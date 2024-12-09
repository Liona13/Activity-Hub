import React from 'react';
import { useSession } from 'next-auth/react';
import { CommentWithRelations } from '@/lib/types/comment';
import { formatDate } from '@/utils/date';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface CommentListProps {
  comments: CommentWithRelations[];
  onReply?: (parentId: string) => void;
  onEdit?: (comment: CommentWithRelations) => void;
  onDelete?: (commentId: string) => void;
}

export function CommentList({ comments, onReply, onEdit, onDelete }: CommentListProps) {
  const { data: session } = useSession();

  const renderComment = (comment: CommentWithRelations, isReply = false) => {
    const isAuthor = session?.user?.id === comment.userId;

    return (
      <div key={comment.id} className={`${isReply ? 'ml-12 mt-4' : 'mt-6'}`}>
        <div className="flex space-x-3">
          <Avatar>
            <AvatarImage src={comment.user.image || undefined} alt={comment.user.name || 'User'} />
            <AvatarFallback>{comment.user.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-900">{comment.user.name}</span>
                <span className="text-sm text-gray-500 ml-2">
                  {formatDate(comment.createdAt, 'SHORT')}
                </span>
              </div>
              {isAuthor && (
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(comment)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete?.(comment.id)}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
            <p className="mt-1 text-gray-700">{comment.content}</p>
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => onReply?.(comment.id)}
              >
                Reply
              </Button>
            )}
          </div>
        </div>

        {/* Render replies */}
        {comment.replies?.map((reply) => renderComment(reply, true))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {comments.map((comment) => renderComment(comment))}
    </div>
  );
} 