import { NextResponse } from 'next/server';
import { Todo, WorkHours } from '@/components/types';
import { suggestTimeSlot } from '@/utils/aiUtils';

export async function POST(req: Request) {
  try {
    // parse json
    const { newTodo, existingTodos, workHours } = await req.json() as {
      newTodo: Todo;
      existingTodos: Todo[];
      workHours: WorkHours;
    };

    // implement ai in this later
    const scheduledTodo = suggestTimeSlot(newTodo, existingTodos, workHours);

    // return the scheduled todo as json
    return NextResponse.json(scheduledTodo);
  } catch (error) {
    console.error('Error scheduling task:', error);
    // return a 500 error response
    return NextResponse.json({ error: 'Failed to schedule task' }, { status: 500 });
  }
}