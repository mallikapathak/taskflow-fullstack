
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { randomUUID } from "node:crypto";

// ----------------------------------
// 1. INITIALIZE APPLICATION
// ----------------------------------

// 1. Create Hono application
const app = new Hono();

// 2. Register middleware
app.use("*", logger());

app.use(
  "*",
  cors({
    origin: "http://localhost:3000",
  })
);

// ----------------------------------
// 2. DEFINE TASK DATA STRUCTURE
// ----------------------------------

type Priority = "low"|"medium"|"high"
type Task = {
    "id": string;
    "title": string;
    "description": string;
    "priority": Priority;
    "completed": boolean;
    "createdAt": string;
    "updatedAt": string
};


// ----------------------------------
// 3. INITIAL TASK DATA
// ----------------------------------

const now = new Date().toISOString();

let tasks : Task[] = [
  {
    id: "task-001",
    title: "Learn Next.js",
    description: "Understand App Router and components",
    priority: "high",
    completed: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "task-002",
    title: "Learn Hono.js",
    description: "Understand routing and middleware",
    priority: "medium",
    completed: true,
    createdAt: now,
    updatedAt: now,
  },
];



// ----------------------------------
// 4. GET ALL TASKS
// ----------------------------------

app.get("/api/tasks", (c) => {
    return c.json({    success: true,
    count: tasks.length,
    data: tasks,});
});


// ----------------------------------
// 5. GET SINGLE TASK
// ----------------------------------

app.get("/api/tasks/:id", (c) => {
  const id = c.req.param("id");
  const task = tasks.find((task) => task.id == id);
  if (! task){
    return c.json({success:false, message:"Id Not found"},404);
  }
  return c.json({success:true, data:task});
});


// ----------------------------------
// 6. CREATE TASK - POST
// ----------------------------------

app.post("/api/tasks", async (c) => {
  const body = await c.req.json().catch(() => null);

  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    return c.json(
      { success: false, message: "Invalid request body" },
      400
    );
  }

  const payload = body as Record<string, unknown>;

  if (
    typeof payload.title !== "string" ||
    !payload.title.trim()
  ) {
    return c.json(
      { success: false, message: "Title is required" },
      400
    );
  }

  const priority = payload.priority ?? "medium";

  if (
    priority !== "low" &&
    priority !== "medium" &&
    priority !== "high"
  ) {
    return c.json(
      { success: false, message: "Invalid priority" },
      400
    );
  }

  if (
    payload.description !== undefined &&
    typeof payload.description !== "string"
  ) {
    return c.json(
      { success: false, message: "Invalid description" },
      400
    );
  }

  const timestamp = new Date().toISOString();

  const newTask: Task = {
    id: randomUUID(),
    title: payload.title.trim(),
    description:
      typeof payload.description === "string"
        ? payload.description.trim()
        : "",
    priority,
    completed: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  tasks.push(newTask);

  return c.json(
    {
      success: true,
      message: "Task created successfully",
      data: newTask,
    },
    201
  );
});


// ----------------------------------
// 7. UPDATE TASK - PATCH
// ----------------------------------

app.patch("/api/tasks/:id", async (c) => {
  const id = c.req.param("id");

  const task = tasks.find((task) => task.id === id);

  if (!task) {
    return c.json(
      { success: false, message: "Task not found" },
      404
    );
  }

  const body = await c.req.json().catch(() => null);

  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    return c.json(
      { success: false, message: "Invalid request body" },
      400
    );
  }

  const payload = body as Record<string, unknown>;

  const updates: Partial<
    Pick<Task, "title" | "description" | "priority" | "completed">
  > = {};

  if ("title" in payload) {
    if (
      typeof payload.title !== "string" ||
      !payload.title.trim()
    ) {
      return c.json({ message: "Invalid title" }, 400);
    }

    updates.title = payload.title.trim();
  }

  if ("description" in payload) {
    if (typeof payload.description !== "string") {
      return c.json({ message: "Invalid description" }, 400);
    }

    updates.description = payload.description.trim();
  }

  if ("completed" in payload) {
    if (typeof payload.completed !== "boolean") {
      return c.json({ message: "Invalid completed value" }, 400);
    }

    updates.completed = payload.completed;
  }

  if ("priority" in payload) {
    if (
      payload.priority !== "low" &&
      payload.priority !== "medium" &&
      payload.priority !== "high"
    ) {
      return c.json({ message: "Invalid priority" }, 400);
    }

    updates.priority = payload.priority;
  }

  if (Object.keys(payload).length === 0) {
    return c.json({ message: "No updates provided" }, 400);
  }

  Object.assign(task, updates, {
    updatedAt: new Date().toISOString(),
  });

  return c.json({
    success: true,
    message: "Task updated successfully",
    data: task,
  });
});


// ----------------------------------
// 8. DELETE TASK
// ----------------------------------

app.delete("/api/tasks/:id", (c) => {
  const id = c.req.param("id");

  const taskExists = tasks.some((task) => task.id === id);

  if (!taskExists) {
    return c.json(
      { success: false, message: "Task not found" },
      404
    );
  }

  tasks = tasks.filter((task) => task.id !== id);

  return c.json({
    success: true,
    message: "Task deleted successfully",
  });
});



// ----------------------------------
// 9. HEALTH CHECK
// ----------------------------------

app.get("/", (c) => {
  return c.json({
    message: "TaskFlow API is running!",
    status: "success",
  });
});


// ----------------------------------
// 10. START SERVER
// ----------------------------------





// // 3. Create first GET route
// app.get("/", (c) => {
//   return c.json({
//     message: "Welcome to TaskFlow API!",
//     status: "success",
//   });
// });

// // 4. Create another GET route
// app.get("/api/tasks", (c) => {
//   return c.json([
//     { id: 1, title: "Learn Next.js", completed: false },
//     { id: 2, title: "Learn Hono.js", completed: true },
//   ]);
// });

// 5. Start server
serve({
  fetch: app.fetch,
  port: 4000,
});

console.log("Server running on http://localhost:4000"); //The statement is executing in node.js backend terminal not in the browser's console
