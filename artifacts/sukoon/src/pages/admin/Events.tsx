import { useState } from "react";
import {
  useListEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  getListEventsQueryKey,
  type Event,
} from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  MapPin,
  Users,
  Tag,
  Clock,
  Sparkles,
  AlertTriangle,
  X,
} from "lucide-react";
import { useAdminGuard } from "@/hooks/use-admin-guard";
import { useAdminLogout } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface EventFormData {
  title: string;
  editionNumber: number;
  date: string;
  city: string;
  venue: string;
  capacity: number;
  price: number;
  originalPrice: number | "";
  offerText: string;
  status: "upcoming" | "past" | "cancelled";
  rsvpLink: string;
}

const defaultFormState: EventFormData = {
  title: "Sukoon Mehfil – Rooftop Session",
  editionNumber: 1,
  date: "2026-08-01T18:00",
  city: "Chandigarh",
  venue: "ODH Mess Rooftop, PGIMER",
  capacity: 25,
  price: 299,
  originalPrice: 499,
  offerText: "EARLY BIRD OFFER",
  status: "upcoming",
  rsvpLink: "",
};

function parseDateForInput(rawDate: string): string {
  try {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 16);
    }
  } catch {
    // fallback
  }
  return "2026-08-01T18:00";
}

function formatDateDisplay(rawDate: string): string {
  try {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      return format(d, "EEEE, MMM d, yyyy '@' h:mm a");
    }
  } catch {
    // fallback
  }
  return "Saturday, Aug 1, 2026 @ 6:00 PM";
}

export function AdminEvents() {
  const { isAuthenticated, isLoading: checkingAuth } = useAdminGuard();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: events, isLoading: loadingEvents } = useListEvents();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const logout = useAdminLogout();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<EventFormData>(defaultFormState);
  const [deletingEventId, setDeletingEventId] = useState<number | null>(null);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        setLocation("/admin");
      },
    });
  };

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setFormData(defaultFormState);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (evt: Event) => {
    setEditingEvent(evt);
    setFormData({
      title: evt.title,
      editionNumber: evt.editionNumber || 1,
      date: parseDateForInput(evt.date),
      city: evt.city || "Chandigarh",
      venue: evt.venue || "",
      capacity: evt.capacity || 25,
      price: evt.price ?? 299,
      originalPrice: evt.originalPrice ?? "",
      offerText: evt.offerText || "",
      status: (evt.status as any) || "upcoming",
      rsvpLink: evt.rsvpLink || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      editionNumber: Number(formData.editionNumber) || 1,
      date: new Date(formData.date).toISOString(),
      city: formData.city,
      venue: formData.venue || undefined,
      capacity: Number(formData.capacity) || 25,
      price: Number(formData.price) || 0,
      originalPrice: formData.originalPrice !== "" ? Number(formData.originalPrice) : undefined,
      offerText: formData.offerText || undefined,
      status: formData.status,
      rsvpLink: formData.rsvpLink || undefined,
    };

    if (editingEvent) {
      updateEvent.mutate(
        {
          id: editingEvent.id,
          data: payload,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
            toast({ title: "Event updated", description: `"${formData.title}" updated successfully.` });
            setIsModalOpen(false);
          },
          onError: () => {
            toast({ title: "Error", description: "Failed to update event.", variant: "destructive" });
          },
        }
      );
    } else {
      createEvent.mutate(
        {
          data: payload,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
            toast({ title: "Event created", description: `"${formData.title}" created successfully.` });
            setIsModalOpen(false);
          },
          onError: () => {
            toast({ title: "Error", description: "Failed to create event.", variant: "destructive" });
          },
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    deleteEvent.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
          toast({ title: "Event deleted", description: "Event and associated records removed." });
          setDeletingEventId(null);
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to delete event.", variant: "destructive" });
        },
      }
    );
  };

  if (checkingAuth || !isAuthenticated || loadingEvents) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-white/30" />
      </div>
    );
  }

  const upcomingEvents = events?.filter((e) => e.status === "upcoming") || [];
  const pastOrCancelledEvents = events?.filter((e) => e.status !== "upcoming") || [];

  return (
    <div className="min-h-screen bg-[#070709] text-white">
      {/* Top Navbar */}
      <header className="border-b border-white/[0.08] sticky top-0 z-20 bg-black/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 md:px-10 h-[56px]">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="text-[13px] font-medium tracking-[0.18em] uppercase text-white">
              SUKOON©
            </Link>
            <span className="text-white/15">|</span>
            <span className="text-[11px] tracking-[0.15em] text-white/30 uppercase font-medium">Events Portal</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/admin/requests"
              className="text-[12px] tracking-[0.12em] uppercase text-white/40 hover:text-white transition-colors font-medium"
            >
              Requests
            </Link>
            <Link
              href="/admin/checkin"
              className="text-[12px] tracking-[0.12em] uppercase text-white/40 hover:text-white transition-colors font-medium"
            >
              Check-in
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

      <main className="px-4 sm:px-6 md:px-10 py-10 max-w-6xl mx-auto space-y-10">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">Manage Events</h1>
            <p className="text-white/40 text-[13px] sm:text-[14px] mt-1">
              Create, edit, or archive Sukoon gatherings and editions.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-400 text-black text-[12px] font-bold uppercase tracking-wider hover:bg-amber-300 transition-all shadow-lg shadow-amber-400/20 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Event</span>
          </button>
        </div>

        {/* Upcoming Events Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-amber-400 text-[12px] font-semibold tracking-widest uppercase">
            <Clock className="w-4 h-4" />
            <span>Active & Upcoming Events ({upcomingEvents.length})</span>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="p-8 rounded-2xl border border-white/10 bg-white/[0.02] text-center text-white/40 text-sm">
              No active upcoming events. Click "Create New Event" to add one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/[0.05] via-white/[0.02] to-transparent relative group hover:border-amber-400/60 transition-all space-y-4 shadow-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-2">
                        Edition #{evt.editionNumber || 1} • UPCOMING
                      </span>
                      <h3 className="text-xl font-serif text-white">{evt.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(evt)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-amber-400 hover:text-black text-white/80 transition-colors"
                        title="Edit event"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingEventId(evt.id)}
                        className="p-2 rounded-lg bg-red-950/40 hover:bg-red-600 text-red-400 hover:text-white transition-colors"
                        title="Delete event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] text-white/70">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{formatDateDisplay(evt.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{evt.venue || evt.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Capacity: {evt.capacity} Seats</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        Entry: <strong className="text-white font-bold">₹{evt.price}</strong>
                        {evt.originalPrice ? (
                          <span className="line-through text-white/40 ml-1">₹{evt.originalPrice}</span>
                        ) : null}
                      </span>
                    </div>
                  </div>

                  {evt.offerText && (
                    <div className="inline-block bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                      {evt.offerText}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past / Archive Events Section */}
        {pastOrCancelledEvents.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 text-white/40 text-[12px] font-semibold tracking-widest uppercase">
              <span>Past & Cancelled Events Archive ({pastOrCancelledEvents.length})</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastOrCancelledEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-5 rounded-xl border border-white/10 bg-white/[0.02] opacity-75 hover:opacity-100 transition-opacity space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1 ${
                        evt.status === "cancelled" ? "bg-red-950 text-red-400 border border-red-500/30" : "bg-white/10 text-white/60"
                      }`}>
                        {evt.status}
                      </span>
                      <h4 className="text-base font-serif text-white/90">{evt.title}</h4>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(evt)}
                        className="p-1.5 rounded bg-white/10 hover:bg-white hover:text-black text-white/70 transition-colors"
                        title="Edit event"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingEventId(evt.id)}
                        className="p-1.5 rounded bg-red-950/40 hover:bg-red-600 text-red-400 hover:text-white transition-colors"
                        title="Delete event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-[11px] text-white/50 space-y-1">
                    <div>📅 {formatDateDisplay(evt.date)}</div>
                    <div>📍 {evt.venue || evt.city}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Create / Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e0e13] border border-white/15 rounded-2xl w-full max-w-xl p-6 space-y-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-serif text-white">
                  {editingEvent ? "Edit Gathering Event" : "Create New Gathering"}
                </h2>
                <p className="text-[12px] text-white/50">
                  {editingEvent ? "Update details for this event edition." : "Fill details to launch a new Sukoon edition."}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider text-white/50 font-medium">Event Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Sukoon Mehfil – Rooftop Session"
                  className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/15 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-white/50 font-medium">Edition #</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.editionNumber}
                    onChange={(e) => setFormData({ ...formData, editionNumber: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/15 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-white/50 font-medium">Event Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full h-10 px-3 rounded-lg bg-[#14141a] border border-white/15 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider text-white/50 font-medium">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/15 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-white/50 font-medium">City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/15 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-white/50 font-medium">Capacity (Seats)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/15 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider text-white/50 font-medium">Venue Details</label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="e.g. ODH Mess Rooftop, PGIMER Chandigarh"
                  className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/15 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-white/50 font-medium">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/15 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-white/50 font-medium">Original Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value ? Number(e.target.value) : "" })}
                    placeholder="Slashed"
                    className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/15 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-white/50 font-medium">Offer Text</label>
                  <input
                    type="text"
                    value={formData.offerText}
                    onChange={(e) => setFormData({ ...formData, offerText: e.target.value })}
                    placeholder="EARLY BIRD"
                    className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/15 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-white/20 text-white/70 hover:text-white text-xs font-medium uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createEvent.isPending || updateEvent.isPending}
                  className="px-6 py-2 rounded-lg bg-amber-400 text-black hover:bg-amber-300 text-xs font-bold uppercase tracking-wider shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {createEvent.isPending || updateEvent.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingEvent ? "Update Event" : "Create Event"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingEventId !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0e13] border border-red-500/30 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl relative">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-serif text-white">Delete Event?</h3>
              <p className="text-[13px] text-white/60 leading-relaxed font-light">
                Are you sure you want to delete this event? This action will permanently remove the event and all associated attendance requests and pass records.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingEventId(null)}
                className="px-5 py-2 rounded-lg border border-white/20 text-white/70 hover:text-white text-xs font-medium uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingEventId)}
                disabled={deleteEvent.isPending}
                className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg disabled:opacity-50 flex items-center gap-2"
              >
                {deleteEvent.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Permanently</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
