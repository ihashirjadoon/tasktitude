import { Todo, WorkHours } from '@/components/types';

// function to check if a time slot is within work hours
//this is broken too
const isWithinWorkHours = (time: Date, workHours: WorkHours): boolean => {
  if (!workHours.start || !workHours.end) return false; // ensure workHours has valid values

  const [startHour, startMinute] = workHours.start.split(':').map(Number);
  const [endHour, endMinute] = workHours.end.split(':').map(Number);
  const hour = time.getHours();
  const minute = time.getMinutes();

  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;
  const currentTime = hour * 60 + minute;

  return currentTime >= startTime && currentTime < endTime;
};

// function to check if a time slot overlaps with existing todos
//overlap problems when suggesting
const overlapsWithExistingTodos = (start: Date, end: Date, todos: Todo[]): boolean => {
  return todos.some(todo => {
    if (!todo.startTime || !todo.endTime) return false;
    return (start < todo.endTime && end > todo.startTime);
  });
};

// suggesting new time for todo
//kinda broken 
//aklways schedules latest time slot
export const suggestTimeSlot = (newTodo: Todo, existingTodos: Todo[], workHours: WorkHours): Todo => {
  const { deadline, estimatedTime } = newTodo;
  if (!deadline || estimatedTime === undefined) {
    throw new Error("Deadline or estimated time is missing");
  }
  
  const taskDuration = estimatedTime * 60 * 1000; // convert minutes to milliseconds

  let suggestedStart = new Date();
  if (suggestedStart < new Date()) {
    suggestedStart = new Date();
  }

  while (!isWithinWorkHours(suggestedStart, workHours)) {
    suggestedStart.setTime(suggestedStart.getTime() + 15 * 60 * 1000); // move 15 minutes forward
  }

  let suggestedEnd = new Date(suggestedStart.getTime() + taskDuration);

  while (suggestedEnd <= deadline) {
    // Use overlapsWithExistingTodos function to check for overlaps
    const overlaps = overlapsWithExistingTodos(suggestedStart, suggestedEnd, existingTodos);

    if (
      isWithinWorkHours(suggestedStart, workHours) &&
      isWithinWorkHours(suggestedEnd, workHours) &&
      !overlaps
    ) {
      return {
        ...newTodo,
        startTime: suggestedStart,
        endTime: suggestedEnd,
      };
    }

    suggestedStart.setTime(suggestedStart.getTime() + 15 * 60 * 1000); // 15-minute intervals
    suggestedEnd = new Date(suggestedStart.getTime() + taskDuration);

    if (!isWithinWorkHours(suggestedStart, workHours)) {
      suggestedStart.setDate(suggestedStart.getDate() + 1);
      suggestedStart.setHours(
        parseInt(workHours.start.split(':')[0], 10),
        parseInt(workHours.start.split(':')[1], 10),
        0,
        0
      );
      suggestedEnd = new Date(suggestedStart.getTime() + taskDuration);
    }
  }

  suggestedEnd = new Date(deadline);
  suggestedStart = new Date(suggestedEnd.getTime() - taskDuration);

  return {
    ...newTodo,
    startTime: suggestedStart,
    endTime: suggestedEnd,
  };
};


// function to reschedule todo
//needs testing
export const rescheduleTodo = (todoToReschedule: Todo, existingTodos: Todo[], workHours: WorkHours): Todo => {
  const otherTodos = existingTodos.filter(todo => todo.id !== todoToReschedule.id);
  
  return suggestTimeSlot(todoToReschedule, otherTodos, workHours);
};

// function to optimize schedule
//this is also broken
//can implement ai here to make harder tasks finished first
export const optimizeSchedule = (todos: Todo[], workHours: WorkHours): Todo[] => {
    const sortedTodos = [...todos].sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
    
    const optimizedTodos: Todo[] = [];
    
    for (const todo of sortedTodos) {
      const scheduledTodo = suggestTimeSlot(todo, optimizedTodos, workHours);
      optimizedTodos.push(scheduledTodo);
    }
    
    return optimizedTodos;
};
