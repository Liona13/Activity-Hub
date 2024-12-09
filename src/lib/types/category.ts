import { Activity } from '@prisma/client';

export interface CategoryFormData {
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
}

export interface CategoryWithRelations {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  activities: Activity[];
  parentId: string | null;
  parent: CategoryWithRelations | null;
  children: CategoryWithRelations[];
  createdAt: Date;
  updatedAt: Date;
} 