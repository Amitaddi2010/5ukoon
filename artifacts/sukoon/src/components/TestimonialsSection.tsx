import React, { useState } from 'react';
import { useListFeedbacks, type Feedback } from '@workspace/api-client-react';
import { Star, MessageSquarePlus } from 'lucide-react';
import { FeedbackModal } from './FeedbackModal';

export function TestimonialsSection({ eventId }: { eventId?: number }) {
  const { data: feedbacks, isLoading } = useListFeedbacks({ eventId });
  const [showAll, setShowAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-24">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10" />
          <div className="text-[10px] text-white/30 uppercase tracking-widest">Loading testimonials</div>
        </div>
      </div>
    );
  }

  const displayedFeedbacks = (feedbacks || []).filter((fb: Feedback) => fb.rating >= 4);
  const initialDisplayCount = 8;
  const visibleFeedbacks = showAll ? displayedFeedbacks : displayedFeedbacks.slice(0, initialDisplayCount);

  return (
    <section id="testimonials" className="w-full py-24 sm:py-32 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-400/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-5xl font-display text-white mb-4">Words of <span className="text-amber-400">Sukoon</span></h2>
            <p className="text-white/40 text-[13px] sm:text-[15px] leading-relaxed max-w-lg">
              Experiences shared by our community of doctors, scholars, and staff.
            </p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="group flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/50 text-white px-5 py-3 rounded-full transition-all duration-300 w-fit shrink-0"
          >
            <MessageSquarePlus className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] tracking-[0.15em] uppercase font-medium">Leave Feedback</span>
          </button>
        </div>

        {displayedFeedbacks.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
            <p className="text-white/30 text-[13px]">No testimonials yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {visibleFeedbacks.map((fb: Feedback) => (
              <div 
                key={fb.id} 
                className="break-inside-avoid bg-[#111111] border border-white/10 p-6 rounded-3xl hover:border-white/20 transition-colors group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: fb.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                  {Array.from({ length: 5 - fb.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-white/20" />
                  ))}
                </div>
                
                <p className="text-white/80 text-[14px] leading-relaxed mb-6 font-serif italic">
                  "{fb.message}"
                </p>
                
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div>
                    <h4 className="text-white text-[12px] font-medium">{fb.name}</h4>
                    <span className="text-white/40 text-[10px] uppercase tracking-wider">{fb.department}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {displayedFeedbacks.length > initialDisplayCount && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-[11px] uppercase tracking-[0.15em] text-white/50 hover:text-amber-400 transition-colors border border-white/10 hover:border-amber-400/30 px-6 py-2.5 rounded-full bg-white/5"
            >
              {showAll ? 'Show Less' : `Show ${displayedFeedbacks.length - initialDisplayCount} More`}
            </button>
          </div>
        )}
      </div>

      <FeedbackModal 
        isOpen={isModalOpen} 
        setIsOpen={setIsModalOpen}
        eventId={eventId}
      />
    </section>
  );
}
