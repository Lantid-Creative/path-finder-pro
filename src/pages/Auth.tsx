import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, User, ArrowRight, Loader2, MapPin, Users, Bell } from "lucide-react";
import { toast } from "sonner";
import ForgotPassword from "@/components/ForgotPassword";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, displayName);
        toast.success("Account created! Check your email to verify.");
      } else {
        await signIn(email, password);
        toast.success("Welcome back!");
        navigate("/");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-15%] w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-20%] w-[350px] h-[350px] rounded-full bg-safe/5 blur-3xl" />
        <div className="absolute top-[40%] left-[10%] w-[200px] h-[200px] rounded-full bg-accent/5 blur-2xl" />
      </div>

      {/* Top section with branding */}
      <div className="flex-1 flex flex-col items-center justify-end pb-8 px-6 relative z-10 safe-area-top">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl gradient-safe flex items-center justify-center shadow-xl glow-safe">
            <Shield size={36} className="text-primary-foreground" />
          </div>
          <span className="absolute inset-0 rounded-2xl border-2 border-safe/20 animate-[pulse-ring_3s_ease-out_infinite]" />
          <span className="absolute inset-0 rounded-2xl border-2 border-safe/10 animate-[pulse-ring_3s_ease-out_1s_infinite]" />
        </div>

        <h1 className="font-display font-bold text-3xl text-foreground tracking-tight mb-1">PATHLY</h1>
        <p className="text-muted-foreground text-sm mb-6">Your safety companion</p>

        <div className="flex flex-wrap justify-center gap-2">
          {[
            { icon: MapPin, label: "Live Tracking" },
            { icon: Users, label: "Community" },
            { icon: Bell, label: "Smart Alerts" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/60 border border-border/50 text-xs text-muted-foreground"
            >
              <Icon size={12} className="text-primary" />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Form section */}
      <div className="relative z-10 px-5 pb-6 safe-area-bottom">
        <div className="bg-card rounded-3xl border border-border p-6 shadow-2xl shadow-background/80 max-w-sm mx-auto w-full">
          {showForgot ? (
            <ForgotPassword onBack={() => setShowForgot(false)} />
          ) : (
            <>
              {/* Tab switcher */}
              <div className="flex bg-secondary/60 rounded-xl p-1 mb-6">
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    !isSignUp
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isSignUp
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {isSignUp && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block ml-1">Display Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="What should we call you?"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                        maxLength={100}
                        className="w-full bg-secondary/70 border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block ml-1">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      maxLength={255}
                      className="w-full bg-secondary/70 border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block ml-1">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="password"
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full bg-secondary/70 border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full gradient-safe text-primary-foreground font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-safe/20 mt-2"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      {isSignUp ? "Create Account" : "Sign In"}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {!isSignUp && (
                <button
                  onClick={() => setShowForgot(true)}
                  className="w-full mt-3 text-xs text-muted-foreground/70 hover:text-primary transition-colors text-center"
                >
                  Forgot password?
                </button>
              )}
            </>
          )}
        </div>

        <p className="text-center text-[10px] text-muted-foreground/50 mt-4 px-8">
          By continuing, you agree to PATHLY's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Auth;
