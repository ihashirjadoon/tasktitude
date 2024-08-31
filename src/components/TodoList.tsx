import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Todo } from '@/components/types';

interface TodoListProps {
  todos: Todo[];
  toggleTodoCompletion: (id: string) => void;
}

export default function TodoList({ todos, toggleTodoCompletion }: TodoListProps) {
  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader className="bg-purple-600 text-white">
        <CardTitle>Todo List</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {todos.map((todo) => {
            const deadline = new Date(todo.deadline);
            const startTime = todo.startTime ? new Date(todo.startTime) : null;
            const endTime = todo.endTime ? new Date(todo.endTime) : null;

            return (
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
                    Deadline: {deadline.toLocaleString()}
                  </p>
                  {startTime && endTime && (
                    <p className="text-sm text-gray-600">
                      Scheduled: {startTime.toLocaleString()} - {endTime.toLocaleString()}
                    </p>
                  )}
                </label>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
