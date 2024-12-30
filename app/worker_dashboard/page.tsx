"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Mock data for tasks
const initialTasks = [
  {
    id: 1,
    title: "Complete project proposal",
    status: "In Progress",
    progress: 60,
  },
  {
    id: 2,
    title: "Review client feedback",
    status: "Not Started",
    progress: 0,
  },
  { id: 3, title: "Update documentation", status: "Completed", progress: 100 },
];

export default function WorkerDashboard() {
  const [tasks, setTasks] = useState(initialTasks);

  // Simulating data fetching
  useEffect(() => {
    // In a real application, you would fetch data from an API here
    // For now, we'll just use the initial tasks
    setTasks(initialTasks);
  }, []);

  const updateTaskProgress = (taskId: number, newProgress: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              progress: newProgress,
              status: newProgress === 100 ? "Completed" : "In Progress",
            }
          : task
      )
    );
  };

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-bold mb-4">Your Tasks</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <Card key={task.id}>
              <CardHeader>
                <CardTitle>{task.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-2">
                  Status: {task.status}
                </p>
                <Progress value={task.progress} className="mb-2" />
                <div className="flex justify-between">
                  <Button
                    onClick={() =>
                      updateTaskProgress(
                        task.id,
                        Math.max(0, task.progress - 10)
                      )
                    }
                    disabled={task.progress === 0}
                  >
                    -10%
                  </Button>
                  <Button
                    onClick={() =>
                      updateTaskProgress(
                        task.id,
                        Math.min(100, task.progress + 10)
                      )
                    }
                    disabled={task.progress === 100}
                  >
                    +10%
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Performance Overview</h2>
        <Card>
          <CardHeader>
            <CardTitle>Weekly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-2">
              Tasks Completed:{" "}
              {tasks.filter((task) => task.status === "Completed").length}
            </p>
            <p className="text-lg mb-2">
              Tasks In Progress:{" "}
              {tasks.filter((task) => task.status === "In Progress").length}
            </p>
            <p className="text-lg">
              Overall Progress:{" "}
              {Math.round(
                tasks.reduce((acc, task) => acc + task.progress, 0) /
                  tasks.length
              )}
              %
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
