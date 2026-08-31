import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { reviewService } from "@/services/review.service";

// Admin only - PATCH moderate (approve/reject), feature, or verify a review
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const review = await reviewService.findById(id);
    if (!review) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();

    if (body.status && ["PENDING", "APPROVED", "REJECTED"].includes(body.status)) {
      const updated = await reviewService.moderate(id, body.status);
      return NextResponse.json(updated);
    }
    if (body.action === "toggleFeature") {
      const updated = await reviewService.toggleFeature(id);
      return NextResponse.json(updated);
    }
    if (body.action === "toggleVerify") {
      const updated = await reviewService.toggleVerify(id);
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "No valid action provided" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// Admin or review owner - DELETE review
export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const review = await reviewService.findById(id);
    if (!review) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const isOwner = review.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await reviewService.delete(id);
    return NextResponse.json({ message: "Deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
