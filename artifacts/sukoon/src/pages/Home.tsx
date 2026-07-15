import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useListEvents } from "@workspace/api-client-react";
import { Calendar, MapPin, Users, Ticket, ArrowRight, UserCheck, Flame, Mic2, Coffee, Moon } from "lucide-react";

export function Home() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const { data: events } = useListEvents();
  const nextEvent = events?.[0];

  return (
    <div className="bg-background min-h-screen text-foreground selection:bg-primary selection:text-primary-foreground overflow-hidden">
      
      {/* 1. Hero Section */}
      <section className="relative h-[100dvh] flex items-center justify-center pt-20 px-6 sm:px-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-background/80 z-10" />
          <img src="/hero-bg.jpg" alt="Ambient warmth" className="w-full h-full object-cover object-center opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/40 to-background z-20" />
        </div>
        
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative z-30 text-center max-w-4xl mx-auto flex flex-col items-center"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-serif text-primary mb-4"
          >
            Sukoon
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-2xl md:text-3xl font-serif text-foreground/80 mb-8 italic"
          >
            "जहाँ महसूस करना मना नहीं"
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl font-light"
          >
            A curated mehfil-style evening experience blending live music, shayari, and guided storytelling.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <Button asChild size="lg" className="text-lg px-8 h-14 rounded-full">
              <Link href="/request">Request an Invitation</Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-30 opacity-50"
        >
          <span className="text-sm tracking-widest uppercase">DISCOVER</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-primary to-transparent" />
        </motion.div>
      </section>

      {/* 2. Why Sukoon */}
      <section className="py-32 px-6 sm:px-12 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-serif mb-12 text-primary">The Missing Middle</h2>
            <div className="grid md:grid-cols-2 gap-12 text-lg md:text-xl leading-relaxed text-muted-foreground">
              <p>
                Urban life is loud, but it leaves us emotionally constipated. When you need to process, where do you go? 
                Therapy can feel clinical, carrying stigma or high costs. Partying is inherently avoidant, drowning out the feeling rather than sitting with it.
              </p>
              <p>
                Sukoon is the space between. A darbar of vulnerability. For professionals who need to feel deeply without needing to explain themselves. 
                We gather in intimacy, anchor in art, and leave a little lighter.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. The Arc (How It Works) */}
      <section className="py-32 px-6 sm:px-12 bg-secondary/10 relative border-y border-secondary/20">
        <div className="absolute inset-0 z-0 opacity-20 bg-[url('/texture-bg.jpg')] bg-cover mix-blend-overlay"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-serif text-primary mb-6">The Evening's Arc</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">A carefully paced journey through five movements.</p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute left-[50%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-primary/0 via-primary/50 to-primary/0" />
            
            <div className="space-y-16">
              {[
                { title: "Aagaz", desc: "Arrival & decompression. The transition from the noise of the day into the warmth of the room.", icon: UserCheck },
                { title: "Sur", desc: "Live concert & release. Music as the vessel to unthaw the edges of the mind.", icon: Flame },
                { title: "Alfaaz", desc: "Shayari & spoken word. Giving vocabulary to what sits unspoken.", icon: Mic2 },
                { title: "Kahaani", desc: "Story circles. Guided sharing, witnessed deeply, without unsolicited advice.", icon: Coffee },
                { title: "Sukoon", desc: "Return to lightness. The lingering warmth before we step back into the city.", icon: Moon },
              ].map((phase, i) => (
                <motion.div 
                  key={phase.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className={`flex flex-col md:flex-row items-center gap-8 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className={`flex-1 text-center ${i % 2 !== 0 ? 'md:text-left' : 'md:text-right'}`}>
                    <h3 className="text-3xl font-serif text-foreground mb-3">{phase.title}</h3>
                    <p className="text-muted-foreground text-lg">{phase.desc}</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-card border-2 border-primary/30 flex items-center justify-center z-10 shrink-0 shadow-[0_0_15px_rgba(200,150,50,0.2)]">
                    <phase.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Why It Works & Safety */}
      <section className="py-32 px-6 sm:px-12 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-serif text-primary mb-8">Why It Works</h2>
            <ul className="space-y-6 text-lg text-muted-foreground">
              <li className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                <p><strong className="text-foreground font-medium">Progressive Vulnerability:</strong> We don't start with sharing. We start with art. Music softens the guard.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                <p><strong className="text-foreground font-medium">20-30 Person Intimacy:</strong> Small enough to feel seen, large enough to blend in if you choose.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                <p><strong className="text-foreground font-medium">Cultural Fluency:</strong> Shayari and Hindustani music provide an ancestral container for melancholy.</p>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-card p-10 rounded-2xl border border-border"
          >
            <h2 className="text-3xl md:text-4xl font-serif text-secondary mb-8">Safety & Norms</h2>
            <div className="space-y-6 text-lg text-muted-foreground">
              <p>This is <strong className="text-foreground">not therapy</strong>, and it is not a replacement for professional care.</p>
              <p>When we share, we practice <strong className="text-foreground">witnessing</strong>. No advice-giving, no fixing. We simply hold space.</p>
              <p>All sharing is <strong className="text-foreground">consent-based</strong>. You are welcome to remain silent the entire evening.</p>
              <p>What is shared in the room, stays in the room.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. Upcoming Event */}
      <section className="py-24 px-6 sm:px-12 bg-primary/5 border-y border-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-sm font-medium tracking-widest text-primary uppercase mb-6">Next Edition</h2>
          <div className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-3xl p-8 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
            
            <h3 className="text-4xl md:text-5xl font-serif text-foreground mb-8">
              {nextEvent ? nextEvent.title : "Sukoon: Edition I"}
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <div className="flex flex-col items-center">
                <Calendar className="w-6 h-6 text-primary mb-3" />
                <span className="text-lg">{nextEvent ? new Date(nextEvent.date).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }) : "August 9, 2026"}</span>
              </div>
              <div className="flex flex-col items-center">
                <MapPin className="w-6 h-6 text-primary mb-3" />
                <span className="text-lg">{nextEvent ? nextEvent.city : "Chandigarh"}</span>
              </div>
              <div className="flex flex-col items-center">
                <Users className="w-6 h-6 text-primary mb-3" />
                <span className="text-lg">Limited to 25 seats</span>
              </div>
              <div className="flex flex-col items-center">
                <Ticket className="w-6 h-6 text-primary mb-3" />
                <span className="text-lg">₹{nextEvent ? nextEvent.price : "1,499"}</span>
              </div>
            </div>

            <Button asChild size="lg" className="text-lg px-10 h-14 rounded-full">
              <Link href="/request">Request an Invitation <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
            <p className="mt-6 text-sm text-muted-foreground">Applications reviewed on a rolling basis to curate a balanced room.</p>
          </div>
        </div>
      </section>

      {/* 6. Curators & Artists */}
      <section className="py-32 px-6 sm:px-12 max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-serif text-primary text-center mb-16">The Curators</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: "Amit Raj Saraswat", role: "Concept & Host", desc: "Holds the container. Facilitates the transitions between performance and vulnerability." },
            { name: "Chetan Thakur", role: "Performing Artist", desc: "Anchors the evening with Hindustani classical and semi-classical renditions." },
            { name: "Sanya Verma", role: "Experience Director", desc: "Architects the sensory environment—from the warmth of the lighting to the flow of the room." }
          ].map((person) => (
            <div key={person.name} className="group relative bg-card rounded-xl p-8 border border-border overflow-hidden hover:border-primary/50 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-2xl font-serif text-foreground mb-2 relative z-10">{person.name}</h3>
              <p className="text-primary font-medium mb-6 relative z-10">{person.role}</p>
              <p className="text-muted-foreground relative z-10">{person.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Testimonials */}
      <section className="py-32 px-6 sm:px-12 bg-secondary/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-16 text-primary">Voices from the Room</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { quote: "I didn't realize how much I was holding onto until the music started. For the first time in months, I just exhaled.", author: "A professional from Chandigarh" },
              { quote: "It’s not a party, and it’s not a clinic. It’s just human beings being human together. Incredibly rare.", author: "Previous Attendee" },
              { quote: "The way the evening is structured makes you feel completely safe. You can share your soul or say nothing at all.", author: "A founder from Tricity" }
            ].map((t, i) => (
              <div key={i} className="flex flex-col">
                <p className="text-xl font-serif text-foreground/90 italic mb-6 leading-relaxed">"{t.quote}"</p>
                <p className="text-sm tracking-wider text-muted-foreground uppercase mt-auto">— {t.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section className="py-32 px-6 sm:px-12 max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-serif text-center mb-16 text-primary">Common Inquiries</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-lg font-serif">Is this therapy?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base">
              No. Sukoon is a cultural and emotional gathering, not a clinical one. While it can be deeply therapeutic, it is not a replacement for professional mental health support.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-lg font-serif">Do I have to share anything personal?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base">
              Absolutely not. You are welcome to simply listen, absorb the art, and witness others. Silence is a fully respected form of participation here.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-lg font-serif">Can I bring a friend?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base">
              Yes, but we ask that both of you apply separately so we understand why each person wants to attend. Intimacy works best when everyone has individual intent.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger className="text-lg font-serif">Is this a religious event?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base">
              No. We use cultural tools—like shayari and semi-classical music—but the space is strictly secular and welcoming to people of all backgrounds and beliefs.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger className="text-lg font-serif">What happens after I request an invite?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base">
              We review requests to ensure the room has a balanced mix of individuals who understand the intention of the space. We will email you within 48 hours to confirm your seat, after which you can complete the payment.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-background text-center px-6">
        <div className="flex flex-col items-center justify-center space-y-6">
          <h2 className="text-3xl font-serif text-primary">Sukoon</h2>
          <div className="flex space-x-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Instagram</a>
            <a href="#" className="hover:text-primary transition-colors">WhatsApp Community</a>
            <a href="mailto:hello@sukoon.com" className="hover:text-primary transition-colors">Contact</a>
          </div>
          <p className="text-sm text-muted-foreground/50">
            © {new Date().getFullYear()} Sukoon, Chandigarh. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
