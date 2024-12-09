import { NextResponse } from 'next/server';
import { commentService } from '@/lib/services/comment.service';
import { getCurrentUser } from '@/lib/utils/auth';
import { CommentFormData } from '@/lib/types/comment';

// GET /api/activities/[id]/comments
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const comments = await commentService.getByActivityId(params.id);
    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/activities/[id]/comments
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data: CommentFormData = await request.json();
    const comment = await commentService.create(
      { ...data, activityId: params.id },
      user.id
    );
    
    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
} 