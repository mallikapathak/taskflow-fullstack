"use client";

import { useEffect, useState } from "react";

type Task = {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};


// 2. Define API response structure
type TaskResponse = {
  success: boolean;
  count: number;
  data: Task[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {

  // 3. Store tasks
  const [tasks, setTasks] = useState<Task[]>([]);

  // 4. Store loading status
  const [loading, setLoading] = useState(true);

  // 5. Store error message
  const [error, setError] = useState("");

  // 6. Fetch tasks from Hono
  async function fetchTasks() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/tasks`);

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const result: TaskResponse = await response.json();

      // Update React state
      setTasks(result.data);

    } catch (err) {
      console.error("API Error:", err);
      setError("Unable to load tasks. Please check the backend server.");

    } finally {
      setLoading(false);
    }
  }

  // 7. Execute when component mounts
  useEffect(() => {
    fetchTasks();
  }, []);

  // 8. Show loading state
  if (loading) {
    return <div className="p-10">Loading tasks...</div>;
  }

  // 9. Show error state
  if (error) {
    return <div className="p-10 text-red-600">{error}</div>;
  }

  // 10. Display tasks
  return (
    <main className="min-h-screen bg-slate-100 p-10">

      <div className="mx-auto max-w-3xl">

        <h1 className="mb-2 text-3xl font-bold text-slate-800">
          My Tasks
        </h1>

        <p className="mb-8 text-slate-500">
          Manage your daily activities with TaskFlow.
        </p>

        {/* Task statistics */}
        <div className="mb-6 rounded-lg bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">
            Total Tasks: {tasks.length}
          </h2>

          <p className="text-sm text-slate-500">
            Completed: {tasks.filter(task => task.completed).length}
            {" | "}
            Pending: {tasks.filter(task => !task.completed).length}
          </p>
        </div>

        {/* Task list */}
        <div className="space-y-4">

          {tasks.map((task) => (

            <div
              key={task.id}
              className="rounded-lg bg-white p-5 shadow-sm"
            >

              <div className="flex items-center justify-between">

                <h3 className={`text-lg font-semibold ${
                  task.completed
                    ? "text-gray-400 line-through"
                    : "text-slate-800"
                }`}>
                  {task.title}
                </h3>

                <span className={`rounded-full px-3 py-1 text-xs ${
                  task.completed
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {task.completed ? "Completed" : "Pending"}
                </span>

              </div>

              <p className="mt-2 text-sm text-slate-500">
                {task.description}
              </p>

              <div className="mt-4 flex items-center justify-between">

                <span className="text-sm text-slate-500">
                  Priority: {task.priority}
                </span>

                <span className="text-xs text-slate-400">
                  ID: {task.id.slice(0, 8)}
                </span>

              </div>

            </div>

          ))}

          {tasks.length === 0 && (
            <p className="rounded-lg bg-white p-5 text-center text-gray-500">
              No tasks available.
            </p>
          )}

        </div>

      </div>

    </main>
  );
}