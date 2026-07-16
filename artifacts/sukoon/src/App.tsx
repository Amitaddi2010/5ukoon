import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Home } from '@/pages/Home';
import { RequestForm } from '@/pages/Request';
import { AdminLogin } from '@/pages/admin/Login';
import { AdminRequests } from '@/pages/admin/Requests';
import { AdminCheckin } from '@/pages/admin/Checkin';
import { CustomCursor } from '@/components/CustomCursor';
import { SmoothScroll } from '@/components/SmoothScroll';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const queryClient = new QueryClient();

function Loader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[999999] bg-[#050505] flex items-center justify-center pointer-events-auto"
        >
          <motion.div
            animate={{ scale: [0.95, 1, 0.95], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="font-display text-white text-[15px] tracking-[0.2em] uppercase"
          >
            SUKOON
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/request" component={RequestForm} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/requests" component={AdminRequests} />
      <Route path="/admin/checkin" component={AdminCheckin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Loader />
        <SmoothScroll>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <CustomCursor />
            <Router />
          </WouterRouter>
        </SmoothScroll>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
