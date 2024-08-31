import { NextResponse } from 'next/server';
import { Todo, WorkHours } from '@/components/types';
import { optimizeSchedule } from '@/utils/aiUtils';

export async function POST(req: Request) {
  try {
    // parse json
    const { todos, workHours } = await req.json() as {
      todos: Todo[];
      workHours: WorkHours;
    };

    // iomplment ai in this later
    const optimizedSchedule = optimizeSchedule(todos, workHours);

    // return the optimized schedule as json
    return NextResponse.json(optimizedSchedule);
  } catch (error) {
    console.error('Error optimizing schedule:', error);
    // return a 500 error response
    return NextResponse.json({ error: 'Failed to optimize schedule' }, { status: 500 });
  }
}