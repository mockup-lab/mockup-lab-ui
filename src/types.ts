import { User } from 'firebase/auth';

export interface TemplateData {
  index: number;
  id?: string; // Firestore document ID
  category: string;
  title: string;
  description: string;
  longDescription?: string;
  image: string; // legacy or fallback image
  thumbnailUrl?: string; // small image for card deck
  fullImageUrl?: string; // large preview image for modal
  tags: string[];
  price?: number; // Price in USD, 0 for free templates
  isPremium?: boolean; // Whether this is a premium template
  demoUrl?: string; // URL to the demo version
  downloadUrl?: string; // URL to download the template
  createdAt?: Date; // When the template was created
  updatedAt?: Date; // When the template was last updated
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
  favorites: string[]; // Array of template IDs
  purchases: string[]; // Array of purchased template IDs
  isAdmin?: boolean; // Admin flag
}

export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  signUpWithEmailPassword: (email: string, password: string, displayName: string) => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  trailLength: number;
  history: { x: number; y: number }[];
  reset: () => void;
  update: () => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
}