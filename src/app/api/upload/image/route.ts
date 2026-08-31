import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a JPEG, PNG, WebP, GIF, or AVIF image." },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "Image must be smaller than 5MB." }, { status: 400 });
    }

    // File → Buffer → Base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder: "tech-to-check/blogs",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });

    // EditorJS image tool এর format
    return NextResponse.json({
      success: 1,
      file: { url: result.secure_url },
    });
  } catch {
    return NextResponse.json({ success: 0 }, { status: 500 });
  }
}
