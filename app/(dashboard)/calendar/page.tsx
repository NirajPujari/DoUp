"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { TaskCard } from "@/components/shared/task-card";
import { Calendar as CalendarIcon, Info, Sparkles, Ghost } from "lucide-react";
import { Task } from "@/types";
import { dateToString, getHoliday } from "@/lib/task-logic";
import { AddTask } from "@/components/shared/add-task";

export default function CalendarPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (date) {
      fetchTasks(date);
    }
  }, [date]);

  const fetchTasks = async (targetDate: Date) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?date=${dateToString(targetDate)}`);
      const data = await res.json();
      setTasks(Array.isArray(data.tasks) ? data.tasks : []);
    } catch {
      console.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const selectedDateStr = date ? format(date, "EEEE, do MMMM") : "";
  const holiday = date ? getHoliday(date) : undefined;

  return (
    <div className="flex flex-col lg:flex-row gap-12 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Calendar Section */}
      <div className="lg:w-100 flex flex-col space-y-6">
        <header className="space-y-1">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-black tracking-tight">Timeline</h1>
          </div>
          <p className="text-muted-foreground font-semibold">
            Glimpse into your upcoming flow.
          </p>
        </header>

        <Card className="w-fit mx-auto md:mx-0 p-6 flex justify-center items-center rounded-[2.5rem] border-white/5 glass-morphism shadow-2xl shadow-primary/10 overflow-hidden transform transition-all hover:scale-[1.01]">
          <Calendar
            mode="single"
            selected={date}
            required
            onSelect={setDate}
            className="rounded-3xl border-0 p-0 dark:bg-transparent"
            classNames={{
              day_today: "bg-primary/20 text-primary font-black rounded-xl",
              day_selected:
                "bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all scale-110",
              day: "h-10 w-10 text-center text-sm font-bold p-0 relative hover:bg-muted/50 rounded-xl",
            }}
          />
        </Card>

        {holiday && (
          <div className="p-5 rounded-3xl bg-amber-500/10 border-amber-500/20 flex flex-col space-y-2 animate-bounce-subtle">
            <div className="flex items-center text-amber-600 dark:text-amber-400 font-black text-sm uppercase tracking-tighter">
              <Sparkles className="h-4 w-4 mr-2" />
              Special Day: {holiday.name}
            </div>
            <p className="text-xs font-bold text-amber-700/60 dark:text-amber-500/60">
              Enjoy this moment and take it easy today.
            </p>
          </div>
        )}
      </div>

      {/* Daily Tasks Section */}
      <div className="flex-1 space-y-8">
        <header>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black">{selectedDateStr}</h2>
              <p className="text-muted-foreground font-semibold mt-1">
                {loading
                  ? "Syncing..."
                  : `${tasks.length} task${tasks.length === 1 ? "" : "s"} scheduled.`}
              </p>
            </div>
            <AddTask
              defaultDate={date ? dateToString(date) : undefined}
              onSuccess={() => fetchTasks(date)}
            />
          </div>
        </header>

        <div className="grid gap-6 grid-cols-1">
          {loading ? (
            <div className="col-span-full h-40 border-2 border-dashed border-muted rounded-[2.5rem] flex items-center justify-center animate-pulse">
              <Info className="h-6 w-6 text-muted-foreground animate-spin" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-20 rounded-[3rem] border-2 border-dashed border-muted/50 bg-muted/5">
              <Ghost className="h-16 w-16 text-muted-foreground/20 mb-6" />
              <p className="text-xl font-bold text-muted-foreground">
                The schedule is light.
              </p>
              <p className="text-sm font-semibold text-muted-foreground/60 mt-2">
                Maybe it&apos;s time for some unstructured creativity.
              </p>
            </div>
          ) : (
            tasks
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((task, index) => (
                <TaskCard
                  key={index}
                  task={task}
                  onDelete={() => fetchTasks(date)}
                  onToggle={() => fetchTasks(date)}
                  targetDateStr={date ? dateToString(date) : ""}
                />
              ))
          )}
        </div>
      </div>
    </div>
  );
}
