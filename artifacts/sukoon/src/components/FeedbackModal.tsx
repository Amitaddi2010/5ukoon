import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Star, Loader2 } from 'lucide-react';
import { useCreateFeedback } from '@workspace/api-client-react';

interface FeedbackModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  eventId?: number;
}

export function FeedbackModal({ isOpen, setIsOpen, eventId }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [message, setMessage] = useState('');
  
  const { mutate: submitFeedback, isPending, isSuccess } = useCreateFeedback({
    mutation: {
      onSuccess: () => {
        setTimeout(() => {
          setIsOpen(false);
          // Reset form after closing
          setTimeout(() => {
            setRating(0);
            setName('');
            setDepartment('');
            setMessage('');
          }, 300);
        }, 2000);
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !eventId) return;
    
    submitFeedback({
      data: {
        eventId,
        name,
        department,
        rating,
        message
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] bg-[#0c0c0c] border-white/10 text-white overflow-hidden p-0 rounded-3xl">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[150px] bg-amber-400/20 blur-[100px] pointer-events-none rounded-full" />
        
        <div className="relative z-10 p-6 sm:p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-serif text-center font-normal tracking-wide">
              {isSuccess ? "Thank You!" : "Your Experience"}
            </DialogTitle>
            <DialogDescription className="text-center text-white/50 text-[13px]">
              {isSuccess 
                ? "Your feedback means the world to us."
                : "Help us make the next edition even better."}
            </DialogDescription>
          </DialogHeader>

          {isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 rounded-full bg-amber-400/10 flex items-center justify-center mb-4">
                <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
              </div>
              <p className="text-white/60 text-sm">Feedback submitted successfully</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col items-center gap-2 mb-8">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star 
                        className={`w-8 h-8 transition-colors duration-200 ${
                          (hoverRating || rating) >= star 
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' 
                            : 'text-white/20'
                        }`} 
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-[11px] uppercase tracking-[0.2em] text-white/30 mt-2">
                  {rating === 0 ? "Rate your experience" : 
                   rating === 5 ? "Exceptional" : 
                   rating === 4 ? "Great" : 
                   rating === 3 ? "Good" : 
                   rating === 2 ? "Fair" : "Poor"}
                </span>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-[0.15em] text-white/40 ml-1">Name</label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400/50 focus:bg-white/10 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-[0.15em] text-white/40 ml-1">Department</label>
                    <input 
                      type="text" 
                      required
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      placeholder="e.g. Anaesthesia"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400/50 focus:bg-white/10 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.15em] text-white/40 ml-1">Your Message</label>
                  <textarea 
                    required
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Tell us what you loved or what we can improve..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400/50 focus:bg-white/10 transition-colors resize-none"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isPending || rating === 0}
                className="w-full h-12 mt-4 bg-amber-400 text-black rounded-full text-[12px] uppercase tracking-[0.15em] font-bold hover:bg-amber-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(251,191,36,0.15)] hover:shadow-[0_0_25px_rgba(251,191,36,0.25)]"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Submit Feedback"
                )}
              </button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
