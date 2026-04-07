# DoUp — Future Work

A prioritized list of improvements, features, and fixes for the DoUp task management app.
Items are grouped by category and ordered from highest to lowest impact.

---

## 🔴 Critical / Should Do Soon

### 1. Task Editing
**What:** Allow users to edit an existing task's title, description, time, type, and schedule.
**Why:** Right now tasks are write-once. Any mistake requires deleting and re-creating.
**How:**
- Add `PUT /api/tasks/[id]` endpoint
- Add an "Edit" icon/button to `TaskCard` (visible on hover/long-press)
- Reuse the `AddTask` drawer, pre-filling fields from the existing task
- On submit, send a `PUT` request instead of `POST`

---

### 2. Fix the Rollover Logic for Repeating Tasks
**What:** `isTaskVisibleOnDate` currently has incomplete rollover for repeating tasks — the comment even says "keep it simple".
**Why:** If a user misses a Monday repeating task, it should surface on Tuesday (today), not disappear silently.
**How:**
- In `task-logic.ts`, for `repeating` tasks: if today is not a scheduled day, check the most recently scheduled day. If it was not completed, show the task today.
- Store `lastRolloverDate` (already in the `Task` type but unused) and update it server-side on each check.

---

### 3. Progress / Sub-tasks
**What:** The `progress` field (0–100) exists in the schema but is never editable from the UI. The `AddTask` form does not expose it.
**Why:** Misleading to have a progress bar on the card that always shows 0 unless set by direct DB edit.
**How (Option A — Simple):** Add a progress slider to the `AddTask` / edit drawer.
**How (Option B — Rich):** Add a sub-tasks system: array of `{ title: string, done: boolean }` on each task. Progress auto-computes from completion ratio.

---

### 4. Task Description Overflow in Card
**What:** Long descriptions are truncated with `max-w-25 truncate` — on mobile this cuts after ~4 characters.
**Why:** Users can't read what they wrote.
**How:** On mobile show description on its own line below the title. On desktop keep inline but expand the truncation limit.

---

## 🟡 High Value / Important

### 5. Notification / Reminder System
**What:** Send a browser push notification or in-app toast before a task's scheduled time.
**Why:** The whole point of having a `time` field is to remind the user.
**How:**
- Register a Service Worker (`/public/sw.js`) for Web Push
- Store push subscription in MongoDB on user document
- Add a background job (cron API route `/api/cron/reminders`) called via Vercel Cron that queries tasks due in the next 15 minutes and sends push notifications.
- Add a "Enable Reminders" toggle in the Profile page.

---

### 6. Streak & Habit Tracking
**What:** For repeating tasks, show the current completion streak (e.g., "7-day streak 🔥").
**Why:** Streaks are the single most effective motivator for habit-forming tasks. This is the killer feature your app is missing.
**How:**
- Add `streak: number` and `longestStreak: number` to the `Task` type
- Compute streaks server-side in `/api/tasks/[id]` PATCH when a repeating task is marked complete
- Display on `TaskCard` as a small flame badge

---

### 7. Active Sidebar Navigation Highlight
**What:** The sidebar nav items don't show which page is currently active.
**Why:** It looks like a bug to have no active state on the nav — confusing UX.
**How:**
- Convert `DashboardLayout` sidebar to `"use client"` or use a client component for the nav
- Use `usePathname()` from `next/navigation` to compare `item.href` against the current path
- Apply an active class (e.g., `bg-primary/10 text-primary`) when `pathname === item.href`

---

### 8. Drag-to-Reorder Tasks
**What:** Let users manually reorder their today's agenda by dragging cards.
**Why:** Time shown is the only sort order right now. Users may want to prioritize differently.
**How:**
- Install `@dnd-kit/core` and `@dnd-kit/sortable`
- Add `sortOrder: number` field to the `Task` type
- Wrap task list in `<SortableContext>`; persist the new order to MongoDB on drop

---

### 9. Search
**What:** A search bar to find tasks by title or description, across all dates.
**Why:** As the task list grows, users have no way to find older tasks.
**How:**
- Add `GET /api/tasks?search=<query>` support (MongoDB `$text` index or `$regex`)
- Add a search input to the dashboard header with debounced fetch
- Show results in a floating dropdown or a dedicated `/search` page

---

## 🟢 UX Polish / Nice to Have

### 10. Swipe-to-Complete on Mobile
**What:** Standard iOS/Android pattern — swipe a task card right to complete, left to delete.
**Why:** Faster than tapping; feels native on mobile.
**How:**
- Use `@dnd-kit/core` with touch sensors, or implement a custom `touchstart`/`touchmove` handler
- Show green ✓ background on right swipe, red 🗑️ on left swipe
- Trigger `handleToggle` or `handleDelete` on release past a threshold (e.g., 40% card width)

---

### 11. Empty State for Calendar (No Tasks Created Yet)
**What:** First-time users see "The schedule is light." with no guidance.
**How:** Add a contextual onboarding banner when `tasks.length === 0` and it's the user's first day, explaining how to add their first task.

---

### 12. Task Time Conflict Warning
**What:** Warn if the user tries to add two tasks at exactly the same time on the same day.
**How:** In `handleCreate` on the frontend, check if any existing `tasks` state item has the same `time` and `date`. Show a non-blocking warning toast (not a blocker).

---

### 13. Export / Import Tasks (CSV or JSON)
**What:** Let users download all their tasks as JSON or CSV, and import from a file.
**Why:** Backup, portability, and power-user demand.
**How:**
- Add `GET /api/tasks/export` that returns all tasks as JSON
- Add a file input on the Profile page that POSTs to `POST /api/tasks/import`
- Parse and insert tasks with validation

---

### 14. Offline Support (PWA)
**What:** Make the app work without internet — show cached tasks and queue mutations.
**Why:** The app already has a `manifest.json` stub and `appleWebApp` meta — it's already intended to be a PWA.
**How:**
- Add a `public/sw.js` Service Worker with `workbox` for caching API responses
- Queue PATCH/DELETE/POST requests in IndexedDB when offline and replay on reconnect
- Add an "Offline" banner using a `navigator.onLine` event listener

---

### 15. Yearly View on Calendar Page
**What:** Add a year-at-a-glance heatmap (like GitHub contribution graph) showing task density per day.
**Why:** Visually compelling and gives users a sense of their long-term consistency.
**How:**
- Fetch a yearly summary from `GET /api/tasks/stats?year=2025`
- Render a 52×7 grid with color intensity based on completion rate per day
- Place it below the monthly calendar as a collapsible section

---

### 16. Colour-Coded Task Categories / Tags
**What:** Let users assign a colour or tag to tasks (e.g., Work, Health, Personal).
**Why:** The task list becomes visually scannable at a glance.
**How:**
- Add `tag?: string` and `color?: string` to the `Task` type
- Add a colour picker / tag selector in `AddTask`
- Render a small coloured left border or dot on `TaskCard`

---

### 17. Time Picker (Not Just Text Input)
**What:** Replace the `<input type="time">` with a proper native-feeling wheel picker on mobile.
**Why:** `type="time"` renders differently across browsers and is particularly ugly on desktop Chrome.
**How:** Use `react-time-picker` or build a simple HH/MM scroll wheel using CSS `overflow-y: scroll` snap.

---

## 🔧 Technical Debt

### 18. API Types — `as any` Cleanup
Several API routes still use `tasksRaw as any`. These should use the `Task` type with a MongoDB `Document` intersection type for the `_id` field.

### 19. Task Key Using Index
Several `.map((task, index) => <TaskCard key={index} />)` patterns remain. Keys should always be stable IDs (`task._id?.toString()`), not array indexes, to prevent React reconciliation bugs when the list reorders.

### 20. Init-DB Script
The `ts-node init-db.ts` process has been running for 45+ hours. The script should call `process.exit(0)` after completion. Add error handling to ensure the process always terminates.

### 21. Environment Variable Validation
Add startup validation (e.g., using `zod`) that throws a clear error if `DB_URL`, `DB_NAME`, or `JWT_SECRET` are missing or empty, instead of failing silently mid-request.

### 22. Unit Tests for Task Logic
`lib/task-logic.ts` is the brain of the app and has zero tests. Edge cases like end-of-month rollovers, leap years, and annual tasks in the last week of December need coverage.
- Use `vitest` (works natively with Next.js 15 / Vite)
- Test: rollover stops at today, annual tasks match on day change, repeating tasks skip non-scheduled days

---

*Last updated: April 2025*
