# DoUp — Future Work

A prioritized list of improvements, features, and fixes for the DoUp task management app.

## 🔴 Future Tasks

### 1. Ability to Change Task Data
**What:** Allow users to edit an existing task's title, description, time, type, and schedule.
**Why:** Right now tasks are write-once. Any mistake requires deleting and re-creating.
**How:**
- Reuse the `AddTask` component, pre-filling fields from the existing task
- On submit, send a `PUT` request to update the task in the database

---

### 2. Reminders by Notification
**What:** Send a browser push notification or in-app toast before a task's scheduled time.
**Why:** To ensure users don't miss their tasks and schedules.
**How:**
- Register a Service Worker for Web Push notifications
- Prompt the user to allow notifications

---

### 3. Prompt to Install the App
**What:** Display a prompt encouraging users to install the application to their device (PWA).
**Why:** Increases engagement and allows for offline capabilities and a native-app feel.
**How:**
- Ensure PWA setup in `manifest.json`
- Add a custom "Install App" button/banner triggered by the `beforeinstallprompt` event

---

### 4. Better Display of Tasks
**What:** Improve how tasks are displayed in the UI.
**Why:** The current display might truncate important information or look cluttered.
**How:**
- Expand the truncation limit for descriptions
- Use improved layout spacing and typography to make task cards cleaner and more readable
