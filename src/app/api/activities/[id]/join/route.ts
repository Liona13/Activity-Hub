import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';

// Validate activity ID format
const paramsSchema = z.object({
  id: z.string().min(1, 'Activity ID is required'),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Wait for params to be available
    const params = await context.params;
    console.log('Incoming activity ID:', params.id);

    // Validate params
    const validatedParams = paramsSchema.safeParse(params);
    if (!validatedParams.success) {
      console.error('Validation error:', validatedParams.error);
      return NextResponse.json(
        {
          error: 'Invalid activity ID format',
          details: validatedParams.error.errors,
        },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get activity and check if it exists
    const activity = await prisma.activity.findUnique({
      where: { id: validatedParams.data.id },
      include: {
        participants: true,
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Check if user is already participating
    const existingParticipation = await prisma.participation.findUnique({
      where: {
        userId_activityId: {
          userId: session.user.id,
          activityId: validatedParams.data.id,
        },
      },
    });

    if (existingParticipation) {
      return NextResponse.json(
        { error: 'Already participating in this activity' },
        { status: 400 }
      );
    }

    // Check if activity is full
    if (activity.currentParticipants >= activity.maxParticipants) {
      return NextResponse.json(
        { error: 'Activity is full' },
        { status: 400 }
      );
    }

    // Create participation and increment participant count in a transaction
    const updatedActivity = await prisma.$transaction(async (tx) => {
      // Create participation
      await tx.participation.create({
        data: {
          userId: session.user.id,
          activityId: validatedParams.data.id,
          status: 'confirmed',
        },
      });

      // Update activity participant count
      return tx.activity.update({
        where: { id: validatedParams.data.id },
        data: {
          currentParticipants: {
            increment: 1,
          },
        },
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
    });

    return NextResponse.json({ data: updatedActivity });
  } catch (error) {
    console.error('Error joining activity:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request parameters',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || 'Failed to join activity' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 