import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useUserSignUp, useUserLogin, useUserResetPassword, getGetUserMeQueryKey, getGetUserPassesQueryKey } from "@workspace/api-client-react";
import { Loader2, User, Lock, Mail, Phone, Building2, Sparkles, ChevronRight, AlertCircle, ArrowLeft, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const DEPARTMENTS = [
  "Anaesthesia",
  "Cardiology",
  "Hematology",
  "Hepatology",
  "Internal Medicine",
  "Microbiology",
  "Nursing",
  "Orthopedics",
  "Parasitology",
  "Pediatrics",
  "Radiology",
  "Surgery",
  "Other PGIMER Dept",
];

export function UserAuthModal({ isOpen, onClose, onSuccess }: UserAuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [alreadyRegisteredEmail, setAlreadyRegisteredEmail] = useState<string | null>(null);
  const [authError, setAuthError] = useState<{ title: string; message: string } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const signUp = useUserSignUp();
  const login = useUserLogin();
  const resetPassword = useUserResetPassword();

  const [formData, setFormData] = useState({
    name: "",
    department: "Anaesthesia",
    phone: "",
    email: "",
    password: "",
    resetPhone: "",
    newPassword: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAlreadyRegisteredEmail(null);
    setAuthError(null);

    if (mode === "signup") {
      if (!formData.name || !formData.phone || !formData.email || !formData.password) {
        setAuthError({ title: "Missing Information", message: "Please fill in all required fields." });
        return;
      }

      signUp.mutate(
        { data: { name: formData.name, department: formData.department, phone: formData.phone, email: formData.email, password: formData.password } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetUserMeQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetUserPassesQueryKey() });
            toast({ title: "Account Created!", description: "Welcome to Sukoon. You can now view your digital passes." });
            onClose();
            if (onSuccess) onSuccess();
          },
          onError: (err: any) => {
            const msg = err?.data?.error || err?.response?.data?.error || err?.message || "Failed to create account.";
            if (msg.toLowerCase().includes("already exists") || msg.toLowerCase().includes("please log in")) {
              setAlreadyRegisteredEmail(formData.email);
            } else {
              setAuthError({ title: "Registration Error", message: msg });
            }
          },
        }
      );
    } else if (mode === "forgot") {
      if (!formData.email || !formData.resetPhone || !formData.newPassword) {
        setAuthError({ title: "Missing Information", message: "Please enter your email, registered phone number, and new password." });
        return;
      }

      resetPassword.mutate(
        { data: { email: formData.email, phone: formData.resetPhone, newPassword: formData.newPassword } },
        {
          onSuccess: (res: any) => {
            toast({
              title: "Password Reset Successful!",
              description: res?.message || "Your password has been updated. Please sign in now.",
            });
            setFormData(prev => ({ ...prev, password: prev.newPassword }));
            setMode("login");
            setAuthError(null);
          },
          onError: (err: any) => {
            const msg = err?.data?.error || err?.response?.data?.error || err?.message || "Failed to reset password.";
            setAuthError({
              title: "Password Reset Error",
              message: msg,
            });
          },
        }
      );
    } else {
      if (!formData.email || !formData.password) {
        setAuthError({ title: "Missing Information", message: "Please enter your email and password." });
        return;
      }

      login.mutate(
        { data: { email: formData.email, password: formData.password } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetUserMeQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetUserPassesQueryKey() });
            toast({ title: "Welcome Back!", description: "Logged into your Sukoon account." });
            onClose();
            if (onSuccess) onSuccess();
          },
          onError: (err: any) => {
            const msg = err?.data?.error || err?.response?.data?.error || err?.message || "Invalid email or password.";
            setAuthError({ title: "Sign In Failed", message: msg });
          },
        }
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        data-lenis-prevent
        className="w-[94vw] sm:max-w-md bg-[#0b0b0e] border border-white/15 text-white p-0 shadow-[0_0_50px_rgba(0,0,0,0.9)] rounded-3xl max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="relative p-6 sm:p-8 space-y-6">
          {/* Top ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-amber-500/15 to-transparent blur-2xl pointer-events-none" />

          <DialogHeader className="space-y-2 text-left relative z-10 pr-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[11px] font-medium tracking-widest uppercase w-fit">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {mode === "login" ? "Guest Portal" : mode === "signup" ? "New Account" : "Password Recovery"}
              </span>
            </div>

            <DialogTitle className="text-2xl font-serif text-white">
              {mode === "login" ? "Sign In to Sukoon" : mode === "signup" ? "Create Guest Account" : "Reset Password"}
            </DialogTitle>

            <DialogDescription className="text-white/60 text-[13px] font-light leading-relaxed">
              {mode === "login"
                ? "Access your digital entry ticket passes and event status."
                : mode === "signup"
                ? "Register your account to manage your rooftop passes seamlessly."
                : "Verify your email & phone number to set a new password."}
            </DialogDescription>
          </DialogHeader>

          {/* Professional Auth Error Alert Box */}
          {authError && (
            <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-[13px] space-y-2 relative z-10 shadow-lg shadow-red-500/10 animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-[14px] text-red-300">{authError.title}</p>
                    <p className="text-[12px] text-red-200/90 leading-relaxed mt-0.5">{authError.message}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAuthError(null)}
                  className="text-white/40 hover:text-white text-xs uppercase font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Already Registered Alert Dialog Banner */}
          {alreadyRegisteredEmail && (
            <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-500/50 text-amber-200 text-[13px] space-y-3 relative z-10 shadow-lg shadow-amber-500/10 animate-in fade-in zoom-in-95">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[14px] text-amber-300">You are already registered!</p>
                  <p className="text-[12px] text-amber-200/80 leading-relaxed mt-0.5">
                    An account for <span className="font-semibold text-white">{alreadyRegisteredEmail}</span> already exists. Please sign in or reset your password.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setAlreadyRegisteredEmail(null);
                    setAuthError(null);
                  }}
                  className="px-4 py-2 rounded-full bg-amber-400 text-black text-[11px] font-bold uppercase tracking-wider hover:bg-amber-300 transition-colors shadow-md"
                >
                  Go to Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setAlreadyRegisteredEmail(null);
                    setAuthError(null);
                  }}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-amber-300 text-[11px] font-medium uppercase tracking-wider transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            </div>
          )}

          {/* Mode Switcher */}
          {mode !== "forgot" ? (
            <div className="grid grid-cols-2 p-1 bg-white/[0.04] border border-white/10 rounded-full text-[12px] font-medium tracking-wide uppercase relative z-10">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setAlreadyRegisteredEmail(null);
                }}
                className={`py-2 rounded-full transition-all ${
                  mode === "login" ? "bg-white text-black font-semibold shadow-md" : "text-white/50 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setAlreadyRegisteredEmail(null);
                }}
                className={`py-2 rounded-full transition-all ${
                  mode === "signup" ? "bg-amber-400 text-black font-bold shadow-md" : "text-white/50 hover:text-white"
                }`}
              >
                Create Account
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setMode("login")}
              className="inline-flex items-center gap-1.5 text-[12px] text-white/50 hover:text-white transition-colors relative z-10 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </button>
          )}
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            {mode === "signup" && (
              <>
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-widest text-white/50 font-medium">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. / Resident Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#121217] border border-white/15 text-white placeholder:text-white/20 text-[14px] focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Department */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-widest text-white/50 font-medium">Department (PGIMER)</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#121217] border border-white/15 text-white text-[14px] focus:outline-none focus:border-amber-400"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-widest text-white/50 font-medium">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#121217] border border-white/15 text-white placeholder:text-white/20 text-[14px] focus:outline-none focus:border-amber-400"
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-widest text-white/50 font-medium">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@pgimer.edu.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-11 px-4 rounded-xl bg-[#121217] border border-white/15 text-white placeholder:text-white/20 text-[14px] focus:outline-none focus:border-amber-400"
              />
            </div>

            {mode === "forgot" ? (
              <>
                {/* Reset Phone Verification */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-widest text-white/50 font-medium">Registered Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={formData.resetPhone}
                    onChange={(e) => setFormData({ ...formData, resetPhone: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#121217] border border-white/15 text-white placeholder:text-white/20 text-[14px] focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* New Password */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-widest text-white/50 font-medium">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-[#121217] border border-white/15 text-white placeholder:text-white/20 text-[14px] focus:outline-none focus:border-amber-400"
                  />
                </div>
              </>
            ) : (
              /* Password */
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] uppercase tracking-widest text-white/50 font-medium">Password</label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-[11px] text-amber-400/80 hover:text-amber-300 transition-colors font-medium"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-[#121217] border border-white/15 text-white placeholder:text-white/20 text-[14px] focus:outline-none focus:border-amber-400"
                />
              </div>
            )}

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={signUp.isPending || login.isPending || resetPassword.isPending}
              className="w-full h-12 mt-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-black font-bold uppercase tracking-wider text-[12px] hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 disabled:opacity-50 cursor-pointer"
            >
              {signUp.isPending || login.isPending || resetPassword.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : (
                <>
                  <span>
                    {mode === "login"
                      ? "Sign In"
                      : mode === "signup"
                      ? "Create Account & View Passes"
                      : "Reset Password & Sign In"}
                  </span>
                  <ChevronRight className="w-4 h-4 text-black" />
                </>
              )}
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
