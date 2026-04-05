"use client";

import { useState, useEffect } from "react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
} from "date-fns";
import { ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon, CheckSquare } from "lucide-react";
import { TaskInstance } from "@/lib/tasks/engine";
import { toast } from "sonner";
import TaskCard from "@/components/tasks/TaskCard";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<TaskInstance[]>([]);
  const [monthlyData, setMonthlyData] = useState<Record<string, { _id: string; title: string; type: string; isCompleted: boolean; }[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isMonthLoading, setIsMonthLoading] = useState(false);

  useEffect(() => {
    fetchMonthlyTasks(currentMonth);
  }, [currentMonth]);

  useEffect(() => {
    fetchTasksForDate(selectedDate);
  }, [selectedDate]);

  async function fetchMonthlyTasks(date: Date) {
    setIsMonthLoading(true);
    try {
      const monthStr = format(date, "yyyy-MM");
      const res = await fetch(`/api/tasks/month?month=${monthStr}`);
      if (res.ok) {
        const data = await res.json();
        setMonthlyData(data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch monthly overview";
      toast.error(message);
    } finally {
      setIsMonthLoading(false);
    }
  }

  async function fetchTasksForDate(date: Date) {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tasks/date?date=${date.toISOString()}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch tasks for this date";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  const renderHeader = () => {
    return (
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tighter">{format(currentMonth, "MMMM yyyy")}</h1>
          <p className="text-muted-foreground text-[10px] md:text-xs font-bold tracking-[0.2em] mt-1 opacity-60">Monthly Archive</p>
        </div>
        <div className="flex gap-3 bg-muted/30 p-1.5 rounded-2xl border border-border/50">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-3 bg-background/50 hover:bg-background rounded-xl transition-all active:scale-90 shadow-sm"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-4 py-2 text-xs font-black uppercase tracking-widest hover:text-primary transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-3 bg-background/50 hover:bg-background rounded-xl transition-all active:scale-90 shadow-sm"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className="grid grid-cols-7 mb-4">
        {days.map((day, i) => (
          <div key={i} className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dateKey = format(day, "yyyy-MM-dd");
        const dayTasks = monthlyData[dateKey] || [];
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());
        const isSelected = isSameDay(day, selectedDate);

        days.push(
          <div
            key={day.toString()}
            className={`
              relative h-20 md:h-36 border border-border/40 p-2 transition-all cursor-pointer group hover:bg-primary/5
              ${!isCurrentMonth ? "opacity-10 pointer-events-none" : "opacity-100"}
              ${isSelected ? "bg-primary/3 ring-1 ring-inset ring-primary/40 z-10" : ""}
            `}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <div className="flex justify-between items-start mb-1">
              <span className={`
                text-xs md:text-sm font-black transition-colors
                ${isToday ? "bg-primary text-primary-foreground h-6 w-6 rounded-lg flex items-center justify-center -ml-1 -mt-1 scale-110 shadow-lg shadow-primary/20" : "text-muted-foreground group-hover:text-foreground"}
              `}>
                {format(day, "d")}
              </span>
              {dayTasks.length > 0 && (
                <span className="text-[9px] font-black opacity-30 group-hover:opacity-100 transition-opacity">
                  {dayTasks.length}
                </span>
              )}
            </div>

            <div className="space-y-1 overflow-hidden max-h-[80%] custom-scrollbar">
              {dayTasks.slice(0, 3).map((t, idx) => (
                <div 
                  key={t._id + idx}
                  className={`
                    text-[8px] md:text-[10px] px-1.5 py-0.5 rounded-md truncate font-bold
                    ${t.isCompleted ? "bg-muted/30 text-muted-foreground line-through" : 
                      t.type === 'annual' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                      "bg-primary/10 text-primary border border-primary/20"}
                  `}
                >
                  {t.title}
                </div>
              ))}
              {dayTasks.length > 3 && (
                <div className="text-[8px] font-black text-muted-foreground/60 pl-1 uppercase tracking-tighter">
                  + {dayTasks.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="glass rounded-4xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-border/50">{rows}</div>;
  };

  return (
    <div className="space-y-12 pb-24">
      <div className="relative">
        {renderHeader()}
        {isMonthLoading && (
          <div className="absolute top-0 right-0 p-2 md:p-4 items-center gap-2 flex md:hidden">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground opacity-50">Syncing</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
        <div className="xl:col-span-3">
          {renderDays()}
          {renderCells()}
        </div>

        <div className="space-y-10">
          <div className="flex items-center justify-between group">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-foreground underline decoration-primary/40 underline-offset-8">
                {format(selectedDate, "MMM do")}
              </h2>
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-2 opacity-50">Detailed Breakdown</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-muted/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 w-full glass rounded-2xl animate-pulse flex flex-col p-6 gap-3">
                    <div className="h-4 w-2/3 bg-muted rounded-full" />
                    <div className="h-3 w-1/2 bg-muted/60 rounded-full" />
                    <div className="mt-auto flex gap-2">
                        <div className="h-2 w-10 bg-muted/40 rounded-full" />
                        <div className="h-2 w-16 bg-muted/40 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : tasks.length > 0 ? (
              tasks.map((task) => (
                <TaskCard key={task._id} task={task} onUpdate={() => {
                  fetchTasksForDate(selectedDate);
                  fetchMonthlyTasks(currentMonth);
                }} />
              ))
            ) : (
              <div className="glass p-12 rounded-4xl text-center space-y-4 opacity-40 hover:opacity-100 transition-opacity group">
                <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <CheckSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                    <p className="text-base font-black">Zero Encounters</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground leading-tight tracking-widest mt-1">This segment of time is currently void</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
