import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { getSession } from "@/lib/auth/jwt";

export async function GET() {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await User.findById(session.id);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    return NextResponse.json({
      name: user.name,
      email: user.email,
      age: user.age,
      bio: user.bio,
      avatarColor: user.avatarColor,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body: { name?: string; age?: number; bio?: string; avatarColor?: string } = await req.json();
    const { name, age, bio, avatarColor } = body;

    const user = await User.findById(session.id);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    if (name) user.name = name;
    if (age !== undefined) user.age = age;
    if (bio !== undefined) user.bio = bio;
    if (avatarColor) user.avatarColor = avatarColor;

    await user.save();

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
