import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await db.query(
      "SELECT user_id FROM profiles WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    // Generate user ID (same format as email provider)
    const userId = email.toLowerCase();

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate handle from email
    const emailParts = email.split("@");
    const baseHandle = emailParts[0].toLowerCase().replace(/[^a-z0-9]/g, "_");
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const handle = `${baseHandle}_${randomSuffix}`;

    // Create profile
    await db.query(
      `INSERT INTO profiles (user_id, email, handle, password_hash, password_changed_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id) DO NOTHING`,
      [userId, email, handle, passwordHash]
    );

    return NextResponse.json({ success: true, message: "Account created successfully" });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create account" },
      { status: 500 }
    );
  }
}
