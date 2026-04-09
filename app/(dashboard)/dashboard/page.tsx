"use client";
import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { AddTask } from "@/components/shared/add-task";
import { TaskCard } from "@/components/shared/task-card";
import { Zap, ListTodo, Star } from "lucide-react";
import { dateToString } from "@/lib/task-logic";
import { Task } from "@/types";

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
};

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [session, setSession] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const today = format(new Date(), "EEEE, do MMMM");
  const dateStr = dateToString(new Date());

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const [res1, res2] = await Promise.all([
        fetch(`/api/tasks?date=${dateStr}`),
        fetch(`/api/auth/me`),
      ]);

      const data = await res1.json();
      const data2 = await res2.json();

      console.log(data)

      setSession(data2.user);
      setTasks(Array.isArray(data.tasks) ? data.tasks : []);
    } catch {
      console.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, [dateStr]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const completed = tasks.filter((t) =>
    t.type === "repeating"
      ? t.completedDates?.includes(dateStr)
      : t.completedDate === dateStr,
  ).length;

  const progress = tasks.length > 0 ? completed / tasks.length : 0;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full mb-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <div className="flex items-center space-x-3 group cursor-default">
            <div className="h-14 w-1 flex bg-primary rounded-full group-hover:h-16 transition-all duration-300" />
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                {today}
              </h2>
              <h1 className="text-4xl font-extrabold tracking-tight">
                {getGreeting()}, {session?.name.split(" ")[0] || "User"}!
              </h1>
            </div>
          </div>

          <p className="mt-3 text-lg text-muted-foreground font-medium flex items-center">
            <Zap className="h-5 w-5 mr-2 text-primary" />
            {tasks.length - completed > 0
              ? `You have ${tasks.length - completed} pending tasks today.`
              : "You're all clear! Enjoy your productive day."}
          </p>
        </div>

        {/* Progress */}
        <div className="glass-morphism p-6 rounded-[2.5rem] flex items-center space-x-6 min-w-60 shadow-xl border-white/5 transform hover:scale-105 transition-all">
          <div className="relative h-16 w-16">
            <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-muted-foreground/10"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray={28 * 2 * Math.PI}
                strokeDashoffset={28 * 2 * Math.PI * (1 - progress)}
                className="text-black dark:text-white transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center font-extrabold text-sm md:text-base">
              {Math.round(progress * 100)}%
            </div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Tasks Done
            </div>
            <div className="text-2xl font-black">
              {completed}/{tasks.length}
            </div>
          </div>
        </div>
      </header>

      {/* Tasks Section */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3 mb-4">
          <ListTodo className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-black">Today&apos;s Agenda</h2>
        </div>

        {/* ✅ Loading Skeleton */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 pb-12">
            <DashboardSkeleton />
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 rounded-[3rem] border-2 border-dashed border-muted/50 bg-muted/5 animate-in zoom-in duration-500">
            <Star className="h-16 w-16 text-muted-foreground/30 mb-6 animate-pulse" />
            <p className="text-xl font-bold text-muted-foreground text-center">
              Your day is open for possibilities.
            </p>
            <p className="text-sm font-semibold text-muted-foreground/60 mt-2">
              Add your first task and start the momentum!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 pb-12">
            {tasks
              .map((task, index) => (
                <TaskCard
                  key={index}
                  task={task}
                  targetDateStr={dateStr}
                  onDelete={() => {
                    fetchTasks()
                  }}
                  onToggle={(updatedTaskId, checked) => {
                    setTasks((prev) =>
                      prev.map((t) => {
                        if (String(t._id) !== updatedTaskId) return t;
                        if (t.type === "repeating") {
                          const dates = new Set(t.completedDates || []);
                          if (checked) dates.add(dateStr);
                          else dates.delete(dateStr);
                          return { ...t, completedDates: Array.from(dates) };
                        }
                        return {
                          ...t,
                          completedDate: checked ? dateStr : undefined,
                        };
                      }),
                    );
                  }}
                />
              ))}
          </div>
        )}
      </section>

      {/* Add Task */}
      <div className="md:hidden">
        <AddTask onSuccess={fetchTasks}/>
      </div>
      <div className="hidden md:block fixed bottom-12 right-12">
        <AddTask onSuccess={fetchTasks}/>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-32 w-full bg-muted/30 rounded-[2.5rem] animate-pulse"
        />
      ))}
    </>
  );
}
