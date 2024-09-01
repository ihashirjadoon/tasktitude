"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { EventInput, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Zap, Plus, Edit } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import TodoForm from '@/components/TodoForm';
import TodoList from '@/components/TodoList';
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
      updateEvents([...todos, scheduledTodo]);
    } catch (error) {
      console.error('Error scheduling task:', error);
    }
  };

  const optimizeScheduleHandler = async () => {
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
      updateEvents(optimizedTodos);
    } catch (error) {
      console.error('Error optimizing schedule:', error);
    }
  };

  const updateEvents = (updatedTodos: Todo[]) => {
    setEvents(updatedTodos.map(todo => ({
      id: todo.id,
      title: todo.task,
      start: todo.startTime,
      end: todo.endTime,
      extendedProps: { ...todo }
    })));
  };
  
  const handleEventClick = (clickInfo: EventClickArg) => {
    const todo = todos.find(t => t.id === clickInfo.event.id);
    if (todo) {
      setCurrentTodo(todo);
      setIsDialogOpen(true);
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const title = prompt('Please enter a new title for your event');
    if (title) {
      const newEvent: EventInput = {
        id: Date.now().toString(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay
      };
      setEvents([...events, newEvent]);
    }
  };

  const handleEventDrop = (dropInfo: any) => {
    const updatedEvents = events.map(event => 
      event.id === dropInfo.event.id
        ? { ...event, start: dropInfo.event.start, end: dropInfo.event.end }
        : event
    );
    setEvents(updatedEvents);
  };

  const handleEventResize = (resizeInfo: any) => {
    const updatedEvents = events.map(event => 
      event.id === resizeInfo.event.id
        ? { ...event, start: resizeInfo.event.start, end: resizeInfo.event.end }
        : event
    );
    setEvents(updatedEvents);
  };

  const toggleTodoCompletion = useCallback((id: string) => {
    setTodos(prevTodos => prevTodos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
    setEvents(prevEvents => prevEvents.map(event => 
      event.id === id ? { ...event, color: event.color === 'green' ? '' : 'green' } : event
    ));
  }, []);

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
            <Button variant="outline" onClick={optimizeScheduleHandler} className="mr-2 bg-white hover:bg-purple-100">
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
                <Plus className="mr-2" />
                Add New Task
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <TodoForm addTodo={addTodo} />
            </CardContent>
          </Card>

          <Card className="col-span-1 lg:col-span-2 shadow-lg">
            <CardHeader className="bg-purple-600 text-white">
              <CardTitle className="flex items-center">
                <Calendar className="mr-2" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                initialView="timeGridWeek"
                editable={true}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                weekends={true}
                events={events}
                select={handleDateSelect}
                eventClick={handleEventClick}
                eventDrop={handleEventDrop}
                eventResize={handleEventResize}
                slotMinTime={workHours.start}
                slotMaxTime={workHours.end}
              />
            </CardContent>
          </Card>
        </div>

        
        <TodoList 
      todos={todos.sort((a, b) => {
        const aTime = a.startTime instanceof Date ? a.startTime.getTime() : 0;
        const bTime = b.startTime instanceof Date ? b.startTime.getTime() : 0;
        return aTime - bTime;
      })} 
      toggleTodoCompletion={toggleTodoCompletion} 
    />

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