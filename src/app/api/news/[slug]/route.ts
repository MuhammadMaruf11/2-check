import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { newsService } from "@/services/news.service";

// Public - GET single news
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const news = await newsService.getBySlug(slug);
    if (!news) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(news);
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

// Admin only - PATCH update news
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { slug } = await params;
    const news = await newsService.getBySlug(slug);
    if (!news) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const updated = await newsService.update(news.id, body);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

// Admin only - DELETE news
export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { slug } = await params;
    const news = await newsService.getBySlug(slug);
    if (!news) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await newsService.delete(news.id);
    return NextResponse.json({ message: "Deleted successfully" });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
