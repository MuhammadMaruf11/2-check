import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { contactService } from "@/services/contact.service";

// Public - POST send a contact message
export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email and message are required." }, { status: 400 });
    }
    const created = await contactService.create({ name, email, subject, message });
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// Admin only - GET all messages
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const onlyUnread = searchParams.get("unread") === "true";
    const data = await contactService.getAll({ page, onlyUnread });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
