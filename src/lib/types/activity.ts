import { User, Category } from '@prisma/client';

export type ActivityStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface ActivityFormData {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  maxParticipants: number;
  categoryId: string;
  isPrivate?: boolean;
  isPaid?: boolean;
  price?: number;
  images?: string[];
}

// Minimal user info needed for display
export interface UserInfo {
  id: string;
  name: string;
  image: string | null;
}

// Minimal category info needed for display
export interface CategoryInfo {
  id: string;
  name: string;
}

export interface ParticipantInfo {
  id: string;
  status: string;
  joinedAt: string;
  user: UserInfo;
}

export interface ActivityWithRelations {
  id: string;
  title: string;
  description: string;
  startDate: string; // ISO string for client
  endDate: string; // ISO string for client
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  status: ActivityStatus;
  isPrivate: boolean;
  isPaid: boolean;
  price: number | null;
  images: string[];
  creator: UserInfo;
  category: CategoryInfo;
  participants: ParticipantInfo[];
  createdAt: string; // ISO string for client
  updatedAt: string; // ISO string for client
} 