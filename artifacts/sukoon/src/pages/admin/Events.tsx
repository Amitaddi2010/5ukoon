import { useState, useEffect } from "react";
import { useListEvents, useUpdateEvent, getListEventsQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useAdminGuard } from "@/hooks/use-admin-guard";
import { useAdminLogout } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const eventSchema = z.object({
  price: z.coerce.number().min(0, "Price cannot be negative"),
  originalPrice: z.coerce.number().nullable().optional(),
  offerText: z.string().nullable().optional(),
});

export function AdminEvents() {
  const { isAuthenticated, isLoading: checkingAuth } = useAdminGuard();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: events, isLoading: loadingEvents } = useListEvents();
  const activeEvent = events?.[0];

  const updateEvent = useUpdateEvent();
  const logout = useAdminLogout();

  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: { price: 299, originalPrice: null, offerText: "" },
  });

  // Populate form when data loads
  useEffect(() => {
    if (activeEvent) {
      form.reset({
        price: activeEvent.price,
        originalPrice: activeEvent.originalPrice ?? null,
        offerText: activeEvent.offerText ?? "",
      });
    }
  }, [activeEvent, form]);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        setLocation("/admin");
      }
    });
  };

  const onSubmit = (data: z.infer<typeof eventSchema>) => {
    if (!activeEvent?.id) return;
    
    updateEvent.mutate({
      id: activeEvent.id,
      data: {
        price: data.price,
        originalPrice: data.originalPrice || undefined,
        offerText: data.offerText || undefined,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
        toast({ title: "Event updated", description: "Pricing and offers have been updated successfully." });
      },
      onError: () => {
        toast({ title: "Update failed", description: "An error occurred while updating the event.", variant: "destructive" });
      }
    });
  };

  if (checkingAuth || !isAuthenticated || loadingEvents) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/[0.08] sticky top-0 z-10 bg-black/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 md:px-10 h-[52px]">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-[13px] font-medium tracking-[0.18em] uppercase text-white">
              SUKOON©
            </Link>
            <span className="text-white/15">|</span>
            <span className="text-[11px] tracking-[0.15em] text-white/30 uppercase font-medium">Admin</span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/admin/requests"
              className="text-[12px] tracking-[0.12em] uppercase text-white/40 hover:text-white transition-colors font-medium"
            >
              Requests
            </Link>
            <Link
              href="/admin/checkin"
              className="text-[12px] tracking-[0.12em] uppercase text-white/40 hover:text-white transition-colors font-medium"
            >
              Check-in
            </Link>
            <button
              onClick={handleLogout}
              className="text-[12px] tracking-[0.12em] uppercase text-white/30 hover:text-white transition-colors font-medium"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="px-6 md:px-10 py-16 max-w-lg mx-auto space-y-12">
        <div>
          <h1 className="text-[28px] tracking-tight font-light mb-2">Manage Event Pricing</h1>
          <p className="text-white/40 text-[14px]">Update ticket price and promotional offers for the upcoming event.</p>
        </div>

        {activeEvent ? (
          <div className="p-8 border border-white/10 rounded-[20px] bg-white/[0.02]">
            <div className="mb-8">
              <h2 className="text-[16px] font-medium tracking-wide uppercase text-[var(--accent-gold)]">{activeEvent.title}</h2>
              <p className="text-white/40 text-[13px] mt-1">{activeEvent.city} • Capacity: {activeEvent.capacity}</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] tracking-[0.15em] text-white/35 uppercase font-medium">Ticket Price (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="299"
                        className="h-12 bg-transparent border-0 border-b border-white/15 rounded-none text-white text-[16px] px-0 focus-visible:ring-0 focus-visible:border-white/50 placeholder:text-white/20 font-light"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[12px] text-red-400" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="originalPrice" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] tracking-[0.15em] text-white/35 uppercase font-medium">Original Price (₹) - Slashed</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="500 (Optional)"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        className="h-12 bg-transparent border-0 border-b border-white/15 rounded-none text-white text-[16px] px-0 focus-visible:ring-0 focus-visible:border-white/50 placeholder:text-white/20 font-light"
                      />
                    </FormControl>
                    <FormMessage className="text-[12px] text-red-400" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="offerText" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] tracking-[0.15em] text-white/35 uppercase font-medium">Offer Badge Text</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Early Bird"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                        className="h-12 bg-transparent border-0 border-b border-white/15 rounded-none text-white text-[16px] px-0 focus-visible:ring-0 focus-visible:border-white/50 placeholder:text-white/20 font-light"
                      />
                    </FormControl>
                    <FormMessage className="text-[12px] text-red-400" />
                  </FormItem>
                )} />

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={updateEvent.isPending}
                    className="w-full h-11 border border-white rounded-full text-[12px] tracking-[0.12em] uppercase font-medium text-white hover:bg-white hover:text-black transition-all duration-200 disabled:opacity-40"
                  >
                    {updateEvent.isPending ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </Form>
          </div>
        ) : (
          <p className="text-white/50">No upcoming events found.</p>
        )}
      </main>
    </div>
  );
}
