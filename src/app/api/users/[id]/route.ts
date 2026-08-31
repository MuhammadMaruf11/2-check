import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { userService } from "@/services/user.service";

// Admin only - PATCH role change or activate/deactivate
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Admins cannot demote or deactivate themselves - avoids accidentally
    // locking the only admin account out of the dashboard.
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "You cannot change your own role or active status" },
        { status: 400 },
      );
    }

    const target = await userService.findById(id);
    if (!target) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();

    if (body.role && ["USER", "AUTHOR", "ADMIN"].includes(body.role)) {
      const updated = await userService.updateRole(id, body.role);
      return NextResponse.json(updated);
    }
    if (body.action === "toggleActive") {
      const updated = await userService.toggleActive(id);
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "No valid action provided" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
