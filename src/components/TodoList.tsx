import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface Todo {
  task: string;
  estimatedTime: number;
  date: Date;
}

interface TodoListProps {
  todos: Todo[];
  generateSchedule: () => void;
}

export function TodoList({ todos, generateSchedule }: TodoListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Todo List</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {todos.map((todo, index) => (
            <li key={index} className="bg-white p-2 rounded shadow">
              {todo.task} - {todo.estimatedTime} minutes - {todo.date.toLocaleDateString()}
            </li>
          ))}
        </ul>
        <Separator className="my-4" />
        <Button onClick={generateSchedule} className="w-full">Generate Schedule</Button>
      </CardContent>
    </Card>
  )
}