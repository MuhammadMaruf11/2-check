import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { newsletterService } from "@/services/newsletter.service";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public - POST subscribe
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    // upsert makes re-subscribing idempotent rather than erroring on a duplicate email
    await newsletterService.subscribe(email.toLowerCase().trim());
    return NextResponse.json({ message: "Subscribed successfully" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// Admin only - GET all subscribers
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const subscribers = await newsletterService.getAll();
    return NextResponse.json(subscribers);
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
