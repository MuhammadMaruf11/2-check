"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { message } from "antd";
import { apiClient } from "@/lib/axios";

interface CommentData {
  id: string;
  content: string;
  createdAt: string;
  userId?: string | null;
  guestName?: string | null;
  user?: { name?: string | null; image?: string | null } | null;
}

export default function BlogComments({ blogId }: { blogId: string }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const { data: comments = [] } = useQuery({
    queryKey: ["blog-comments", blogId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/comments?blogId=${blogId}`);
      return data as CommentData[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post("/comments", {
        blogId,
        content,
        guestName: !session ? guestName : undefined,
        guestEmail: !session ? guestEmail : undefined,
      });
      return data;
    },
    onSuccess: () => {
      setContent("");
      setGuestName("");
      setGuestEmail("");
      queryClient.invalidateQueries({ queryKey: ["blog-comments", blogId] });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      message.error(error?.response?.data?.error || "Something went wrong");
    },
  });

  const editMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch(`/comments/${id}`, { content: editContent });
      return data;
    },
    onSuccess: () => {
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["blog-comments", blogId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/comments/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blog-comments", blogId] }),
  });

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-ink">Comments ({comments.length})</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!content.trim()) return;
          if (!session && !guestName.trim()) {
            message.error("Please enter your name");
            return;
          }
          createMutation.mutate();
        }}
        className="mt-6 rounded-lg border border-border bg-surface p-5"
      >
        {!session && (
          <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Your name"
              className="rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <input
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="Email (optional)"
              type="email"
              className="rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
        )}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts..."
          rows={3}
          className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="mt-3 rounded-md bg-accent px-5 py-2 text-sm font-medium text-white hover:bg-accent-strong transition-colors disabled:opacity-60"
        >
          {createMutation.isPending ? "Posting..." : "Post Comment"}
        </button>
      </form>

      <div className="mt-8 space-y-6">
        {comments.map((comment) => {
          const isOwner = session?.user?.id === comment.userId;
          return (
            <div key={comment.id} className="border-b border-border pb-6 last:border-none">
              <div className="flex items-center justify-between">
                <p className="font-medium text-ink">{comment.user?.name || comment.guestName || "Anonymous"}</p>
                <time className="text-xs text-foreground-muted">
                  {new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </time>
              </div>

              {editingId === comment.id ? (
                <div className="mt-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={2}
                    className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => editMutation.mutate(comment.id)}
                      className="rounded-md bg-accent px-3 py-1 text-xs font-medium text-white"
                    >
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-xs text-foreground-muted">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-sm text-foreground-muted">{comment.content}</p>
              )}

              {isOwner && editingId !== comment.id && (
                <div className="mt-2 flex gap-3 text-xs">
                  <button
                    onClick={() => {
                      setEditingId(comment.id);
                      setEditContent(comment.content);
                    }}
                    className="text-accent hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this comment?")) deleteMutation.mutate(comment.id);
                    }}
                    className="text-danger hover:underline"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {comments.length === 0 && <p className="text-sm text-foreground-muted">No comments yet. Start the conversation.</p>}
      </div>
    </div>
  );
}
