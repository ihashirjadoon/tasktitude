"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { EventInput } from '@fullcalendar/core';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Zap } from 'lucide-react';

import TodoForm from '@/components/TodoForm';
import TodoList from '@/components/TodoList';
import ScheduleCalendar from '@/components/ScheduleCalendar';
import TaskDialog from '@/components/TaskDialog';
import OnboardingForm from '@/components/OnboardingForm';
import { Todo, WorkHours } from '@/components/types';


export default function SchedulerPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTodo, setCurrentTodo] = useState<Todo | null>(null);
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [workHours, setWorkHours] = useState<WorkHours>({ start: '09:00', end: '17:00' });

  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const notificationTimeouts = events.map(event => {
      const eventTime = new Date(event.start as string).getTime();
      const currentTime = new Date().getTime();
      const timeUntilEvent = eventTime - currentTime;

      if (timeUntilEvent > 0) {
        return setTimeout(() => {
          if (Notification.permission === 'granted') {
            new Notification('TaskTitude Reminder', {
              body: `It's time for: ${event.title}`,
              icon: '/favicon.ico'
            });
          }
        }, timeUntilEvent);
      }
    });

    return () => {
      notificationTimeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [events]);

  const addTodo = async (newTodo: Todo) => {
    try {
      const response = await fetch('/api/scheduleTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newTodo, existingTodos: todos, workHours }),
      });

      if (!response.ok) {
        throw new Error('Failed to schedule task');
      }

      const scheduledTodo: Todo = await response.json();
      setTodos(prevTodos => [...prevTodos, scheduledTodo]);
      setEvents(prevEvents => [...prevEvents, {
        id: scheduledTodo.id,
        title: scheduledTodo.task,
        start: scheduledTodo.startTime,
        end: scheduledTodo.endTime,
      }]);
    } catch (error) {
      console.error('Error scheduling task:', error);
    }
  };
  const optimizeSchedule = async () => {
    try {
      const response = await fetch('/api/optimizeSchedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ todos, workHours }),
      });

      if (!response.ok) {
        throw new Error('Failed to optimize schedule');
      }

      const optimizedTodos: Todo[] = await response.json();
      setTodos(optimizedTodos);
      setEvents(optimizedTodos.map(todo => ({
        id: todo.id,
        title: todo.task,
        start: todo.startTime,
        end: todo.endTime,
      })));
    } catch (error) {
      console.error('Error optimizing schedule:', error);
    }
  };
  
  const handleEventClick = (info: any) => {
    const todo = todos.find(t => t.id === info.event.id);
    if (todo) {
      setCurrentTodo(todo);
      setIsDialogOpen(true);
    }
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
        icon: '/favicon.ico'
      });
    } else {
      alert('Please enable notifications to use this feature.');
    }
  };

  if (isOnboarding) {
    return <OnboardingForm setIsOnboarding={setIsOnboarding} setWorkHours={setWorkHours} />;
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
            <Button variant="outline" onClick={optimizeSchedule} className="mr-2 bg-white hover:bg-purple-100">
              <Zap className="mr-2 h-3 w-3" />
              Optimize Schedule
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
              <TodoForm addTodo={addTodo} />
            </CardContent>
          </Card>

          <Card className="col-span-1 lg:col-span-2 shadow-lg">
            <CardHeader className="bg-purple-600 text-white">
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScheduleCalendar 
                events={events} 
                workHours={workHours} 
                handleEventClick={handleEventClick}
              />
            </CardContent>
          </Card>
        </div>

        <TodoList todos={todos} toggleTodoCompletion={toggleTodoCompletion} />

        <TaskDialog 
          isOpen={isDialogOpen} 
          setIsOpen={setIsDialogOpen} 
          todo={currentTodo} 
          setTodo={setCurrentTodo}
          todos={todos}
          setTodos={setTodos}
          events={events}
          setEvents={setEvents}
        />
      </div>
    </div>
  );
}