/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { blogService } from "@/services/blog.service";

// Fields an AUTHOR is allowed to touch on their own post. Anything else
// (status beyond DRAFT/PENDING_REVIEW, authorId, isFeatured, scheduledAt,
// publishedAt) is admin-only and is stripped out below before it ever
// reaches the database layer.
const AUTHOR_EDITABLE_FIELDS = [
  "title",
  "subTitle",
  "slug",
  "tags",
  "content",
  "coverImage",
  "productIds",
];
const AUTHOR_ALLOWED_STATUSES = ["DRAFT", "PENDING_REVIEW"];

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const blog = await blogService.getBySlug(slug);
    if (!blog)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(blog);
  } catch (error: any) {
    console.error("GET /api/blogs/[slug] error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const blog = await blogService.getBySlug(slug);

    if (!blog) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const isAuthor = blog.authorId === session.user.id;

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    if (isAdmin) {
      // Admins can update anything, including full status transitions
      // (APPROVED / SCHEDULED / PUBLISHED / REJECTED), scheduling, and
      // the featured flag.
      if (body.status && Object.keys(body).length === 1) {
        const updated = await blogService.updateStatus(blog.id, body.status);
        return NextResponse.json(updated);
      }
      if (body.action === "toggleFeatured") {
        const updated = await blogService.toggleFeatured(blog.id);
        return NextResponse.json(updated);
      }
      const updated = await blogService.update(blog.id, body);
      return NextResponse.json(updated);
    }

    // Non-admin author editing their own post: whitelist content fields only,
    // and only allow the DRAFT <-> PENDING_REVIEW self-service transitions.
    // They can never set APPROVED/SCHEDULED/PUBLISHED/REJECTED, isFeatured,
    // authorId, or scheduling fields directly - those require admin review.
    const safeData: Record<string, unknown> = {};
    for (const field of AUTHOR_EDITABLE_FIELDS) {
      if (field in body) safeData[field] = body[field];
    }
    if (body.status !== undefined) {
      if (!AUTHOR_ALLOWED_STATUSES.includes(body.status)) {
        return NextResponse.json(
          { error: "Only admins can approve, schedule, publish, or reject posts" },
          { status: 403 },
        );
      }
      safeData.status = body.status;
    }

    const updated = await blogService.update(blog.id, safeData);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    const blog = await blogService.getBySlug(slug);
    if (!blog)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isAdmin = session.user.role === "ADMIN";
    const isAuthor = blog.authorId === session.user.id;
    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    // Authors can only delete their own posts while still in draft/review -
    // once a post has been through editorial review, only an admin removes it.
    if (isAuthor && !isAdmin && !["DRAFT", "PENDING_REVIEW", "REJECTED"].includes(blog.status)) {
      return NextResponse.json(
        { error: "This post has already been reviewed; ask an admin to remove it." },
        { status: 403 },
      );
    }

    await blogService.delete(blog.id);
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/blogs/[slug] error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
