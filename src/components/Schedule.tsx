import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ScheduleItem {
  task: string;
  startTime: Date;
  endTime: Date;
}

interface ScheduleProps {
  schedule: ScheduleItem[];
}

export function Schedule({ schedule }: ScheduleProps) {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Generated Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {schedule.map((item, index) => (
            <li key={index} className="bg-white p-2 rounded shadow">
              {item.task} - {item.startTime.toLocaleString()} to {item.endTime.toLocaleString()}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}