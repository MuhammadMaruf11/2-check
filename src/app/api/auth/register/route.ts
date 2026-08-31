/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/auth.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const user = await authService.register({ email, password, name });
    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    if (error.message === "Email already exists") {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
