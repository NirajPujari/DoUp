import mongoose from "mongoose";

const TaskCompletionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true,
    index: true,
  },
  completedAt: {
    type: Date,
    required: true,
    index: true, // Specifically for filtering tasks on a date
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 100, // For recurring tasks, completion could mean 100%
  },
});

export default mongoose.models.TaskCompletion || mongoose.model("TaskCompletion", TaskCompletionSchema);
