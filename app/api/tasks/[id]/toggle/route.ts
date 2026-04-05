import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Task from "@/models/Task";
import TaskCompletion from "@/models/TaskCompletion";
import { getSession } from "@/lib/auth/jwt";
import { startOfDay, endOfDay } from "date-fns";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "No session" }, { status: 401 });

    const { id } = await params;
    const { isCompleted, type } = await req.json();
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    if (type === "one-time") {
      // For one-time tasks, we update the task itself
      await Task.findOneAndUpdate(
        { _id: id, userId: session.id },
        { progress: isCompleted ? 100 : 0 }
      );
    } else {
      // For repeating/annual tasks, we create/delete a completion record
      if (isCompleted) {
        await TaskCompletion.create({
          userId: session.id,
          taskId: id,
          completedAt: new Date(),
        });
      } else {
        await TaskCompletion.findOneAndDelete({
          userId: session.id,
          taskId: id,
          completedAt: { $gte: todayStart, $lte: todayEnd },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
