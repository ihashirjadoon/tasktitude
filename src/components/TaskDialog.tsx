import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EventInput } from '@fullcalendar/core';
import { Todo } from '@/components/types';

interface TaskDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  todo: Todo | null;
  setTodo: (todo: Todo | null) => void;
  todos: Todo[];
  setTodos: (todos: Todo[]) => void;
  events: EventInput[];
  setEvents: (events: EventInput[]) => void;
}

export default function TaskDialog({
  isOpen,
  setIsOpen,
  todo,
  setTodo,
  todos,
  setTodos,
  events,
  setEvents,
}: TaskDialogProps) {
  const handleClose = () => {
    setIsOpen(false);
    setTodo(null);
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    if (!todo) return;
    const newTime = new Date(value);
    const updatedTodo = { ...todo, [field]: newTime };

    // Check if startTime is after endTime, adjust endTime if needed
    if (field === 'startTime' && newTime >= new Date(todo.endTime)) {
      const adjustedEndTime = new Date(newTime.getTime() + (todo.estimatedTime || 60) * 60000);
      updatedTodo.endTime = adjustedEndTime;
    } else if (field === 'endTime' && newTime <= new Date(todo.startTime)) {
      const adjustedStartTime = new Date(newTime.getTime() - (todo.estimatedTime || 60) * 60000);
      updatedTodo.startTime = adjustedStartTime;
    }

    setTodo(updatedTodo);

    // Update todos and events
    const updatedTodos = todos.map(t => t.id === todo.id ? updatedTodo : t);
    setTodos(updatedTodos);

    const updatedEvents = events.map(event =>
      event.id === todo.id ? { ...event, [field === 'startTime' ? 'start' : 'end']: newTime } : event
    );
    setEvents(updatedEvents);
  };

  if (!todo) {
    return null; // If todo is null, render nothing or return a fallback UI
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-white rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-800">Task Details</DialogTitle>
          <DialogDescription>
            Here are the details for this task. You can adjust the start and end times.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-lg"><strong>Task:</strong> {todo.task}</p>
          <p><strong>Estimated Time:</strong> {todo.estimatedTime} minutes</p>
          <p><strong>Deadline:</strong> {formatDeadline(todo.deadline)}</p>
          <div>
            <Label htmlFor="startTime" className="text-sm font-semibold">Start Time</Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={formatDateTimeLocal(todo.startTime)}
              onChange={(e) => handleTimeChange('startTime', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="endTime" className="text-sm font-semibold">End Time</Label>
            <Input
              id="endTime"
              type="datetime-local"
              value={formatDateTimeLocal(todo.endTime)}
              onChange={(e) => handleTimeChange('endTime', e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to format deadline
function formatDeadline(deadline: Date | string | null): string {
  if (!deadline) return 'No deadline set';

  const date = typeof deadline === 'string' ? new Date(deadline) : deadline;
  
  return date instanceof Date && !isNaN(date.getTime())
    ? date.toLocaleDateString()
    : 'Invalid date';
}

// Helper function to format datetime-local input values
function formatDateTimeLocal(date: Date | string | null): string {
  if (!date) return '';

  const parsedDate = typeof date === 'string' ? new Date(date) : date;

  if (!(parsedDate instanceof Date) || isNaN(parsedDate.getTime())) {
    return ''; // Return an empty string if the date is invalid
  }

  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${parsedDate.getFullYear()}-${pad(parsedDate.getMonth() + 1)}-${pad(parsedDate.getDate())}T${pad(parsedDate.getHours())}:${pad(parsedDate.getMinutes())}`;
}
