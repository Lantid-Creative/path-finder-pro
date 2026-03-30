import { useState } from "react";
import { Shield, Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ForgotPasswordProps {
  onBack: () => void;
}

const ForgotPassword = ({ onBack }: ForgotPasswordProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 rounded-full bg-safe/15 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={28} className="text-safe" />
        </div>
        <h3 className="font-display font-semibold text-foreground mb-1">Check your email</h3>
        <p className="text-sm text-muted-foreground mb-5 px-2">
          We sent a password reset link to <span className="text-foreground font-medium">{email}</span>
        </p>
        <button
          onClick={onBack}
          className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1 mx-auto"
        >
          <ArrowLeft size={14} />
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      <h3 className="font-display font-semibold text-lg text-foreground mb-1">Reset Password</h3>
      <p className="text-sm text-muted-foreground mb-5">
        Enter your email and we'll send you a reset link
      </p>

      <form onSubmit={handleSubmit} className="space-y-3.5">
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

        <button
          type="submit"
          disabled={loading}
          className="w-full gradient-safe text-primary-foreground font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-safe/20"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              Send Reset Link
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
