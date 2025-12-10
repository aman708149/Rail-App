export interface Notifications {
  email: boolean;
  sms: boolean;
}

export interface Rail {
  searchPreference: number;
}

export interface UserPreferences {
  userId: string;
  language: string;
  theme: string;
  notifications: Notifications;
  rail: Rail;
  // Add more fields as needed
}
