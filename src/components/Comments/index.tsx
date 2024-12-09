import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CommentList } from './CommentList';
import { CommentForm } from './CommentForm';
import { CommentWithRelations } from '@/lib/types/comment';
import { api } from '@/utils/api';

interface CommentsProps {
  activityId: string;
}

export function Comments({ activityId }: CommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentWithRelations[]>([]);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<CommentWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [activityId]);

  const loadComments = async () => {
    try {
      const response = await api.activities.comments.list(activityId);
      setComments(response);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (content: string) => {
    if (!session?.user) return;

    try {
      const response = await api.activities.comments.create(activityId, {
        content,
        parentId: replyTo,
      });

      if (replyTo) {
        // Update the parent comment with the new reply
        setComments(comments.map(comment => {
          if (comment.id === replyTo) {
            return {
              ...comment,
              replies: [...(comment.replies || []), response],
            };
          }
          return comment;
        }));
        setReplyTo(null);
      } else {
        // Add new comment to the list
        setComments([response, ...comments]);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const handleEditComment = async (content: string) => {
    if (!editingComment || !session?.user) return;

    try {
      const response = await api.activities.comments.update(editingComment.id, {
        content,
      });

      setComments(comments.map(comment => {
        if (comment.id === editingComment.id) {
          return response;
        }
        return comment;
      }));
      setEditingComment(null);
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!session?.user) return;

    try {
      await api.activities.comments.delete(commentId);
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  if (isLoading) {
    return <div>Loading comments...</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Comments</h3>
      
      {session ? (
        <CommentForm
          onSubmit={handleSubmitComment}
          placeholder="Share your thoughts..."
        />
      ) : (
        <p className="text-sm text-gray-500">
          Please sign in to leave a comment.
        </p>
      )}

      {replyTo && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Reply to comment</h4>
          <CommentForm
            onSubmit={handleSubmitComment}
            placeholder="Write your reply..."
            buttonText="Reply"
            isReply
            onCancel={() => setReplyTo(null)}
          />
        </div>
      )}

      {editingComment && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Edit comment</h4>
          <CommentForm
            onSubmit={handleEditComment}
            placeholder="Edit your comment..."
            buttonText="Save"
            initialValue={editingComment.content}
            onCancel={() => setEditingComment(null)}
          />
        </div>
      )}

      <CommentList
        comments={comments}
        onReply={setReplyTo}
        onEdit={setEditingComment}
        onDelete={handleDeleteComment}
      />
    </div>
  );
} 