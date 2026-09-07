export type ThemeId = 
  | 'blooming-heart'
  | 'starlit-promise'
  | 'warmth-of-us'
  | 'seasons-of-love'
  | 'ocean-of-my-heart';

export type EnvelopeSeal = 
  | 'wax-heart'
  | 'golden-rose'
  | 'celestial-star'
  | 'ocean-pearl'
  | 'botanical-leaf';

export interface RecipientResponse {
  approved: boolean;
  reactionEmoji: string;
  message: string;
  respondedAt: string;
}

export interface LetterPage {
  id: string;
  pageNumber: number;
  title?: string;
  content: string;
  imageUrl?: string;
  imageCaption?: string;
}

export interface CreatorUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface LetterData {
  id: string;
  creatorToken: string;
  creatorId?: string;
  theme: ThemeId;
  recipientName: string;
  senderName: string;
  date: string;
  title: string;
  content: string;
  imageUrl?: string;
  imageCaption?: string;
  pages?: LetterPage[];
  musicEnabled: boolean;
  soundtrackMood?: string;
  envelopeSeal: EnvelopeSeal;
  createdAt: string;
  viewCount: number;
  firstOpenedAt?: string;
  lastOpenedAt?: string;
  status: 'unread' | 'opened' | 'approved';
  recipientResponse?: RecipientResponse;
  hasPassword?: boolean;
  password?: string;
  passwordHint?: string;
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  mood: string;
  bestFor: string;
  bgGradient: string;
  accentColor: string;
  primaryTextColor: string;
  letterBg: string;
  letterBorder: string;
  fontFamily: string;
  musicName: string;
  musicDescription: string;
  iconName: string;
  envelopeColor: string;
}
