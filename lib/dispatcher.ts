import { Resend } from 'resend';

let resendClient: Resend | null = null;

// Central notification router
// Will route to Resend (Email) today, Twilio (SMS) soon, and Browser Push later.
export const dispatcher = {
  // Lazily instantiated so importing this module never fails at build/start
  // time in an environment without RESEND_API_KEY set (e.g. local dev) —
  // it only throws if something actually tries to send an email.
  get resend(): Resend {
    if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
    return resendClient;
  },

  // Returns whether the email actually sent — callers use this to decide
  // whether the alert is safe to record (see lib/alerts.ts). Never throws.
  async send(athlete: any, camp: any, alertType: 'instant' | 'digest'): Promise<boolean> {
    console.log(`[DISPATCHER] Routing ${alertType.toUpperCase()} alert to ${athlete.email} for ${camp.school_name}`);

    // Channel 1: EMAIL (Active)
    const emailSent = await this.sendEmail(athlete, camp, alertType);

    // Channel 2: SMS (Coming Soon)
    // if (athlete.phone && athlete.wants_sms) { await this.sendSMS(athlete, camp); }

    // Channel 3: PUSH (Coming Later)
    // if (athlete.push_token) { await this.sendPush(athlete, camp); }

    return emailSent;
  },

  async sendEmail(athlete: any, camp: any, alertType: 'instant' | 'digest'): Promise<boolean> {
    const subject = alertType === 'instant' 
      ? `🚨 ${camp.school_name} just posted a new softball camp!`
      : `New Camp in your area: ${camp.school_name} ${camp.camp_name}`;

    const dateStr = new Date(camp.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #18181b;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #18181b; margin-bottom: 5px;">Recruit<span style="color: #84cc16;">Radar</span></h1>
          <div style="height: 4px; width: 40px; background: #d9f99d; margin: 0 auto; border-radius: 2px;"></div>
        </div>
        
        <p style="font-size: 16px;">Hi ${athlete.name.split(' ')[0]},</p>
        
        <p style="font-size: 16px;">
          ${alertType === 'instant' 
            ? `One of your target schools, <strong>${camp.school_name}</strong>, just opened registration for a new camp. Spots at these elite camps fill up extremely fast.`
            : `A new camp matching your region/division preferences was just posted.`}
        </p>
        
        <div style="background: #fafafa; border: 1px solid #e4e4e7; border-radius: 12px; padding: 24px; margin: 30px 0;">
          <h2 style="margin: 0 0 10px 0; font-size: 20px; color: #18181b;">${camp.school_name}</h2>
          <p style="margin: 0 0 5px 0; color: #52525b; font-size: 15px;"><strong>Camp:</strong> ${camp.camp_name}</p>
          <p style="margin: 0 0 5px 0; color: #52525b; font-size: 15px;"><strong>Date:</strong> ${dateStr}</p>
          <p style="margin: 0 0 5px 0; color: #52525b; font-size: 15px;"><strong>Type:</strong> ${camp.camp_type}</p>
          <p style="margin: 0 0 20px 0; color: #52525b; font-size: 15px;"><strong>Focus:</strong> ${camp.position_focus || 'All positions'}</p>
          
          <a href="${camp.registration_link}" style="display: inline-block; background: #d9f99d; color: #18181b; text-decoration: none; font-weight: bold; padding: 12px 24px; border-radius: 8px; font-size: 16px;">
            Register Now →
          </a>
        </div>
        
        <p style="font-size: 14px; color: #71717a; text-align: center; margin-top: 40px;">
          You are receiving this because you set up alerts on RecruitRadar.<br/>
          To manage your alerts, <a href="https://softball-recruit.vercel.app/profile" style="color: #18181b;">update your profile</a>.
        </p>
      </div>
    `;

    try {
      const { data, error } = await this.resend.emails.send({
        from: 'RecruitRadar Alerts <alerts@recruitradar.co>',
        to: athlete.email,
        subject: subject,
        html: html,
      });

      if (error) {
        console.error('[RESEND ERROR]', error);
        return false;
      }
      console.log('[RESEND SUCCESS] Email queued:', data?.id);
      return true;
    } catch (e) {
      console.error('[RESEND EXCEPTION]', e);
      return false;
    }
  },

  // One combined email per athlete for every "digest" (division/region)
  // match found in a single alert-check run, instead of one email per camp —
  // an athlete matching many camps in one run (e.g. a broad division match
  // against a large catch-up batch) would otherwise get flooded.
  async sendDigest(athlete: any, camps: any[]): Promise<boolean> {
    if (camps.length === 0) return false;
    console.log(`[DISPATCHER] Routing DIGEST alert to ${athlete.email} for ${camps.length} camp(s)`);

    const rows = camps.map(camp => {
      const dateStr = new Date(camp.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `
        <div style="background: #fafafa; border: 1px solid #e4e4e7; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
          <h2 style="margin: 0 0 8px 0; font-size: 18px; color: #18181b;">${camp.school_name}</h2>
          <p style="margin: 0 0 4px 0; color: #52525b; font-size: 14px;"><strong>Camp:</strong> ${camp.camp_name}</p>
          <p style="margin: 0 0 4px 0; color: #52525b; font-size: 14px;"><strong>Date:</strong> ${dateStr}</p>
          <p style="margin: 0 0 14px 0; color: #52525b; font-size: 14px;"><strong>Type:</strong> ${camp.camp_type}</p>
          <a href="${camp.registration_link}" style="display: inline-block; background: #d9f99d; color: #18181b; text-decoration: none; font-weight: bold; padding: 10px 20px; border-radius: 8px; font-size: 14px;">
            Register Now →
          </a>
        </div>
      `;
    }).join('');

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #18181b;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #18181b; margin-bottom: 5px;">Recruit<span style="color: #84cc16;">Radar</span></h1>
          <div style="height: 4px; width: 40px; background: #d9f99d; margin: 0 auto; border-radius: 2px;"></div>
        </div>

        <p style="font-size: 16px;">Hi ${athlete.name.split(' ')[0]},</p>

        <p style="font-size: 16px;">
          ${camps.length === 1 ? 'A new camp' : `${camps.length} new camps`} matching your region/division preferences ${camps.length === 1 ? 'was' : 'were'} just posted:
        </p>

        ${rows}

        <p style="font-size: 14px; color: #71717a; text-align: center; margin-top: 40px;">
          You are receiving this because you set up alerts on RecruitRadar.<br/>
          To manage your alerts, <a href="https://softball-recruit.vercel.app/profile" style="color: #18181b;">update your profile</a>.
        </p>
      </div>
    `;

    try {
      const { data, error } = await this.resend.emails.send({
        from: 'RecruitRadar Alerts <alerts@recruitradar.co>',
        to: athlete.email,
        subject: camps.length === 1
          ? `New Camp in your area: ${camps[0].school_name} ${camps[0].camp_name}`
          : `${camps.length} new camps in your area`,
        html: html,
      });

      if (error) {
        console.error('[RESEND ERROR]', error);
        return false;
      }
      console.log('[RESEND SUCCESS] Digest email queued:', data?.id);
      return true;
    } catch (e) {
      console.error('[RESEND EXCEPTION]', e);
      return false;
    }
  }
};
