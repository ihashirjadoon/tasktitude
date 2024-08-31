import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkHours } from '@/components/types';

interface OnboardingFormProps {
  setIsOnboarding: (isOnboarding: boolean) => void;
  setWorkHours: (workHours: WorkHours) => void;
}

export default function OnboardingForm({ setIsOnboarding, setWorkHours }: OnboardingFormProps) {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWorkHours({ start: startTime, end: endTime });
    setIsOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-purple-800">Welcome to TaskTitude AI Scheduler</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="workStart" className="text-lg font-semibold">Work Start Time</Label>
              <Input
                id="workStart"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="workEnd" className="text-lg font-semibold">Work End Time</Label>
              <Input
                id="workEnd"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
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