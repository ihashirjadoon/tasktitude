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
import { Todo, WorkHours } from '@/components/types';

interface TaskDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  todo: Todo | null;
  setTodo: (todo: Todo | null) => void;
  todos: Todo[];
  setTodos: (todos: Todo[]) => void;
  events: EventInput[];
  setEvents: (events: EventInput[]) => void;
  workHours: WorkHours;
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
  workHours,
}: TaskDialogProps) {
  const handleClose = () => {
    setIsOpen(false);
    setTodo(null);
  };

  const handleTimeChange = (field: 'startTime' | 'endTime' | 'deadline', value: string) => {
    if (!todo) return;
    const newTime = new Date(value);
    let updatedTodo = { ...todo, [field]: newTime };

    try {
      // Adjust times based on the changed field
      if (field === 'startTime') {
        updatedTodo = adjustEndTime(updatedTodo);
      } else if (field === 'endTime') {
        updatedTodo = adjustStartTime(updatedTodo);
      } else if (field === 'deadline') {
        updatedTodo = adjustStartAndEndTime(updatedTodo, workHours);
      }

      setTodo(updatedTodo);

      // Update todos and events
      const updatedTodos = todos.map(t => t.id === todo.id ? updatedTodo : t);
      setTodos(updatedTodos);

      const updatedEvents = events.map(event =>
        event.id === todo.id ? {
          ...event,
          start: updatedTodo.startTime,
          end: updatedTodo.endTime,
          extendedProps: { ...updatedTodo }
        } : event
      );
      setEvents(updatedEvents);
    } catch (error) {
      console.error('Error adjusting times:', error);
      // You might want to show an error message to the user here
    }
  };

  if (!todo) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-white rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-800">Task Details</DialogTitle>
          <DialogDescription>
            Here are the details for this task. You can adjust the start time, end time, and deadline.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-lg"><strong>Task:</strong> {todo.task}</p>
          <p><strong>Estimated Time:</strong> {todo.estimatedTime} minutes</p>
          <div>
            <Label htmlFor="deadline" className="text-sm font-semibold">Deadline</Label>
            <Input
              id="deadline"
              type="datetime-local"
              value={formatDateTimeLocal(todo.deadline)}
              onChange={(e) => handleTimeChange('deadline', e.target.value)}
            />
          </div>
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

// Utility functions

function adjustEndTime(todo: Todo): Todo {
  const startTime = new Date(todo.startTime);
  const endTime = new Date(todo.endTime);
  if (startTime >= endTime) {
    const newEndTime = new Date(startTime.getTime() + (todo.estimatedTime || 60) * 60000);
    return { ...todo, endTime: newEndTime };
  }
  return todo;
}

function adjustStartTime(todo: Todo): Todo {
  const startTime = new Date(todo.startTime);
  const endTime = new Date(todo.endTime);
  if (endTime <= startTime) {
    const newStartTime = new Date(endTime.getTime() - (todo.estimatedTime || 60) * 60000);
    return { ...todo, startTime: newStartTime };
  }
  return todo;
}

function adjustStartAndEndTime(todo: Todo, workHours: WorkHours): Todo {
  if (!workHours || !workHours.start || !workHours.end) {
    console.error('Invalid work hours:', workHours);
    return todo;
  }

  const deadline = new Date(todo.deadline);
  const [startHour, startMinute] = workHours.start.split(':').map(Number);
  const [endHour, endMinute] = workHours.end.split(':').map(Number);

  if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
    console.error('Invalid work hours format:', workHours);
    return todo;
  }

  let startTime = new Date(deadline.getTime() - (todo.estimatedTime || 60) * 60000);
  startTime.setHours(Math.max(startHour, startTime.getHours()), startTime.getMinutes(), 0, 0);

  if (startTime.getHours() < startHour || (startTime.getHours() === startHour && startTime.getMinutes() < startMinute)) {
    startTime.setDate(startTime.getDate() - 1);
    startTime.setHours(endHour, endMinute, 0, 0);
  }

  const endTime = new Date(startTime.getTime() + (todo.estimatedTime || 60) * 60000);

  return { ...todo, startTime, endTime };
}

function formatDateTimeLocal(date: Date | string | null): string {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  if (!(parsedDate instanceof Date) || isNaN(parsedDate.getTime())) {
    return '';
  }
  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${parsedDate.getFullYear()}-${pad(parsedDate.getMonth() + 1)}-${pad(parsedDate.getDate())}T${pad(parsedDate.getHours())}:${pad(parsedDate.getMinutes())}`;
}