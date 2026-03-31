import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { formatApiError } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Lightning, Sun, Moon } from "@phosphor-icons/react";

export default function AuthPage() {
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setSubmitting(true);
    try {
      await register(email, password, name);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative">
      <Button
        data-testid="auth-theme-toggle"
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="absolute top-4 right-4 rounded-xl"
      >
        {theme === "dark" ? <Sun weight="duotone" className="w-4 h-4" /> : <Moon weight="duotone" className="w-4 h-4" />}
      </Button>

      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Lightning weight="bold" className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: "Manrope" }}>
            Velocity-One
          </h1>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <Tabs value={tab} onValueChange={(v) => { setTab(v); setError(""); }}>
            <TabsList className="w-full mb-6 rounded-xl h-10">
              <TabsTrigger
                value="login"
                data-testid="login-tab"
                className="flex-1 rounded-lg text-sm data-[state=active]:shadow-sm"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="register"
                data-testid="register-tab"
                className="flex-1 rounded-lg text-sm data-[state=active]:shadow-sm"
              >
                Register
              </TabsTrigger>
            </TabsList>

            {error && (
              <div data-testid="auth-error" className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
                {error}
              </div>
            )}

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Email</Label>
                  <Input data-testid="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="rounded-xl h-10" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Password</Label>
                  <Input data-testid="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter password" className="rounded-xl h-10" />
                </div>
                <Button data-testid="login-submit" type="submit" disabled={submitting} className="w-full rounded-xl h-10 font-semibold">
                  {submitting ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Name</Label>
                  <Input data-testid="register-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" className="rounded-xl h-10" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Email</Label>
                  <Input data-testid="register-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="rounded-xl h-10" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Password</Label>
                  <Input data-testid="register-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Min 6 characters" className="rounded-xl h-10" />
                </div>
                <Button data-testid="register-submit" type="submit" disabled={submitting} className="w-full rounded-xl h-10 font-semibold">
                  {submitting ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <p className="text-center text-muted-foreground text-xs mt-6">
          Cognitive Load & AI Delegation Architecture
        </p>
      </div>
    </div>
  );
}
