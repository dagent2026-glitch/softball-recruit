import { Athlete } from './db';

export function isPro(athlete: Athlete): boolean {
  if (athlete.subscription_status === 'active') return true;
  if (athlete.subscription_status === 'trialing' && athlete.trial_ends_at) {
    return new Date(athlete.trial_ends_at) > new Date();
  }
  return false;
}

export function trialDaysLeft(athlete: Athlete): number | null {
  if (athlete.subscription_status !== 'trialing' || !athlete.trial_ends_at) return null;
  const diff = new Date(athlete.trial_ends_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function hasHadTrial(athlete: Athlete): boolean {
  return !!athlete.trial_started_at;
}
