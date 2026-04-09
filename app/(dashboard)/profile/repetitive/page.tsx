"use client";
import { useEffect, useState } from "react";
import { AddTask } from "@/components/shared/add-task";
import { TaskCard } from "@/components/shared/task-card";
import { RepeatIcon, Star, ArrowLeft } from "lucide-react";
import { Task } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RepetitiveTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tasks?type=repeating`);
      const data = await res.json();
      setTasks(Array.isArray(data.tasks) ? data.tasks : []);
    } catch {
      console.error("Failed to fetch repetitive tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full mb-12 px-4 md:px-0">
      {/* Header */}
      <header className="flex flex-col space-y-4">
        <Link href="/profile">
          <Button variant="ghost" className="pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Button>
        </Link>
        <div className="flex items-center space-x-3 group cursor-default">
          <div className="h-10 w-1 flex bg-primary rounded-full group-hover:h-12 transition-all duration-300" />
          <div className="space-y-0.5">
             <h1 className="text-3xl font-extrabold tracking-tight">
               Repetitive Tasks
             </h1>
             <p className="text-sm text-muted-foreground font-medium mt-1">
               Manage your recurring habits and routines.
             </p>
          </div>
        </div>
      </header>

      {/* Tasks Section */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3 mb-4">
          <RepeatIcon className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-black">All Repeating Tasks</h2>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 pb-12">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 w-full bg-muted/30 rounded-[2.5rem] animate-pulse"
              />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 rounded-[3rem] border-2 border-dashed border-muted/50 bg-muted/5 animate-in zoom-in duration-500">
            <Star className="h-16 w-16 text-muted-foreground/30 mb-6 animate-pulse" />
            <p className="text-xl font-bold text-muted-foreground text-center">
              No repetitive tasks yet.
            </p>
            <p className="text-sm font-semibold text-muted-foreground/60 mt-2">
              Add your first repeating task to start building habits!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 pb-12">
            {tasks
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((task, index) => (
                <TaskCard
                  key={index}
                  task={task}
                  viewOnly={true}
                  targetDateStr=""
                  onDelete={() => setTasks((prev) => prev.filter((t) => t._id !== task._id))}
                />
              ))}
          </div>
        )}
      </section>

      {/* Add Task */}
      <div className="md:hidden">
        <AddTask taskType="repeating" onSuccess={fetchTasks} />
      </div>
      <div className="hidden md:block fixed bottom-12 right-12 z-50">
        <AddTask taskType="repeating" onSuccess={fetchTasks} />
      </div>
    </div>
  );
}
