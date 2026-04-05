import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  type: {
    type: String,
    enum: ["one-time", "repeating", "annual"],
    required: true,
    index: true,
  },
  time: {
    type: String, // "HH:mm" format for specific time of day
  },
  date: {
    type: Date, // For one-time tasks (specific day) and annual task start
  },
  daysOfWeek: {
    type: [Number], // 0-6 (Sun-Sat) for repeating tasks
    default: [],
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  isRolledOver: {
    type: Boolean,
    default: false,
  },
  originalDate: {
    type: Date, // If it's a rolled over task, store the original date
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
