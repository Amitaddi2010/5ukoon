import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateRequest, useListEvents } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Link } from "wouter";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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

export function RequestForm() {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const createRequest = useCreateRequest();
  
  const { data: events } = useListEvents();
  const activeEvent = events?.[0];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      socialHandle: "",
      heardAbout: "",
      mutualConnection: "",
      whyAttend: "",
      eventId: activeEvent?.id || 1,
    },
  });

  // Keep eventId synced once events load
  if (activeEvent && form.getValues().eventId !== activeEvent.id) {
    form.setValue("eventId", activeEvent.id);
  }

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await form.trigger(["name", "phone"]);
    } else if (step === 2) {
      isValid = await form.trigger(["email", "socialHandle"]);
    } else if (step === 3) {
      isValid = await form.trigger(["heardAbout"]);
    } else if (step === 4) {
      isValid = await form.trigger(["mutualConnection"]);
    }

    if (isValid) {
      setStep(s => s + 1);
    }
  };

  const prevStep = () => {
    setStep(s => Math.max(1, s - 1));
  };

  const onSubmit = (data: FormValues) => {
    createRequest.mutate({ data }, {
      onSuccess: () => {
        setIsSubmitted(true);
      }
    });
  };

  if (!events) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-primary">Loading...</div>;
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md space-y-6"
        >
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-8">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-serif text-foreground">Request Received</h2>
          <p className="text-muted-foreground text-lg">
            We appreciate your interest in Sukoon. We review applications to curate a balanced room and will be in touch within 48 hours.
          </p>
          <div className="pt-8">
            <Button asChild variant="outline">
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const steps = [
    { num: 1, title: "Identity" },
    { num: 2, title: "Contact" },
    { num: 3, title: "Discovery" },
    { num: 4, title: "Connection" },
    { num: 5, title: "Intention" }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col pt-12 md:pt-0">
      <div className="w-full h-1 bg-muted fixed top-0 left-0 z-50">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-in-out" 
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 max-w-2xl mx-auto w-full">
        <div className="w-full">
          
          <div className="mb-12 flex justify-between items-center">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Cancel
            </Link>
            <div className="text-sm font-medium tracking-widest text-primary uppercase">
              Step {step} of 5
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <AnimatePresence mode="wait">
                
                {step === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="space-y-2 mb-8">
                      <h2 className="text-3xl font-serif text-foreground">Who is requesting?</h2>
                      <p className="text-muted-foreground">Basic details for the guest list.</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Aman Sharma" className="h-14 text-lg bg-card/50" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+91 98765 43210" className="h-14 text-lg bg-card/50" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="space-y-2 mb-8">
                      <h2 className="text-3xl font-serif text-foreground">Digital footprint</h2>
                      <p className="text-muted-foreground">Where we send updates and verify identities.</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="aman@example.com" className="h-14 text-lg bg-card/50" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="socialHandle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram or LinkedIn URL (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="instagram.com/aman" className="h-14 text-lg bg-card/50" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="space-y-2 mb-8">
                      <h2 className="text-3xl font-serif text-foreground">How did you find us?</h2>
                      <p className="text-muted-foreground">Sukoon grows through quiet word of mouth.</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="heardAbout"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-3"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border border-border p-4 bg-card/50 cursor-pointer hover:border-primary/50 transition-colors">
                                <FormControl>
                                  <RadioGroupItem value="Instagram" />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer flex-1 text-lg">
                                  Instagram
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border border-border p-4 bg-card/50 cursor-pointer hover:border-primary/50 transition-colors">
                                <FormControl>
                                  <RadioGroupItem value="Friend/Word of mouth" />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer flex-1 text-lg">
                                  A friend told me about it
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border border-border p-4 bg-card/50 cursor-pointer hover:border-primary/50 transition-colors">
                                <FormControl>
                                  <RadioGroupItem value="Other" />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer flex-1 text-lg">
                                  Other
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div 
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="space-y-2 mb-8">
                      <h2 className="text-3xl font-serif text-foreground">Familiar faces</h2>
                      <p className="text-muted-foreground">Do you know anyone else attending?</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="mutualConnection"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name of person (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Leave blank if coming alone" className="h-14 text-lg bg-card/50" {...field} />
                          </FormControl>
                          <FormDescription>
                            We ask this to ensure a healthy mix of strangers and acquaintances in the room.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                {step === 5 && (
                  <motion.div 
                    key="step5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="space-y-2 mb-8">
                      <h2 className="text-3xl font-serif text-foreground">Intention</h2>
                      <p className="text-muted-foreground">The most important question.</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="whyAttend"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>In one or two sentences, why do you want to attend Sukoon?</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="I've been looking for a space to..." 
                              className="min-h-[150px] text-lg bg-card/50 resize-none p-4" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

              </AnimatePresence>

              <div className="flex justify-between pt-8 border-t border-border/50">
                {step > 1 ? (
                  <Button type="button" variant="ghost" onClick={prevStep} className="text-muted-foreground">
                    Back
                  </Button>
                ) : (
                  <div></div>
                )}
                
                {step < 5 ? (
                  <Button type="button" size="lg" onClick={nextStep} className="px-8 rounded-full">
                    Next <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="px-8 rounded-full"
                    disabled={createRequest.isPending}
                  >
                    {createRequest.isPending ? "Submitting..." : "Submit Request"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
