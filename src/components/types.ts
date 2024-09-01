export interface Todo {
    difficulty: string;
    id: string;
    task: string;
    estimatedTime: number;
    deadline: Date;
    completed: boolean;
    startTime?: Date;
    endTime?: Date;
  }
  
  export interface WorkHours {
    start: string;
    end: string;
  }