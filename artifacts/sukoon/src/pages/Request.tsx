import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateRequest, useListEvents } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Navbar } from "@/components/Navbar";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  email: z.string().email("Valid email required"),
  socialHandle: z.string().optional(),
  heardAbout: z.string().optional(),
  mutualConnection: z.string().optional(),
  whyAttend: z.string().min(10, "Please share a bit more about your intention").max(300),
  eventId: z.number()
});

type FormValues = z.infer<typeof formSchema>;

const stepVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export function RequestForm() {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const createRequest = useCreateRequest();

  const { data: events } = useListEvents();
  const activeEvent = events?.[0];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "", phone: "", email: "", socialHandle: "",
      heardAbout: "", mutualConnection: "", whyAttend: "",
      eventId: activeEvent?.id || 1,
    },
  });

  if (activeEvent && form.getValues().eventId !== activeEvent.id) {
    form.setValue("eventId", activeEvent.id);
  }

  const nextStep = async () => {
    const fieldMap: Record<number, (keyof FormValues)[]> = {
      1: ["name", "phone"],
      2: ["email", "socialHandle"],
      3: ["heardAbout"],
      4: ["mutualConnection"],
    };
    const valid = await form.trigger(fieldMap[step] ?? []);
    if (valid) setStep(s => s + 1);
  };

  const onSubmit = (data: FormValues) => {
    createRequest.mutate({ data }, { onSuccess: () => setIsSubmitted(true) });
  };

  if (!events) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <span className="text-[11px] tracking-[0.2em] text-white/30 uppercase">Loading...</span>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md"
        >
          <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mx-auto mb-10">
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <path d="M1 6l5 5L15 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-3xl font-medium text-white mb-5 tracking-tight">Request Received</h2>
          <p className="text-[14px] text-white/50 font-light leading-relaxed mb-10">
            We appreciate your interest in Sukoon. We review applications to curate a balanced room and will be in touch within 48 hours.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[12px] tracking-[0.12em] uppercase text-white/40 hover:text-white transition-colors font-medium"
          >
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
              <path d="M13 5H1M5 1L1 5l4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />

      {/* Progress bar */}
      <div className="fixed top-[52px] left-0 right-0 z-40 h-[1px] bg-white/[0.06]">
        <div
          className="h-full bg-white/60 transition-all duration-500 ease-in-out"
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 pt-[100px]">
        <div className="w-full max-w-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-16">
            <Link href="/" className="flex items-center gap-2 text-[12px] tracking-[0.12em] text-white/30 uppercase hover:text-white transition-colors font-medium">
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                <path d="M13 5H1M5 1L1 5l4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Cancel
            </Link>
            <span className="text-[11px] tracking-[0.2em] text-white/25 uppercase font-medium">
              Step {step} / 05
            </span>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">

                {step === 1 && (
                  <motion.div key="s1" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }} className="space-y-10">
                    <div>
                      <p className="text-[11px] tracking-[0.2em] text-white/25 uppercase mb-4 font-medium">Identity</p>
                      <h2 className="text-3xl md:text-4xl font-medium text-white tracking-tight">Who is requesting?</h2>
                    </div>
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] tracking-[0.15em] text-white/35 uppercase font-medium">Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Aman Sharma" className="h-12 bg-transparent border-0 border-b border-white/15 rounded-none text-white text-[16px] px-0 focus-visible:ring-0 focus-visible:border-white/50 placeholder:text-white/20 font-light" {...field} />
                        </FormControl>
                        <FormMessage className="text-[12px] text-red-400" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] tracking-[0.15em] text-white/35 uppercase font-medium">WhatsApp Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 98765 43210" className="h-12 bg-transparent border-0 border-b border-white/15 rounded-none text-white text-[16px] px-0 focus-visible:ring-0 focus-visible:border-white/50 placeholder:text-white/20 font-light" {...field} />
                        </FormControl>
                        <FormMessage className="text-[12px] text-red-400" />
                      </FormItem>
                    )} />
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="s2" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }} className="space-y-10">
                    <div>
                      <p className="text-[11px] tracking-[0.2em] text-white/25 uppercase mb-4 font-medium">Contact</p>
                      <h2 className="text-3xl md:text-4xl font-medium text-white tracking-tight">Digital footprint</h2>
                    </div>
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] tracking-[0.15em] text-white/35 uppercase font-medium">Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="aman@example.com" className="h-12 bg-transparent border-0 border-b border-white/15 rounded-none text-white text-[16px] px-0 focus-visible:ring-0 focus-visible:border-white/50 placeholder:text-white/20 font-light" {...field} />
                        </FormControl>
                        <FormMessage className="text-[12px] text-red-400" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="socialHandle" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] tracking-[0.15em] text-white/35 uppercase font-medium">Instagram or LinkedIn (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="instagram.com/aman" className="h-12 bg-transparent border-0 border-b border-white/15 rounded-none text-white text-[16px] px-0 focus-visible:ring-0 focus-visible:border-white/50 placeholder:text-white/20 font-light" {...field} />
                        </FormControl>
                        <FormMessage className="text-[12px] text-red-400" />
                      </FormItem>
                    )} />
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="s3" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }} className="space-y-10">
                    <div>
                      <p className="text-[11px] tracking-[0.2em] text-white/25 uppercase mb-4 font-medium">Discovery</p>
                      <h2 className="text-3xl md:text-4xl font-medium text-white tracking-tight">How did you find us?</h2>
                    </div>
                    <FormField control={form.control} name="heardAbout" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                            {["Instagram", "Friend/Word of mouth", "Other"].map(v => (
                              <FormItem key={v} className="flex items-center gap-4 border-b border-white/[0.08] py-4 cursor-pointer">
                                <FormControl>
                                  <RadioGroupItem value={v} className="border-white/30 text-white" />
                                </FormControl>
                                <FormLabel className="font-light text-[15px] text-white/70 cursor-pointer">
                                  {v === "Friend/Word of mouth" ? "A friend told me" : v}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage className="text-[12px] text-red-400" />
                      </FormItem>
                    )} />
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div key="s4" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }} className="space-y-10">
                    <div>
                      <p className="text-[11px] tracking-[0.2em] text-white/25 uppercase mb-4 font-medium">Connection</p>
                      <h2 className="text-3xl md:text-4xl font-medium text-white tracking-tight">Familiar faces</h2>
                    </div>
                    <FormField control={form.control} name="mutualConnection" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] tracking-[0.15em] text-white/35 uppercase font-medium">Someone you know (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Leave blank if coming alone" className="h-12 bg-transparent border-0 border-b border-white/15 rounded-none text-white text-[16px] px-0 focus-visible:ring-0 focus-visible:border-white/50 placeholder:text-white/20 font-light" {...field} />
                        </FormControl>
                        <FormDescription className="text-[12px] text-white/25 font-light mt-3">
                          We ask this to ensure a healthy mix of strangers and acquaintances.
                        </FormDescription>
                        <FormMessage className="text-[12px] text-red-400" />
                      </FormItem>
                    )} />
                  </motion.div>
                )}

                {step === 5 && (
                  <motion.div key="s5" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }} className="space-y-10">
                    <div>
                      <p className="text-[11px] tracking-[0.2em] text-white/25 uppercase mb-4 font-medium">Intention</p>
                      <h2 className="text-3xl md:text-4xl font-medium text-white tracking-tight">The most important question</h2>
                    </div>
                    <FormField control={form.control} name="whyAttend" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] tracking-[0.15em] text-white/35 uppercase font-medium">Why do you want to attend Sukoon?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="I've been looking for a space to..."
                            className="bg-transparent border-0 border-b border-white/15 rounded-none text-white text-[16px] px-0 min-h-[120px] focus-visible:ring-0 focus-visible:border-white/50 placeholder:text-white/20 font-light resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-[12px] text-red-400" />
                      </FormItem>
                    )} />
                  </motion.div>
                )}

              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-16 pt-8 border-t border-white/[0.08]">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(s => Math.max(1, s - 1))}
                    className="flex items-center gap-2 text-[12px] tracking-[0.12em] uppercase text-white/30 hover:text-white transition-colors font-medium"
                  >
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                      <path d="M13 5H1M5 1L1 5l4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Back
                  </button>
                ) : <div />}

                {step < 5 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-3 px-7 h-10 border border-white rounded-full text-[12px] tracking-[0.1em] uppercase font-medium text-white hover:bg-white hover:text-black transition-all duration-200"
                  >
                    Next
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                      <path d="M1 5h12M9 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={createRequest.isPending}
                    className="flex items-center gap-3 px-7 h-10 bg-white text-black rounded-full text-[12px] tracking-[0.1em] uppercase font-medium hover:bg-white/90 transition-all duration-200 disabled:opacity-40"
                  >
                    {createRequest.isPending ? "Submitting..." : "Submit Request"}
                  </button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
