import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, X, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

interface QRCameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedCode: string) => void;
}

export function QRCameraScannerModal({ isOpen, onClose, onScanSuccess }: QRCameraScannerModalProps) {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    setCameraError(null);
    setLastScanned(null);
    let mounted = true;

    const startCamera = async () => {
      try {
        // Ensure element exists
        const element = document.getElementById("qr-reader-container");
        if (!element) return;

        const scanner = new Html5Qrcode("qr-reader-container");
        html5QrCodeRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (!mounted) return;
            // Extract code if text is a URL
            let codeToUse = decodedText.trim();
            try {
              if (codeToUse.includes("code=")) {
                const url = new URL(codeToUse);
                const codeParam = url.searchParams.get("code");
                if (codeParam) codeToUse = codeParam;
              } else {
                const match = codeToUse.match(/SKN-[A-Z0-9-]+/i);
                if (match) codeToUse = match[0];
              }
            } catch {
              // ignore parse errors, use literal string
            }

            setLastScanned(codeToUse);
            onScanSuccess(codeToUse);
            stopCamera();
            onClose();
          },
          () => {
            // Ignore frame decode errors
          }
        );

        if (mounted) setIsScanning(true);
      } catch (err: any) {
        if (!mounted) return;
        console.error("Camera scan error:", err);
        setCameraError(
          err?.message || "Could not access camera. Please allow camera permissions in browser."
        );
        setIsScanning(false);
      }
    };

    // Small delay to ensure modal DOM is mounted
    const timeout = setTimeout(startCamera, 300);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      stopCamera();
    };
  }, [isOpen]);

  const stopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn("Failed to stop scanner cleanly:", err);
      }
    }
    html5QrCodeRef.current = null;
    setIsScanning(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0c0c10] border border-white/15 rounded-3xl p-6 text-white shadow-2xl space-y-5 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-amber-500/10 blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Camera className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-white">Live Camera QR Scanner</h3>
              <p className="text-[11px] text-white/50">Align guest QR code within the frame</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Viewport Container */}
        <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 min-h-[280px] flex items-center justify-center">
          <div id="qr-reader-container" className="w-full h-full min-h-[280px]" />

          {/* Scanner Overlay Box Guidelines */}
          {isScanning && !cameraError && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-56 h-56 border-2 border-amber-400 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] relative">
                {/* Corner Accents */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-amber-300 rounded-tl" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-amber-300 rounded-tr" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-amber-300 rounded-bl" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-amber-300 rounded-br" />
                {/* Animated Scanning Laser Line */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-bounce" />
              </div>
            </div>
          )}

          {/* Camera Error View */}
          {cameraError && (
            <div className="p-6 text-center space-y-3 max-w-xs">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
              <p className="text-[13px] text-red-200 leading-relaxed">{cameraError}</p>
              <button
                onClick={() => {
                  setCameraError(null);
                  setIsScanning(false);
                }}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
            </div>
          )}
        </div>

        {/* Scan Status Footer */}
        <div className="text-center text-xs text-white/50 space-y-1">
          {lastScanned ? (
            <div className="inline-flex items-center gap-1.5 text-emerald-400 font-mono font-bold bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
              <span>Scanned: {lastScanned}</span>
            </div>
          ) : (
            <p className="text-[11px] font-light text-amber-200/70">
              Point phone or desktop webcam directly at guest pass QR code.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
