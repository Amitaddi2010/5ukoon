import { useState, useMemo } from "react";
import { useListRequests, useUpdateRequestStatus, useGetEventStats, useListEvents, useAdminLogout, useListUsers, useDeleteUser, getListRequestsQueryKey, getGetEventStatsQueryKey, getListUsersQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, BarChart2, List, Building2, Calendar, Users, Trash2, Mail, Phone, UserCheck, Download } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useAdminGuard } from "@/hooks/use-admin-guard";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";
import { useToast } from "@/hooks/use-toast";

export function AdminRequests() {
  const { isAuthenticated, isLoading: checkingAuth } = useAdminGuard();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>("all");
  const [userSearch, setUserSearch] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"requests" | "analytics" | "users">("requests");

  const { data: events } = useListEvents();
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const sortedEvents = useMemo(() => {
    if (!events) return [];
    return [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [events]);

  const eventId = selectedEventId || sortedEvents[0]?.id;
  const currentEvent = sortedEvents.find(e => e.id === eventId);

  const { data: requests, isLoading: loadingReqs } = useListRequests(
    { eventId },
    { query: { enabled: !!eventId, queryKey: getListRequestsQueryKey({ eventId }) } }
  );

  const { data: stats } = useGetEventStats(
    eventId!,
    { query: { enabled: !!eventId, queryKey: getGetEventStatsQueryKey(eventId!) } }
  );

  const { data: users, isLoading: loadingUsers, refetch: refetchUsers } = useListUsers({
    query: {
      queryKey: getListUsersQueryKey(),
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    }
  });

  const deleteUserMutation = useDeleteUser();

  const handleDeleteUser = (userId: number, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete account for ${userName}?`)) return;
    deleteUserMutation.mutate({ id: userId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
        toast({ title: "User Deleted", description: `Account for ${userName} has been removed.` });
      }
    });
  };
  const logout = useAdminLogout();
  const updateStatus = useUpdateRequestStatus();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        setLocation("/admin");
      }
    });
  };

  const handleStatusUpdate = (id: number, status: 'approved' | 'declined' | 'waitlisted' | 'pending') => {
    // @ts-ignore - API expects specific literal union that matches our strings
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

  const filteredUsers = useMemo(() => {
    const list = Array.isArray(users)
      ? users
      : Array.isArray((users as any)?.data)
        ? (users as any).data
        : [];

    if (!userSearch.trim()) return list;
    const term = userSearch.toLowerCase();
    return list.filter((u: any) =>
      (u.name || "").toLowerCase().includes(term) ||
      (u.email || "").toLowerCase().includes(term) ||
      (u.phone || "").includes(term) ||
      (u.department || "").toLowerCase().includes(term)
    );
  }, [users, userSearch]);

  const exportToCSV = () => {
    if (!filteredRequests || filteredRequests.length === 0) {
      toast({ title: "No Data", description: "There are no registrations to export.", variant: "destructive" });
      return;
    }
    const headers = ["Name", "Department", "Email", "Phone", "Attendance Possibility", "Status", "Registered At"];
    const rows = filteredRequests.map(r => [
      `"${(r.name || "").replace(/"/g, '""')}"`,
      `"${(r.department || 'General PGIMER').replace(/"/g, '""')}"`,
      `"${(r.email || "").replace(/"/g, '""')}"`,
      `"${(r.phone || "").replace(/"/g, '""')}"`,
      `"${(r.attendancePossibility || "").replace(/"/g, '""')}"`,
      `"${(r.status || "").replace(/"/g, '""')}"`,
      `"${format(new Date(r.createdAt), "yyyy-MM-dd HH:mm:ss")}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `guest_list_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast({ title: "Export Complete", description: "Guest list has been downloaded as a CSV file." });
  };

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
            <span className="text-[11px] tracking-[0.15em] text-white/30 uppercase font-medium">Admin Control</span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/admin/events"
              className="text-[12px] tracking-[0.12em] uppercase text-white/40 hover:text-white transition-colors font-medium"
            >
              Events
            </Link>
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

      <main className="px-4 sm:px-6 md:px-10 py-8 sm:py-12 max-w-7xl mx-auto space-y-8 sm:space-y-12">
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-[10px] sm:text-[11px] tracking-[0.2em] text-amber-400 uppercase font-medium block">
                Event Control Center
              </span>
              {sortedEvents.length > 0 && (
                <Select value={eventId?.toString()} onValueChange={(val) => setSelectedEventId(Number(val))}>
                  <SelectTrigger className="w-auto h-7 bg-zinc-900 border border-white/20 rounded-full text-[11px] tracking-wide text-white/80 font-medium focus:ring-0 px-3">
                    <SelectValue placeholder="Select Event" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-white/10 text-white">
                    {sortedEvents.map(ev => (
                      <SelectItem key={ev.id} value={ev.id.toString()} className="text-[11px]">
                        Edition {ev.editionNumber} • {format(new Date(ev.date), "MMM do")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <h1 className="text-xl sm:text-3xl font-serif text-white">
                {currentEvent ? currentEvent.title : "Loading Events..."}
              </h1>
            </div>
            {currentEvent && (
              <div className="text-[12px] text-white/40 mt-2 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(currentEvent.date), "EEE. do MMMM yyyy @ h:mm a")}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-950 p-1 sm:p-1.5 rounded-full border border-white/10 w-full sm:w-auto justify-center">
            <button
              onClick={() => setActiveTab("requests")}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-[12px] tracking-wide uppercase font-medium transition-all ${
                activeTab === "requests"
                  ? "bg-white text-black font-semibold shadow-md"
                  : "text-white/50 hover:text-white"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Requests ({requests?.length ?? 0})</span>
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-[12px] tracking-wide uppercase font-medium transition-all ${
                activeTab === "analytics"
                  ? "bg-amber-400 text-black font-semibold shadow-md"
                  : "text-white/50 hover:text-white"
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("users");
                refetchUsers();
              }}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-[12px] tracking-wide uppercase font-medium transition-all ${
                activeTab === "users"
                  ? "bg-emerald-400 text-black font-semibold shadow-md"
                  : "text-white/50 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Accounts ({filteredUsers.length})</span>
            </button>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-white/[0.1] rounded-xl overflow-hidden bg-zinc-950/40">
          {[
            { label: "CAPACITY", value: stats?.capacity ?? 50, color: "text-white" },
            { label: "CONFIRMED", value: stats?.confirmed ?? 0, color: "text-emerald-400" },
            { label: "PENDING", value: stats?.pending ?? 0, color: "text-white" },
            { label: "WAITLISTED", value: stats?.waitlisted ?? 0, color: "text-amber-400" },
          ].map((item, i) => (
            <div key={item.label} className={`p-6 ${i < 3 ? "border-r border-white/[0.1]" : ""}`}>
              <p className="text-[10px] tracking-[0.2em] text-white/30 uppercase mb-2 font-medium">{item.label}</p>
              <p className={`text-3xl font-medium ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Tab 1: Demographics & Analytics View */}
        {activeTab === "analytics" && (
          <AnalyticsCharts requests={requests || []} />
        )}

        {/* Tab 2: Requests Table View */}
        {activeTab === "requests" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-white tracking-tight">
                Guest Registrations ({filteredRequests.length})
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] font-medium tracking-wider uppercase transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export to CSV
                </button>
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
            </div>

            {loadingReqs ? (
              <div className="py-24 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-white/25" />
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="border border-white/[0.08] rounded-xl py-20 text-center">
                <p className="text-[13px] text-white/25 tracking-wide font-light">No registrations found.</p>
              </div>
            ) : (
              <div className="border border-white/[0.08] rounded-xl overflow-x-auto">
                <div className="min-w-[760px]">
                  {/* Column headers */}
                  <div className="bg-white/[0.03] border-b border-white/[0.08] grid grid-cols-[2fr_2fr_2fr_2fr_1fr_auto] gap-4 py-3 px-4">
                  {["GUEST & DEPT", "CONTACT", "ATTENDANCE LIKELIHOOD", "REGISTERED AT", "STATUS", "ACTIONS"].map(h => (
                    <span key={h} className="text-[10px] tracking-[0.18em] text-white/30 uppercase font-medium">{h}</span>
                  ))}
                </div>

                {filteredRequests.map((req, i) => (
                  <div
                    key={req.id}
                    className={`border-t border-white/[0.08] first:border-t-0 grid grid-cols-[2fr_2fr_2fr_2fr_1fr_auto] gap-4 py-5 px-4 items-center group hover:bg-white/[0.02] transition-colors`}
                  >
                    {/* Guest & Dept */}
                    <div>
                      <p className="text-[14px] font-medium text-white leading-snug">{req.name}</p>
                      <span className="inline-block mt-1 text-[11px] text-amber-300/90 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded font-medium">
                        {req.department || "General PGIMER"}
                      </span>
                    </div>

                    {/* Contact */}
                    <div>
                      <p className="text-[13px] text-white/70 font-light leading-snug">{req.email}</p>
                      <p className="text-[12px] text-white/40 font-light mt-0.5">{req.phone}</p>
                    </div>

                    {/* Attendance Likelihood */}
                    <div>
                      <span className="text-[12px] text-white/80 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md font-medium">
                        {req.attendancePossibility || "Definitely (100%)"}
                      </span>
                    </div>

                    {/* Registered At */}
                    <div>
                      <p className="text-[12px] text-white/40 font-light">
                        {format(new Date(req.createdAt), "MMM d, h:mm a")}
                      </p>
                    </div>

                    {/* Status */}
                    <div>
                      <span className={`text-[11px] tracking-[0.15em] font-semibold ${statusColor(req.status)}`}>
                        {statusLabel(req.status)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {req.status === 'pending' && (
                        <>
                          <ActionBtn onClick={() => handleStatusUpdate(req.id, 'approved')} label="✓" color="text-emerald-400 hover:bg-emerald-400/10 border-emerald-400/20" title="Approve & Generate Pass" />
                          <ActionBtn onClick={() => handleStatusUpdate(req.id, 'waitlisted')} label="~" color="text-amber-400 hover:bg-amber-400/10 border-amber-400/20" title="Waitlist" />
                          <ActionBtn onClick={() => handleStatusUpdate(req.id, 'declined')} label="✕" color="text-red-400 hover:bg-red-400/10 border-red-400/20" title="Decline" />
                        </>
                      )}
                      {req.status === 'approved' && (
                        <div className="flex items-center gap-1.5">
                          {/* Send WhatsApp Pass */}
                          <a
                            href={`https://wa.me/${req.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `*SUKOON ROOFTOP MEHFIL — ENTRY PASS* 🌙\n\nDear ${req.name} (${req.department || 'PGIMER'}),\n\nYour registration for Sukoon Rooftop Session has been CONFIRMED! 🎉\n\n📅 *When:* This Saturday at 6:00 PM\n📍 *Venue:* ODH Mess Rooftop, PGIMER Chandigarh\n🎟️ *Ticket Code:* ${req.ticketCode || 'SKN-PASS'}\n\n⚠️ *Entry Rules:* Strictly PGIMER Residents & Staff only. Please present your PGIMER ID / Ticket Code at entry.\n\nSee you at the rooftop!\n- Sukoon Team`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium hover:bg-emerald-500/25 transition-colors flex items-center gap-1"
                            title="Send Pass via WhatsApp"
                          >
                            <span>WhatsApp Pass</span>
                          </a>

                          {/* Send Email Pass */}
                          <a
                            href={`mailto:${req.email}?subject=${encodeURIComponent('Sukoon Rooftop Mehfil - Entry Pass Confirmation')}&body=${encodeURIComponent(
                              `Dear ${req.name} (${req.department || 'PGIMER'}),\n\nYour registration for Sukoon Rooftop Session has been CONFIRMED!\n\nEvent Details:\n📅 Date & Time: This Saturday at 6:00 PM\n📍 Venue: ODH Mess Rooftop, PGIMER Chandigarh\n🎟️ Ticket Code: ${req.ticketCode || 'SKN-PASS'}\n\nEntry Rules: Strictly PGIMER Residents & Staff only. Please present your PGIMER ID card / Ticket Code at entry.\n\nWarm regards,\nSukoon Team`
                            )}`}
                            className="px-2.5 py-1 rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[11px] font-medium hover:bg-blue-500/25 transition-colors flex items-center gap-1"
                            title="Send Pass via Email"
                          >
                            <span>Email Pass</span>
                          </a>

                          <button
                            onClick={() => handleStatusUpdate(req.id, 'pending')}
                            className="text-[11px] uppercase text-white/30 hover:text-white transition-colors ml-1 font-medium"
                            title="Reset to Pending"
                          >
                            Reset
                          </button>
                        </div>
                      )}
                      {req.status !== 'pending' && req.status !== 'approved' && (
                        <button
                          onClick={() => handleStatusUpdate(req.id, 'pending')}
                          className="text-[11px] tracking-[0.1em] uppercase text-white/30 hover:text-white transition-colors font-medium"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

        {/* Tab 3: Registered User Accounts Management View */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-medium text-white tracking-tight">
                  Registered User Accounts ({filteredUsers.length})
                </h2>
                <p className="text-[12px] text-white/50 font-light">
                  Manage accounts created by guests via the signup portal.
                </p>
              </div>

              <input
                type="text"
                placeholder="Search user by name, email, phone, or department..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full sm:w-80 h-10 px-4 rounded-full bg-zinc-950 border border-white/20 text-white placeholder:text-white/30 text-xs focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>

            {loadingUsers ? (
              <div className="py-20 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-white/25" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-20 text-center border border-white/10 rounded-2xl bg-zinc-950/40">
                <Users className="w-10 h-10 text-white/20 mx-auto mb-2" />
                <p className="text-[13px] text-white/40 font-light">No registered user accounts found.</p>
              </div>
            ) : (
              <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-zinc-950/40">
                <div className="divide-y divide-white/[0.06]">
                  {filteredUsers.map((u: any) => (
                    <div
                      key={u.id}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-base font-medium text-white">{u.name}</h3>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300">
                            {u.department}
                          </span>
                          {u.isSignedUp ? (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                              Account User
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400">
                              Registered Guest
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-[12px] text-white/60">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-white/40" />
                            {u.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-white/40" />
                            {u.phone}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="px-3.5 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Delete User Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Account</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
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
