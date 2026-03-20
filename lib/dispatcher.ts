import { Resend } from 'resend';

// Central notification router
// Will route to Resend (Email) today, Twilio (SMS) soon, and Browser Push later.
export const dispatcher = {
  resend: new Resend(process.env.RESEND_API_KEY || 're_czKGzqUX_4o6DmJhaFLLfhyMdRTyojBQy'),
  
  async send(athlete: any, camp: any, alertType: 'instant' | 'digest') {
    console.log(`[DISPATCHER] Routing ${alertType.toUpperCase()} alert to ${athlete.email} for ${camp.school_name}`);
    
    // Channel 1: EMAIL (Active)
    await this.sendEmail(athlete, camp, alertType);

    // Channel 2: SMS (Coming Soon)
    // if (athlete.phone && athlete.wants_sms) { await this.sendSMS(athlete, camp); }
    
    // Channel 3: PUSH (Coming Later)
    // if (athlete.push_token) { await this.sendPush(athlete, camp); }
  },

  async sendEmail(athlete: any, camp: any, alertType: 'instant' | 'digest') {
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
        from: 'RecruitRadar Alerts <onboarding@resend.dev>', // Resend sandbox requires onboarding@resend.dev
        to: athlete.email, // In sandbox mode, this MUST be the email address you registered Resend with
        subject: subject,
        html: html,
      });

      if (error) {
        console.error('[RESEND ERROR]', error);
      } else {
        console.log('[RESEND SUCCESS] Email queued:', data?.id);
      }
    } catch (e) {
      console.error('[RESEND EXCEPTION]', e);
    }
  }
};
