export interface Profile {
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  banner_url?: string;
  bio?: string;
  language?: string;
  timezone?: string;
  theme?: string;
  distance_unit?: string;
  temperature_unit?: string;
  travel_style?: string;
  pace_of_travel?: string;
  preferred_currency?: string;
  travel_companions?: string;
  dietary_restrictions?: string;
  accommodation_preference?: string;
  accessibility_needs?: string;
  email_notifications?: boolean;
  promotional_emails?: boolean;
  push_notifications?: boolean;
  ai_training_consent?: boolean;
  onboarding_done?: boolean;
  show_friends?: boolean;
  show_followers?: boolean;
}

export type SettingsFormData = Profile;

export interface Session {
  id: string;
  created_at: string;
  updated_at: string;
  user_agent: string;
  ip: string;
}

export interface SettingsClientProps {
  userId: string;
  email: string;
  isGoogleOAuth: boolean;
  initialFirstName?: string;
  initialLastName?: string;
  avatarUrl?: string;
  profile?: Profile;
}

export type TabType = "profile" | "travel" | "privacy" | "security" | "blocked";
