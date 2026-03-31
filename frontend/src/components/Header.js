import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Lightning, UserCircle, SignOut, Sun, Moon, Gauge } from "@phosphor-icons/react";

export function Header({ velocityScore, energy, onEnergyChange }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric"
  });

  return (
    <header className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
          <Lightning weight="bold" className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Hello, {user?.name || "User"}
          </h1>
          <p className="text-muted-foreground text-xs">{today}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2">
          <Gauge weight="duotone" className="w-4 h-4 text-muted-foreground" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground hidden sm:inline">Energy</span>
          <Slider
            data-testid="energy-slider"
            value={[energy]}
            onValueChange={(v) => onEnergyChange(v[0])}
            min={1} max={10} step={1}
            className="w-20"
          />
          <span className="mono text-sm font-bold text-foreground w-4 text-center" data-testid="energy-value">{energy}</span>
        </div>

        <div className="bg-card border border-border rounded-xl px-3 py-1.5 text-center min-w-[72px]">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground block leading-tight">Velocity</span>
          <span className="mono text-lg font-bold text-primary leading-tight" data-testid="velocity-score">{velocityScore.toFixed(1)}</span>
        </div>

        <Button data-testid="theme-toggle" variant="outline" size="icon" onClick={toggleTheme} className="rounded-xl h-9 w-9">
          {theme === "dark" ? <Sun weight="duotone" className="w-4 h-4" /> : <Moon weight="duotone" className="w-4 h-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button data-testid="user-menu-trigger" variant="outline" size="icon" className="rounded-xl h-9 w-9">
              <UserCircle weight="duotone" className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem disabled className="text-muted-foreground text-xs">{user?.email}</DropdownMenuItem>
            <DropdownMenuItem data-testid="logout-button" onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
              <SignOut className="w-4 h-4 mr-2" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
