"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface Comment {
  id: string;
  body: string;
  created_at: string;
  user: {
    handle: string;
    avatar_url?: string;
  };
}

interface CommentsThreadProps {
  eventId: string;
}

export function CommentsThread({ eventId }: CommentsThreadProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [eventId]);

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !newComment.trim()) return;

    try {
      const response = await fetch(`/api/events/${eventId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newComment }),
      });

      if (response.ok) {
        setNewComment("");
        loadComments();
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-xl font-semibold text-text-primary">
        Comments
      </h2>

      {/* Comment Form */}
      {session ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
          <Button type="submit" className="mt-2" disabled={!newComment.trim()}>
            Post Comment
          </Button>
        </form>
      ) : (
        <p className="mb-6 text-sm text-text-secondary">
          <a href="/auth/signin" className="text-brand hover:underline">
            Sign in
          </a>{" "}
          to comment
        </p>
      )}

      {/* Comments List */}
      {loading ? (
        <p className="text-text-secondary">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-text-secondary">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border border-border-default bg-background-surface p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-background-elevated" />
                <span className="font-medium text-text-primary">
                  {comment.user.handle}
                </span>
                <span className="text-xs text-text-tertiary">
                  {format(new Date(comment.created_at), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
              <p className="text-text-secondary whitespace-pre-line">
                {comment.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
