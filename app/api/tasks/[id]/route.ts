import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const { completedDate, isCompleted } = await request.json();

    const db = await getDb();

    const task = await db.collection("tasks").findOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // completedDate is stored as a plain string (YYYY-MM-DD)
    // Set it when completing, remove it when un-completing
    const updateOps = completedDate
      ? isCompleted
        ? { $set: { completedDate, updatedAt: new Date() } }
        : { $unset: { completedDate: "" }, $set: { updatedAt: new Date() } }
      : { $set: { updatedAt: new Date() } };

    await db.collection("tasks").updateOne(
      { _id: new ObjectId(id) },
      updateOps,
    );

    return NextResponse.json({ message: "Task updated" });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    const { id } = await context.params;
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await getDb();
    const result = await db
      .collection("tasks")
      .deleteOne({ _id: new ObjectId(id), userId: session.user.id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Task not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Task deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
