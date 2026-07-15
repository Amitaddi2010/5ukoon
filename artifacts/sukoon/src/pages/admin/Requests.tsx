import { useState, useMemo } from "react";
import { useListRequests, useUpdateRequestStatus, useGetEventStats, useListEvents, useAdminLogout, getListRequestsQueryKey, getGetEventStatsQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useAdminGuard } from "@/hooks/use-admin-guard";

export function AdminRequests() {
  const { isAuthenticated, isLoading: checkingAuth } = useAdminGuard();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("all");

  const { data: events } = useListEvents();
  const eventId = events?.[0]?.id;

  const { data: requests, isLoading: loadingReqs } = useListRequests(
    { eventId },
    { query: { enabled: !!eventId } }
  );

  const { data: stats } = useGetEventStats(
    eventId!,
    { query: { enabled: !!eventId } }
  );

  const updateStatus = useUpdateRequestStatus();
  const logout = useAdminLogout();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        setLocation("/admin");
      }
    });
  };

  const handleStatusUpdate = (id: number, status: 'approved' | 'declined' | 'waitlisted' | 'pending') => {
    updateStatus.mutate({ id, data: { status } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListRequestsQueryKey({ eventId }) });
        if (eventId) {
          queryClient.invalidateQueries({ queryKey: getGetEventStatsQueryKey(eventId) });
        }
      }
    });
  };

  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    if (filter === "all") return requests;
    return requests.filter(r => r.status === filter);
  }, [requests, filter]);

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      approved: "APPROVED",
      declined: "DECLINED",
      waitlisted: "WAITLISTED",
      pending: "PENDING",
    };
    return map[status] ?? status.toUpperCase();
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'approved': return "text-emerald-400";
      case 'declined': return "text-red-400";
      case 'waitlisted': return "text-amber-400";
      default: return "text-white/40";
    }
  };

  if (checkingAuth || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/[0.08] sticky top-0 z-10 bg-black/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 md:px-10 h-[52px]">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-[13px] font-medium tracking-[0.18em] uppercase text-white">
              SUKOON©
            </Link>
            <span className="text-white/15">|</span>
            <span className="text-[11px] tracking-[0.15em] text-white/30 uppercase font-medium">Admin</span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/admin/checkin"
              className="text-[12px] tracking-[0.12em] uppercase text-white/40 hover:text-white transition-colors font-medium"
            >
              Check-in Mode
            </Link>
            <button
              onClick={handleLogout}
              className="text-[12px] tracking-[0.12em] uppercase text-white/30 hover:text-white transition-colors font-medium"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="px-6 md:px-10 py-16 max-w-7xl mx-auto space-y-16">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-white/[0.1]">
          {[
            { label: "CAPACITY", value: stats?.capacity ?? 25, color: "text-white" },
            { label: "CONFIRMED", value: stats?.confirmed ?? 0, color: "text-emerald-400" },
            { label: "PENDING", value: stats?.pending ?? 0, color: "text-white" },
            { label: "WAITLISTED", value: stats?.waitlisted ?? 0, color: "text-amber-400" },
          ].map((item, i) => (
            <div key={item.label} className={`p-7 md:p-9 ${i < 3 ? "border-r border-white/[0.1]" : ""}`}>
              <p className="text-[10px] tracking-[0.2em] text-white/25 uppercase mb-3 font-medium">{item.label}</p>
              <p className={`text-4xl font-medium ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Requests table */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-medium text-white tracking-tight">
                Requests ({filteredRequests.length})
              </h2>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[160px] h-9 bg-transparent border border-white/20 rounded-full text-[12px] tracking-[0.1em] uppercase text-white/60 font-medium focus:ring-0">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10 text-white">
                <SelectItem value="all" className="text-[12px] tracking-wide uppercase">All</SelectItem>
                <SelectItem value="pending" className="text-[12px] tracking-wide uppercase">Pending</SelectItem>
                <SelectItem value="approved" className="text-[12px] tracking-wide uppercase">Approved</SelectItem>
                <SelectItem value="waitlisted" className="text-[12px] tracking-wide uppercase">Waitlisted</SelectItem>
                <SelectItem value="declined" className="text-[12px] tracking-wide uppercase">Declined</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loadingReqs ? (
            <div className="py-24 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-white/25" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="border-t border-white/[0.08] py-20 text-center">
              <p className="text-[13px] text-white/25 tracking-wide font-light">No requests found.</p>
            </div>
          ) : (
            <div>
              {/* Column headers */}
              <div className="border-t border-white/[0.08] grid grid-cols-[2fr_2fr_3fr_1fr_auto] gap-6 py-3 px-2">
                {["GUEST", "CONTACT", "INTENTION", "STATUS", ""].map(h => (
                  <span key={h} className="text-[10px] tracking-[0.2em] text-white/20 uppercase font-medium">{h}</span>
                ))}
              </div>

              {filteredRequests.map((req, i) => (
                <div
                  key={req.id}
                  className={`border-t border-white/[0.08] grid grid-cols-[2fr_2fr_3fr_1fr_auto] gap-6 py-6 px-2 items-start group ${i === filteredRequests.length - 1 ? 'border-b' : ''}`}
                >
                  {/* Guest */}
                  <div>
                    <p className="text-[14px] font-medium text-white leading-snug">{req.name}</p>
                    {req.mutualConnection && (
                      <p className="text-[12px] text-white/30 font-light mt-1">Knows: {req.mutualConnection}</p>
                    )}
                    {req.socialHandle && (
                      <a
                        href={req.socialHandle.includes('http') ? req.socialHandle : `https://${req.socialHandle}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[12px] text-white/25 hover:text-white transition-colors font-light mt-1 block truncate"
                      >
                        {req.socialHandle}
                      </a>
                    )}
                  </div>

                  {/* Contact */}
                  <div>
                    <p className="text-[13px] text-white/60 font-light leading-snug">{req.email}</p>
                    <p className="text-[12px] text-white/30 font-light mt-1">{req.phone}</p>
                  </div>

                  {/* Intention */}
                  <div>
                    <p className="text-[13px] text-white/50 font-light leading-relaxed line-clamp-2 italic">
                      &ldquo;{req.whyAttend}&rdquo;
                    </p>
                    <p className="text-[11px] text-white/20 font-light mt-2 tracking-wide">
                      {req.heardAbout || "—"} · {format(new Date(req.createdAt), "MMM d")}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <span className={`text-[11px] tracking-[0.15em] font-medium ${statusColor(req.status)}`}>
                      {statusLabel(req.status)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {req.status === 'pending' && (
                      <>
                        <ActionBtn onClick={() => handleStatusUpdate(req.id, 'approved')} label="✓" color="text-emerald-400 hover:bg-emerald-400/10 border-emerald-400/20" title="Approve" />
                        <ActionBtn onClick={() => handleStatusUpdate(req.id, 'waitlisted')} label="~" color="text-amber-400 hover:bg-amber-400/10 border-amber-400/20" title="Waitlist" />
                        <ActionBtn onClick={() => handleStatusUpdate(req.id, 'declined')} label="✕" color="text-red-400 hover:bg-red-400/10 border-red-400/20" title="Decline" />
                      </>
                    )}
                    {req.status !== 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(req.id, 'pending')}
                        className="text-[11px] tracking-[0.1em] uppercase text-white/20 hover:text-white/50 transition-colors font-medium"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ActionBtn({ onClick, label, color, title }: { onClick: () => void; label: string; color: string; title: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-7 h-7 rounded-full border flex items-center justify-center text-[13px] transition-colors ${color}`}
    >
      {label}
    </button>
  );
}
