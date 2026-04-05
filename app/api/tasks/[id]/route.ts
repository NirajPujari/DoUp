import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Task from "@/models/Task";
import TaskCompletion from "@/models/TaskCompletion";
import { getSession } from "@/lib/auth/jwt";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "No session" }, { status: 401 });

    const { id } = await params;

    // Delete the task
    const task = await Task.findOneAndDelete({ _id: id, userId: session.id });
    if (!task) return NextResponse.json({ message: "Task not found" }, { status: 404 });

    // Also delete all completion records for this task
    await TaskCompletion.deleteMany({ taskId: id, userId: session.id });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
