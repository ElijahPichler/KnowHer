import { Timestamp } from 'firebase/firestore';

export type User = {
  id: string;
  email: string;
  firstName: string;
  createdAt: Timestamp;
};

export type WifeInfo = {
  firstName: string;
  nickname?: string;
  anniversaryDate?: Timestamp;
  favoriteColor?: string;
  hobbies?: string[];
  foodPreferences?: string[];
};

export type Event = {
  title: string;
  date: Timestamp;
  description?: string;
  isRecurring?: boolean;
  recurringFrequency?: 'yearly' | 'monthly' | 'weekly';
  createdAt?: Timestamp;
};

export type DateNight = {
  date: Timestamp;
  notes?: string;
  location?: string;
  activity?: string;
  createdAt?: Timestamp;
};

export type PeriodLog = {
  startDate: Timestamp;
  endDate?: Timestamp | null;  // Using both undefined and null as possible values
  flow?: 'light' | 'medium' | 'heavy';
  symptoms?: string[];
  notes?: string;
  createdAt?: Timestamp;
};

export type MenstrualPhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | 'late' | 'unknown';

export type PhaseRecommendation = {
  phase: MenstrualPhase;
  title: string;
  description: string;
  tips: string[];
};

export type DateIdea = {
  id: string;
  title: string;
  description: string;
  category: 'romantic' | 'adventure' | 'relaxation' | 'cultural' | 'food';
  estimatedCost: '$' | '$$' | '$$$';
  imageUrl?: string;
};