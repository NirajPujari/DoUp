import dbConnect from "@/lib/db";
import Task from "@/models/Task";
import TaskCompletion from "@/models/TaskCompletion";
import { startOfDay, endOfDay, subDays, isSameDay } from "date-fns";

export interface TaskInstance {
  _id: string;
  title: string;
  description: string;
  type: "one-time" | "repeating" | "annual";
  time?: string;
  progress: number;
  isCompleted: boolean;
  isRolledOver: boolean;
  originalDate?: Date;
}

/**
 * Core engine to compute what tasks are active on a specific date.
 */
export async function getTasksForDate(userId: string, date: Date): Promise<TaskInstance[]> {
  await dbConnect();

  const dayOfWeek = date.getDay(); // 0-6
  const month = date.getMonth();
  const dayOfMonth = date.getDate();

  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  // 1. Fetch one-time tasks for this specific day
  const oneTimeTasks = await Task.find({
    userId,
    type: "one-time",
    date: { $gte: dayStart, $lte: dayEnd },
  });

  // 2. Fetch repeating tasks for this day of the week
  const repeatingTasks = await Task.find({
    userId,
    type: "repeating",
    daysOfWeek: dayOfWeek,
  });

  // 3. Fetch annual tasks for this month/day
  const annualTasks = await Task.find({
    userId,
    type: "annual",
    // We filter analytically later or use a complex mongo query. 
    // Since annual tasks are few, we filter in JS for simplicity/clarity.
  });

  const filteredAnnualTasks = annualTasks.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === month && d.getDate() === dayOfMonth;
  });

  // 4. Handle Rollover (Uncompleted one-time tasks from previous days)
  // Only if the requested date is "today" or in the future
  const today = startOfDay(new Date());
  let rolledOverTasks: any[] = [];
  
  if (isSameDay(date, today)) {
    rolledOverTasks = await Task.find({
      userId,
      type: "one-time",
      date: { $lt: dayStart },
      progress: { $lt: 100 },
    });
  }

  // 5. Check completions for recurring/annual tasks
  const completions = await TaskCompletion.find({
    userId,
    completedAt: { $gte: dayStart, $lte: dayEnd },
  });

  const completedTaskIds = new Set(completions.map((c) => c.taskId.toString()));

  // 6. Map and combine
  const allTasks: TaskInstance[] = [
    ...oneTimeTasks.map((t) => ({
      _id: t._id.toString(),
      title: t.title,
      description: t.description,
      type: t.type,
      time: t.time,
      progress: t.progress,
      isCompleted: t.progress >= 100,
      isRolledOver: false,
    })),
    ...repeatingTasks.map((t) => ({
      _id: t._id.toString(),
      title: t.title,
      description: t.description,
      type: t.type,
      time: t.time,
      progress: completedTaskIds.has(t._id.toString()) ? 100 : 0,
      isCompleted: completedTaskIds.has(t._id.toString()),
      isRolledOver: false,
    })),
    ...filteredAnnualTasks.map((t) => ({
      _id: t._id.toString(),
      title: t.title,
      description: t.description,
      type: t.type,
      time: t.time,
      progress: completedTaskIds.has(t._id.toString()) ? 100 : 0,
      isCompleted: completedTaskIds.has(t._id.toString()),
      isRolledOver: false,
    })),
    ...rolledOverTasks.map((t) => ({
      _id: t._id.toString(),
      title: t.title,
      description: t.description,
      type: t.type,
      time: t.time,
      progress: t.progress,
      isCompleted: t.progress >= 100,
      isRolledOver: true,
      originalDate: t.date,
    })),
  ];

  // Sort by time
  return allTasks.sort((a, b) => {
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });
}
