import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { categoryService } from "@/services/category.service";

// Public - GET single category
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const category = await categoryService.getBySlug(slug);
    if (!category) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// Admin only - PATCH update category
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
    const category = await categoryService.getBySlug(slug);
    if (!category) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const updated = await categoryService.update(category.id, body);
    return NextResponse.json(updated);
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === "P2002") {
      return NextResponse.json({ error: "A category with this slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// Admin only - DELETE category
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
    const category = await categoryService.getBySlug(slug);
    if (!category) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await categoryService.delete(category.id);
    return NextResponse.json({ message: "Deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
