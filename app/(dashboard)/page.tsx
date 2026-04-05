import { getSession } from "@/lib/auth/jwt";
import { getTasksForDate } from "@/lib/tasks/engine";
import TaskList from "@/components/tasks/TaskList";
import TaskForm from "../../components/tasks/TaskForm";
import { format } from "date-fns";

export default async function DashboardPage() {
  const session = await getSession();
  const today = new Date();
  const tasks = await getTasksForDate(session.id, today);

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em] text-primary/80 ml-1 opacity-70">Daily Pulse</p>
          <h1 className="text-2xl md:text-6xl font-black tracking-tighter leading-none">{session.name.split(' ')[0]}</h1>
          <p className="text-muted-foreground font-medium text-sm md:text-xl mt-3 opacity-80">
            {format(today, "EEEE, MMMM do, yyyy")}
          </p>
        </div>
        
        <div className="flex gap-4">
          <TaskForm />
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold tracking-tight px-2 border-l-4 border-primary">Active Tasks</h2>
            <div className="h-px bg-muted flex-1 mx-6 opacity-30" />
            <span className="text-xs font-bold text-muted-foreground uppercase opacity-80">{tasks.length} Total</span>
          </div>
          
          <TaskList tasks={tasks} />
        </div>

        <aside className="space-y-8">
          <div className="glass p-8 rounded-2xl space-y-6">
            <h2 className="text-xl font-bold tracking-tight">Today&apos;s Progress</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-muted-foreground">Completion Rate</span>
                <span className="text-primary font-black">
                  {tasks.length > 0 ? Math.round((tasks.filter(t => t.isCompleted).length / tasks.length) * 100) : 0}%
                </span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-linear-to-r from-primary to-accent transition-all duration-1000 ease-out"
                  style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.isCompleted).length / tasks.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-muted/20 border border-border/50 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Completed</p>
                    <p className="text-2xl font-black">{tasks.filter(t => t.isCompleted).length}</p>
                </div>
                <div className="p-4 bg-muted/20 border border-border/50 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">To Do</p>
                    <p className="text-2xl font-black">{tasks.filter(t => !t.isCompleted).length}</p>
                </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-secondary/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-3 w-3 rounded-full bg-secondary animate-pulse" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-secondary opacity-90">Attention Needed</h3>
            </div>
            {tasks.filter(t => t.isRolledOver && !t.isCompleted).length > 0 ? (
                <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">You have {tasks.filter(t => t.isRolledOver && !t.isCompleted).length} rolled-over tasks from previous days.</p>
                </div>
            ) : (
                <p className="text-xs text-muted-foreground">No urgent rolled-over tasks. Keep it up!</p>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
