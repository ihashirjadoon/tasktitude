"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput } from '@fullcalendar/core';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from 'lucide-react';

interface Todo {
  id: string;
  task: string;
  estimatedTime: number;
  deadline: Date;
  completed: boolean;
  startTime?: Date;
  endTime?: Date;
}

interface WorkHours {
  start: string;
  end: string;
}

export default function SchedulerPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [task, setTask] = useState('');
  const [estimatedTime, setEstimatedTime] = useState(30);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTodo, setCurrentTodo] = useState<Todo | null>(null);
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [workHours, setWorkHours] = useState<WorkHours>({ start: '09:00', end: '17:00' });
  const [deadlineDate, setDeadlineDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [deadlineTime, setDeadlineTime] = useState<string>('00:00');

  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    // this stuff is for the notifs
    const notificationTimeouts = events.map(event => {
      const eventTime = new Date(event.start as string).getTime();
      const currentTime = new Date().getTime();
      const timeUntilEvent = eventTime - currentTime;

      if (timeUntilEvent > 0) {
        return setTimeout(() => {
          if (Notification.permission === 'granted') {
            new Notification('TaskTitude Reminder', {
              body: `It's time for: ${event.title}`,
              icon: '/favicon.ico' //make this notif icon
            });
          }
        }, timeUntilEvent);
      }
    });

    return () => {
      notificationTimeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [events]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !deadlineDate || !deadlineTime) return;
    
    const [year, month, day] = deadlineDate.split('-').map(Number);
    const [hours, minutes] = deadlineTime.split(':').map(Number);
    const deadlineDateTime = new Date(year, month - 1, day, hours, minutes);

    const newTodo: Todo = {
      id: Date.now().toString(),
      task,
      estimatedTime,
      deadline: deadlineDateTime,
      completed: false,
    };
    const scheduledTodo = suggestTimeSlot(newTodo);
    setTodos(prevTodos => [...prevTodos, scheduledTodo]);
    setEvents(prevEvents => [...prevEvents, {
      id: scheduledTodo.id,
      title: scheduledTodo.task,
      start: scheduledTodo.startTime,
      end: scheduledTodo.endTime,
    }]);
    setTask('');
    setEstimatedTime(30);
    setDeadlineDate(new Date().toISOString().split('T')[0]);
    setDeadlineTime('00:00');
  };

  const suggestTimeSlot = (todo: Todo): Todo => {
    // call an ai here to give suggested hours
    const suggestedStart = new Date(todo.deadline);
    suggestedStart.setHours(suggestedStart.getHours() - todo.estimatedTime / 60);
    
    const [startHour, startMinute] = workHours.start.split(':').map(Number);
    const [endHour, endMinute] = workHours.end.split(':').map(Number);
    
    if (suggestedStart.getHours() < startHour || 
        (suggestedStart.getHours() === startHour && suggestedStart.getMinutes() < startMinute)) {
      suggestedStart.setHours(startHour, startMinute, 0, 0);
    } else if (suggestedStart.getHours() > endHour || 
               (suggestedStart.getHours() === endHour && suggestedStart.getMinutes() > endMinute)) {
      suggestedStart.setDate(suggestedStart.getDate() - 1);
      suggestedStart.setHours(endHour, endMinute, 0, 0);
    }
    
    const suggestedEnd = new Date(suggestedStart.getTime() + todo.estimatedTime * 60000);
    
    return {
      ...todo,
      startTime: suggestedStart,
      endTime: suggestedEnd,
    };
  };

  const handleEventClick = (info: any) => {
    const todo = todos.find(t => t.id === info.event.id);
    if (todo) {
      setCurrentTodo(todo);
      setIsDialogOpen(true);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setCurrentTodo(null);
  };

  const toggleTodoCompletion = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
    setEvents(events.map(event => 
      event.id === id ? { ...event, color: event.color === 'green' ? '' : 'green' } : event
    ));
  };

  const testNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from TaskTitude',
        icon: '/favicon.ico' //add icon  on the notif
      });
    } else {
      alert('Please enable notifications to use this feature.');
    }
  };

  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-purple-800">Welcome to TaskTitude AI Scheduler</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => {
              e.preventDefault();
              setIsOnboarding(false);
            }} className="space-y-6">
              <div>
                <Label htmlFor="workStart" className="text-lg font-semibold">Work Start Time</Label>
                <Input
                  id="workStart"
                  type="time"
                  value={workHours.start}
                  onChange={(e) => setWorkHours({ ...workHours, start: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="workEnd" className="text-lg font-semibold">Work End Time</Label>
                <Input
                  id="workEnd"
                  type="time"
                  value={workHours.end}
                  onChange={(e) => setWorkHours({ ...workHours, end: e.target.value })}
                  className="mt-1"
                />
              </div>
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                Start Scheduling
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-purple-800">TaskTitude AI Scheduler</h1>
          <div>
            <Button variant="outline" onClick={testNotification} className="mr-2 bg-white hover:bg-purple-100">
              Test Notification
            </Button>
            <Link href="/">
              <Button variant="outline" className="bg-white hover:bg-purple-100">Back to Home</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="col-span-1 shadow-lg">
            <CardHeader className="bg-purple-600 text-white">
              <CardTitle className="flex items-center">
                <Calendar className="mr-2" />
                Add New Task
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={addTodo} className="space-y-4">
                <div>
                  <Label htmlFor="task" className="text-lg font-semibold">Task</Label>
                  <Input
                    id="task"
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    placeholder="Enter task"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="estimatedTime" className="text-lg font-semibold">Estimated Time: {estimatedTime} minutes</Label>
                  <Slider
                    id="estimatedTime"
                    min={5}
                    max={240}
                    step={5}
                    value={[estimatedTime]}
                    onValueChange={(value) => setEstimatedTime(value[0])}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="deadlineDate" className="text-lg font-semibold">Deadline Date</Label>
                  <Input
                    id="deadlineDate"
                    type="date"
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="deadlineTime" className="text-lg font-semibold">Deadline Time</Label>
                  <Input
                    id="deadlineTime"
                    type="time"
                    value={deadlineTime}
                    onChange={(e) => setDeadlineTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                  Add Todo
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="col-span-1 lg:col-span-2 shadow-lg">
            <CardHeader className="bg-purple-600 text-white">
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                events={events}
                eventClick={handleEventClick}
                height="auto"
                slotMinTime={workHours.start}
                slotMaxTime={workHours.end}
              />
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 shadow-lg">
          <CardHeader className="bg-purple-600 text-white">
            <CardTitle>Todo List</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {todos.map((todo) => (
                <li key={todo.id} className="bg-white p-4 rounded-lg shadow-md flex items-center">
                  <Checkbox
                    id={`todo-${todo.id}`}
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodoCompletion(todo.id)}
                    className="mr-4"
                  />
                  <label htmlFor={`todo-${todo.id}`} className={`flex-grow ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                    <p className="font-medium text-lg">{todo.task}</p>
                    <p className="text-sm text-gray-600">
                      Estimated time: {todo.estimatedTime} minutes
                    </p>
                    <p className="text-sm text-gray-600">
                      Deadline: {todo.deadline.toLocaleString()}
                    </p>
                    {todo.startTime && todo.endTime && (
                      <p className="text-sm text-gray-600">
                        Scheduled: {todo.startTime.toLocaleString()} - {todo.endTime.toLocaleString()}
                      </p>
                    )}
                  </label>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-white rounded-lg shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-purple-800">Task Details</DialogTitle>
              <DialogDescription>
                Here are the details for this task.
              </DialogDescription>
            </DialogHeader>
            {currentTodo && (
              <div className="space-y-4">
                <p className="text-lg"><strong>Task:</strong> {currentTodo.task}</p>
                <p><strong>Estimated Time:</strong> {currentTodo.estimatedTime} minutes</p>
                <p><strong>Deadline:</strong> {currentTodo.deadline.toLocaleString()}</p>
                <p><strong>Scheduled Time:</strong></p>
                <div>
                  <Label htmlFor="startTime" className="text-sm font-semibold">Start Time</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={currentTodo.startTime?.toISOString().slice(0, 16)}
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={currentTodo.endTime?.toISOString().slice(0, 16)}
                    disabled
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={handleDialogClose}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}