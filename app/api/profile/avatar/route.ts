import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { db } from "@/lib/db/client";
import { put } from "@vercel/blob";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Validate dimensions (basic check - could be enhanced)
    // Note: Full image validation would require image processing library

    // Upload to Vercel Blob
    const blob = await put(`avatars/${session.user.id}/${Date.now()}-${file.name}`, file, {
      access: "public",
      contentType: file.type,
    });

    // Update profile in database
    await db.query(
      `UPDATE profiles 
       SET avatar_url = $1, avatar_source = 'uploaded' 
       WHERE user_id = $2`,
      [blob.url, session.user.id]
    );

    return NextResponse.json({
      success: true,
      avatarUrl: blob.url,
    });
  } catch (error: any) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload avatar" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current avatar URL
    const profileResult = await db.query(
      "SELECT avatar_url FROM profiles WHERE user_id = $1",
      [session.user.id]
    );

    const avatarUrl = profileResult.rows[0]?.avatar_url;

    // Update profile to remove avatar
    await db.query(
      `UPDATE profiles 
       SET avatar_url = NULL, avatar_source = 'generated' 
       WHERE user_id = $1`,
      [session.user.id]
    );

    // Note: Vercel Blob doesn't have a delete API in @vercel/blob v2
    // You could implement blob deletion if needed, but for now we just clear the DB reference
    // The blob will remain in storage but won't be referenced

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Avatar delete error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove avatar" },
      { status: 500 }
    );
  }
}
