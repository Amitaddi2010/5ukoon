import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAdminLogin } from "@workspace/api-client-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useAdminLogin();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate({ data }, {
      onSuccess: () => setLocation("/admin/requests"),
      onError: () => toast({ title: "Authentication failed", description: "Invalid credentials.", variant: "destructive" }),
    });
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      {/* Wordmark */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-20"
      >
        <span className="text-[13px] font-medium tracking-[0.2em] uppercase text-white">SUKOON©</span>
        <p className="text-[11px] tracking-[0.15em] text-white/25 uppercase mt-1 text-center font-medium">Admin</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="w-full max-w-sm"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField control={form.control} name="username" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] tracking-[0.15em] text-white/35 uppercase font-medium">Username</FormLabel>
                <FormControl>
                  <Input
                    placeholder="admin"
                    className="h-12 bg-transparent border-0 border-b border-white/15 rounded-none text-white text-[16px] px-0 focus-visible:ring-0 focus-visible:border-white/50 placeholder:text-white/20 font-light"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-[12px] text-red-400" />
              </FormItem>
            )} />

            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] tracking-[0.15em] text-white/35 uppercase font-medium">Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-12 bg-transparent border-0 border-b border-white/15 rounded-none text-white text-[16px] px-0 focus-visible:ring-0 focus-visible:border-white/50 placeholder:text-white/20 font-light"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-[12px] text-red-400" />
              </FormItem>
            )} />

            <div className="pt-4">
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full h-11 border border-white rounded-full text-[12px] tracking-[0.12em] uppercase font-medium text-white hover:bg-white hover:text-black transition-all duration-200 disabled:opacity-40"
              >
                {loginMutation.isPending ? "Authenticating..." : "Enter Darbar"}
              </button>
            </div>
          </form>
        </Form>
      </motion.div>
    </div>
  );
}
