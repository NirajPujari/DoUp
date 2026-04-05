"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import TaskForm from "./TaskForm";

export default function CreateRepeatingTaskButton() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsFormOpen(true)}
        className="flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-xl shadow-primary/20 group"
      >
        <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
        <span>Ignite System</span>
      </button>

      {isFormOpen && (
        <TaskForm 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={() => {
            setIsFormOpen(false);
            window.location.reload(); // Refresh to show new task
          }}
        />
      )}
    </>
  );
}
