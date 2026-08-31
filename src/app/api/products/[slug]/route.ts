import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { productService } from "@/services/product.service";

// Public - GET single product (admins can view unpublished products too)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN";

    const product = await productService.getBySlug(slug, { includeUnpublished: isAdmin, includeCustomerReviews: isAdmin });
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// Admin only - PATCH update product (also handles publish/featured toggles via body flags)
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
    const product = await productService.getBySlug(slug, { includeUnpublished: true });
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();

    if (body.action === "togglePublish") {
      const updated = await productService.togglePublish(product.id);
      return NextResponse.json(updated);
    }
    if (body.action === "toggleFeatured") {
      const updated = await productService.toggleFeatured(product.id);
      return NextResponse.json(updated);
    }

    const updated = await productService.update(product.id, body);
    return NextResponse.json(updated);
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === "P2002") {
      return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
    }
    console.error("PATCH /api/products/[slug] error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// Admin only - DELETE product
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
    const product = await productService.getBySlug(slug, { includeUnpublished: true });
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await productService.delete(product.id);
    return NextResponse.json({ message: "Deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
