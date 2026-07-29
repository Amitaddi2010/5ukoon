import { useGetUserMe, useGetUserPasses, useUserLogout, getGetUserMeQueryKey, getGetUserPassesQueryKey } from "@workspace/api-client-react";
import { MusicalPassCard } from "@/components/MusicalPassCard";
import { Navbar } from "@/components/Navbar";
import { Loader2, Ticket, MapPin, Calendar, CheckCircle2, Clock, ShieldAlert, LogOut, Sparkles, QrCode } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { UserAuthModal } from "@/components/UserAuthModal";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export function MyPasses() {
  const { data: rawUser, isLoading: loadingUser } = useGetUserMe({
    query: { queryKey: getGetUserMeQueryKey(), retry: false },
  });
  const { data: rawPasses, isLoading: loadingPasses } = useGetUserPasses({
    query: { queryKey: getGetUserPassesQueryKey(), enabled: !!rawUser },
  });

  const user = (rawUser as any)?.data ?? rawUser ?? null;
  const passes = Array.isArray(rawPasses)
    ? rawPasses
    : Array.isArray((rawPasses as any)?.data)
      ? (rawPasses as any).data
      : [];

  const logout = useUserLogout();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.setQueryData(getGetUserMeQueryKey(), null);
        toast({ title: "Logged Out", description: "You have been signed out." });
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white selection:bg-amber-400 selection:text-black font-sans">
      <Navbar />

      <main className="pt-32 pb-20 px-4 sm:px-6 md:px-10 max-w-5xl mx-auto space-y-10">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-6 gap-4">
          <div>
            <span className="text-[10px] sm:text-[11px] tracking-[0.2em] text-amber-400 uppercase font-medium block mb-1">
              Guest Ticket Portal
            </span>
            <h1 className="text-2xl sm:text-4xl font-serif text-white tracking-tight">
              My Entry Ticket Passes
            </h1>
          </div>

          {user ? (
            <div className="flex items-center gap-4 bg-white/[0.03] border border-white/10 px-4 py-2 rounded-full">
              <div className="text-left">
                <p className="text-[13px] font-medium text-white">{user.name}</p>
                <p className="text-[11px] text-amber-300/80">{user.department}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-6 py-2.5 rounded-full bg-amber-400 text-black font-bold uppercase tracking-wider text-[12px] hover:bg-amber-300 transition-all shadow-md"
            >
              Sign In to View Passes
            </button>
          )}
        </div>

        {/* Content Body */}
        {loadingUser || (user && loadingPasses) ? (
          <div className="py-24 flex justify-center items-center">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          </div>
        ) : !user ? (
          /* Not Signed In Card */
          <div className="border border-white/10 bg-white/[0.02] rounded-3xl p-10 text-center space-y-6 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-400 shadow-lg">
              <Ticket className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-serif text-white">Sign In Required</h2>
              <p className="text-[13px] text-white/60 leading-relaxed font-light">
                Sign in to your Sukoon account or create a new account to view your confirmed digital entry passes.
              </p>
            </div>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold uppercase tracking-wider text-[12px] hover:brightness-110 transition-all shadow-lg shadow-amber-400/20"
            >
              Sign In / Create Account
            </button>
          </div>
        ) : !passes || passes.length === 0 ? (
          /* Signed In but No Passes Found */
          <div className="border border-white/10 bg-white/[0.02] rounded-3xl p-10 text-center space-y-6 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white/40">
              <Ticket className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-serif text-white">No Event Passes Found</h2>
              <p className="text-[13px] text-white/60 leading-relaxed font-light">
                You haven't requested an entry pass for the upcoming Saturday session yet.
              </p>
            </div>
            <Link href="/" className="inline-block px-8 py-3 rounded-full bg-amber-400 text-black font-bold uppercase tracking-wider text-[12px] hover:bg-amber-300 transition-all">
              Register for Saturday Event
            </Link>
          </div>
        ) : (
          /* Render Digital Musical Ticket Passes */
          <div className="space-y-8">
            {passes.map((pass: any) => (
              <MusicalPassCard key={pass.id} pass={pass} />
            ))}
          </div>
        )}
      </main>

      <UserAuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
