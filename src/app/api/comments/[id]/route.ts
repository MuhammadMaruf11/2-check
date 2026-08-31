import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { commentService } from "@/services/comment.service";

// Owner only - PATCH edit comment content, OR admin/post-author - hide/unhide
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const comment = await commentService.findById(id);
    if (!comment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const isOwner = comment.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    const isPostAuthor = comment.blog.authorId === session.user.id;

    const body = await req.json();

    if (body.action === "toggleHidden") {
      if (!isAdmin && !isPostAuthor) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const updated = await commentService.toggleHidden(id);
      return NextResponse.json(updated);
    }

    if (typeof body.content === "string") {
      if (!isOwner) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const updated = await commentService.update(id, body.content);
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "No valid action provided" }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

// Admin or comment owner - DELETE comment
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
    const comment = await commentService.findById(id);
    if (!comment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const isOwner = comment.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await commentService.delete(id);
    return NextResponse.json({ message: "Deleted successfully" });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
