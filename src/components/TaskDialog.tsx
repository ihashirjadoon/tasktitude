import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
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

export default function TaskDialog({ isOpen, setIsOpen, todo, setTodo, todos, setTodos, events, setEvents }: TaskDialogProps) {
  const handleClose = () => {
    setIsOpen(false);
    setTodo(null);
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    if (!todo) return;
    const newTime = new Date(value);
    const updatedTodo = { ...todo, [field]: newTime };
    setTodo(updatedTodo);

    // Update todos and events
    const updatedTodos = todos.map(t => t.id === todo.id ? updatedTodo : t);
    setTodos(updatedTodos);

    const updatedEvents = events.map(event => 
      event.id === todo.id ? { ...event, [field === 'startTime' ? 'start' : 'end']: newTime } : event
    );
    setEvents(updatedEvents);
  };

  if (!todo) return null;

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
          <p><strong>Deadline:</strong> {todo.deadline.toLocaleString()}</p>
          <div>
            <Label htmlFor="startTime" className="text-sm font-semibold">Start Time</Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={todo.startTime?.toISOString().slice(0, 16)}
              onChange={(e) => handleTimeChange('startTime', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              type="datetime-local"
              value={todo.endTime?.toISOString().slice(0, 16)}
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