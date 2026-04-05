"use client";

import { TaskInstance } from "@/lib/tasks/engine";
import TaskCard from "./TaskCard";
import { useRouter } from "next/navigation";

interface TaskListProps {
  tasks: TaskInstance[];
}

export default function TaskList({ tasks }: TaskListProps) {
  const router = useRouter();

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 glass rounded-4xl border-2 border-dashed border-muted text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
            <span className="text-2xl opacity-50 font-bold">Zzz</span>
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold tracking-tight">No tasks for today</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">Your schedule is clear! Take a break or add a new goal above.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {tasks.map((task) => (
        <TaskCard 
          key={task._id} 
          task={task} 
          onUpdate={() => router.refresh()} 
        />
      ))}
    </div>
  );
}
