import { useState, useMemo } from "react";
import { useListGuests, useCheckInGuest, useListEvents, useAdminLogout, getListGuestsQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Loader2, Camera, Search, CheckCircle2, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminGuard } from "@/hooks/use-admin-guard";
import { QRCameraScannerModal } from "@/components/QRCameraScannerModal";

export function AdminCheckin() {
  const { isAuthenticated, isLoading: checkingAuth } = useAdminGuard();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [scanResult, setScanResult] = useState<{
    type: "success" | "warning" | "error";
    message: string;
    guestName?: string;
    department?: string;
  } | null>(null);

  const queryClient = useQueryClient();

  const { data: events } = useListEvents();
  const currentEvent = events?.[0];
  const eventId = currentEvent?.id;

  const { data: guests, isLoading } = useListGuests(
    { eventId },
    { query: { enabled: !!eventId, queryKey: getListGuestsQueryKey({ eventId }) } }
  );

  const checkInMutation = useCheckInGuest();
  const logout = useAdminLogout();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        setLocation("/admin");
      }
    });
  };

  const handleValidateAndCheckIn = (ticketOrName: string) => {
    if (!guests || !currentEvent) return;
    const term = ticketOrName.trim().toLowerCase();
    if (!term) return;

    // Search by exact ticket code or substring
    const matchedGuest = guests.find(g =>
      g.ticketCode?.toLowerCase() === term ||
      g.ticketCode?.toLowerCase().includes(term) ||
      g.name.toLowerCase().includes(term)
    );

    if (!matchedGuest) {
      setScanResult({
        type: "error",
        message: `Invalid Ticket Code / Guest "${ticketOrName}". No matching pass found in system.`,
      });
      return;
    }

    // Verify Event Date
    const eventDate = new Date(currentEvent.date);
    const now = new Date();
    // Allow check-in within event date range
    const isSameEventDay = eventDate.toDateString() === now.toDateString() || Math.abs(eventDate.getTime() - now.getTime()) < 7 * 24 * 60 * 60 * 1000;

    if (!isSameEventDay) {
      setScanResult({
        type: "error",
        message: `EVENT DATE MISMATCH: This pass is valid for ${eventDate.toDateString()}, not today.`,
        guestName: matchedGuest.name,
      });
      return;
    }

    if (matchedGuest.checkedIn) {
      setScanResult({
        type: "warning",
        message: `ALREADY CHECKED IN: ${matchedGuest.name} (${matchedGuest.ticketCode}) has already entered.`,
        guestName: matchedGuest.name,
      });
      return;
    }

    // Perform Check-in
    checkInMutation.mutate({ id: matchedGuest.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGuestsQueryKey({ eventId }) });
        setScanResult({
          type: "success",
          message: `ENTRY ALLOWED & VALIDATED! Welcome to Sukoon Mehfil.`,
          guestName: matchedGuest.name,
        });
      }
    });
  };

  const handleCheckIn = (guestId: number, isCheckedIn: boolean, guestName: string) => {
    if (isCheckedIn) return;
    checkInMutation.mutate({ id: guestId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGuestsQueryKey({ eventId }) });
        setScanResult({
          type: "success",
          message: `Entry Validated for ${guestName}!`,
          guestName,
        });
      }
    });
  };

  const filteredGuests = useMemo(() => {
    if (!guests) return [];
    if (!search.trim()) return guests;
    const term = search.toLowerCase();
    return guests.filter(g =>
      g.name.toLowerCase().includes(term) ||
      g.ticketCode?.toLowerCase().includes(term)
    );
  }, [guests, search]);

  const arrivedCount = guests?.filter(g => g.checkedIn).length ?? 0;
  const totalCount = guests?.length ?? 0;

  if (checkingAuth || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-white/[0.08] sticky top-0 z-10 bg-black/90 backdrop-blur-md px-6 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link href="/admin/requests" className="text-[12px] tracking-[0.15em] text-white/30 uppercase hover:text-white transition-colors font-medium">
              ← Back
            </Link>
            <span className="text-[13px] font-medium tracking-[0.18em] uppercase text-white">
              SUKOON© / Live QR Check-in
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] tracking-[0.18em] text-white/25 uppercase font-medium">Arrived</p>
              <p className="text-[22px] font-medium text-white leading-tight">
                {arrivedCount}<span className="text-white/25 text-[15px]">/{totalCount}</span>
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-[11px] tracking-[0.12em] uppercase text-white/20 hover:text-white transition-colors font-medium"
            >
              Out
            </button>
          </div>
        </div>

        {/* Scan Result Alert Banner */}
        {scanResult && (
          <div className={`p-4 rounded-xl text-[13px] font-medium flex items-center justify-between transition-all ${
            scanResult.type === "success"
              ? "bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-500/10"
              : scanResult.type === "warning"
              ? "bg-amber-950/80 border border-amber-500/50 text-amber-300"
              : "bg-red-950/80 border border-red-500/50 text-red-300"
          }`}>
            <div>
              {scanResult.guestName && <p className="font-bold text-[14px] uppercase tracking-wide">{scanResult.guestName}</p>}
              <p>{scanResult.message}</p>
            </div>
            <button onClick={() => setScanResult(null)} className="text-xs uppercase tracking-wider text-white/40 hover:text-white ml-4">Dismiss</button>
          </div>
        )}

        {/* Search & Code Scan Form */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          <form onSubmit={(e) => { e.preventDefault(); handleValidateAndCheckIn(search); }} className="relative flex-1 flex items-center gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-0 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-white/40" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Scan QR Code / Enter Ticket Code (SKN-XXXXXXXX) or Guest Name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-white/20 pl-6 pr-0 pb-3 pt-1 text-[15px] text-white font-light placeholder:text-white/30 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-amber-400 text-black text-[12px] font-bold uppercase tracking-wider hover:bg-amber-300 transition-all shrink-0 cursor-pointer"
            >
              Verify Pass
            </button>
          </form>

          <button
            type="button"
            onClick={() => setIsCameraOpen(true)}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-400/10 border border-amber-400/40 text-amber-300 text-[12px] font-bold uppercase tracking-wider hover:bg-amber-400/30 transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-amber-400/5 cursor-pointer"
          >
            <Camera className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Scan with Camera</span>
          </button>
        </div>
      </header>

      {/* Guest list */}
      <main className="flex-1 px-6 py-6">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-white/25" />
          </div>
        ) : filteredGuests.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[13px] text-white/20 tracking-wide font-light">No confirmed guests found.</p>
          </div>
        ) : (
          <div className="pb-24">
            {filteredGuests.map((guest, i) => (
              <div
                key={guest.id}
                onClick={() => handleCheckIn(guest.id, guest.checkedIn, guest.name)}
                className={`border-t border-white/[0.07] py-5 flex items-center justify-between cursor-pointer group transition-all
                  ${i === filteredGuests.length - 1 ? 'border-b border-white/[0.07]' : ''}
                `}
              >
                <div>
                  <h3 className={`text-[17px] font-medium leading-snug transition-colors ${guest.checkedIn ? 'text-emerald-400' : 'text-white group-hover:text-white/70'}`}>
                    {guest.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[12px] text-white/40 font-mono tracking-widest">{guest.ticketCode || `SKN-REG-${guest.id}`}</span>
                    {guest.status === 'waitlisted' && (
                      <span className="text-[10px] tracking-[0.15em] uppercase text-amber-400 font-medium">Waitlisted</span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 pl-6">
                  {guest.checkedIn ? (
                    <div className="w-9 h-9 rounded-full border border-emerald-400/40 bg-emerald-400/10 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                      <svg width="14" height="12" viewBox="0 0 12 10" fill="none">
                        <path d="M1 5l4 4L11 1" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full border border-white/15 group-hover:border-amber-400 transition-colors flex items-center justify-center text-[11px] text-white/40 group-hover:text-amber-400">
                      Verify
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Live Camera Scanner Modal */}
      <QRCameraScannerModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onScanSuccess={(scannedCode) => {
          setSearch(scannedCode);
          handleValidateAndCheckIn(scannedCode);
        }}
      />
    </div>
  );
}
