import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { formatApiError } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Lightning } from "@phosphor-icons/react";

export default function AuthPage() {
  const { login, register } = useAuth();
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
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1770745560263-a8fc696de90b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGRhcmslMjB0ZXh0dXJlfGVufDB8fHx8MTc3NDk3MTAzNnww&ixlib=rb-4.1.0&q=85)" }}
      />
      <div className="w-full max-w-sm relative z-10">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[#FF5500] rounded-sm flex items-center justify-center">
            <Lightning weight="bold" className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#EDEDED]" style={{ fontFamily: "Manrope" }}>
            Velocity-One
          </h1>
        </div>

        <div className="bg-[#141414] border border-[#2A2A2A] rounded-sm p-6">
          <Tabs value={tab} onValueChange={(v) => { setTab(v); setError(""); }}>
            <TabsList className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-sm mb-6">
              <TabsTrigger
                value="login"
                data-testid="login-tab"
                className="flex-1 rounded-sm data-[state=active]:bg-[#FF5500] data-[state=active]:text-white text-[#8A8A8A] text-sm"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="register"
                data-testid="register-tab"
                className="flex-1 rounded-sm data-[state=active]:bg-[#FF5500] data-[state=active]:text-white text-[#8A8A8A] text-sm"
              >
                Register
              </TabsTrigger>
            </TabsList>

            {error && (
              <div data-testid="auth-error" className="mb-4 p-3 bg-[#FF3D00]/10 border border-[#FF3D00]/30 rounded-sm text-[#FF3D00] text-sm">
                {error}
              </div>
            )}

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label className="text-xs uppercase tracking-[0.2em] text-[#8A8A8A] mb-1.5 block">Email</Label>
                  <Input
                    data-testid="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDEDED] rounded-sm placeholder:text-[#8A8A8A]/50 focus:ring-1 focus:ring-[#FF5500] focus:border-[#FF5500]"
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-[0.2em] text-[#8A8A8A] mb-1.5 block">Password</Label>
                  <Input
                    data-testid="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter password"
                    className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDEDED] rounded-sm placeholder:text-[#8A8A8A]/50 focus:ring-1 focus:ring-[#FF5500] focus:border-[#FF5500]"
                  />
                </div>
                <Button
                  data-testid="login-submit"
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#FF5500] hover:bg-[#CC4400] text-white rounded-sm font-semibold"
                >
                  {submitting ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label className="text-xs uppercase tracking-[0.2em] text-[#8A8A8A] mb-1.5 block">Name</Label>
                  <Input
                    data-testid="register-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Your name"
                    className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDEDED] rounded-sm placeholder:text-[#8A8A8A]/50 focus:ring-1 focus:ring-[#FF5500] focus:border-[#FF5500]"
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-[0.2em] text-[#8A8A8A] mb-1.5 block">Email</Label>
                  <Input
                    data-testid="register-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDEDED] rounded-sm placeholder:text-[#8A8A8A]/50 focus:ring-1 focus:ring-[#FF5500] focus:border-[#FF5500]"
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-[0.2em] text-[#8A8A8A] mb-1.5 block">Password</Label>
                  <Input
                    data-testid="register-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Min 6 characters"
                    className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDEDED] rounded-sm placeholder:text-[#8A8A8A]/50 focus:ring-1 focus:ring-[#FF5500] focus:border-[#FF5500]"
                  />
                </div>
                <Button
                  data-testid="register-submit"
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#FF5500] hover:bg-[#CC4400] text-white rounded-sm font-semibold"
                >
                  {submitting ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <p className="text-center text-[#8A8A8A] text-xs mt-6">
          Cognitive Load & AI Delegation Architecture
        </p>
      </div>
    </div>
  );
}
