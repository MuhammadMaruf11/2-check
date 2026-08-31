import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { newsService } from "@/services/news.service";

// Public - GET all news
export async function GET() {
  try {
    const news = await newsService.getAll();
    return NextResponse.json(news);
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

// Admin only - POST create news
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, slug, content, imageUrl } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Title, slug and content are required" },
        { status: 400 },
      );
    }

    const news = await newsService.create({ title, slug, content, imageUrl });
    return NextResponse.json(news, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
