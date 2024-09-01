import { NextResponse } from 'next/server';
import { Todo, WorkHours } from '@/components/types';
import { suggestTimeSlot } from '@/utils/aiUtils';

export async function POST(req: Request) {
  try {
    const { newTodo, existingTodos, workHours } = await req.json() as {
      newTodo: Todo;
      existingTodos: Todo[];
      workHours: WorkHours;
    };

    const scheduledTodo = await suggestTimeSlot(newTodo, existingTodos, workHours);

    return NextResponse.json(scheduledTodo);
  } catch (error) {
    console.error('Error scheduling task:', error);
    return NextResponse.json({ error: 'Failed to schedule task' }, { status: 500 });
  }
}