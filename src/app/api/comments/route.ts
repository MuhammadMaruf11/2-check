/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { commentService } from "@/services/comment.service";

// Public - GET comments by blog. Admins and a post's own author can pass
// includeHidden=true to see hidden/moderated comments too.
// Admin only - GET the full moderation queue via ?admin=true.
// Author - GET comments on their own posts via ?mine=true.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const blogId = searchParams.get("blogId");
    const wantsHidden = searchParams.get("includeHidden") === "true";

    if (searchParams.get("admin") === "true") {
      const session = await getServerSession(authOptions);
      if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const page = parseInt(searchParams.get("page") || "1");
      const onlyHidden = searchParams.get("hidden") === "true";
      const data = await commentService.getForAdmin({ page, onlyHidden });
      return NextResponse.json(data);
    }

    if (searchParams.get("mine") === "true") {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const page = parseInt(searchParams.get("page") || "1");
      const data = await commentService.getForAuthor(session.user.id, { page });
      return NextResponse.json(data);
    }

    if (searchParams.get("authored") === "true") {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const page = parseInt(searchParams.get("page") || "1");
      const data = await commentService.getAuthoredByUser(session.user.id, { page });
      return NextResponse.json(data);
    }

    if (!blogId) {
      return NextResponse.json(
        { error: "blogId is required" },
        { status: 400 },
      );
    }

    let includeHidden = false;
    if (wantsHidden) {
      const session = await getServerSession(authOptions);
      includeHidden = session?.user?.role === "ADMIN";
      // (Author-owns-this-post case is handled by the dedicated admin/author
      // comment moderation endpoints, which already scope by ownership.)
    }

    const comments = await commentService.getByBlog(blogId, { includeHidden });
    return NextResponse.json(comments);
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

// Public - POST create comment (guest or logged-in)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { content, blogId, guestName, guestEmail } = body;

    if (!content || !blogId) {
      return NextResponse.json(
        { error: "Content and blogId are required" },
        { status: 400 },
      );
    }

    if (!session && !guestName) {
      return NextResponse.json(
        { error: "Guest name is required" },
        { status: 400 },
      );
    }

    const comment = await commentService.create({
      content,
      blogId,
      userId: session?.user.id,
      guestName: !session ? guestName : undefined,
      guestEmail: !session ? guestEmail : undefined,
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 },
    );
  }
}
