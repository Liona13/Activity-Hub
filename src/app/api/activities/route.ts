import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/utils/auth';
import { activityService } from '@/lib/services/activity.service';
import { PAGINATION } from '@/constants/config';
import { ActivityStatus } from '@/lib/types/activity';
import { z } from 'zod';

const querySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().default(PAGINATION.DEFAULT_PAGE_SIZE),
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).optional(),
  creatorId: z.string().optional(),
  participantId: z.string().optional(),
  orderBy: z.enum(['startDate', 'createdAt', 'title']).optional().default('startDate'),
  orderDirection: z.enum(['asc', 'desc']).optional().default('asc'),
  date: z.enum(['today', 'tomorrow', 'week', 'month']).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Log incoming parameters for debugging
    console.log('Incoming search params:', Object.fromEntries(searchParams.entries()));
    
    // Parse and validate query parameters
    const validatedQuery = querySchema.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || PAGINATION.DEFAULT_PAGE_SIZE,
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      status: searchParams.get('status') || undefined,
      creatorId: searchParams.get('creatorId') || undefined,
      participantId: searchParams.get('participantId') || undefined,
      orderBy: searchParams.get('orderBy') || undefined,
      orderDirection: searchParams.get('orderDirection') || undefined,
      date: searchParams.get('date') || undefined,
    });

    console.log('Validated query:', validatedQuery);

    const result = await activityService.getActivities(validatedQuery);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching activities:', error);
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Transform dates from strings to Date objects
    const activityData = {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      maxParticipants: Number(data.maxParticipants),
      price: data.isPaid ? Number(data.price) : null,
    };

    const activity = await activityService.create(activityData, user.id);
    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
} 