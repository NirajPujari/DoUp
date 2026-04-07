import { NextResponse } from 'next/server';
import { getSession, login } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  return NextResponse.json({ user: session.user });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { name } = await request.json();
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const db = await getDb();
    await db.collection('users').updateOne(
      { email: session.user.email },
      { $set: { name: name.trim() } }
    );

    // Re-issue the session cookie with the updated name
    await login({ id: session.user.id, email: session.user.email, name: name.trim() });

    return NextResponse.json({ message: 'Name updated', user: { ...session.user, name: name.trim() } });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
