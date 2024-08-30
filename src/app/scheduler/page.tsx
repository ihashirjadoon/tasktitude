"use client";
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { TodoInput } from '@/components/TodoInput'
import { TodoList } from '@/components/TodoList'
import { Schedule } from '@/components/Schedule'

interface Todo {
  task: string;
  estimatedTime: number;
  date: Date;
}

interface ScheduleItem extends Todo {
  startTime: Date;
  endTime: Date;
}

export default function SchedulerPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [task, setTask] = useState('')
  const [estimatedTime, setEstimatedTime] = useState(30)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!task || !date) return
    setTodos([...todos, { task, estimatedTime, date }])
    setTask('')
    setEstimatedTime(30)
  }

  const generateSchedule = () => {
    const sortedTodos = [...todos].sort((a, b) => a.date.getTime() - b.date.getTime())
    let currentDate = new Date(sortedTodos[0].date)
    currentDate.setHours(9, 0, 0, 0) // change this to change the start time

    const newSchedule = sortedTodos.map((todo) => {
      if (todo.date.getTime() !== currentDate.getTime()) {
        currentDate = new Date(todo.date)
        currentDate.setHours(9, 0, 0, 0)
      }

      const startTime = new Date(currentDate)
      const endTime = new Date(currentDate.getTime() + todo.estimatedTime * 60000)

      currentDate = endTime

      return {
        ...todo,
        startTime,
        endTime
      }
    })

    setSchedule(newSchedule)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-purple-600">TaskTitude</h1>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <TodoInput
            task={task}
            setTask={setTask}
            estimatedTime={estimatedTime}
            setEstimatedTime={setEstimatedTime}
            date={date}
            setDate={setDate}
            addTodo={addTodo}
          />
          <TodoList todos={todos} generateSchedule={generateSchedule} />
        </div>

        <Schedule schedule={schedule} />
      </div>
    </div>
  )
}