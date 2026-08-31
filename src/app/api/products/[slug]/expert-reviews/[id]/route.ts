import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { productService } from "@/services/product.service";

// Admin only - PATCH update expert review
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const updated = await productService.updateExpertReview(id, body);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// Admin only - DELETE expert review
export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await productService.deleteExpertReview(id);
    return NextResponse.json({ message: "Deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
