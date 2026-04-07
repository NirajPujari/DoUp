"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Trash2, Clock, Calendar, Repeat, Stars } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  targetDateStr: string;
  onDelete?: () => void;
  onToggle?: (id: string, checked: boolean) => void;
}

export function TaskCard({
  task,
  targetDateStr,
  onDelete,
  onToggle,
}: TaskCardProps) {
  const [isCompleted, setIsCompleted] = useState(
    task.completedDate === targetDateStr,
  );
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleToggle = async (checked: boolean) => {
    setIsCompleted(checked);
    try {
      const res = await fetch(`/api/tasks/${task._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completedDate: targetDateStr,
          isCompleted: checked,
        }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      router.refresh();
      if (checked) toast.success("Task completed!");
      onToggle?.(String(task._id), checked);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update status",
      );
      setIsCompleted(!checked);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/tasks/${task._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
      toast.success("Task deleted");
      onDelete?.();
      router.refresh();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete task",
      );
    } finally {
      setShowConfirm(false);
    }
  };

  const typeIcon =
    task.type === "one-time" ? (
      <Calendar className="h-3 w-3 mr-1" />
    ) : task.type === "repeating" ? (
      <Repeat className="h-3 w-3 mr-1" />
    ) : (
      <Stars className="h-3 w-3 mr-1" />
    );

  return (
    <div
      onClick={() => handleToggle(!isCompleted)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === " " && handleToggle(!isCompleted)}
      className={`p-3 sm:p-4 md:p-6 lg:p-7 rounded-2xl md:rounded-3xl border transition-all duration-500 group relative shadow-sm md:shadow-md hover:shadow-lg md:hover:shadow-xl cursor-pointer select-none active:scale-[0.98] ${
        isCompleted
          ? "bg-secondary/40 border-primary/10 grayscale-[0.2]"
          : "bg-card border-white/10 hover:border-primary/30"
      }`}
    >
      <div className="flex items-start justify-between gap-2 md:gap-4">
        <div className="flex items-start space-x-2 sm:space-x-3 md:space-x-4">
          <div className="pt-1 animate-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              id={task._id?.toString()}
              checked={isCompleted}
              onCheckedChange={handleToggle}
              className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 rounded-md md:rounded-lg transition-transform active:scale-95 duration-300"
            />
          </div>

          <div className="space-y-0.5 md:space-y-1">
            <h3
              className={`text-sm sm:text-base md:text-lg lg:text-xl font-semibold md:font-bold leading-tight transition-all duration-300 
        ${
          isCompleted
            ? "text-muted-foreground line-through decoration-primary decoration-2 opacity-70"
            : "text-foreground"
        }`}
            >
              {task.title}
            </h3>

            <div className="flex flex-wrap items-center gap-x-2 md:gap-x-3 text-[9px] sm:text-[10px] md:text-[11px] font-semibold md:font-bold text-muted-foreground uppercase tracking-wide md:tracking-wider">
              <span className="flex items-center">
                <Clock className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1 text-primary" />
                {task.time}
              </span>

              {task.description && (
                <span className="max-w-25 sm:max-w-35 md:max-w-45 truncate">
                  {task.description}
                </span>
              )}

              <span className="flex items-center py-0.5 px-1.5 md:px-2 bg-primary/5 rounded-full text-primary text-[9px] md:text-[11px]">
                {typeIcon}
                {task.type}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}
          className="p-1.5 sm:p-2 md:p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg md:rounded-xl transition-all flex items-center justify-center shrink-0"
        >
          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7" />
        </button>
      </div>

      {!isCompleted && task.progress > 0 && (
        <div className="mt-2 md:mt-4 space-y-1 animate-in fade-in duration-500">
          <div className="flex justify-between text-[9px] sm:text-[10px] md:text-[11px] font-semibold md:font-bold uppercase tracking-wide md:tracking-widest text-primary">
            <span>Progress</span>
            <span>{task.progress}%</span>
          </div>

          <Progress
            value={task.progress}
            className="h-1 md:h-1.5 rounded-full bg-primary/10"
          />
        </div>
      )}

      {isCompleted && (
        <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2 flex items-center justify-center text-primary/40 animate-in zoom-in-50 spin-in-12 duration-700 pointer-events-none">
          <Stars className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12" />
        </div>
      )}
      {/* Inline delete confirmation */}
      {showConfirm && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-3 pt-3 border-t border-destructive/20 animate-in slide-in-from-top-2 fade-in duration-200"
        >
          <p className="text-sm font-semibold text-destructive mb-3">
            Delete &ldquo;{task.title}&rdquo;? This can&apos;t be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 py-2 px-4 rounded-xl text-sm font-bold bg-muted/50 hover:bg-muted text-muted-foreground transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-2 px-4 rounded-xl text-sm font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all active:scale-95"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
