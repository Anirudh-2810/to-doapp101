import { useAuth } from "@/contexts/AuthContext";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Lightning, UserCircle, SignOut, Gauge } from "@phosphor-icons/react";

export function Header({ velocityScore, energy, onEnergyChange }) {
  const { user, logout } = useAuth();

  return (
    <header className="flex flex-col md:flex-row justify-between md:items-end mb-6 gap-4 pb-4 border-b border-[#2A2A2A]">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#FF5500] rounded-sm flex items-center justify-center">
          <Lightning weight="bold" className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#EDEDED]" style={{ fontFamily: "Manrope" }}>
            Velocity-One
          </h1>
          <p className="text-[#8A8A8A] text-xs">Cognitive Task Engine</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <Gauge weight="duotone" className="w-4 h-4 text-[#8A8A8A]" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#8A8A8A] mb-1">Energy</p>
            <div className="flex items-center gap-2">
              <Slider
                data-testid="energy-slider"
                value={[energy]}
                onValueChange={(v) => onEnergyChange(v[0])}
                min={1}
                max={10}
                step={1}
                className="w-24 [&_[role=slider]]:bg-[#FF5500] [&_[role=slider]]:border-[#FF5500] [&_.bg-primary]:bg-[#FF5500]"
              />
              <span className="mono text-sm font-bold text-[#EDEDED] w-5 text-center" data-testid="energy-value">
                {energy}
              </span>
            </div>
          </div>
        </div>

        <div className="pl-6 border-l border-[#2A2A2A] text-right">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#8A8A8A] mb-0.5">Velocity</p>
          <span className="mono text-2xl font-bold text-[#00C853]" data-testid="velocity-score">
            {velocityScore.toFixed(1)}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              data-testid="user-menu-trigger"
              variant="ghost"
              size="icon"
              className="rounded-sm text-[#8A8A8A] hover:text-[#EDEDED] hover:bg-[#1F1F1F]"
            >
              <UserCircle weight="duotone" className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#141414] border-[#2A2A2A] text-[#EDEDED] rounded-sm">
            <DropdownMenuItem disabled className="text-[#8A8A8A] text-xs focus:bg-transparent">
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuItem
              data-testid="logout-button"
              onClick={logout}
              className="text-[#FF3D00] focus:text-[#FF3D00] focus:bg-[#FF3D00]/10 cursor-pointer"
            >
              <SignOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
