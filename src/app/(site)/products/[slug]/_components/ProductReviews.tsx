"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Rate, message } from "antd";
import { apiClient } from "@/lib/axios";
import Link from "next/link";

interface ReviewData {
  id: string;
  rating: number;
  title?: string | null;
  comment: string;
  isVerified: boolean;
  isFeatured: boolean;
  createdAt: string;
  user: { name?: string | null; image?: string | null };
}

export default function ProductReviews({ productId }: { productId: string }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data } = useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/reviews?productId=${productId}`);
      return data as { reviews: ReviewData[]; rating: { average: number; total: number } };
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post("/reviews", { productId, rating, title, comment });
      return data;
    },
    onSuccess: () => {
      message.success("Thanks! Your review will appear once it's approved.");
      setShowForm(false);
      setRating(0);
      setTitle("");
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["product-reviews", productId] });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      message.error(error?.response?.data?.error || "Something went wrong");
    },
  });

  const reviews = data?.reviews ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold text-ink">Customer Reviews</h2>
        {session ? (
          !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="rounded-md border border-ink px-4 py-2 text-sm font-medium text-ink hover:bg-ink hover:text-white transition-colors"
            >
              Write a Review
            </button>
          )
        ) : (
          <Link href="/login" className="text-sm font-medium text-accent hover:underline">
            Sign in to write a review
          </Link>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (rating === 0) {
              message.error("Please select a rating");
              return;
            }
            mutation.mutate();
          }}
          className="mt-6 rounded-lg border border-border bg-surface p-6"
        >
          <label className="block text-sm font-medium text-ink mb-2">Your Rating</label>
          <Rate value={rating} onChange={setRating} />
          <label className="mt-4 block text-sm font-medium text-ink mb-2">Title (optional)</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-accent"
            placeholder="Sum up your experience"
          />
          <label className="mt-4 block text-sm font-medium text-ink mb-2">Your Review</label>
          <textarea
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-accent"
            placeholder="What did you like or dislike?"
          />
          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-md bg-accent px-5 py-2 text-sm font-medium text-white hover:bg-accent-strong transition-colors disabled:opacity-60"
            >
              {mutation.isPending ? "Submitting..." : "Submit Review"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-md px-5 py-2 text-sm font-medium text-foreground-muted hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 space-y-6">
        {reviews.length === 0 && <p className="text-sm text-foreground-muted">No customer reviews yet. Be the first to share your experience.</p>}
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-border pb-6 last:border-none">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-ink">{review.user?.name || "Anonymous"}</p>
                <Rate disabled value={review.rating} className="text-sm" />
              </div>
              <time className="text-xs text-foreground-muted">
                {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </time>
            </div>
            {review.title && <p className="mt-2 font-medium text-ink">{review.title}</p>}
            <p className="mt-1 text-sm text-foreground-muted">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
