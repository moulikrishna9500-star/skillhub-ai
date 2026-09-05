export interface Skill {
  name: string;
  isPrimary?: boolean;
  category?: string;
}

export interface Review {
  id: string;
  authorName: string;
  authorAvatar: string;
  rating: number;
  date: string;
  comment: string;
  skillExchanged: string;
}

export interface Mentor {
  id: string;
  name: string;
  avatar: string;
  location: string;
  timezone: string;
  rating: number;
  reviewCount: number;
  matchScore: number; // e.g. 98, 85, 72
  isPerfectMatch?: boolean;
  teaches: Skill[];
  wantsToLearn: string[];
  availability: string; // e.g. "2h/week available"
  availabilityHours: number; // e.g. 2
  bio: string;
  isOnline: boolean;
  title: string;
  reviews?: Review[];
  experienceYears?: number;
  completedSwaps?: number;
}

export interface ActiveSwap {
  id: string;
  mentor: Mentor;
  skillYouTeach: string;
  skillYouLearn: string;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  nextSession?: string;
  hoursCompleted: number;
  totalHoursPlanned: number;
  lastMessage?: string;
  progressPercent: number;
  partnerProfile?: UserProfile;
  reviewSubmitted?: boolean;
}

export interface UserProfile {
  id?: string;
  email?: string;
  phone?: string;
  name: string;
  avatar: string;
  headline: string;
  location: string;
  timezone: string;
  rating: number;
  reviewsCount: number;
  teaches: string[];
  wantsToLearn: string[];
  availabilityHours: number;
  bio: string;
  hoursBanked: number;
  swapsCompleted: number;
  isOnline: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'swap_request' | 'swap_accepted' | 'session_reminder' | 'review' | 'community';
  avatar?: string;
}
