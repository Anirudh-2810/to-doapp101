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
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-foreground">New Task</h2>
        <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
          <Plus weight="bold" className="w-3.5 h-3.5 text-primary" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          data-testid="task-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What needs to be done?"
          className="rounded-xl h-10"
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger data-testid="priority-select" className="rounded-xl text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="3" className="text-xs">High</SelectItem>
                <SelectItem value="2" className="text-xs">Medium</SelectItem>
                <SelectItem value="1" className="text-xs">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Deadline</Label>
            <Popover open={calOpen} onOpenChange={setCalOpen}>
              <PopoverTrigger asChild>
                <Button
                  data-testid="deadline-picker"
                  variant="outline"
                  className="w-full justify-start text-left rounded-xl text-xs h-9"
                >
                  <CalendarBlank className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                  {deadline ? format(deadline, "MMM d") : "Pick date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={(d) => { if (d) { setDeadline(d); setCalOpen(false); } }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div>
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger data-testid="category-select" className="rounded-xl text-xs h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Cognitive Load</Label>
            <span className="mono text-xs text-primary font-semibold" data-testid="complexity-display">{complexity}/10</span>
          </div>
          <Slider
            data-testid="complexity-slider"
            value={[complexity]}
            onValueChange={(v) => setComplexity(v[0])}
            min={1} max={10} step={1}
          />
        </div>

        <Button
          data-testid="task-submit-button"
          type="submit"
          disabled={loading || !text.trim()}
          className="w-full rounded-xl h-10 font-semibold"
        >
          Commit Task
        </Button>
      </form>
    </div>
  );
}
