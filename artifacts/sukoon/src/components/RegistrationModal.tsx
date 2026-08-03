import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCreateRequest, useListEvents, useGetUserMe } from "@workspace/api-client-react";
import { Loader2, Calendar, MapPin, ShieldAlert, CheckCircle2, Sparkles, ChevronDown, Ticket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { MusicalPassCard } from "@/components/MusicalPassCard";
import { format } from "date-fns";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
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

const POSSIBILITIES = [
  "Definitely (100%)",
  "Likely (75%)",
  "50-50 / Unsure",
  "Unlikely",
];

export function RegistrationModal({ isOpen, onClose }: RegistrationModalProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { data: events } = useListEvents();
  const { data: user } = useGetUserMe({ query: { queryKey: ["userMe"], retry: false } });
  const currentEvent = events?.[0];
  const createRequest = useCreateRequest();

  const [formData, setFormData] = useState({
    name: "",
    department: "Anaesthesia",
    phone: "",
    email: "",
    attendancePossibility: "Definitely (100%)",
  });

  const [createdPass, setCreatedPass] = useState<any>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        department: user.department || prev.department,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required contact details.",
        variant: "destructive",
      });
      return;
    }

    const eventId = currentEvent?.id ?? 1;

    createRequest.mutate(
      {
        data: {
          eventId,
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          department: formData.department,
          attendancePossibility: formData.attendancePossibility,
          whyAttend: `PGIMER Registration (${formData.department})`,
        },
      },
      {
        onSuccess: (res: any) => {
          const reqData = res?.data ?? res;
          const isDup = reqData?.isDuplicate || res?.isDuplicate;
          setCreatedPass({
            id: reqData?.id ?? Date.now(),
            eventId: eventId,
            eventTitle: currentEvent?.title || "Sukoon Rooftop Mehfil",
            eventDate: currentEvent?.date ? new Date(currentEvent.date).toISOString() : new Date("2026-08-01T18:00:00.000Z").toISOString(),
            eventVenue: currentEvent?.venue || "ODH Mess Rooftop, PGIMER Chandigarh",
            status: reqData?.status || "pending",
            ticketCode: reqData?.ticketCode || null,
            name: formData.name.trim(),
            department: formData.department,
            attendancePossibility: formData.attendancePossibility,
            createdAt: new Date().toISOString(),
          });
          setIsSubmitted(true);
          if (isDup) {
            toast({
              title: "Existing Pass Retrieved!",
              description: "You were already registered for this event. Your pass details have been loaded.",
            });
          } else {
            toast({
              title: "Pass Generated & Registration Submitted!",
              description: "Your official pass preview is now ready below.",
            });
          }
        },
        onError: (err: any) => {
          toast({
            title: "Submission Error",
            description: err?.response?.data?.error || "Failed to submit registration. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setFormData({
      name: "",
      department: "Anaesthesia",
      phone: "",
      email: "",
      attendancePossibility: "Definitely (100%)",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleResetAndClose()}>
      <DialogContent className={`w-[95vw] ${isSubmitted ? 'sm:max-w-2xl' : 'sm:max-w-xl'} bg-[#0b0b0e] border border-white/15 text-white p-0 shadow-[0_0_60px_rgba(0,0,0,0.9)] rounded-2xl sm:rounded-3xl max-h-[92vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`}>
        <div className="relative p-4 sm:p-6 space-y-4">
          {/* Top ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-24 bg-gradient-to-b from-amber-500/15 via-amber-400/5 to-transparent blur-2xl pointer-events-none" />

          {!isSubmitted ? (
            <div className="space-y-5 relative z-10">
              {/* Header Section */}
              <DialogHeader className="space-y-2 text-left pr-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-[10px] sm:text-[11px] font-medium tracking-widest uppercase">
                  <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{currentEvent?.date ? format(new Date(currentEvent.date), "E. do MMMM yyyy '@' h:mm a") : "Coming Soon"}</span>
                </div>

                <DialogTitle className="text-xl sm:text-2xl font-serif tracking-tight text-white leading-snug">
                  Sukoon Rooftop Mehfil Registration
                </DialogTitle>

                <DialogDescription className="text-white/60 text-[12px] sm:text-[13px] leading-relaxed font-light">
                  Join us for an exclusive evening of live music, shayari, and guided storytelling.
                </DialogDescription>
              </DialogHeader>

              {/* Event Location & Security Warning Card */}
              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500/[0.08] via-white/[0.02] to-transparent border border-amber-500/20 space-y-2.5">
                <div className="flex items-center gap-2 text-[12px] sm:text-[13px] text-white/90 font-medium">
                  <div className="w-6 h-6 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span className="truncate">ODH Mess Rooftop, PGIMER Chandigarh</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-red-300 bg-red-950/60 border border-red-500/30 px-3 py-1.5 rounded-lg font-medium tracking-wide leading-snug">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                  <span>OUTSIDERS NOT ALLOWED (PGIMER Staff, PhD Scholars and Residents Only)</span>
                </div>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* 1. Full Name */}
                <div className="space-y-1">
                  <label className="block text-[10px] sm:text-[11px] uppercase tracking-widest text-white/50 font-medium">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. / Resident / Staff Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-11 sm:h-12 px-3.5 rounded-xl bg-white/[0.04] border border-white/15 text-white placeholder:text-white/20 text-[16px] sm:text-[13px] focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/30 transition-all font-sans"
                  />
                </div>

                {/* 2. Department Selection */}
                <div className="space-y-1">
                  <label className="block text-[10px] sm:text-[11px] uppercase tracking-widest text-white/50 font-medium">
                    Department (PGIMER) *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full h-11 sm:h-12 px-3.5 pr-10 rounded-xl bg-[#121217] border border-white/15 text-white text-[16px] sm:text-[13px] focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/30 transition-all appearance-none cursor-pointer"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept} className="bg-[#121217] text-white">
                          {dept}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-white/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 3. Contact Info (2-column on sm) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] sm:text-[11px] uppercase tracking-widest text-white/50 font-medium">
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full h-11 sm:h-12 px-3.5 rounded-xl bg-white/[0.04] border border-white/15 text-white placeholder:text-white/20 text-[16px] sm:text-[13px] focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/30 transition-all font-sans"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] sm:text-[11px] uppercase tracking-widest text-white/50 font-medium">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@pgimer.edu.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-11 sm:h-12 px-3.5 rounded-xl bg-white/[0.04] border border-white/15 text-white placeholder:text-white/20 text-[16px] sm:text-[13px] focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/30 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* 4. Attendance Possibility */}
                <div className="space-y-1">
                  <label className="block text-[10px] sm:text-[11px] uppercase tracking-widest text-white/50 font-medium">
                    Possibility of Attending Event *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.attendancePossibility}
                      onChange={(e) => setFormData({ ...formData, attendancePossibility: e.target.value })}
                      className="w-full h-11 sm:h-12 px-3.5 pr-10 rounded-xl bg-[#121217] border border-white/15 text-white text-[16px] sm:text-[13px] focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/30 transition-all appearance-none cursor-pointer"
                    >
                      {POSSIBILITIES.map((pos) => (
                        <option key={pos} value={pos} className="bg-[#121217] text-white">
                          {pos}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-white/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={createRequest.isPending}
                    className="w-full h-12 sm:h-13 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 text-black font-bold uppercase tracking-[0.14em] text-[12px] sm:text-[13px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
                  >
                    {createRequest.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-black" />
                        <span>Register Now</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Success confirmation screen */
            <div className="py-4 text-center space-y-5 relative z-10">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif text-white">Registration Submitted!</h3>
              <p className="text-[13px] text-white/70 max-w-md mx-auto leading-relaxed font-light">
                Thank you, <span className="text-white font-medium">{formData.name}</span> ({formData.department}).
                We have registered your interest for <span className="text-amber-300 font-medium">Sat. 1st August 2026 at 6:00 PM (ODH Mess Rooftop)</span>.
              </p>

              {createdPass && (
                <div className="text-left pt-2">
                  <MusicalPassCard pass={createdPass} autoDownload={true} />
                </div>
              )}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    handleResetAndClose();
                    setLocation('/my-passes');
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-amber-400 text-black text-[12px] font-bold tracking-wider uppercase hover:bg-amber-300 transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <Ticket className="w-4 h-4" />
                  <span>View My Digital Ticket Pass</span>
                </button>
                <button
                  onClick={handleResetAndClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-[12px] font-medium tracking-wide uppercase transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
