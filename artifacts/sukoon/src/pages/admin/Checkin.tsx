import { useState, useMemo } from "react";
import { useListGuests, useCheckInGuest, useListEvents, useAdminLogout, getListGuestsQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Search, CheckCircle2, Circle, Loader2, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    if (isCheckedIn) return; // Prevent double check-in calls for now
    
    checkInMutation.mutate({ id: guestId }, {
      onSuccess: () => {
        // Invalidate rather than optimistic update to ensure truth
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

  const arrivedCount = guests?.filter(g => g.checkedIn).length || 0;
  const totalCount = guests?.length || 0;

  if (checkingAuth || !isAuthenticated) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      {/* Mobile-friendly header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
              <Link href="/admin/requests"><ArrowLeft className="w-5 h-5" /></Link>
            </Button>
            <h1 className="font-serif text-xl text-primary">Door Check-in</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium">
              <span className="text-primary">{arrivedCount}</span> / {totalCount} Arrived
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="h-8 w-8">
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search guest name or code..." 
            className="pl-9 h-12 bg-background border-border text-base"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </header>

      <main className="flex-1 p-4">
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">Loading guests...</div>
        ) : filteredGuests.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">No guests found.</div>
        ) : (
          <div className="space-y-3 pb-24">
            {filteredGuests.map(guest => (
              <div 
                key={guest.id}
                onClick={() => handleCheckIn(guest.id, guest.checkedIn)}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all
                  ${guest.checkedIn 
                    ? 'bg-emerald-950/20 border-emerald-900/50' 
                    : guest.status === 'waitlisted' 
                      ? 'bg-card opacity-60 border-border/50' 
                      : 'bg-card border-border hover:border-primary/50'
                  }
                `}
              >
                <div>
                  <h3 className={`text-lg font-medium ${guest.checkedIn ? 'text-emerald-500' : 'text-foreground'}`}>
                    {guest.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground font-mono">{guest.ticketCode}</span>
                    {guest.status === 'waitlisted' && (
                      <span className="text-xs bg-amber-900/40 text-amber-500 px-2 py-0.5 rounded">Waitlisted</span>
                    )}
                  </div>
                </div>
                
                <div className="shrink-0 pl-4">
                  {guest.checkedIn ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <Circle className="w-8 h-8 text-muted-foreground/30" />
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
