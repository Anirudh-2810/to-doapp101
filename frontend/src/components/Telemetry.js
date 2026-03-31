import { Progress } from "@/components/ui/progress";
import { Fire, Brain, TrendUp, Warning, ChartBar } from "@phosphor-icons/react";

export function Telemetry({ telemetry, categories }) {
  const streak = telemetry?.streak || 0;
  const matchRate = telemetry?.cognitive_match_rate || 50;
  const totalCompleted = telemetry?.total_completed || 0;
  const delegationNeeded = categories?.filter((c) => c.needs_delegation) || [];

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-5 shadow-sm">
      <h2 className="text-sm font-semibold text-foreground">Telemetry</h2>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-sm text-foreground flex items-center gap-1.5">
              <Fire weight="fill" className="w-4 h-4 text-amber-500" />
              Deep Work Streak
            </span>
            <span className="mono text-xs font-bold text-amber-500" data-testid="streak-count">
              {streak} {streak === 1 ? "Day" : "Days"}
            </span>
          </div>
          <Progress value={Math.min(100, streak * 7)} className="h-1.5" data-testid="streak-bar" />
        </div>

        <div>
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-sm text-foreground flex items-center gap-1.5">
              <Brain weight="fill" className="w-4 h-4 text-primary" />
              Cognitive Match
            </span>
            <span className="mono text-xs font-bold text-primary" data-testid="match-rate">
              {matchRate.toFixed(0)}%
            </span>
          </div>
          <Progress value={matchRate} className="h-1.5" data-testid="match-bar" />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-foreground flex items-center gap-1.5">
            <TrendUp weight="fill" className="w-4 h-4 text-emerald-500" />
            Tasks Completed
          </span>
          <span className="mono text-xs font-bold text-emerald-500" data-testid="total-completed">
            {totalCompleted}
          </span>
        </div>
      </div>

      {categories && categories.length > 0 && (
        <div className="pt-3 border-t border-border">
          <h3 className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
            <ChartBar weight="bold" className="w-3 h-3" />
            Category Velocity
          </h3>
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between text-xs">
                <span className="text-foreground flex items-center gap-1">
                  {cat.category}
                  {cat.needs_delegation && <Warning weight="fill" className="w-3 h-3 text-destructive" />}
                </span>
                <span className={`mono font-medium ${cat.velocity >= 50 ? "text-emerald-500" : cat.velocity >= 30 ? "text-amber-500" : "text-destructive"}`}>
                  {cat.velocity}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {delegationNeeded.length > 0 && (
        <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-xl" data-testid="delegation-alert">
          <p className="text-[10px] uppercase tracking-wider text-destructive font-semibold mb-1 flex items-center gap-1">
            <Warning weight="fill" className="w-3 h-3" />
            Delegation Recommended
          </p>
          <p className="text-xs text-foreground/80">
            {delegationNeeded.map((c) => c.category).join(", ")} {delegationNeeded.length === 1 ? "has" : "have"} low velocity.
          </p>
        </div>
      )}
    </div>
  );
}
