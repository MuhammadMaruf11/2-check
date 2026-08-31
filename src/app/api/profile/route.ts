import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET the current user's own profile
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, role: true, createdAt: true },
  });
  return NextResponse.json(user);
}

// PATCH update the current user's own name/image, or change their own password
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (body.action === "changePassword") {
      const { currentPassword, newPassword } = body;
      if (!currentPassword || !newPassword || newPassword.length < 8) {
        return NextResponse.json(
          { error: "Current password and a new password (min 8 characters) are required" },
          { status: 400 },
        );
      }

      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (!user?.password) {
        return NextResponse.json({ error: "Password change is not available for this account" }, { status: 400 });
      }

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({ where: { id: session.user.id }, data: { password: hashed } });
      return NextResponse.json({ message: "Password updated successfully" });
    }

    // Only name/image are self-editable - role and isActive are admin-only (see /api/users/[id]).
    const { name, image } = body;
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(image !== undefined ? { image } : {}),
      },
      select: { id: true, name: true, email: true, image: true },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
