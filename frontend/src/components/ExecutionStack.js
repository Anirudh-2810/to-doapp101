import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Lightning, Check, Trash, Brain, SpinnerGap, Target } from "@phosphor-icons/react";

const PRIORITY_CONFIG = {
  3: { label: "High", border: "border-l-rose-500", badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  2: { label: "Medium", border: "border-l-amber-500", badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  1: { label: "Low", border: "border-l-teal-500", badge: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
};

const CATEGORY_COLORS = {
  "Deep Work": "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  "Email": "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  "Meetings": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "Creative": "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "Admin": "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  "Learning": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "Health": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "General": "bg-muted text-muted-foreground",
};

export function ExecutionStack({ tasks, onComplete, onDelete, onAIAudit, aiInsights, aiLoading }) {
  const [showInsights, setShowInsights] = useState(false);

  const handleAudit = async () => {
    await onAIAudit();
    setShowInsights(true);
  };

  return (
    <div className="bg-card border border-border rounded-2xl flex flex-col min-h-[500px] shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 pb-4 border-b border-border gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Execution Stack</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Sorted by AI urgency & energy alignment</p>
        </div>
        <Button
          data-testid="ai-audit-button"
          onClick={handleAudit}
          disabled={aiLoading}
          size="sm"
          className="rounded-xl text-xs"
        >
          {aiLoading ? (
            <SpinnerGap className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <Lightning weight="fill" className="w-3.5 h-3.5 mr-1.5" />
          )}
          {aiLoading ? "Analyzing..." : "Run AI Audit"}
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <Target weight="duotone" className="w-14 h-14 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground font-medium text-sm">Stack is empty</p>
          <p className="text-muted-foreground/60 text-xs mt-1">Ingest tasks to begin optimization</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-2" data-testid="task-list">
          {tasks.map((task, idx) => {
            const pc = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG[2];
            const cc = CATEGORY_COLORS[task.category] || CATEGORY_COLORS["General"];
            return (
              <div
                key={task.id}
                data-testid={`task-item-${task.id}`}
                className={`task-item bg-background border border-border rounded-xl p-3.5 border-l-[3px] ${pc.border} animate-fade-up ${
                  task.is_optimal ? "ring-1 ring-primary/20" : ""
                }`}
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground leading-tight mb-1.5 truncate">{task.text}</h3>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${pc.badge}`}>
                        {pc.label}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${cc}`}>
                        {task.category}
                      </span>
                      <span className="text-[10px] text-muted-foreground mono">Due {task.deadline}</span>
                      <span className="text-[10px] text-muted-foreground mono">Load {task.complexity}/10</span>
                      <span className={`text-[10px] mono font-semibold ${task.is_optimal ? "text-primary" : "text-muted-foreground"}`}>
                        Score {task.score}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      data-testid={`complete-task-${task.id}`}
                      onClick={() => onComplete(task.id)}
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg"
                    >
                      <Check weight="bold" className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      data-testid={`delete-task-${task.id}`}
                      onClick={() => onDelete(task.id)}
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                    >
                      <Trash weight="bold" className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={showInsights} onOpenChange={setShowInsights}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain weight="duotone" className="w-5 h-5 text-primary" />
              AI Cognitive Analysis
            </DialogTitle>
            <DialogDescription className="text-xs">
              Powered by GPT analysis of your task patterns
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2" data-testid="ai-insights-content">
            {aiInsights?.type === "error" ? (
              <p className="text-destructive text-sm">{aiInsights.insights}</p>
            ) : aiInsights?.type === "success" ? (
              <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed bg-muted rounded-xl p-4 max-h-[400px] overflow-y-auto">
                {aiInsights.insights}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No insights generated yet.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
