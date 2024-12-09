import { prisma } from '@/lib/db/prisma';
import { ActivityFormData, ActivityStatus } from '@/lib/types/activity';
import { PAGINATION } from '@/constants/config';
import type { Prisma } from '@prisma/client';

export const activityService = {
  // Create a new activity
  async create(data: ActivityFormData & { coordinates?: { lat: number; lng: number } }, creatorId: string) {
    const { coordinates, ...activityData } = data;
    return prisma.activity.create({
      data: {
        ...activityData,
        creatorId,
        currentParticipants: 0,
        status: 'upcoming',
        startDate: new Date(activityData.startDate),
        endDate: new Date(activityData.endDate),
        images: activityData.images || [],
        isPrivate: activityData.isPrivate || false,
        isPaid: activityData.isPaid || false,
        price: activityData.isPaid ? activityData.price || 0 : null,
      },
      include: {
        creator: true,
        category: true,
      },
    });
  },

  // Get activities with pagination and filters
  async getActivities({
    page = 1,
    limit = PAGINATION.DEFAULT_PAGE_SIZE,
    search,
    category,
    status,
    creatorId,
    participantId,
    orderBy = 'startDate',
    orderDirection = 'asc',
    date,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: ActivityStatus;
    creatorId?: string;
    participantId?: string;
    orderBy?: 'startDate' | 'createdAt' | 'title';
    orderDirection?: 'asc' | 'desc';
    date?: 'today' | 'tomorrow' | 'week' | 'month';
  }) {
    const skip = (page - 1) * limit;
    const take = Math.min(limit, PAGINATION.MAX_PAGE_SIZE);

    // Build where clause
    const where: Prisma.ActivityWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    if (status) {
      where.status = status;
    }

    if (creatorId) {
      where.creatorId = creatorId;
    }

    if (participantId) {
      where.participants = {
        some: {
          userId: participantId,
        },
      };
    }

    // Handle date filtering
    if (date) {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      switch (date) {
        case 'today':
          where.startDate = {
            gte: startOfDay,
            lte: endOfDay,
          };
          break;
        case 'tomorrow':
          const startOfTomorrow = new Date(startOfDay);
          startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
          const endOfTomorrow = new Date(endOfDay);
          endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);
          where.startDate = {
            gte: startOfTomorrow,
            lte: endOfTomorrow,
          };
          break;
        case 'week':
          const endOfWeek = new Date(startOfDay);
          endOfWeek.setDate(endOfWeek.getDate() + 7);
          where.startDate = {
            gte: startOfDay,
            lte: endOfWeek,
          };
          break;
        case 'month':
          const endOfMonth = new Date(startOfDay);
          endOfMonth.setMonth(endOfMonth.getMonth() + 1);
          where.startDate = {
            gte: startOfDay,
            lte: endOfMonth,
          };
          break;
      }
    }

    // Get total count for pagination
    const total = await prisma.activity.count({ where });

    // Get activities
    const activities = await prisma.activity.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: true,
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: {
        [orderBy]: orderDirection,
      },
      skip,
      take,
    });

    return {
      activities,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        pageSize: limit,
        hasMore: skip + activities.length < total,
      },
    };
  },

  // Get activity by id
  async getById(id: string) {
    return prisma.activity.findUnique({
      where: { id },
      include: {
        creator: true,
        category: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
    });
  },

  // Join an activity
  async join(activityId: string, userId: string) {
    // Start a transaction
    return prisma.$transaction(async (tx) => {
      // Get activity and check if it's full
      const activity = await tx.activity.findUnique({
        where: { id: activityId },
      });

      if (!activity) throw new Error('Activity not found');
      if (activity.currentParticipants >= activity.maxParticipants) {
        throw new Error('Activity is full');
      }

      // Create participation and increment participant count
      await tx.participation.create({
        data: {
          userId,
          activityId,
        },
      });

      return tx.activity.update({
        where: { id: activityId },
        data: {
          currentParticipants: {
            increment: 1,
          },
        },
        include: {
          creator: true,
          category: true,
        },
      });
    });
  },

  // Leave an activity
  async leave(activityId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.participation.delete({
        where: {
          userId_activityId: {
            userId,
            activityId,
          },
        },
      });

      return tx.activity.update({
        where: { id: activityId },
        data: {
          currentParticipants: {
            decrement: 1,
          },
        },
        include: {
          creator: true,
          category: true,
        },
      });
    });
  },

  // Update activity status
  async updateStatus(id: string, status: ActivityStatus) {
    return prisma.activity.update({
      where: { id },
      data: { status },
      include: {
        creator: true,
        category: true,
      },
    });
  },
}; 