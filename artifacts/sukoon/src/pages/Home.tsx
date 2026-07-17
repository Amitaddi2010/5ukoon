import { Link } from "wouter";
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from "framer-motion";
import { useListEvents } from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { useState, useEffect, useRef } from "react";
import $ from "jquery";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
} as any;

const splitTextVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 * i, ease: [0.25, 0.1, 0.25, 1], duration: 0.8 },
  }),
} as any;

const wordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }
  },
} as any;

export function AnimatedText({ text, className, delay = 0 }: { text: string, className?: string, delay?: number }) {
  const lines = text.split("\n");
  return (
    <motion.div
      variants={splitTextVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      custom={delay}
      className={className}
    >
      {lines.map((line, lineIndex) => (
        <span key={lineIndex} className="block">
          {line.split(" ").map((word, wordIndex) => (
            <motion.span key={`${lineIndex}-${wordIndex}`} variants={wordVariants} className="inline-block mr-[0.25em]">
              {word}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.div>
  );
}

export function AudioPreviewCard() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <BentoCard className="md:col-span-2 p-8 md:p-10 flex flex-col justify-between">
      <div className="absolute inset-0 backdrop-blur-3xl" />
      <div className="absolute inset-0 bg-gradient-to-tr from-[#44cd2b]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <div className="relative z-10 w-full flex justify-between items-start">
        <span className="text-[11px] tracking-[0.2em] text-[var(--accent-gold)] uppercase font-medium">The Vibe</span>
        <button 
          onClick={togglePlay}
          className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300"
          data-cursor-hover
        >
          {isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>
      </div>

      <div className="relative z-10 mt-6 flex items-end justify-between gap-1 h-12 md:px-4">
        {[...Array(24)].map((_, i) => (
          <motion.div 
            key={i}
            animate={{ height: isPlaying ? [`${20 + Math.random() * 20}%`, `${60 + Math.random() * 40}%`, `${20 + Math.random() * 20}%`] : "15%" }}
            transition={{ duration: 0.8 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 md:w-2 bg-white/20 group-hover:bg-white/40 rounded-t-sm transition-colors"
          />
        ))}
      </div>

      <div className="relative z-10 mt-8">
        <h3 className="text-2xl md:text-3xl font-display text-white mb-2">Immersive Audio</h3>
        <p className="text-white/40 text-[13px]">A taste of the soundscapes awaiting you.</p>
      </div>
      
      <audio ref={audioRef} src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" loop />
    </BentoCard>
  );
}

export function BentoCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      whileHover={{ scale: 0.98 }}
      onMouseMove={handleMouseMove}
      className={`group relative rounded-[32px] bg-white/[0.02] border border-white/[0.05] overflow-hidden ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[31px] opacity-0 transition duration-300 group-hover:opacity-100 z-0"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              rgba(255,255,255,0.06),
              transparent 80%
            )
          `,
        }}
      />
      {children}
    </motion.div>
  );
}

export function SectionPanel({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`group relative rounded-[40px] bg-white/[0.02] border border-white/[0.05] overflow-hidden ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[39px] opacity-0 transition duration-500 group-hover:opacity-100 z-0"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              rgba(255,255,255,0.04),
              transparent 80%
            )
          `,
        }}
      />
      <div className="absolute inset-0 backdrop-blur-3xl z-[-1]" />
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}

export function ImmersiveWaterBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    const initRipples = async () => {
      // @ts-ignore - expose jQuery globally for the ripples plugin
      window.jQuery = $;
      // @ts-ignore
      window.$ = $;
      // @ts-ignore
      await import("jquery.ripples");

      if (!mounted || !containerRef.current) return;

      try {
        // @ts-ignore
        $(containerRef.current).ripples({
          resolution: 512,
          dropRadius: 25,
          perturbance: 0.04,
        });
      } catch (e) {
        console.error("Error initializing ripples:", e);
      }
    };

    initRipples();

    // Trigger random ripples on scroll to make it immersive
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!containerRef.current) return;
          const currentScrollY = window.scrollY;
          const diff = Math.abs(currentScrollY - lastScrollY);
          
          if (diff > 50) {
            lastScrollY = currentScrollY;
            const x = window.innerWidth / 2 + (Math.random() - 0.5) * window.innerWidth * 0.8;
            const y = window.innerHeight / 2 + (Math.random() - 0.5) * window.innerHeight * 0.8;
            try {
              // @ts-ignore
              $(containerRef.current).ripples('drop', x, y, 30 + Math.random() * 30, 0.03 + Math.random() * 0.04);
            } catch (e) {}
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      mounted = false;
      window.removeEventListener('scroll', handleScroll);
      try {
        if (containerRef.current) {
          // @ts-ignore
          $(containerRef.current).ripples('destroy');
        }
      } catch (e) {}
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full z-[-1]"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=3000&auto=format&fit=crop')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  );
}

export function Home() {
  const { data: events } = useListEvents();
  const nextEvent = events?.[0];

  const eventDate = nextEvent
    ? new Date(nextEvent.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "August 9, 2026";

  return (
    <div className="min-h-screen text-white overflow-x-hidden relative">
      <ImmersiveWaterBackground />
      <Navbar />

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative h-[100dvh] flex flex-col items-center justify-center overflow-hidden">
        {/* Dark overlay to make text pop */}
        <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none" />

        {/* Oversized display heading */}
        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h1
              className="text-[18vw] md:text-[14vw] lg:text-[12vw] leading-[0.85] tracking-[-0.03em] text-white select-none pointer-events-none drop-shadow-2xl"
              style={{ fontFamily: "var(--app-font-display-heavy)" }}
            >
              <motion.span
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-block"
              >
                SUK
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.35 }}
                className="inline-block relative"
              >
                OON
                {/* Green accent dot */}
                <span className="absolute -top-[1vw] -right-[3vw]">
                  <span className="accent-dot-pulse" />
                </span>
              </motion.span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.7 }}
            className="mt-6 text-[15px] md:text-[16px] leading-relaxed text-white/70 font-light max-w-sm mx-auto pointer-events-none"
          >
            We gather in intimacy, anchor in art,<br />and leave a little lighter.
          </motion.p>
        </div>

        {/* Bottom-left: service tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="absolute bottom-7 left-6 md:left-10 flex flex-col gap-[5px] z-10 pointer-events-none"
        >
          {["LIVE MUSIC", "SHAYARI", "STORYTELLING", "GUIDED CIRCLES", "CHANDIGARH, INDIA"].map((tag) => (
            <span key={tag} className="text-[11px] tracking-[0.14em] text-white/40 uppercase font-medium">
              {tag}
            </span>
          ))}
        </motion.div>

        {/* Bottom-center: scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 pointer-events-none"
        >
          <motion.svg
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white/40"
          >
            <path d="M7 1v12M1 7l6 6 6-6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          </motion.svg>
          <span className="text-[11px] tracking-[0.18em] text-white/40 uppercase font-medium">Scroll to explore</span>
        </motion.div>

        {/* Bottom-right: edition label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 right-6 md:right-10 z-10 pointer-events-none"
        >
          <span className="text-[11px] tracking-[0.18em] text-white/50 uppercase font-medium flex items-center gap-2">
            <span className="accent-dot" />
            FEATURED EDITION /01
          </span>
        </motion.div>
      </section>

      {/* ─── 01 THE MISSING MIDDLE ────────────────────────────── */}
      <section id="experience" className="py-20 md:py-32 px-4 md:px-8 max-w-7xl mx-auto">
        <SectionPanel className="p-10 md:p-20">
          <motion.div {...fadeUp} className="grid md:grid-cols-[120px_1fr] gap-12 md:gap-20">
            <div className="pt-1">
              <span className="text-[11px] tracking-[0.2em] text-white/25 uppercase font-medium flex items-center gap-2">
                <span className="accent-dot" />
                01
              </span>
            </div>
            <div>
              <AnimatedText 
                text={"The Missing\nMiddle"} 
                className="font-display font-normal text-4xl md:text-6xl text-white mb-10 leading-[1.05] tracking-[-0.02em]" 
              />
              <div className="grid md:grid-cols-2 gap-10 text-[15px] leading-loose text-white/55 font-light max-w-4xl">
                <p>
                  Urban life is loud, but it leaves us emotionally constipated. When you need to process, where do you go?
                  Therapy can feel clinical, carrying stigma or high costs. Partying is inherently avoidant, drowning out the feeling rather than sitting with it.
                </p>
                <p>
                  Sukoon is the space between. A darbar of vulnerability. For professionals who need to feel deeply without needing to explain themselves.
                  We gather in intimacy, anchor in art, and leave a little lighter.
                </p>
              </div>
            </div>
          </motion.div>
        </SectionPanel>
      </section>

      {/* ─── 02 THE BENTO EXPERIENCE ────────────────────────────── */}
      <section id="experience-grid" className="py-20 md:py-32 px-4 md:px-8 max-w-[1400px] mx-auto">
        <div className="relative z-10">
          <motion.div {...fadeUp} className="mb-16 md:mb-24 flex flex-col items-center text-center">
             <span className="text-[11px] tracking-[0.2em] text-[var(--accent-gold)] uppercase font-medium flex items-center gap-2 mb-6">
               <span className="accent-dot" />
               02
             </span>
             <AnimatedText 
               text="The Sukoon Experience" 
               className="font-display font-normal text-4xl md:text-6xl text-white tracking-[-0.02em] leading-tight" 
             />
             <p className="mt-6 text-white/50 text-[15px] font-light max-w-lg mx-auto">
               An evening carefully curated to anchor you in art, transitioning from the noise of the day into the warmth of a shared room.
             </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[300px] md:auto-rows-[400px]">
          
          {/* Card 1: Artist Lineup (Span 2 cols) */}
          <BentoCard className="md:col-span-2">
             {/* Background glow on hover */}
             <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-gold)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
             <div className="absolute inset-0 backdrop-blur-3xl" />
             
             <div className="p-10 md:p-12 h-full flex flex-col justify-end relative z-10 pointer-events-none">
               <h3 className="text-3xl md:text-5xl font-display text-white mb-3">The Artists</h3>
               <p className="text-white/50 text-[14px] max-w-md">
                 Hindustani classical renditions by Chetan Thakur & spoken word poetry that gives vocabulary to what sits unspoken.
               </p>
             </div>
             {/* Inner image zooming on hover */}
             <div className="absolute top-0 right-0 w-full md:w-2/3 h-full pointer-events-none">
               <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/50 to-transparent z-10 hidden md:block" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent z-10 md:hidden" />
               <img 
                 src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2000&auto=format&fit=crop" 
                 className="w-full h-full object-cover opacity-20 group-hover:opacity-40 group-hover:scale-105 transition-all duration-[1.5s] ease-out" 
                 alt="Artists" 
               />
             </div>
          </BentoCard>

          {/* Card 2: Venue & Location */}
          <BentoCard className="p-8 md:p-10">
            <div className="absolute inset-0 backdrop-blur-3xl bg-white/[0.01]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 h-full flex flex-col justify-between pointer-events-none">
              <div className="w-14 h-14 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-[var(--accent-gold)]/30 group-hover:text-[var(--accent-gold)] transition-all duration-500">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/70 group-hover:text-[var(--accent-gold)] transition-colors">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-display text-white mb-2">{nextEvent?.city ?? "Chandigarh, IN"}</h3>
                <p className="text-white/40 text-[13px] leading-relaxed">
                  An intimate, secret venue.<br />Exact location revealed upon RSVP.
                </p>
              </div>
            </div>
          </BentoCard>

          {/* Card 3: The Arc */}
          <BentoCard className="p-8 md:p-10">
            <div className="absolute inset-0 backdrop-blur-3xl" />
            <div className="relative z-10 h-full flex flex-col justify-between pointer-events-none">
              <div className="flex flex-col gap-3">
                {[
                  { n: "01", t: "AAGAZ" }, 
                  { n: "02", t: "SUR" }, 
                  { n: "03", t: "ALFAAZ" }, 
                  { n: "04", t: "KAHAANI" }, 
                  { n: "05", t: "SUKOON" }
                ].map((phase, i) => (
                  <div key={phase.n} className="flex items-center gap-4 opacity-40 group-hover:opacity-100 transition-opacity duration-500" style={{ transitionDelay: `${i * 70}ms` }}>
                    <span className="text-[10px] tracking-[0.2em] font-medium text-[var(--accent-gold)]">{phase.n}</span>
                    <span className="text-[11px] tracking-[0.1em] text-white">{phase.t}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <h3 className="text-2xl font-display text-white mb-2">The Arc</h3>
                <p className="text-white/40 text-[13px]">Five movements of vulnerability.</p>
              </div>
            </div>
          </BentoCard>

          {/* Card 4: Audio Preview (Span 2 cols) */}
          <AudioPreviewCard />

          {/* Card 5: Tickets & Call to Action (Span 2 cols) */}
          <BentoCard className="md:col-span-2 p-8 sm:p-10 md:p-12 flex flex-col justify-between items-start">
             <div className="absolute inset-0 bg-gradient-to-t from-[var(--accent-gold)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
             <div className="absolute inset-0 backdrop-blur-3xl" />
             
             <div className="relative z-10 w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
               <span className="text-[10px] sm:text-[11px] tracking-[0.2em] text-[var(--accent-gold)] uppercase font-medium">Next Edition</span>
               <span className="text-[10px] sm:text-[11px] tracking-[0.2em] text-white/50 uppercase font-medium border border-white/10 px-3 py-1 rounded-full">25 Seats Only</span>
             </div>
             
             <div className="relative z-10 mt-12 sm:mt-auto w-full flex flex-col lg:flex-row lg:items-end justify-between gap-8">
               <div className="max-w-xl">
                 <AnimatedText text="Reserve your spot at Sukoon" className="text-3xl sm:text-4xl md:text-5xl font-display text-white mb-4 tracking-[-0.02em] leading-tight" delay={1} />
                 <p className="text-white/50 text-[13px] sm:text-[14px] leading-relaxed flex items-center gap-2 flex-wrap">
                   <span>Applications reviewed on a rolling basis.</span>
                   <span className="flex items-center gap-2">
                     <span className="text-white/90 font-medium">Entry: ₹{nextEvent?.price ?? "299"}</span>
                     {(nextEvent as any)?.originalPrice && (
                       <span className="text-white/40 line-through text-[12px]">₹{(nextEvent as any).originalPrice}</span>
                     )}
                   </span>
                   {(nextEvent as any)?.offerText && (
                     <span className="bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold ml-1">
                       {(nextEvent as any).offerText}
                     </span>
                   )}
                 </p>
               </div>
               
               <Link 
                 href="/request" 
                 className="inline-flex items-center justify-center w-full lg:w-auto gap-3 px-8 h-12 sm:h-14 bg-white text-black rounded-full text-[11px] sm:text-[12px] tracking-[0.15em] uppercase font-semibold hover:bg-[var(--accent-gold)] hover:scale-[1.02] transition-all duration-300 shrink-0"
                 data-cursor-hover
               >
                 Request Invitation
                 <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                   <path d="M1 5h14M11 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                 </svg>
               </Link>
             </div>
          </BentoCard>

        </div>
        </div>
      </section>

      {/* ─── 06 VOICES FROM THE ROOM ──────────────────────────── */}
      <section className="py-20 md:py-32 px-4 md:px-8 max-w-7xl mx-auto">
        <SectionPanel className="p-10 md:p-20">
          <div className="grid md:grid-cols-[120px_1fr] gap-12 md:gap-20">
            <motion.div {...fadeUp} className="pt-1">
              <span className="text-[11px] tracking-[0.2em] text-white/25 uppercase font-medium flex items-center gap-2">
                <span className="accent-dot" />
                06
              </span>
            </motion.div>
            <motion.div {...fadeUp} className="w-full">
              <AnimatedText 
                text={"Voices from\nthe Room"} 
                className="font-display font-normal text-4xl md:text-6xl text-white mb-16 leading-[1.05] tracking-[-0.02em]" 
              />
              <div className="grid md:grid-cols-3 gap-0">
                {[
                  { q: "I haven't felt this seen in a room full of strangers in years.", a: "Founder, 32" },
                  { q: "It's like therapy, but set to a soundtrack that understands you.", a: "Creative Director, 28" },
                  { q: "A rare pocket of genuine intimacy in an otherwise noisy city.", a: "Architect, 35" }
                ].map((item, i) => (
                  <div key={i} className={`p-8 md:p-10 border border-white/[0.05] ${i !== 0 ? 'border-t-0 md:border-t md:border-l-0' : ''}`}>
                    <p className="font-serif text-xl italic text-white/80 leading-relaxed mb-6">"{item.q}"</p>
                    <p className="text-[12px] uppercase tracking-widest text-[var(--accent-gold)]">{item.a}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </SectionPanel>
      </section>

      {/* ─── 07 FAQ ───────────────────────────────────────────── */}
      <section className="py-20 md:py-32 px-4 md:px-8 max-w-7xl mx-auto mb-20">
        <SectionPanel className="p-10 md:p-20">
          <div className="grid md:grid-cols-[120px_1fr] gap-12 md:gap-20">
            <motion.div {...fadeUp} className="pt-1">
              <span className="text-[11px] tracking-[0.2em] text-white/25 uppercase font-medium flex items-center gap-2">
                <span className="accent-dot" />
                07
              </span>
            </motion.div>
            <motion.div {...fadeUp} className="w-full">
              <AnimatedText 
                text={"Common\nInquiries"} 
                className="font-display font-normal text-4xl md:text-6xl text-white mb-16 leading-[1.05] tracking-[-0.02em]" 
              />
              <div className="w-full max-w-3xl">
                {[
                  { q: "Is this therapy?", a: "No. Sukoon is a cultural and emotional gathering, not a clinical one. While it can be deeply therapeutic, it is not a replacement for professional mental health support." },
                  { q: "Do I have to share anything personal?", a: "Absolutely not. You are welcome to simply listen, absorb the art, and witness others. Silence is a fully respected form of participation here." },
                  { q: "Can I bring a friend?", a: "Yes, but we ask that both of you apply separately so we understand why each person wants to attend. Intimacy works best when everyone has individual intent." },
                  { q: "Is this a religious event?", a: "No. We use cultural tools — like shayari and semi-classical music — but the space is strictly secular and welcoming to people of all backgrounds and beliefs." },
                  { q: "What happens after I request an invite?", a: "We review requests to ensure the room has a balanced mix. We will reach out within 48 hours to confirm your seat, after which you can complete the payment." },
                ].map((item, i) => (
                  <FAQItem key={i} q={item.q} a={item.a} />
                ))}
              </div>
            </motion.div>
          </div>
        </SectionPanel>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────── */}
      <footer id="contact" className="border-t border-white/[0.08] px-6 md:px-10 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="font-display text-[15px] tracking-[0.14em] uppercase text-white flex items-center gap-2">
            <span className="accent-dot" />
            SUKOON©
          </span>

          <div className="flex items-center gap-8">
            <a href="#" className="text-[12px] text-white/40 hover:text-[var(--accent-gold)] transition-colors tracking-wide" data-cursor-hover>Instagram</a>
            <a href="#" className="text-[12px] text-white/40 hover:text-[var(--accent-gold)] transition-colors tracking-wide" data-cursor-hover>WhatsApp</a>
            <a href="mailto:hello@sukoon.com" className="text-[12px] text-white/40 hover:text-[var(--accent-gold)] transition-colors tracking-wide" data-cursor-hover>Contact</a>
          </div>

          <p className="text-[11px] text-white/20 tracking-wide font-light">
            © {new Date().getFullYear()} Sukoon, Chandigarh
          </p>
        </div>
      </footer>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-white/[0.08]">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-start justify-between gap-6 py-6 text-left group"
        data-cursor-hover
      >
        <span className="text-[15px] font-medium text-white leading-snug">{q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-white/40 text-xl leading-none mt-0.5 group-hover:text-[var(--accent-gold)] transition-colors shrink-0"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="faq-content"
          >
            <div className="pb-6">
              <p className="text-[14px] text-white/50 font-light leading-relaxed">{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
