import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { productService } from "@/services/product.service";

// Public - GET all products (admins additionally see unpublished products)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const categorySlug = searchParams.get("category") || undefined;
    const brand = searchParams.get("brand") || undefined;
    const featuredParam = searchParams.get("featured");
    const sort = (searchParams.get("sort") as "newest" | "rating" | "priceAsc" | "priceDesc" | "name") || "newest";

    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN";
    const statusParam = searchParams.get("status"); // admin-only: "all" | "published" | "unpublished"

    const data = await productService.getAll({
      page,
      limit,
      search,
      categorySlug,
      brand,
      isFeatured: featuredParam ? featuredParam === "true" : undefined,
      includeUnpublished: isAdmin && statusParam !== "published",
      sort,
    });

    // If an admin explicitly asked for unpublished only, filter client-side of the query result set.
    if (isAdmin && statusParam === "unpublished") {
      data.products = data.products.filter((p: { isPublished: boolean }) => !p.isPublished);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// Admin only - POST create product
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
    const { name, slug, shortDescription, longDescription } = body;

    if (!name || !slug || !shortDescription || !longDescription) {
      return NextResponse.json(
        { error: "Name, slug, shortDescription and longDescription are required" },
        { status: 400 },
      );
    }

    const product = await productService.create(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === "P2002") {
      return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
    }
    console.error("POST /api/products error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
