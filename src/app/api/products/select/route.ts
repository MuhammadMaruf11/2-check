import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { productService } from "@/services/product.service";

// Admin only - lightweight id/name list for "related products" pickers
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const products = await productService.getAllForSelect();
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
