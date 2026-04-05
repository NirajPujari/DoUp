"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface TaskFormProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  showTrigger?: boolean;
}

export default function TaskForm({ 
  isOpen: externalIsOpen, 
  onClose: externalOnClose, 
  onSuccess,
  showTrigger = true 
}: TaskFormProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  
  const handleClose = () => {
    if (externalOnClose) {
      externalOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title");
    const description = formData.get("description");
    const type = formData.get("type");
    const date = formData.get("date");
    const time = formData.get("time");
    
    // Days of week for repeating
    const daysOfWeek = Array.from(formData.getAll("daysOfWeek")).map(Number);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        body: JSON.stringify({ 
          title, 
          description, 
          type, 
          date, 
          time,
          daysOfWeek 
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        toast.success("Task created successfully!");
        handleClose();
        if (onSuccess) {
          onSuccess();
        } else {
          router.refresh();
        }
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to create task");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {showTrigger && (
        <button
          onClick={() => setInternalIsOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-full hover:bg-primary/90 transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-px"
        >
          <Plus className="h-5 w-5" />
          <span>New Task</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-lg glass p-8 rounded-3xl shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-all"
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-2xl font-black mb-8 leading-none tracking-tight text-foreground">Schedule Your Day</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-2">Task Title</label>
                <input
                  name="title"
                  type="text"
                  required
                  className="w-full bg-muted/60 border-none rounded-2xl px-5 py-4 placeholder-muted-foreground focus:ring-2 focus:ring-primary transition-all outline-none"
                  placeholder="e.g. Design Chronos UI"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-2">Description</label>
                <textarea
                  name="description"
                  rows={2}
                  className="w-full bg-muted/60 border-none rounded-2xl px-5 py-4 placeholder-muted-foreground focus:ring-2 focus:ring-primary transition-all outline-none resize-none"
                  placeholder="Optional details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-2">Type</label>
                  <select
                    name="type"
                    className="w-full bg-muted/60 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary transition-all outline-none appearance-none"
                    defaultValue="one-time"
                  >
                    <option value="one-time">One-time</option>
                    <option value="repeating">Repeating</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-2">Time</label>
                  <input
                    name="time"
                    type="time"
                    className="w-full bg-muted/60 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-2">Initial Date</label>
                <input
                  name="date"
                  type="date"
                  required
                  className="w-full bg-muted/60 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary transition-all outline-none"
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-2 block">Weekly Recurrence (If Repeating)</label>
                <div className="flex flex-wrap gap-2 px-1">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                    <label key={i} className="flex items-center group cursor-pointer">
                      <input
                        type="checkbox"
                        name="daysOfWeek"
                        value={i}
                        className="hidden peer"
                      />
                      <div className="h-10 w-10 flex items-center justify-center rounded-xl border border-muted-foreground/20 text-muted-foreground transition-all peer-checked:bg-primary peer-checked:text-primary-foreground peer-checked:border-primary group-hover:bg-muted font-bold text-sm">
                        {day}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground font-black py-5 rounded-2xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 mt-4 shadow-xl shadow-primary/20"
              >
                {isLoading ? <Plus className="animate-spin h-6 w-6" /> : (
                  <>
                    <span>Confirm Task</span>
                    <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
