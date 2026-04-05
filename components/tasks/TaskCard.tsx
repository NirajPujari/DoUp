"use client";

import { CheckCircle2, Circle, Clock, MoreVertical, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { TaskInstance } from "@/lib/tasks/engine";
import { toast } from "sonner";
import { useState } from "react";

interface TaskCardProps {
  task: TaskInstance;
  onUpdate?: () => void;
}

export default function TaskCard({ task, onUpdate }: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  async function toggleComplete() {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/tasks/${task._id}/toggle`, {
        method: "POST",
        body: JSON.stringify({ isCompleted: !task.isCompleted, type: task.type }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        toast.success(task.isCompleted ? "Task uncompleted" : "Task completed!");
        onUpdate?.();
      }
    } catch (err) {
      toast.error("Failed to update task");
    } finally {
      setIsUpdating(false);
    }
  }

  async function deleteTask() {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`/api/tasks/${task._id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Task deleted");
        onUpdate?.();
      }
    } catch (err) {
      toast.error("Failed to delete task");
    }
  }

  return (
    <div className="group relative glass-card p-5 rounded-2xl transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-primary/5 active:scale-95 duration-200">
      <div className="flex items-start gap-4">
        {/* Toggle Button */}
        <button
          onClick={toggleComplete}
          disabled={isUpdating}
          className={`shrink-0 mt-1 h-6 w-6 rounded-full border-2 transition-all flex items-center justify-center ${
            task.isCompleted
              ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30"
              : "border-muted-foreground hover:border-primary"
          }`}
        >
          {task.isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4 opacity-0 group-hover:opacity-30" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-bold text-lg leading-tight transition-all truncate ${task.isCompleted ? "text-muted-foreground line-through decoration-primary/40" : "text-foreground"}`}>
              {task.title}
            </h3>
            {task.isRolledOver && (
              <span className="shrink-0 text-[10px] uppercase font-black bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full tracking-tighter">
                Rolled Over
              </span>
            )}
          </div>
          
          <p className={`text-sm mb-3 line-clamp-2 ${task.isCompleted ? "text-muted-foreground/60" : "text-muted-foreground"}`}>
            {task.description || "No description provided."}
          </p>

          <div className="flex items-center gap-4">
            {task.time && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary/80">
                <Clock className="h-3.5 w-3.5" />
                <span>{task.time}</span>
              </div>
            )}
            <div className={`text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-md ${
              task.type === "repeating" ? "bg-accent/10 text-accent" : 
              task.type === "annual" ? "bg-amber-400/10 text-amber-400" : 
              "bg-primary/10 text-primary"
            }`}>
              {task.type}
            </div>
            {task.originalDate && (
              <span className="text-[10px] text-muted-foreground ml-auto">
                From {format(new Date(task.originalDate), "MMM d")}
              </span>
            )}
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={deleteTask}
          className="shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-destructive/10 rounded-lg"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Progress Indicator (if non-recurring or just visual) */}
      {!task.isCompleted && task.progress > 0 && (
        <div className="absolute bottom-0 left-0 h-1 bg-primary/20 w-full overflow-hidden rounded-b-2xl">
          <div className="h-full bg-primary" style={{ width: `${task.progress}%` }} />
        </div>
      )}
    </div>
  );
}
