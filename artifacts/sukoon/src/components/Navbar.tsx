import { Link } from "wouter";
import { useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#experience", label: "The Experience" },
  { href: "/#arc", label: "The Arc" },
  { href: "/#edition", label: "Edition I" },
  { href: "/#contact", label: "Contact" },
];

const socialLinks = [
  { label: "Instagram", href: "#" },
  { label: "WhatsApp", href: "#" },
  { label: "Email", href: "mailto:hello@sukoon.com" },
];

export function Navbar() {
  const [panelOpen, setPanelOpen] = useState(false);
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > 100 && latest > previous!) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <>
      <motion.nav 
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: "-150%", opacity: 0 },
        }}
        animate={hidden && !panelOpen ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-5xl flex items-center justify-between px-6 md:px-8 h-[56px] rounded-[32px] border border-white/[0.08] bg-[#0a0a0a]/40 backdrop-blur-xl shadow-2xl"
      >
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-[15px] tracking-[0.14em] uppercase text-white select-none shrink-0"
        >
          SUKOON©
        </Link>

        {/* Nav links — desktop */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="group relative font-sans text-[13px] text-white/55 hover:text-white transition-colors duration-200 tracking-wide"
            >
              {label}
              <span className="absolute -bottom-[2px] left-0 w-0 h-[1px] bg-[var(--accent-gold)] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link
            href="/request"
            className="hidden sm:inline-flex items-center px-5 h-8 text-[12px] tracking-[0.12em] uppercase border border-white/80 rounded-full text-white hover:bg-white hover:text-black transition-all duration-200 font-medium"
          >
            Let&apos;s Talk
          </Link>
          {/* Dot trigger — opens panel */}
          <button
            onClick={() => setPanelOpen((v) => !v)}
            className="w-7 h-7 rounded-full border border-white/25 flex items-center justify-center hover:border-[var(--accent-gold)] transition-colors duration-300"
            aria-label="Menu"
            data-cursor-hover
          >
            <motion.div
              animate={{
                backgroundColor: panelOpen
                  ? "var(--accent-gold)"
                  : "rgba(255,255,255,0.7)",
              }}
              transition={{ duration: 0.3 }}
              className="w-[7px] h-[7px] rounded-full"
            />
          </button>
        </div>
      </motion.nav>

      {/* ─── Slide-Out Panel ─────────────────────────────────── */}
      <AnimatePresence>
        {panelOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm"
              onClick={() => setPanelOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 300,
                mass: 0.8,
              }}
              className="fixed top-0 right-0 bottom-0 z-[60] w-full md:w-[480px] lg:w-[560px] bg-[#0a0a0a] border-l border-white/[0.08] flex flex-col"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-8 h-[52px] border-b border-white/[0.08]">
                <span className="text-[11px] tracking-[0.2em] text-white/25 uppercase font-medium">
                  Navigation
                </span>
                <button
                  onClick={() => setPanelOpen(false)}
                  className="w-7 h-7 rounded-full border border-white/25 flex items-center justify-center hover:border-[var(--accent-gold)] transition-colors duration-300"
                  aria-label="Close Menu"
                  data-cursor-hover
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    className="text-white/60"
                  >
                    <path
                      d="M1 1l8 8M9 1l-8 8"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Panel body */}
              <div className="flex-1 flex flex-col justify-between px-8 py-10 overflow-y-auto">
                {/* Nav links */}
                <div className="flex flex-col gap-2">
                  {navLinks.map(({ href, label }, i) => (
                    <motion.div
                      key={href}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.08 + i * 0.06,
                        ease: [0.25, 0.1, 0.25, 1],
                      }}
                    >
                      <a
                        href={href}
                        onClick={() => setPanelOpen(false)}
                        className="group flex items-center gap-4 py-5 border-b border-white/[0.06] text-white/70 hover:text-white transition-colors duration-200"
                        data-cursor-hover
                      >
                        <span className="w-2 h-2 rounded-full bg-transparent group-hover:bg-[var(--accent-gold)] transition-colors duration-300" />
                        <span className="font-display text-[28px] md:text-[32px] tracking-[-0.01em]">
                          {label}
                        </span>
                      </a>
                    </motion.div>
                  ))}
                </div>

                {/* Bottom section */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.45 }}
                  className="pt-10"
                >
                  {/* Social links */}
                  <p className="text-[10px] tracking-[0.2em] text-white/20 uppercase mb-4 font-medium">
                    Connect
                  </p>
                  <div className="flex flex-wrap gap-4 mb-10">
                    {socialLinks.map(({ label, href }) => (
                      <a
                        key={label}
                        href={href}
                        className="group flex items-center gap-2 text-[13px] text-white/40 hover:text-white transition-colors tracking-wide"
                        data-cursor-hover
                      >
                        <span className="w-[5px] h-[5px] rounded-full bg-[var(--accent-gold)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {label}
                      </a>
                    ))}
                  </div>

                  {/* Edition info */}
                  <div className="border-t border-white/[0.06] pt-6">
                    <p className="text-[10px] tracking-[0.2em] text-white/20 uppercase mb-2 font-medium">
                      Next Edition
                    </p>
                    <p className="text-[14px] text-white/55 font-light">
                      Sukoon: Edition I — Chandigarh
                    </p>
                  </div>

                  {/* CTA */}
                  <Link
                    href="/request"
                    onClick={() => setPanelOpen(false)}
                    className="inline-flex items-center gap-3 mt-8 px-7 h-10 border border-white rounded-full text-[12px] tracking-[0.1em] uppercase font-medium text-white hover:bg-[var(--accent-gold)] hover:border-[var(--accent-gold)] hover:text-black transition-all duration-300"
                    data-cursor-hover
                  >
                    Request an Invite
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                      <path
                        d="M1 5h12M9 1l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
