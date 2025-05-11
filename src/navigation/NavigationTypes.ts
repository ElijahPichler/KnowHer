import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type SignupScreenProps = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

// Onboarding (no longer in auth stack, directly in root)
export type OnboardingScreenProps = NativeStackScreenProps<{}>;

// App Stack (Main navigation)
export type AppStackParamList = {
  Main: undefined;
  Profile: undefined;
};

export type MainScreenProps = NativeStackScreenProps<AppStackParamList, 'Main'>;
export type ProfileScreenProps = NativeStackScreenProps<AppStackParamList, 'Profile'>;

// Tab Navigation
export type TabParamList = {
  PeriodTracker: undefined;
  WifeInfo: undefined;
  DateNight: undefined;
};

export type PeriodTrackerScreenProps = NativeStackScreenProps<TabParamList, 'PeriodTracker'>;
export type WifeInfoScreenProps = NativeStackScreenProps<TabParamList, 'WifeInfo'>;
export type DateNightScreenProps = NativeStackScreenProps<TabParamList, 'DateNight'>;