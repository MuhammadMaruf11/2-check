/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { blogService } from "@/services/blog.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const statusParam = searchParams.get("status") || undefined;
    const mine = searchParams.get("mine") === "true";

    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN";

    // "mine=true" is how the author dashboard lists a writer's own posts
    // across every status (draft, pending, rejected, etc). Everyone else -
    // including anonymous visitors and admins browsing the public feed -
    // only ever gets PUBLISHED posts, unless the caller is an admin using
    // the admin dashboard (any status, defaulting to all).
    let authorId: string | undefined;
    let status: string | undefined;

    if (mine) {
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      authorId = session.user.id;
      status = statusParam;
    } else if (isAdmin) {
      status = statusParam;
    } else {
      status = "PUBLISHED";
    }

    const data = await blogService.getAll(page, limit, status as any, search, authorId, searchParams.get("tag") || undefined);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN" && session.user.role !== "AUTHOR") {
      return NextResponse.json(
        { error: "Only authors and admins can create blog posts" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const isAdmin = session.user.role === "ADMIN";

    // Non-admin authors can never set status, isFeatured, or scheduling at
    // creation time - new posts from a writer always start as DRAFT and
    // move through the review workflow from there.
    const payload = isAdmin
      ? { ...body, authorId: session.user.id }
      : {
          ...body,
          authorId: session.user.id,
          status: "DRAFT",
          isFeatured: false,
          scheduledAt: undefined,
          publishedAt: undefined,
        };

    const blog = await blogService.create(payload);

    return NextResponse.json(blog, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/blogs error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 },
    );
  }
}
