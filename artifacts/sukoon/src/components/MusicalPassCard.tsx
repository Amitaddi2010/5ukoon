import { useRef, useEffect } from "react";
import { generateQRCodeSVG } from "@/lib/qrcode";
import { Calendar, MapPin, ShieldCheck, Download, Printer, Music2, Sparkles, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";

export interface MusicalPassCardProps {
  pass: {
    id: number;
    eventId: number;
    eventTitle: string;
    eventDate: string;
    eventVenue?: string | null;
    status: string;
    ticketCode?: string | null;
    name: string;
    department?: string | null;
    attendancePossibility?: string | null;
    createdAt: string;
  };
  autoDownload?: boolean;
  onDownload?: () => void;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function MusicalPassCard({ pass, autoDownload }: MusicalPassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const hasAutoDownloaded = useRef(false);
  const isApproved = pass.status === "approved";
  const ticketCode = pass.ticketCode || `SKN-REG-${pass.id}`;
  
  // Scannable verification URL encoded in QR Code
  const qrValidationPayload = `https://sukoon.in/admin/checkin?code=${ticketCode}&event=${pass.eventId}`;
  const qrImageUrl = generateQRCodeSVG(qrValidationPayload);

  // Auto download pass print/save popup after registration if requested
  useEffect(() => {
    if (autoDownload && !hasAutoDownloaded.current) {
      hasAutoDownloaded.current = true;
      const timer = setTimeout(() => {
        handlePrintOrDownload();
      }, 1200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [autoDownload]);

  const handlePrintOrDownload = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sukoon Entry Pass - ${pass.name}</title>
          <style>
            body {
              background: #070709;
              color: white;
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            .pass-card {
              background: linear-gradient(135deg, #121217 0%, #08080a 100%);
              border: 2px solid #f59e0b;
              border-radius: 24px;
              padding: 32px;
              max-width: 500px;
              width: 100%;
              box-shadow: 0 20px 50px rgba(0,0,0,0.8);
              text-align: center;
              position: relative;
            }
            .gold-badge {
              display: inline-block;
              padding: 4px 16px;
              border-radius: 20px;
              background: rgba(245, 158, 11, 0.15);
              border: 1px solid #f59e0b;
              color: #fbbf24;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 2px;
              margin-bottom: 16px;
            }
            h1 { font-family: serif; font-size: 26px; margin: 0 0 4px 0; color: #ffffff; }
            p.sub { font-size: 13px; color: #a1a1aa; margin: 0 0 20px 0; }
            .info-box {
              background: rgba(255,255,255,0.03);
              border: 1px solid rgba(255,255,255,0.1);
              border-radius: 16px;
              padding: 16px;
              text-align: left;
              margin-bottom: 20px;
              font-size: 13px;
              line-height: 1.6;
            }
            .qr-box {
              background: white;
              padding: 16px;
              border-radius: 16px;
              display: inline-block;
              margin: 10px 0;
            }
            .qr-box img { width: 160px; height: 160px; display: block; }
            .ticket-code {
              font-family: monospace;
              font-size: 20px;
              font-weight: bold;
              color: #fbbf24;
              letter-spacing: 3px;
              margin-top: 8px;
            }
            .footer-note {
              font-size: 10px;
              color: #ef4444;
              background: rgba(127, 29, 29, 0.4);
              padding: 8px 12px;
              border-radius: 8px;
              margin-top: 16px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
          </style>
        </head>
        <body>
          <div class="pass-card">
            <div class="gold-badge">🌙 Sukoon Rooftop Mehfil • VIP Pass</div>
            <h1>${escapeHtml(pass.eventTitle)}</h1>
            <p class="sub">PGIMER Resident & Staff Evening</p>

            <div class="info-box">
              <div><strong>Guest Name:</strong> ${escapeHtml(pass.name)} (${escapeHtml(pass.department || 'PGIMER')})</div>
              <div><strong>📅 Date & Time:</strong> ${format(new Date(pass.eventDate), "EEEE, MMM d, yyyy '@' h:mm a")}</div>
              <div><strong>📍 Venue:</strong> ${escapeHtml(pass.eventVenue || 'ODH Mess Rooftop, PGIMER Chandigarh')}</div>
              <div><strong>Status:</strong> ${isApproved ? 'CONFIRMED GUEST' : 'UNDER VALIDATION'}</div>
            </div>

            ${isApproved ? `
              <div class="qr-box">
                <img src="${qrImageUrl}" alt="Pass QR Code" />
              </div>
              <div class="ticket-code">${ticketCode}</div>
            ` : '<p style="color:#fbbf24;">Validation Pending — Code generated upon approval</p>'}

            <div class="footer-note">
              🚫 OUTSIDERS STRICTLY NOT ALLOWED • PRESENT PGIMER ID & PASS AT ENTRANCE
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-4">
      {/* Musical Ticket Pass Visual Card */}
      <div
        ref={cardRef}
        className={`relative overflow-hidden rounded-3xl border transition-all ${
          isApproved
            ? "bg-gradient-to-br from-[#121218] via-[#0a0a0e] to-[#050507] border-amber-400/50 shadow-[0_0_50px_rgba(245,158,11,0.15)]"
            : "bg-[#0b0b0e] border-white/15"
        }`}
      >
        {/* Top Gold & Music Wave Accent Bar */}
        <div className="h-2 bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400" />

        <div className="p-5 sm:p-7 space-y-5">
          {/* Header & Waveform */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 pt-1">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-[10px] font-bold tracking-widest uppercase">
                <Music2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>OFFICIAL MUSICAL MEHFIL PASS</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif text-white tracking-tight leading-snug">{pass.eventTitle}</h3>
            </div>

            {/* Music Frequency Bars Visual */}
            <div className="flex items-end gap-1 h-8 opacity-80">
              {[40, 70, 100, 60, 90, 50, 80, 100, 60, 30].map((h, i) => (
                <span
                  key={i}
                  className="w-1 bg-amber-400 rounded-full animate-pulse"
                  style={{ height: `${h}%`, animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>

          {/* Body Info Grid */}
          <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
            {/* Left Meta */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {isApproved ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 text-[11px] font-bold tracking-wider uppercase">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>CONFIRMED GUEST</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[11px] font-medium tracking-wider uppercase">
                    <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "6s" }} />
                    <span>VALIDATION IN PROGRESS</span>
                  </span>
                )}
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 text-[12px] sm:text-[13px]">
                <div className="flex items-center gap-2.5 text-white/90">
                  <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-medium">Sat. 1st August 2026 @ 6:00 PM</span>
                </div>
                <div className="flex items-center gap-2.5 text-white/90">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-white/80">{pass.eventVenue || "ODH Mess Rooftop, PGIMER Chandigarh"}</span>
                </div>
              </div>

              {/* Guest badge */}
              <div className="p-3.5 rounded-xl bg-amber-400/[0.05] border border-amber-400/20 flex flex-wrap items-center justify-between gap-2 text-[13px]">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-amber-300/60 block font-medium">Guest Name</span>
                  <span className="font-semibold text-white">{pass.name} ({pass.department || 'PGIMER'})</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-widest text-amber-300/60 block font-medium">Attendance</span>
                  <span className="text-amber-300 font-medium">{pass.attendancePossibility || '100%'}</span>
                </div>
              </div>
            </div>

            {/* Right QR Code Display */}
            <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-black/80 border border-white/15 text-center min-w-[210px]">
              {isApproved ? (
                <div className="space-y-2.5">
                  <div className="w-28 h-28 mx-auto rounded-xl bg-white p-2 flex items-center justify-center shadow-lg">
                    <img src={qrImageUrl} alt="Entry Pass QR Code" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-white/40 block">Ticket Code</span>
                    <span className="font-mono font-bold text-base text-amber-300 tracking-widest">
                      {ticketCode}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-6 px-4 space-y-2 text-center">
                  <Sparkles className="w-7 h-7 text-amber-400 mx-auto animate-pulse" />
                  <span className="text-[11px] text-white/60 block">QR Code activates upon admin approval</span>
                  <span className="text-[10px] text-amber-400/80 uppercase tracking-widest font-mono">CODE PENDING</span>
                </div>
              )}
            </div>
          </div>

          {/* Security Banner */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-[11px] text-red-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-red-400 shrink-0" />
            <span>OUTSIDERS STRICTLY NOT ALLOWED — PGIMER Resident ID & Pass Required at Entrance</span>
          </div>
        </div>
      </div>

      {/* Pass Download & Print Action Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
        <button
          onClick={handlePrintOrDownload}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-black font-bold uppercase tracking-wider text-[12px] hover:brightness-110 transition-all shadow-lg shadow-amber-400/20 flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4 text-black" />
          <span>Download / Print Official Pass</span>
        </button>
      </div>
    </div>
  );
}
