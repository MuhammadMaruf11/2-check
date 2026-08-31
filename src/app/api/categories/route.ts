import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { categoryService } from "@/services/category.service";

// Public - GET all categories
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const onlyWithProducts = searchParams.get("withProducts") === "true";

    const categories = onlyWithProducts
      ? await categoryService.getAllWithPublishedProducts()
      : await categoryService.getAll();

    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// Admin only - POST create category
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
    const { name, slug, description, icon, displayOrder } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const category = await categoryService.create({ name, slug, description, icon, displayOrder });
    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === "P2002") {
      return NextResponse.json({ error: "A category with this slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
