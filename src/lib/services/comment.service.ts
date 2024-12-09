import { prisma } from '@/lib/db/prisma';
import { CommentFormData } from '@/lib/types/comment';

export const commentService = {
  // Create a new comment
  async create(data: CommentFormData, userId: string) {
    return prisma.comment.create({
      data: {
        content: data.content,
        userId,
        activityId: data.activityId,
        parentId: data.parentId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });
  },

  // Get comments for an activity
  async getByActivityId(activityId: string) {
    return prisma.comment.findMany({
      where: {
        activityId,
        parentId: null, // Only get top-level comments
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  // Update a comment
  async update(id: string, content: string, userId: string) {
    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment || comment.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
  },

  // Delete a comment
  async delete(id: string, userId: string) {
    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment || comment.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return prisma.comment.delete({
      where: { id },
    });
  },
}; 