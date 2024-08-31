import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput } from '@fullcalendar/core';
import { WorkHours } from '@/components/types';

interface ScheduleCalendarProps {
  events: EventInput[];
  workHours: WorkHours;
  handleEventClick: (info: any) => void;
}

export default function ScheduleCalendar({ events, workHours, handleEventClick }: ScheduleCalendarProps) {
  return (
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
  );
}