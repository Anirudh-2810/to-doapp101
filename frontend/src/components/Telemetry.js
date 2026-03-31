import { Progress } from "@/components/ui/progress";
import { Fire, Brain, TrendUp, Warning, ChartBar } from "@phosphor-icons/react";

export function Telemetry({ telemetry, categories }) {
  const streak = telemetry?.streak || 0;
  const matchRate = telemetry?.cognitive_match_rate || 50;
  const totalCompleted = telemetry?.total_completed || 0;
  const delegationNeeded = categories?.filter((c) => c.needs_delegation) || [];

  return (
    <div className="bg-[#141414] border border-[#2A2A2A] rounded-sm p-5 space-y-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A8A8A]">Behavioral Telemetry</h2>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-sm text-[#EDEDED] flex items-center gap-1.5">
              <Fire weight="fill" className="w-4 h-4 text-[#FF5500]" />
              Deep Work Streak
            </span>
            <span className="mono text-xs font-bold text-[#FF5500]" data-testid="streak-count">
              {streak} {streak === 1 ? "Day" : "Days"}
            </span>
          </div>
          <Progress
            value={Math.min(100, streak * 7)}
            className="h-1.5 bg-[#0A0A0A] [&>div]:bg-[#FF5500]"
            data-testid="streak-bar"
          />
        </div>

        <div>
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-sm text-[#EDEDED] flex items-center gap-1.5">
              <Brain weight="fill" className="w-4 h-4 text-[#00E5FF]" />
              Cognitive Match
            </span>
            <span className="mono text-xs font-bold text-[#00E5FF]" data-testid="match-rate">
              {matchRate.toFixed(0)}%
            </span>
          </div>
          <Progress
            value={matchRate}
            className="h-1.5 bg-[#0A0A0A] [&>div]:bg-[#00E5FF]"
            data-testid="match-bar"
          />
        </div>

        <div>
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-sm text-[#EDEDED] flex items-center gap-1.5">
              <TrendUp weight="fill" className="w-4 h-4 text-[#00C853]" />
              Tasks Completed
            </span>
            <span className="mono text-xs font-bold text-[#00C853]" data-testid="total-completed">
              {totalCompleted}
            </span>
          </div>
        </div>
      </div>

      {categories && categories.length > 0 && (
        <div className="pt-3 border-t border-[#2A2A2A]">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#8A8A8A] mb-3 flex items-center gap-1.5">
            <ChartBar weight="bold" className="w-3 h-3" />
            Category Velocity
          </h3>
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between text-xs">
                <span className={`text-[#EDEDED] ${cat.needs_delegation ? "text-[#FF3D00]" : ""}`}>
                  {cat.category}
                  {cat.needs_delegation && (
                    <Warning weight="fill" className="w-3 h-3 text-[#FF3D00] inline ml-1" />
                  )}
                </span>
                <span className={`mono ${cat.velocity >= 50 ? "text-[#00C853]" : cat.velocity >= 30 ? "text-[#FF5500]" : "text-[#FF3D00]"}`}>
                  {cat.velocity}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {delegationNeeded.length > 0 && (
        <div className="p-3 bg-[#FF3D00]/5 border border-[#FF3D00]/20 rounded-sm" data-testid="delegation-alert">
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#FF3D00] font-semibold mb-1 flex items-center gap-1">
            <Warning weight="fill" className="w-3 h-3" />
            Delegation Recommended
          </p>
          <p className="text-xs text-[#EDEDED]/80">
            {delegationNeeded.map((c) => c.category).join(", ")} {delegationNeeded.length === 1 ? "has" : "have"} low velocity. Consider delegating or automating.
          </p>
        </div>
      )}
    </div>
  );
}
