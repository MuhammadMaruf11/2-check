import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { userService } from "@/services/user.service";

// Admin only - GET all users
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const role = searchParams.get("role") || undefined;
    const search = searchParams.get("search") || undefined;

    const data = await userService.getAll({ page, role, search });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
