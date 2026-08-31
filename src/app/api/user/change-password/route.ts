/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { authService } from "@/services/auth.service";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Both passwords are required" },
        { status: 400 },
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    await authService.changePassword(
      session.user.id,
      currentPassword,
      newPassword,
    );

    return NextResponse.json({ message: "Password changed successfully" });
  } catch (error: any) {
    if (error.message === "Current password is incorrect") {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
