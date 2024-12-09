import { prisma } from '@/lib/db/prisma';
import { CategoryFormData } from '@/lib/types/category';

export const categoryService = {
  // Create a new category
  async create(data: CategoryFormData) {
    return prisma.category.create({
      data,
      include: {
        parent: true,
        children: true,
      },
    });
  },

  // Get all categories
  async getAll() {
    return prisma.category.findMany({
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            activities: true,
          },
        },
      },
    });
  },

  // Get category by id
  async getById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        activities: {
          include: {
            creator: true,
          },
        },
      },
    });
  },

  // Update category
  async update(id: string, data: CategoryFormData) {
    return prisma.category.update({
      where: { id },
      data,
      include: {
        parent: true,
        children: true,
      },
    });
  },

  // Delete category
  async delete(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  },

  // Get root categories (categories without parents)
  async getRootCategories() {
    return prisma.category.findMany({
      where: {
        parentId: null,
      },
      include: {
        children: true,
        _count: {
          select: {
            activities: true,
          },
        },
      },
    });
  },
}; 