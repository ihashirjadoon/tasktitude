import { Todo, WorkHours } from '@/components/types';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});


export async function optimizeSchedule(todos: Todo[], workHours: WorkHours): Promise<Todo[]> {
  const currentTime = new Date();
  const sortedTodos = todos.sort((a, b) => {
    if (a.difficulty !== b.difficulty) {
      return (b.difficulty || 'Medium').localeCompare(a.difficulty || 'Medium');
    }
    return (a.startTime?.getTime() || 0) - (b.startTime?.getTime() || 0);
  });

  const prompt = `
    Optimize the following schedule, starting from the current time (${currentTime.toISOString()}):
    ${sortedTodos.map(todo => `Task: ${todo.task}, Estimated Time: ${todo.estimatedTime} minutes, Difficulty: ${todo.difficulty || 'Medium'}`).join('\n')}

    Work hours: ${workHours.start} to ${workHours.end}

    Optimization rules:
    1. Start scheduling from the current time (${currentTime.toISOString()}).
    2. Prioritize harder tasks earlier in the day to avoid burnout.
    3. Add 15-minute breaks every 2 hours of work.
    4. Schedule a 1-hour lunch break around midday.
    5. Schedule a 1-hour dinner break in the evening if work hours extend past 6 PM.
    6. Ensure no task starts before ${workHours.start} or ends after ${workHours.end}.
    7. If tasks cannot be completed today, schedule them for future days.
    8. Ensure tasks aren't scheduled in the past.
    
    Return the optimized schedule as a JSON array of objects, each containing:
    { "task": "Task name", "startTime": "YYYY-MM-DDTHH:mm:ss", "endTime": "YYYY-MM-DDTHH:mm:ss", "isBreak": boolean }
  `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-70b-8192",
    });

    const optimizedSchedule = JSON.parse(completion.choices[0]?.message?.content || '[]');
    console.log("Optimized schedule:", optimizedSchedule);

    return optimizedSchedule.map((item: any) => {
      if (item.isBreak) {
        return {
          id: `break-${Date.now()}-${Math.random()}`,
          task: item.task,
          startTime: new Date(item.startTime),
          endTime: new Date(item.endTime),
          estimatedTime: 15,
          difficulty: 'Easy',
          completed: false,
        };
      }
      const originalTodo = todos.find(todo => todo.task === item.task);
      return {
        ...originalTodo,
        startTime: new Date(item.startTime),
        endTime: new Date(item.endTime),
      };
    });
  } catch (error) {
    console.error('Error in AI schedule optimization:', error);
    return todos; 
  }
}


export async function suggestTimeSlot(newTodo: Todo, existingTodos: Todo[], workHours: WorkHours): Promise<Todo> {
  const existingSchedule = existingTodos.map(todo => {
    const startTime = formatTime(todo.startTime);
    const endTime = formatTime(todo.endTime);
    return `Task: ${todo.task}, Start: ${startTime}, End: ${endTime}`;
  }).join('\n');

  const prompt = `
    Given the following existing schedule:
    ${existingSchedule}

    And work hours from ${workHours.start} to ${workHours.end},
    suggest the best time slot for this new task:
    Task: ${newTodo.task}, Estimated Time: ${newTodo.estimatedTime} minutes, Deadline: ${newTodo.deadline ? formatTime(newTodo.deadline) : 'No Deadline'}

    Return ONLY the suggested start time in the format: YYYY-MM-DDTHH:mm:ss
    Ensure the suggested time is within the work hours, doesn't overlap with existing tasks, and isn't in the past.
    If there's no available slot today, suggest a time for tomorrow.
  `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-70b-8192",
    });

    const aiResponse = completion.choices[0]?.message?.content?.trim();
    console.log("AI suggested time:", aiResponse);

    let suggestedStartTime = new Date(aiResponse || '');

    if (isNaN(suggestedStartTime.getTime()) || suggestedStartTime < new Date()) {
      console.error("Invalid or past date returned by AI:", aiResponse);
      suggestedStartTime = new Date();
    }

    const adjustedStartTime = adjustTimeToWorkHours(suggestedStartTime, workHours, existingTodos);
    console.log("Adjusted start time:", adjustedStartTime);

    return {
      ...newTodo,
      startTime: adjustedStartTime,
      endTime: new Date(adjustedStartTime.getTime() + (newTodo.estimatedTime || 60) * 60000),
    };
  } catch (error) {
    console.error('Error in AI time slot suggestion:', error);
    return {
      ...newTodo,
      startTime: new Date(),
      endTime: new Date(Date.now() + (newTodo.estimatedTime || 60) * 60000),
    };
  }
}

function adjustTimeToWorkHours(suggestedTime: Date, workHours: WorkHours, existingTodos: Todo[]): Date {
  const [startHour, startMinute] = workHours.start.split(':').map(Number);
  const [endHour, endMinute] = workHours.end.split(':').map(Number);

  let adjustedTime = new Date(suggestedTime);
  const now = new Date();

  if (adjustedTime < now) {
    adjustedTime = new Date(now.getTime() + 5 * 60000); 
  }

  adjustedTime.setHours(
    Math.max(startHour, Math.min(adjustedTime.getHours(), endHour)),
    adjustedTime.getMinutes(),
    0,
    0
  );

  if (adjustedTime.getHours() < startHour || (adjustedTime.getHours() === startHour && adjustedTime.getMinutes() < startMinute)) {
    adjustedTime.setHours(startHour, startMinute, 0, 0);
  }

  while (isOverlapping(adjustedTime, existingTodos)) {
    adjustedTime = new Date(adjustedTime.getTime() + 30 * 60000);
  }

  if (adjustedTime.getHours() > endHour || (adjustedTime.getHours() === endHour && adjustedTime.getMinutes() > endMinute)) {
    adjustedTime.setDate(adjustedTime.getDate() + 1);
    adjustedTime.setHours(startHour, startMinute, 0, 0);
  }

  return adjustedTime;
}

function isOverlapping(suggestedTime: Date, existingTodos: Todo[]): boolean {
  return existingTodos.some(todo => {
    const todoStart = new Date(todo.startTime);
    const todoEnd = new Date(todo.endTime);
    return suggestedTime >= todoStart && suggestedTime < todoEnd;
  });
}

function formatTime(date: Date | string | undefined): string {
  if (!date) return 'No Time Set';
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) throw new Error('Invalid Date');
    return parsedDate.toISOString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}