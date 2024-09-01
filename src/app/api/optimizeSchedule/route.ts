import { NextResponse } from 'next/server';
import { Todo, WorkHours } from '@/components/types';
import { optimizeSchedule } from '@/utils/aiUtils';

export async function POST(req: Request) {
  try {
    const { todos, workHours } = await req.json() as {
      todos: Todo[];
      workHours: WorkHours;
    };

    const optimizedSchedule = await optimizeSchedule(todos, workHours);

    return NextResponse.json(optimizedSchedule);
  } catch (error) {
    console.error('Error optimizing schedule:', error);
    return NextResponse.json({ error: 'Failed to optimize schedule' }, { status: 500 });
  }
}