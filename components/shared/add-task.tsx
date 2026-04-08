"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Calendar,
  Clock,
  Star,
  Loader2,
  RepeatIcon,
  AlignLeft,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type TaskType = "one-time" | "repeating" | "annual";

const TASK_TYPES: { value: TaskType; label: string; icon: React.ReactNode }[] =
  [
    {
      value: "one-time",
      label: "One-time",
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      value: "repeating",
      label: "Repeating",
      icon: <RepeatIcon className="h-4 w-4" />,
    },
    { value: "annual", label: "Annual", icon: <Star className="h-4 w-4" /> },
  ];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function AddTask({
  defaultDate,
  onSuccess,
  taskType,
}: { defaultDate?: string; onSuccess?: () => void; taskType?: TaskType } = {}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TaskType>(taskType || "one-time");
  const [time, setTime] = useState("09:00");
  const [date, setDate] = useState(
    defaultDate ?? new Date().toISOString().split("T")[0],
  );
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);

  useEffect(() => {
    if (defaultDate) setDate(defaultDate);
  }, [defaultDate]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setType("one-time");
    setTime("09:00");
    setDate(defaultDate ?? new Date().toISOString().split("T")[0]);
    setDaysOfWeek([]);
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) resetForm();
  };

  const handleCreate = async () => {
    if (!title.trim()) return toast.error("Please enter a task title");
    if (type === "repeating" && daysOfWeek.length === 0)
      return toast.error("Please select at least one day for a repeating task");

    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim(),
        type,
        time,
      };
      if (type === "one-time") body.date = date;
      if (type === "repeating") body.daysOfWeek = daysOfWeek;
      if (type === "annual") {
        const d = new Date(date);
        body.annualDate = { month: d.getMonth(), day: d.getDate() };
      }

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to create task");

      toast.success("Task added!");
      setOpen(false);
      router.refresh();
      onSuccess?.();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };
  const filteredTasks = taskType
    ? TASK_TYPES.filter((t) => t.value === taskType)
    : TASK_TYPES;

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} dismissible={false}>
      <DrawerTrigger asChild>
        <Button className="fixed bottom-32 right-6 h-14 w-14 rounded-full z-50 shadow-2xl md:static md:h-14 md:w-auto md:px-6 md:rounded-2xl flex items-center gap-2 duration-500 hover:scale-105 active:scale-95 transition-all">
          <Plus className="h-5 w-5 shrink-0" />
          <span className="hidden md:inline font-bold">New Task</span>
        </Button>
      </DrawerTrigger>

      <DrawerContent className="bg-background/98 backdrop-blur-2xl mt-0! h-dvh max-h-dvh! rounded-none! border-none [&>div.bg-muted.mx-auto.mt-4]:hidden">
        <div
          className="mx-auto w-full max-w-lg flex flex-col h-full relative"
        >
          <div className="px-6 pt-6 pb-2">
            <DrawerHeader className="px-0 pb-0">
              <DrawerTitle className="text-3xl font-black tracking-tight pr-10">
                New Task
              </DrawerTitle>
              <DrawerDescription className="font-semibold text-muted-foreground mt-1">
                Plan your next move.
              </DrawerDescription>
            </DrawerHeader>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-6 right-6 h-10 w-10 shrink-0 rounded-full bg-muted/30 hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Scrollable form */}
          <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <Label className="font-bold text-xs md:text-sm uppercase tracking-widest text-muted-foreground">
                Title *
              </Label>
              <Input
                placeholder="e.g., Morning Yoga flow"
                className="h-10 md:h-14 rounded-2xl text-sm md:text-base font-semibold bg-muted/30 border-muted/50 focus:bg-background transition-all"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="font-bold text-xs md:text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <AlignLeft className="h-3.5 w-3.5" /> Description
                <span className="normal-case tracking-normal font-medium text-muted-foreground/50">
                  (optional)
                </span>
              </Label>
              <Textarea
                placeholder="Add any notes or context..."
                className="rounded-2xl text-sm md:text-base font-medium bg-muted/30 border-muted/50 resize-none focus:bg-background transition-all min-h-18"
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setDescription(e.target.value)
                }
              />
            </div>

            {/* Type toggle pills */}
            <div className="space-y-2">
              <Label className="font-bold text-xs md:text-sm uppercase tracking-widest text-muted-foreground">
                Frequency
              </Label>
              <div className="flex gap-2">
                {filteredTasks.map((t) => {
                  const isActive = type === t.value;
                  const isDisabled = !!taskType;

                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      disabled={isDisabled}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm border transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground border-primary shadow-lg scale-[1.03]"
                          : "bg-muted/30 border-muted/50 text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                        isDisabled && "cursor-not-allowed opacity-70",
                      )}
                    >
                      {t.icon}
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time */}
            <div className="space-y-2">
              <Label className="font-bold text-xs md:text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" /> Time
              </Label>
              <Input
                type="time"
                className="h-10 md:h-12 rounded-xl bg-muted/30 border-muted/50 font-semibold"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            {/* One-time date */}
            {type === "one-time" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <Label className="font-bold text-xs md:text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" /> Date
                </Label>
                <Input
                  type="date"
                  className="h-10 md:h-12 rounded-xl bg-muted/30 border-muted/50 font-semibold"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            )}

            {/* Repeating days */}
            {type === "repeating" && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <Label className="font-bold text-xs md:text-sm uppercase tracking-widest text-muted-foreground">
                  Days
                </Label>
                <div className="flex justify-between gap-1">
                  {DAY_LABELS.map((day, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleDay(idx)}
                      className={cn(
                        "flex-1 py-2 rounded-xl font-bold text-xs transition-all border",
                        daysOfWeek.includes(idx)
                          ? "bg-primary text-primary-foreground border-primary scale-105 shadow-md"
                          : "bg-muted/30 border-muted/50 text-muted-foreground hover:bg-muted/60",
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Annual date */}
            {type === "annual" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <Label className="font-bold text-xs md:text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Star className="h-3.5 w-3.5" /> Special Date (repeats every
                  year)
                </Label>
                <Input
                  type="date"
                  className="h-10 md:h-12 rounded-xl bg-muted/30 border-muted/50 font-semibold"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Sticky submit button */}
          <div className="px-6 pb-8 pt-3 border-t border-muted/20 bg-background/98">
            <Button
              className="w-full h-12 md:h-14 rounded-2xl text-base md:text-lg font-bold shadow-lg shadow-primary/20"
              disabled={loading}
              onClick={handleCreate}
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                "Add Task"
              )}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
