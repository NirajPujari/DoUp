import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { isTaskVisibleOnDate, dateToString } from '@/lib/task-logic';
import { Task } from '@/types';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date') || dateToString(new Date());
    const targetDate = new Date(dateParam);

    const db = await getDb();
    const tasksRaw = await db.collection('tasks').find({ userId: session.user.id }).toArray();
    const visibleTasks = tasksRaw.filter(task => isTaskVisibleOnDate(task as Task, targetDate));

    return NextResponse.json({ tasks: visibleTasks });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const taskData = await request.json();
    const { title, description, time, type, date, daysOfWeek, annualDate } = taskData;

    if (!title || !type) {
      return NextResponse.json({ error: 'Title and Type are required' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection('tasks').insertOne({
      userId: session.user.id,
      title,
      description: description || '',
      time: time || '00:00',
      type,
      date: date ? new Date(date) : undefined,
      daysOfWeek: daysOfWeek || [],
      annualDate: annualDate || undefined,
      completedDate: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ message: 'Task created', taskId: result.insertedId }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}
