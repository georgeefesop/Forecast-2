"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { getUserAvatarUrl } from "@/lib/avatar";
import { Edit2, Trash2, Reply, X, Check } from "lucide-react";

interface Comment {
  id: string;
  body: string;
  created_at: string;
  edited_at?: string;
  parent_id?: string;
  user: {
    handle: string;
    avatar_url?: string;
    avatar_source?: string;
    avatar_seed?: string;
    user_id?: string;
  };
  replies?: Comment[];
}

interface CommentsThreadProps {
  eventId: string;
}

interface CommentItemProps {
  comment: Comment;
  eventId: string;
  session: any;
  avatarUrls: Record<string, string>;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  editingId: string | null;
  editText: string;
  setEditText: (text: string) => void;
  submitting: boolean;
  onReply: (parentId: string) => Promise<void>;
  onEdit: (commentId: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onStartEdit: (comment: Comment) => void;
  onCancelEdit: () => void;
  onLoadComments: () => Promise<void>;
  depth?: number;
}

// Comment Item Component (recursive for replies) - moved outside to prevent recreation on each render
function CommentItem({
  comment,
  eventId,
  session,
  avatarUrls,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText,
  editingId,
  editText,
  setEditText,
  submitting,
  onReply,
  onEdit,
  onDelete,
  onStartEdit,
  onCancelEdit,
  onLoadComments,
  depth = 0,
}: CommentItemProps) {
  const isOwner = session?.user?.id === comment.user.user_id;
  const isEditing = editingId === comment.id;
  const isReplying = replyingTo === comment.id;
  const maxDepth = 3; // Limit nesting depth

  return (
    <div className={depth > 0 ? "mt-3 ml-6 border-l-2 border-border-subtle pl-4" : ""}>
      <div className="rounded-lg border border-border-default bg-background-surface p-4">
        <div className="mb-2 flex items-center gap-2">
          {avatarUrls[comment.id] ? (
            <img
              src={avatarUrls[comment.id]}
              alt={comment.user.handle}
              className="h-8 w-8 rounded-full object-cover border border-border-default"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-background-elevated border border-border-default flex items-center justify-center text-xs font-medium text-text-secondary">
              {comment.user.handle.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="font-medium text-text-primary">
            {comment.user.handle}
          </span>
          <span className="text-xs text-text-tertiary">
            {format(new Date(comment.created_at), "MMM d, yyyy 'at' h:mm a")}
          </span>
          {comment.edited_at && (
            <span className="text-xs text-text-tertiary italic">
              (edited)
            </span>
          )}
          {isOwner && !isEditing && (
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => onStartEdit(comment)}
                className="btn btn-ghost btn-sm"
                title="Edit comment"
                style={{ padding: "0.25rem", minHeight: "auto" }}
              >
                <Edit2 className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(comment.id)}
                className="btn btn-ghost btn-sm"
                title="Delete comment"
                style={{ padding: "0.25rem", minHeight: "auto", color: "var(--color-semantic-error)" }}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              disabled={submitting}
              className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none disabled:opacity-50"
            />
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="default"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(comment.id);
                }}
                disabled={!editText.trim() || submitting}
              >
                <Check className="h-3 w-3" />
                Save
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onCancelEdit}
                disabled={submitting}
              >
                <X className="h-3 w-3" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-text-secondary whitespace-pre-line mb-3">
              {comment.body}
            </p>

            {session && depth < maxDepth && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReplyingTo(isReplying ? null : comment.id)}
                  className="btn btn-ghost btn-sm"
                  style={{ padding: "0.25rem 0.5rem", minHeight: "auto", fontSize: "0.75rem" }}
                >
                  <Reply className="h-3 w-3" />
                  {isReplying ? "Cancel" : "Reply"}
                </button>
              </div>
            )}

            {isReplying && (
              <div className="mt-3 space-y-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${comment.user.handle}...`}
                  rows={2}
                  disabled={submitting}
                  className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-sm text-text-primary focus:border-border-strong focus:outline-none disabled:opacity-50"
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="default"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onReply(comment.id);
                    }}
                    disabled={!replyText.trim() || submitting}
                  >
                    {submitting ? "Posting..." : "Post Reply"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText("");
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Render Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              eventId={eventId}
              session={session}
              avatarUrls={avatarUrls}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyText={replyText}
              setReplyText={setReplyText}
              editingId={editingId}
              editText={editText}
              setEditText={setEditText}
              submitting={submitting}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onStartEdit={onStartEdit}
              onCancelEdit={onCancelEdit}
              onLoadComments={onLoadComments}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentsThread({ eventId }: CommentsThreadProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [avatarUrls, setAvatarUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    loadComments();
  }, [eventId]);

  // Recursive function to load avatars for all comments and replies
  const loadAvatarsForComments = async (comments: Comment[]): Promise<Record<string, string>> => {
    const avatarMap: Record<string, string> = {};
    
    const loadAvatar = async (comment: Comment) => {
      const avatarUrl = await getUserAvatarUrl(
        comment.user.user_id || "",
        comment.user.handle,
        comment.user.avatar_url || null,
        comment.user.avatar_source || null,
        comment.user.avatar_seed || null
      );
      avatarMap[comment.id] = avatarUrl;
      
      // Load avatars for replies recursively
      if (comment.replies && comment.replies.length > 0) {
        await Promise.all(comment.replies.map(loadAvatar));
      }
    };
    
    await Promise.all(comments.map(loadAvatar));
    return avatarMap;
  };

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
        
        // Load avatars for all comments and replies
        const avatarMap = await loadAvatarsForComments(data);
        setAvatarUrls(avatarMap);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/events/${eventId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newComment }),
      });

      if (response.ok) {
        setNewComment("");
        await loadComments();
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!session || !replyText.trim() || submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/events/${eventId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyText, parent_id: parentId }),
      });

      if (response.ok) {
        setReplyText("");
        setReplyingTo(null);
        await loadComments();
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Error posting reply:", errorData);
        alert(`Failed to post reply: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      alert("Failed to post reply. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (commentId: string) => {
    console.log("handleEdit called", { commentId, editText, submitting, session: !!session });
    if (!session || !editText.trim() || submitting) {
      console.log("handleEdit early return", { hasSession: !!session, hasText: !!editText.trim(), submitting });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/events/${eventId}/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: editText }),
      });

      console.log("Edit response", { ok: response.ok, status: response.status });
      if (response.ok) {
        setEditText("");
        setEditingId(null);
        await loadComments();
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Error editing comment:", errorData);
        alert(`Failed to edit comment: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error editing comment:", error);
      alert("Failed to edit comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!session || !confirm("Are you sure you want to delete this comment?")) return;

    try {
      const response = await fetch(`/api/events/${eventId}/comments/${commentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadComments();
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditText(comment.body);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
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
            disabled={submitting}
            className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none disabled:opacity-50"
          />
          <Button type="submit" className="mt-2" disabled={!newComment.trim() || submitting}>
            {submitting ? "Posting..." : "Post Comment"}
          </Button>
        </form>
      ) : (
        <p className="mb-6 text-sm text-text-secondary">
          <a href="/auth/signin" className="text-text-primary hover:underline">
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
            <CommentItem
              key={comment.id}
              comment={comment}
              eventId={eventId}
              session={session}
              avatarUrls={avatarUrls}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyText={replyText}
              setReplyText={setReplyText}
              editingId={editingId}
              editText={editText}
              setEditText={setEditText}
              submitting={submitting}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStartEdit={startEdit}
              onCancelEdit={cancelEdit}
              onLoadComments={loadComments}
            />
          ))}
        </div>
      )}
    </div>
  );
}
