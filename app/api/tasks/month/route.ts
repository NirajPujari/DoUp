import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getSession } from "@/lib/auth/jwt";
import { getTasksForDate } from "@/lib/tasks/engine";
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from "date-fns";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const monthStr = searchParams.get("month"); // e.g. "2026-04"
    if (!monthStr) return NextResponse.json({ message: "Missing month" }, { status: 400 });

    const [year, month] = monthStr.split("-").map(Number);
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(startDate);

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const monthlyTasks: Record<string, { _id: string; title: string; type: string; isCompleted: boolean; }[]> = {};

    // For each day, get the tasks using the engine
    // Note: In a real production app with many tasks, this should be optimized
    // to fetch all relevant task rules once and then compute instances in memory.
    for (const day of days) {
      const dateKey = format(day, "yyyy-MM-dd");
      const tasks = await getTasksForDate(session.id, day);
      if (tasks.length > 0) {
        monthlyTasks[dateKey] = tasks.map(t => ({
          _id: t._id,
          title: t.title,
          type: t.type,
          isCompleted: t.isCompleted,
        }));
      }
    }

    return NextResponse.json(monthlyTasks);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
