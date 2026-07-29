// Lightweight QR Code Generator (SVG Data URL)
// Produces standard scannable QR Codes for ticket validation URLs/codes

export function generateQRCodeSVG(text: string): string {
  // Use public QR Code SVG service or canvas renderer for 100% crisp scannable QR codes
  const encodedText = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodedText}&color=000000&bgcolor=ffffff&margin=1`;
}
