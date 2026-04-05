import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const updateData = await request.json();
    const { progress, completedDate, isCompleted } = updateData;

    const db = await getDb();
    const task = await db.collection('tasks').findOne({ _id: new ObjectId(params.id), userId: session.user.id });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const update: any = { updatedAt: new Date() };
    if (typeof progress === 'number') update.progress = progress;
    
    // Logic for completion dates
    if (completedDate) {
       if (isCompleted) {
         // Add to completed dates if not already there
         update.$addToSet = { completedDates: completedDate };
       } else {
         // Remove from completed dates
         update.$pull = { completedDates: completedDate };
       }
    }

    await db.collection('tasks').updateOne({ _id: new ObjectId(params.id) }, { $set: update });

    return NextResponse.json({ message: 'Task updated' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await getDb();
    const result = await db.collection('tasks').deleteOne({ _id: new ObjectId(params.id), userId: session.user.id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Task deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
