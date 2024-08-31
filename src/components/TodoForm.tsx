import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Todo } from '@/components/types';

interface TodoFormProps {
  addTodo: (todo: Todo) => void;
}

export default function TodoForm({ addTodo }: TodoFormProps) {
  const [task, setTask] = useState('');
  const [estimatedTime, setEstimatedTime] = useState(30);
  const [deadlineDate, setDeadlineDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [deadlineTime, setDeadlineTime] = useState<string>('00:00');

  const handleSubmit = (e: React.FormEvent) => {
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
    addTodo(newTodo);
    setTask('');
    setEstimatedTime(30);
    setDeadlineDate(new Date().toISOString().split('T')[0]);
    setDeadlineTime('00:00');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
  );
}