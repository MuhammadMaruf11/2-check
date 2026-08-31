import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { productService } from "@/services/product.service";

// Admin only - POST add video review
export async function POST(
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
    const product = await productService.getBySlug(slug, { includeUnpublished: true });
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const { title, youtubeUrl } = body;
    if (!title || !youtubeUrl) {
      return NextResponse.json({ error: "title and youtubeUrl are required" }, { status: 400 });
    }

    const video = await productService.addVideoReview(product.id, body);
    return NextResponse.json(video, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
