import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { TaskForm } from "@/components/TaskForm";
import { ExecutionStack } from "@/components/ExecutionStack";
import { Telemetry } from "@/components/Telemetry";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [telemetry, setTelemetry] = useState(null);
  const [categories, setCategories] = useState([]);
  const [energy, setEnergy] = useState(5);
  const [aiInsights, setAiInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [taskLoading, setTaskLoading] = useState(false);
  const energyTimer = useRef(null);

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await api.get("/tasks");
      setTasks(data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  }, []);

  const fetchTelemetry = useCallback(async () => {
    try {
      const { data } = await api.get("/telemetry");
      setTelemetry(data);
    } catch (err) {
      console.error("Failed to fetch telemetry", err);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get("/telemetry/categories");
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setEnergy(user.energy_level || 5);
      fetchTasks();
      fetchTelemetry();
      fetchCategories();
    }
  }, [user, fetchTasks, fetchTelemetry, fetchCategories]);

  const handleEnergyChange = (val) => {
    setEnergy(val);
    if (energyTimer.current) clearTimeout(energyTimer.current);
    energyTimer.current = setTimeout(async () => {
      try {
        await api.put("/user/energy", { energy_level: val });
        await fetchTasks();
      } catch (err) {
        console.error("Failed to update energy", err);
      }
    }, 400);
  };

  const handleCreateTask = async (taskData) => {
    setTaskLoading(true);
    try {
      await api.post("/tasks", taskData);
      toast.success("Task committed");
      await fetchTasks();
    } catch (err) {
      toast.error("Failed to create task");
    } finally {
      setTaskLoading(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await api.post(`/tasks/${taskId}/complete`);
      toast.success("Task executed");
      await Promise.all([fetchTasks(), fetchTelemetry(), fetchCategories()]);
    } catch (err) {
      toast.error("Failed to complete task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success("Task removed");
      await fetchTasks();
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };

  const handleAIAudit = async () => {
    setAiLoading(true);
    try {
      const { data } = await api.post("/ai/insights");
      setAiInsights(data);
    } catch (err) {
      setAiInsights({ insights: "Failed to generate AI insights", type: "error" });
    } finally {
      setAiLoading(false);
    }
  };

  const velocityScore = telemetry?.velocity_score || 50.0;

  return (
    <div data-testid="dashboard" className="min-h-screen p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="noise-overlay" />

      <Header
        velocityScore={velocityScore}
        energy={energy}
        onEnergyChange={handleEnergyChange}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-1 space-y-4">
          <TaskForm onSubmit={handleCreateTask} loading={taskLoading} />
          <Telemetry telemetry={telemetry} categories={categories} />
        </div>

        <div className="lg:col-span-2">
          <ExecutionStack
            tasks={tasks}
            onComplete={handleCompleteTask}
            onDelete={handleDeleteTask}
            onAIAudit={handleAIAudit}
            aiInsights={aiInsights}
            aiLoading={aiLoading}
          />
        </div>
      </div>
    </div>
  );
}
