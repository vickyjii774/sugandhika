"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { RatingStars } from "@/components/ui/RatingStars";
import { Button } from "@/components/ui/Button";
import { submitProductReview } from "@/lib/actions/store.actions";
import { toast } from "sonner";
import Link from "next/link";
import { Star, MessageSquare } from "lucide-react";

interface ReviewFormProps {
  productId: string;
}

export function ReviewForm({ productId }: ReviewFormProps) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!session) {
    return (
      <div className="p-6 bg-brand-cream/60 rounded-2xl border border-brand-light/20 text-center space-y-3">
        <MessageSquare className="w-8 h-8 text-brand-dark mx-auto" />
        <h4 className="text-sm font-bold text-slate-800">Write a Customer Review</h4>
        <p className="text-xs text-slate-500">
          Please log in to your Sugandhika account to share your experience.
        </p>
        <Link href="/login" className="inline-block">
          <Button variant="primary" size="sm">
            Sign In to Review
          </Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Please enter a review comment.");
      return;
    }

    setSubmitting(true);
    const userId = (session.user as any).id;
    const res = await submitProductReview({
      userId,
      productId,
      rating,
      comment,
    });
    setSubmitting(false);

    if (res.success) {
      toast.success("Thank you! Your review has been published.");
      setComment("");
    } else {
      toast.error(res.error || "Failed to submit review.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-soft space-y-4">
      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
        <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Leave a Review
      </h4>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700">Your Rating</label>
        <RatingStars
          rating={rating}
          size="lg"
          interactive
          onRatingChange={(r) => setRating(r)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700">Your Feedback</label>
        <textarea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="How did this product perform? Share your thoughts on scent, smoke level, and effectiveness..."
          required
          className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-dark focus:bg-white"
        />
      </div>

      <Button type="submit" variant="primary" size="sm" isLoading={submitting} className="w-full">
        Submit Review
      </Button>
    </form>
  );
}
