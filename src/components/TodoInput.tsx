import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TodoInputProps {
  task: string;
  setTask: (task: string) => void;
  estimatedTime: number;
  setEstimatedTime: (time: number) => void;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  addTodo: (e: React.FormEvent) => void;
}

export function TodoInput({ task, setTask, estimatedTime, setEstimatedTime, date, setDate, addTodo }: TodoInputProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={addTodo} className="space-y-4">
          <div>
            <Label htmlFor="task">Task</Label>
            <Input
              id="task"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Enter a task"
            />
          </div>
          <div>
            <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
            <Input
              id="estimatedTime"
              type="number"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(parseInt(e.target.value))}
              min={1}
            />
          </div>
          <div>
            <Label>Date</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </div>
          <Button type="submit">Add Todo</Button>
        </form>
      </CardContent>
    </Card>
  )
}