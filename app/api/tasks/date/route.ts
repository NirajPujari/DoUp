import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getSession } from "@/lib/auth/jwt";
import { getTasksForDate } from "@/lib/tasks/engine";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");
    if (!dateStr) return NextResponse.json({ message: "Missing date" }, { status: 400 });

    const date = new Date(dateStr);
    const tasks = await getTasksForDate(session.id, date);

    return NextResponse.json(tasks);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
