import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { contactService } from "@/services/contact.service";

// Admin only - PATCH mark as read
export async function PATCH(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    const updated = await contactService.markAsRead(id);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// Admin only - DELETE message
export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    await contactService.delete(id);
    return NextResponse.json({ message: "Deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
