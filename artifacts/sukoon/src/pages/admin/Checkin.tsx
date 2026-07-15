import { useState, useMemo } from "react";
import { useListGuests, useCheckInGuest, useListEvents, useAdminLogout, getListGuestsQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminGuard } from "@/hooks/use-admin-guard";

export function AdminCheckin() {
  const { isAuthenticated, isLoading: checkingAuth } = useAdminGuard();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: events } = useListEvents();
  const eventId = events?.[0]?.id;

  const { data: guests, isLoading } = useListGuests(
    { eventId },
    { query: { enabled: !!eventId } }
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

  const handleCheckIn = (guestId: number, isCheckedIn: boolean) => {
    if (isCheckedIn) return;
    checkInMutation.mutate({ id: guestId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGuestsQueryKey({ eventId }) });
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
    <div className="min-h-[100dvh] bg-black text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/[0.08] sticky top-0 z-10 bg-black/90 backdrop-blur-md px-6 py-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-5">
            <Link href="/admin/requests" className="text-[12px] tracking-[0.15em] text-white/30 uppercase hover:text-white transition-colors font-medium">
              ← Back
            </Link>
            <span className="text-[13px] font-medium tracking-[0.18em] uppercase text-white">
              SUKOON© / Check-in
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

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-0 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-white/20" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search name or ticket code..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-transparent border-0 border-b border-white/10 pl-6 pr-0 pb-3 pt-1 text-[15px] text-white font-light placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
          />
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
            <p className="text-[13px] text-white/20 tracking-wide font-light">No guests found.</p>
          </div>
        ) : (
          <div className="pb-24">
            {filteredGuests.map((guest, i) => (
              <div
                key={guest.id}
                onClick={() => handleCheckIn(guest.id, guest.checkedIn)}
                className={`border-t border-white/[0.07] py-5 flex items-center justify-between cursor-pointer group transition-all
                  ${i === filteredGuests.length - 1 ? 'border-b border-white/[0.07]' : ''}
                `}
              >
                <div>
                  <h3 className={`text-[17px] font-medium leading-snug transition-colors ${guest.checkedIn ? 'text-emerald-400' : 'text-white group-hover:text-white/70'}`}>
                    {guest.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[12px] text-white/25 font-light tracking-widest">{guest.ticketCode}</span>
                    {guest.status === 'waitlisted' && (
                      <span className="text-[10px] tracking-[0.15em] uppercase text-amber-400 font-medium">Waitlisted</span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 pl-6">
                  {guest.checkedIn ? (
                    <div className="w-8 h-8 rounded-full border border-emerald-400/40 bg-emerald-400/10 flex items-center justify-center">
                      <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                        <path d="M1 5l4 4L11 1" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border border-white/15 group-hover:border-white/30 transition-colors" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
