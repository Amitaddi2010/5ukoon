import { Link } from "wouter";
import { motion } from "framer-motion";
import { useListEvents } from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
};

export function Home() {
  const { data: events } = useListEvents();
  const nextEvent = events?.[0];

  const eventDate = nextEvent
    ? new Date(nextEvent.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "August 9, 2026";

  return (
    <div className="bg-black min-h-screen text-white overflow-x-hidden">
      <Navbar />

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative h-[100dvh] flex flex-col">
        {/* Description — lower-center */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[18%] w-full max-w-sm px-6 text-center z-10">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="text-[15px] leading-relaxed text-white/70 font-light"
          >
            We gather in intimacy, anchor in art,<br />and leave a little lighter.
          </motion.p>
        </div>

        {/* Bottom-left: service tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="absolute bottom-7 left-6 md:left-10 flex flex-col gap-[5px] z-10"
        >
          {["LIVE MUSIC", "SHAYARI", "STORYTELLING", "GUIDED CIRCLES", "CHANDIGARH, INDIA"].map((tag) => (
            <span key={tag} className="text-[11px] tracking-[0.14em] text-white/45 uppercase font-medium">
              {tag}
            </span>
          ))}
        </motion.div>

        {/* Bottom-center: scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white/40">
            <path d="M7 1v12M1 7l6 6 6-6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[11px] tracking-[0.18em] text-white/40 uppercase font-medium">Scroll to explore</span>
        </motion.div>

        {/* Bottom-right: edition label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="absolute bottom-8 right-6 md:right-10 z-10"
        >
          <span className="text-[11px] tracking-[0.18em] text-white/40 uppercase font-medium">
            FEATURED EDITION /01
          </span>
        </motion.div>
      </section>

      {/* ─── 01 THE MISSING MIDDLE ────────────────────────────── */}
      <section id="experience" className="border-t border-white/[0.08] py-28 md:py-36 px-6 md:px-10">
        <motion.div {...fadeUp} className="max-w-6xl mx-auto grid md:grid-cols-[120px_1fr] gap-12 md:gap-20">
          <div className="pt-1">
            <span className="text-[11px] tracking-[0.2em] text-white/25 uppercase font-medium">01</span>
          </div>
          <div>
            <h2 className="text-4xl md:text-6xl font-medium text-white mb-10 leading-tight tracking-tight">
              The Missing<br />Middle
            </h2>
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
      </section>

      {/* ─── 02 THE ARC ───────────────────────────────────────── */}
      <section id="arc" className="border-t border-white/[0.08] py-28 md:py-36 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="grid md:grid-cols-[120px_1fr] gap-12 md:gap-20 mb-20">
            <div className="pt-1">
              <span className="text-[11px] tracking-[0.2em] text-white/25 uppercase font-medium">02</span>
            </div>
            <div>
              <h2 className="text-4xl md:text-6xl font-medium text-white leading-tight tracking-tight">
                The Evening's<br />Arc (05)
              </h2>
              <p className="mt-6 text-[14px] text-white/45 tracking-wide font-light">
                A carefully paced journey through five movements.
              </p>
            </div>
          </motion.div>

          <div className="md:pl-[140px]">
            {[
              { num: "01", title: "AAGAZ", sub: "Arrival & Decompression", desc: "The transition from the noise of the day into the warmth of the room." },
              { num: "02", title: "SUR", sub: "Live Concert & Release", desc: "Music as the vessel to unthaw the edges of the mind." },
              { num: "03", title: "ALFAAZ", sub: "Shayari & Spoken Word", desc: "Giving vocabulary to what sits unspoken." },
              { num: "04", title: "KAHAANI", sub: "Story Circles", desc: "Guided sharing, witnessed deeply, without unsolicited advice." },
              { num: "05", title: "SUKOON", sub: "Return to Lightness", desc: "The lingering warmth before we step back into the city." },
            ].map((phase, i) => (
              <motion.div
                key={phase.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="border-t border-white/[0.08] py-7 flex items-start md:items-center gap-8 group"
              >
                <span className="text-[11px] tracking-[0.15em] text-white/20 font-medium min-w-[28px] mt-1 md:mt-0">
                  {phase.num}
                </span>
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-10 flex-1">
                  <h3 className="text-[13px] tracking-[0.18em] font-medium text-white min-w-[100px]">
                    {phase.title}
                  </h3>
                  <span className="text-[13px] text-white/40 font-light min-w-[220px]">{phase.sub}</span>
                  <p className="text-[14px] text-white/55 font-light leading-relaxed">{phase.desc}</p>
                </div>
              </motion.div>
            ))}
            <div className="border-t border-white/[0.08]" />
          </div>
        </div>
      </section>

      {/* ─── 03 WHY IT WORKS ──────────────────────────────────── */}
      <section className="border-t border-white/[0.08] py-28 md:py-36 px-6 md:px-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[120px_1fr] gap-12 md:gap-20">
          <motion.div {...fadeUp} className="pt-1">
            <span className="text-[11px] tracking-[0.2em] text-white/25 uppercase font-medium">03</span>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-16">
            <motion.div {...fadeUp}>
              <h2 className="text-3xl md:text-4xl font-medium text-white mb-10 leading-tight tracking-tight">
                Why It Works
              </h2>
              <div className="space-y-8">
                {[
                  { label: "Progressive Vulnerability", body: "We don't start with sharing. We start with art. Music softens the guard." },
                  { label: "20–30 Person Intimacy", body: "Small enough to feel seen, large enough to blend in if you choose." },
                  { label: "Cultural Fluency", body: "Shayari and Hindustani music provide an ancestral container for melancholy." },
                ].map((item) => (
                  <div key={item.label} className="border-t border-white/[0.08] pt-6">
                    <p className="text-[13px] tracking-[0.1em] uppercase text-white font-medium mb-2">{item.label}</p>
                    <p className="text-[14px] text-white/50 font-light leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <h2 className="text-3xl md:text-4xl font-medium text-white mb-10 leading-tight tracking-tight">
                Safety & Norms
              </h2>
              <div className="space-y-6 text-[14px] text-white/55 font-light leading-relaxed">
                <p>This is <span className="text-white font-medium">not therapy</span>, and it is not a replacement for professional care.</p>
                <p>When we share, we practice <span className="text-white font-medium">witnessing</span>. No advice-giving, no fixing. We simply hold space.</p>
                <p>All sharing is <span className="text-white font-medium">consent-based</span>. You are welcome to remain silent the entire evening.</p>
                <p>What is shared in the room, stays in the room.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 04 NEXT EDITION ──────────────────────────────────── */}
      <section id="edition" className="border-t border-white/[0.08] py-28 md:py-36 px-6 md:px-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[120px_1fr] gap-12 md:gap-20">
          <motion.div {...fadeUp} className="pt-1">
            <span className="text-[11px] tracking-[0.2em] text-white/25 uppercase font-medium">04</span>
          </motion.div>
          <motion.div {...fadeUp}>
            <p className="text-[11px] tracking-[0.18em] text-white/30 uppercase mb-6 font-medium">Next Edition</p>
            <h2 className="text-4xl md:text-6xl font-medium text-white mb-16 leading-tight tracking-tight">
              {nextEvent?.title ?? "Sukoon: Edition I"}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-white/[0.1] mb-14">
              {[
                { label: "DATE", value: eventDate },
                { label: "CITY", value: nextEvent?.city ?? "Chandigarh" },
                { label: "SEATS", value: "Limited to 25" },
                { label: "ENTRY", value: `₹${nextEvent?.price ?? "1,499"}` },
              ].map((item, i) => (
                <div
                  key={item.label}
                  className={`p-6 md:p-8 ${i < 3 ? "border-r border-white/[0.1]" : ""}`}
                >
                  <p className="text-[10px] tracking-[0.2em] text-white/30 uppercase mb-3 font-medium">{item.label}</p>
                  <p className="text-[15px] text-white font-medium">{item.value}</p>
                </div>
              ))}
            </div>

            <Link
              href="/request"
              className="inline-flex items-center gap-3 px-8 h-12 border border-white rounded-full text-[13px] tracking-[0.1em] uppercase font-medium text-white hover:bg-white hover:text-black transition-all duration-300"
            >
              Request an Invitation
              <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                <path d="M1 5h14M11 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <p className="mt-5 text-[12px] text-white/30 font-light tracking-wide">
              Applications reviewed on a rolling basis to curate a balanced room.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── 05 THE CURATORS ──────────────────────────────────── */}
      <section className="border-t border-white/[0.08] py-28 md:py-36 px-6 md:px-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[120px_1fr] gap-12 md:gap-20">
          <motion.div {...fadeUp} className="pt-1">
            <span className="text-[11px] tracking-[0.2em] text-white/25 uppercase font-medium">05</span>
          </motion.div>
          <motion.div {...fadeUp} className="w-full">
            <h2 className="text-4xl md:text-5xl font-medium text-white mb-16 leading-tight tracking-tight">
              The Curators (03)
            </h2>
            <div className="w-full">
              {[
                { name: "Amit Raj Saraswat", role: "Concept & Host", desc: "Holds the container. Facilitates the transitions between performance and vulnerability." },
                { name: "Chetan Thakur", role: "Performing Artist", desc: "Anchors the evening with Hindustani classical and semi-classical renditions." },
                { name: "Sanya Verma", role: "Experience Director", desc: "Architects the sensory environment — from the warmth of the lighting to the flow of the room." },
              ].map((person, i) => (
                <motion.div
                  key={person.name}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="border-t border-white/[0.08] py-7 flex flex-col md:flex-row md:items-center gap-4 md:gap-0 group"
                >
                  <h3 className="text-[18px] md:text-[20px] font-medium text-white tracking-tight flex-[2]">
                    {person.name}
                  </h3>
                  <p className="text-[12px] tracking-[0.14em] text-white/35 uppercase font-medium flex-1">
                    {person.role}
                  </p>
                  <p className="text-[14px] text-white/50 font-light leading-relaxed flex-[2]">
                    {person.desc}
                  </p>
                </motion.div>
              ))}
              <div className="border-t border-white/[0.08]" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── 06 VOICES FROM THE ROOM ──────────────────────────── */}
      <section className="border-t border-white/[0.08] py-28 md:py-36 px-6 md:px-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[120px_1fr] gap-12 md:gap-20">
          <motion.div {...fadeUp} className="pt-1">
            <span className="text-[11px] tracking-[0.2em] text-white/25 uppercase font-medium">06</span>
          </motion.div>
          <motion.div {...fadeUp} className="w-full">
            <h2 className="text-4xl md:text-5xl font-medium text-white mb-16 leading-tight tracking-tight">
              Voices from<br />the Room
            </h2>
            <div className="grid md:grid-cols-3 gap-0">
              {[
                { quote: "I didn't realize how much I was holding onto until the music started. For the first time in months, I just exhaled.", author: "A professional from Chandigarh" },
                { quote: "It's not a party, and it's not a clinic. It's just human beings being human together. Incredibly rare.", author: "Previous Attendee" },
                { quote: "The way the evening is structured makes you feel completely safe. You can share your soul or say nothing at all.", author: "A founder from Tricity" },
              ].map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`p-8 md:p-10 flex flex-col ${i < 2 ? "md:border-r border-white/[0.08]" : ""} border-t border-white/[0.08] md:border-t-0`}
                >
                  <p className="text-[15px] font-light text-white/70 leading-loose flex-1 mb-8">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <p className="text-[11px] tracking-[0.15em] text-white/30 uppercase font-medium">
                    — {t.author}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── 07 FAQ ───────────────────────────────────────────── */}
      <section className="border-t border-white/[0.08] py-28 md:py-36 px-6 md:px-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[120px_1fr] gap-12 md:gap-20">
          <motion.div {...fadeUp} className="pt-1">
            <span className="text-[11px] tracking-[0.2em] text-white/25 uppercase font-medium">07</span>
          </motion.div>
          <motion.div {...fadeUp} className="w-full">
            <h2 className="text-4xl md:text-5xl font-medium text-white mb-16 leading-tight tracking-tight">
              Common<br />Inquiries
            </h2>
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
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────── */}
      <footer id="contact" className="border-t border-white/[0.08] px-6 md:px-10 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-[13px] font-medium tracking-[0.18em] uppercase text-white">SUKOON©</span>

          <div className="flex items-center gap-8">
            <a href="#" className="text-[12px] text-white/40 hover:text-white transition-colors tracking-wide">Instagram</a>
            <a href="#" className="text-[12px] text-white/40 hover:text-white transition-colors tracking-wide">WhatsApp</a>
            <a href="mailto:hello@sukoon.com" className="text-[12px] text-white/40 hover:text-white transition-colors tracking-wide">Contact</a>
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
      >
        <span className="text-[15px] font-medium text-white leading-snug">{q}</span>
        <span className="text-white/40 text-xl leading-none mt-0.5 group-hover:text-white transition-colors shrink-0">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <div className="pb-6">
          <p className="text-[14px] text-white/50 font-light leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

// Need useState import
import { useState } from "react";
