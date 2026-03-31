import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Lightning, Check, Trash, Brain, SpinnerGap, Target } from "@phosphor-icons/react";

const PRIORITY_STYLES = {
  3: { label: "Critical", color: "text-[#FF3D00]", bg: "bg-[#FF3D00]/10", border: "border-[#FF3D00]/20" },
  2: { label: "Standard", color: "text-[#FF5500]", bg: "bg-[#FF5500]/10", border: "border-[#FF5500]/20" },
  1: { label: "Low", color: "text-[#8A8A8A]", bg: "bg-[#8A8A8A]/10", border: "border-[#8A8A8A]/20" },
};

export function ExecutionStack({ tasks, onComplete, onDelete, onAIAudit, aiInsights, aiLoading }) {
  const [showInsights, setShowInsights] = useState(false);

  const handleAudit = async () => {
    await onAIAudit();
    setShowInsights(true);
  };

  return (
    <div className="bg-[#141414] border border-[#2A2A2A] rounded-sm flex flex-col min-h-[500px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 pb-4 border-b border-[#2A2A2A] gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#EDEDED]" style={{ fontFamily: "Manrope" }}>
            Execution Stack
          </h2>
          <p className="text-xs text-[#8A8A8A] mt-0.5">Sorted by AI urgency & energy alignment</p>
        </div>
        <Button
          data-testid="ai-audit-button"
          onClick={handleAudit}
          disabled={aiLoading}
          variant="outline"
          size="sm"
          className="border-[#00E5FF]/30 text-[#00E5FF] bg-[#00E5FF]/5 hover:bg-[#00E5FF]/10 hover:text-[#00E5FF] rounded-sm text-xs"
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
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-60">
          <Target weight="duotone" className="w-12 h-12 text-[#8A8A8A] mb-3" />
          <p className="text-[#8A8A8A] font-medium text-sm">Stack is empty</p>
          <p className="text-[#8A8A8A]/60 text-xs mt-1">Ingest tasks to begin optimization</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto" data-testid="task-list">
          {tasks.map((task, idx) => {
            const ps = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES[2];
            return (
              <div
                key={task.id}
                data-testid={`task-item-${task.id}`}
                className={`task-item flex flex-col sm:flex-row justify-between sm:items-center gap-3 px-5 py-3.5 border-b border-[#2A2A2A] relative ${
                  task.is_optimal ? "bg-[#FF5500]/[0.03]" : ""
                }`}
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                {task.is_optimal && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#FF5500] optimal-indicator" />
                )}

                <div className="flex items-start gap-3 flex-1 pl-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-sm ${ps.bg} ${ps.color} border ${ps.border} uppercase mono shrink-0 mt-0.5`}>
                    P{task.priority}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[#EDEDED] text-sm leading-tight mb-1 truncate">{task.text}</h3>
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-[#8A8A8A] mono uppercase">
                      <span>Due: {task.deadline}</span>
                      <span className="text-[#2A2A2A]">/</span>
                      <span>Load: {task.complexity}/10</span>
                      <span className="text-[#2A2A2A]">/</span>
                      <span>{task.category}</span>
                      <span className="text-[#2A2A2A]">/</span>
                      <span className={task.is_optimal ? "text-[#FF5500]" : ""}>
                        Score: {task.score}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    data-testid={`complete-task-${task.id}`}
                    onClick={() => onComplete(task.id)}
                    variant="ghost"
                    size="sm"
                    className="text-[#8A8A8A] hover:text-[#00C853] hover:bg-[#00C853]/10 rounded-sm h-7 px-2"
                  >
                    <Check weight="bold" className="w-3.5 h-3.5 mr-1" />
                    <span className="text-xs">Execute</span>
                  </Button>
                  <Button
                    data-testid={`delete-task-${task.id}`}
                    onClick={() => onDelete(task.id)}
                    variant="ghost"
                    size="icon"
                    className="text-[#8A8A8A] hover:text-[#FF3D00] hover:bg-[#FF3D00]/10 rounded-sm h-7 w-7"
                  >
                    <Trash weight="bold" className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={showInsights} onOpenChange={setShowInsights}>
        <DialogContent className="bg-[#141414] border-[#2A2A2A] text-[#EDEDED] rounded-sm max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#EDEDED]" style={{ fontFamily: "Manrope" }}>
              <Brain weight="duotone" className="w-5 h-5 text-[#00E5FF]" />
              AI Cognitive Analysis
            </DialogTitle>
            <DialogDescription className="text-[#8A8A8A] text-xs">
              Powered by GPT analysis of your task patterns
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2" data-testid="ai-insights-content">
            {aiInsights?.type === "error" ? (
              <p className="text-[#FF3D00] text-sm">{aiInsights.insights}</p>
            ) : aiInsights?.type === "success" ? (
              <div className="text-sm text-[#EDEDED]/90 whitespace-pre-wrap leading-relaxed bg-[#0A0A0A] border border-[#2A2A2A] rounded-sm p-4 max-h-[400px] overflow-y-auto">
                {aiInsights.insights}
              </div>
            ) : (
              <p className="text-[#8A8A8A] text-sm">No insights generated yet. Run an AI Audit first.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
