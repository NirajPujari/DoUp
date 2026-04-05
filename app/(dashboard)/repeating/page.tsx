import { getSession } from "@/lib/auth/jwt";
import dbConnect from "@/lib/db";
import Task from "@/models/Task";
import { Repeat, Calendar as CalendarIcon, Trash2, Clock } from "lucide-react";
import { format } from "date-fns";
import CreateRepeatingTaskButton from "../../../components/tasks/CreateRepeatingTaskButton";

export default async function RepeatingTasksPage() {
  const session = await getSession();
  await dbConnect();

  const tasks = await Task.find({
    userId: session.id,
    type: { $ne: "one-time" }
  }).sort({ createdAt: -1 });

  const getDayName = (dayIndex: number) => {
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayIndex];
  };

  return (
    <div className="space-y-12 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
              <Repeat className="h-6 w-6" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Repeating Systems</h1>
          </div>
          <p className="text-muted-foreground font-medium text-lg max-w-2xl">
            Manage your recurring disciplines and annual traditions. These are the foundations of your routine.
          </p>
        </div>
        
        <CreateRepeatingTaskButton />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task._id.toString()} className="glass p-10 rounded-4xl border border-border/50 hover:border-primary/30 transition-all group overflow-hidden relative">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <span className={`
                    text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl
                    ${task.type === 'annual' ? "bg-amber-500/10 text-amber-500" : "bg-primary/10 text-primary"}
                  `}>
                    {task.type} Rule
                  </span>
                  <h3 className="text-2xl font-bold tracking-tight mt-4">{task.title}</h3>
                </div>
                
                <button className="p-4 bg-muted/40 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-2xl transition-all active:scale-90 shadow-sm">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5">
                <p className="text-sm text-muted-foreground font-medium line-clamp-2 leading-relaxed">
                  {task.description || "No description provided for this recurring segment."}
                </p>

                <div className="flex flex-wrap gap-5 pt-6 border-t border-border/40">
                  {task.time && (
                    <div className="flex items-center gap-3 text-xs font-black text-muted-foreground/80 uppercase tracking-widest bg-muted/30 px-3 py-1.5 rounded-lg">
                      <Clock className="h-4 w-4 text-primary" />
                      {task.time}
                    </div>
                  )}
                  {task.type === 'annual' ? (
                    <div className="flex items-center gap-3 text-xs font-black text-muted-foreground/80 uppercase tracking-widest bg-amber-500/5 px-3 py-1.5 rounded-lg">
                      <CalendarIcon className="h-4 w-4 text-amber-500" />
                      Starts {format(new Date(task.date), "MMM dd")}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        {task.daysOfWeek.sort().map((day: number) => (
                          <span key={day} className="h-8 w-10 flex items-center justify-center bg-muted/50 rounded-xl text-[10px] font-black text-foreground border border-border/50">
                            {getDayName(day)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <Repeat className="absolute -bottom-8 -right-8 h-40 w-40 text-primary opacity-[0.03] group-hover:opacity-[0.05] group-hover:scale-125 transition-all pointer-events-none" />
            </div>
          ))
        ) : (
          <div className="col-span-full glass p-24 rounded-5xl text-center border-dashed border-2 border-border/40">
            <div className="h-24 w-24 bg-muted/30 rounded-4xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-inner">
                <Repeat className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h2 className="text-3xl font-black mb-3 opacity-60 italic">Void of Iterations</h2>
            <p className="text-muted-foreground font-medium text-lg">Your routine is currently unstructured. Ignite a system to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
