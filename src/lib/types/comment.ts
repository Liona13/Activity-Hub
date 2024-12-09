import { User } from '@prisma/client';

export interface CommentFormData {
  content: string;
  activityId: string;
  parentId?: string;
}

export interface CommentWithRelations {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  activityId: string;
  parentId: string | null;
  user: Pick<User, 'id' | 'name' | 'image'>;
  replies?: CommentWithRelations[];
} 