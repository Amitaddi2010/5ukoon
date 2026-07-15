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

const queryClient = new QueryClient();

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
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
