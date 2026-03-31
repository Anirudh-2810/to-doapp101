import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Plus, CalendarBlank } from "@phosphor-icons/react";
import { format } from "date-fns";

const CATEGORIES = ["General", "Deep Work", "Email", "Meetings", "Creative", "Admin", "Learning", "Health"];

export function TaskForm({ onSubmit, loading }) {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("2");
  const [complexity, setComplexity] = useState(5);
  const [deadline, setDeadline] = useState(new Date());
  const [category, setCategory] = useState("General");
  const [calOpen, setCalOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit({
      text: text.trim(),
      priority: parseInt(priority),
      complexity,
      deadline: format(deadline, "yyyy-MM-dd"),
      category,
    });
    setText("");
    setComplexity(5);
  };

  return (
    <div className="bg-[#141414] border border-[#2A2A2A] rounded-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A8A8A]">Task Ingestion</h2>
        <Plus weight="bold" className="w-4 h-4 text-[#8A8A8A]" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          data-testid="task-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="I need to..."
          className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDEDED] rounded-sm placeholder:text-[#8A8A8A]/50 focus:ring-1 focus:ring-[#FF5500] focus:border-[#FF5500]"
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[10px] uppercase tracking-[0.15em] text-[#8A8A8A] mb-1 block">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger
                data-testid="priority-select"
                className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDEDED] rounded-sm text-xs focus:ring-1 focus:ring-[#FF5500]"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#141414] border-[#2A2A2A] text-[#EDEDED] rounded-sm">
                <SelectItem value="3" className="text-xs focus:bg-[#1F1F1F] focus:text-[#EDEDED]">High (Critical)</SelectItem>
                <SelectItem value="2" className="text-xs focus:bg-[#1F1F1F] focus:text-[#EDEDED]">Medium (Standard)</SelectItem>
                <SelectItem value="1" className="text-xs focus:bg-[#1F1F1F] focus:text-[#EDEDED]">Low (Maintenance)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-[10px] uppercase tracking-[0.15em] text-[#8A8A8A] mb-1 block">Deadline</Label>
            <Popover open={calOpen} onOpenChange={setCalOpen}>
              <PopoverTrigger asChild>
                <Button
                  data-testid="deadline-picker"
                  variant="outline"
                  className="w-full justify-start text-left bg-[#0A0A0A] border-[#2A2A2A] text-[#EDEDED] rounded-sm text-xs hover:bg-[#1F1F1F] hover:text-[#EDEDED]"
                >
                  <CalendarBlank className="w-3.5 h-3.5 mr-1.5 text-[#8A8A8A]" />
                  {deadline ? format(deadline, "MMM d") : "Pick date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#141414] border-[#2A2A2A] rounded-sm" align="start">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={(d) => { if (d) { setDeadline(d); setCalOpen(false); }}}
                  className="text-[#EDEDED]"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div>
          <Label className="text-[10px] uppercase tracking-[0.15em] text-[#8A8A8A] mb-1 block">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger
              data-testid="category-select"
              className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDEDED] rounded-sm text-xs focus:ring-1 focus:ring-[#FF5500]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#141414] border-[#2A2A2A] text-[#EDEDED] rounded-sm">
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c} className="text-xs focus:bg-[#1F1F1F] focus:text-[#EDEDED]">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <Label className="text-[10px] uppercase tracking-[0.15em] text-[#8A8A8A]">Cognitive Load</Label>
            <span className="mono text-xs text-[#FF5500]" data-testid="complexity-display">{complexity}/10</span>
          </div>
          <Slider
            data-testid="complexity-slider"
            value={[complexity]}
            onValueChange={(v) => setComplexity(v[0])}
            min={1}
            max={10}
            step={1}
            className="[&_[role=slider]]:bg-[#FF5500] [&_[role=slider]]:border-[#FF5500] [&_.bg-primary]:bg-[#FF5500]"
          />
        </div>

        <Button
          data-testid="task-submit-button"
          type="submit"
          disabled={loading || !text.trim()}
          className="w-full bg-[#FF5500] hover:bg-[#CC4400] text-white rounded-sm font-semibold"
        >
          Commit Task
        </Button>
      </form>
    </div>
  );
}
