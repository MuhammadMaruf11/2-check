import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { reviewService } from "@/services/review.service";

// Public - GET approved reviews for a product.
// Admin only - GET the full moderation queue via ?admin=true (all statuses, paginated).
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (searchParams.get("admin") === "true") {
      const session = await getServerSession(authOptions);
      if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");
      const status = searchParams.get("status") as "PENDING" | "APPROVED" | "REJECTED" | null;

      const data = await reviewService.getForAdmin({
        page,
        limit,
        status: status ?? undefined,
        productId: productId ?? undefined,
      });
      return NextResponse.json(data);
    }

    if (searchParams.get("mine") === "true") {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const page = parseInt(searchParams.get("page") || "1");
      const data = await reviewService.getByUser(session.user.id, { page });
      return NextResponse.json(data);
    }

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const [reviews, rating] = await Promise.all([
      reviewService.getByProduct(productId, { onlyApproved: true }),
      reviewService.getAverageRating(productId),
    ]);

    return NextResponse.json({ reviews, rating });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// Auth required - POST create review (goes into PENDING moderation queue)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { rating, title, comment, productId } = body;

    if (!rating || !comment || !productId) {
      return NextResponse.json(
        { error: "Rating, comment and productId are required" },
        { status: 400 },
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const alreadyReviewed = await reviewService.hasReviewed(session.user.id, productId);
    if (alreadyReviewed) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 409 },
      );
    }

    const review = await reviewService.create({
      rating,
      title,
      comment,
      productId,
      userId: session.user.id,
    });

    return NextResponse.json(review, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
