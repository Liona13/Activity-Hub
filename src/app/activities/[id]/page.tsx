import { Suspense } from 'react';
import ActivityDetailClient from './activity-detail-client';
import { ActivitySkeleton } from './activity-skeleton';
import { prisma } from '@/lib/db/prisma';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { ActivityWithRelations, ActivityStatus } from '@/lib/types/activity';
import { notFound } from 'next/navigation';

async function getActivity(id: string) {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: true,
        participants: {
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

    if (!activity) return null;

    // Validate activity status
    const status = activity.status as ActivityStatus;
    if (!['upcoming', 'ongoing', 'completed', 'cancelled'].includes(status)) {
      throw new Error(`Invalid activity status: ${status}`);
    }

    // Convert dates to strings and ensure all required fields are present
    return {
      ...activity,
      status,
      startDate: activity.startDate.toISOString(),
      endDate: activity.endDate.toISOString(),
      createdAt: activity.createdAt.toISOString(),
      updatedAt: activity.updatedAt.toISOString(),
      creator: {
        ...activity.creator,
        name: activity.creator.name || 'Anonymous', // Provide default for null name
      },
      participants: activity.participants.map(p => ({
        id: p.id,
        status: p.status,
        joinedAt: p.joinedAt.toISOString(),
        user: {
          ...p.user,
          name: p.user.name || 'Anonymous', // Provide default for null name
        }
      }))
    } satisfies ActivityWithRelations;
  } catch (error) {
    console.error('Error fetching activity:', error);
    throw new Error('Failed to fetch activity details');
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ActivityPage(props: PageProps) {
  const params = await props.params;
  const { id } = params;

  if (!id || typeof id !== 'string') {
    notFound();
  }

  const activity = await getActivity(id);

  if (!activity) {
    notFound();
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<ActivitySkeleton />}>
        <ActivityDetailClient activity={activity} />
      </Suspense>
    </ErrorBoundary>
  );
} 