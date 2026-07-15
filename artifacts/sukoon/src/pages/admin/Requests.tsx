import { useState, useMemo } from "react";
import { useListRequests, useUpdateRequestStatus, useGetEventStats, useListEvents, useAdminLogout, getListRequestsQueryKey, getGetEventStatsQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Check, X, Clock, ExternalLink, Loader2, LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useAdminGuard } from "@/hooks/use-admin-guard";

export function AdminRequests() {
  const { isAuthenticated, isLoading: checkingAuth } = useAdminGuard();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("all");
  
  // Hardcoded to first event for now as per simple req
  const { data: events } = useListEvents();
  const eventId = events?.[0]?.id;

  const { data: requests, isLoading: loadingReqs } = useListRequests(
    { eventId }, 
    { query: { enabled: !!eventId } }
  );
  
  const { data: stats } = useGetEventStats(
    eventId!, 
    { query: { enabled: !!eventId } }
  );
  
  const updateStatus = useUpdateRequestStatus();
  const logout = useAdminLogout();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        setLocation("/admin");
      }
    });
  };

  const handleStatusUpdate = (id: number, status: 'approved' | 'declined' | 'waitlisted') => {
    updateStatus.mutate({ id, data: { status } }, {
      onSuccess: () => {
        // Optimistic UI updates could go here, but invalidating is safer
        queryClient.invalidateQueries({ queryKey: getListRequestsQueryKey({ eventId }) });
        if (eventId) {
          queryClient.invalidateQueries({ queryKey: getGetEventStatsQueryKey(eventId) });
        }
      }
    });
  };

  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    if (filter === "all") return requests;
    return requests.filter(r => r.status === filter);
  }, [requests, filter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-emerald-900/40 text-emerald-400 border-emerald-900">Approved</Badge>;
      case 'declined': return <Badge className="bg-destructive/20 text-destructive border-destructive/50">Declined</Badge>;
      case 'waitlisted': return <Badge className="bg-amber-900/40 text-amber-400 border-amber-900">Waitlisted</Badge>;
      default: return <Badge variant="outline" className="text-muted-foreground">Pending</Badge>;
    }
  };

  if (checkingAuth || !isAuthenticated) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-serif text-xl text-primary">Sukoon Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/admin/checkin">Check-in Mode</Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-8">
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-normal text-muted-foreground uppercase tracking-wider">Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif text-foreground">{stats?.capacity || 25}</div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-normal text-primary uppercase tracking-wider">Confirmed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif text-primary">{stats?.confirmed || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-normal text-muted-foreground uppercase tracking-wider">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif">{stats?.pending || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-normal text-muted-foreground uppercase tracking-wider">Waitlisted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif text-amber-500">{stats?.waitlisted || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-serif text-foreground">Requests</h2>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="waitlisted">Waitlisted</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Table */}
        <Card className="border-border">
          {loadingReqs ? (
            <div className="py-20 flex justify-center text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              No requests found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Guest</TableHead>
                  <TableHead className="w-[150px]">Contact</TableHead>
                  <TableHead>Intention</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="text-right w-[180px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map(req => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">{req.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        {req.socialHandle && (
                          <a href={req.socialHandle.includes('http') ? req.socialHandle : `https://${req.socialHandle}`} target="_blank" rel="noreferrer" className="hover:text-primary flex items-center gap-1">
                            Social <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      {req.mutualConnection && (
                        <div className="text-xs text-primary/80 mt-1">
                          Knows: {req.mutualConnection}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{req.email}</div>
                      <div className="text-xs text-muted-foreground mt-1">{req.phone}</div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground line-clamp-2 italic" title={req.whyAttend || ''}>
                        "{req.whyAttend}"
                      </p>
                      <div className="text-xs text-muted-foreground/50 mt-1">
                        Via: {req.heardAbout || 'Unknown'} • {format(new Date(req.createdAt), "MMM d")}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(req.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      {req.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-900/20" onClick={() => handleStatusUpdate(req.id, 'approved')}>
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-500 hover:text-amber-400 hover:bg-amber-900/20" onClick={() => handleStatusUpdate(req.id, 'waitlisted')}>
                            <Clock className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/20" onClick={() => handleStatusUpdate(req.id, 'declined')}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      {req.status !== 'pending' && (
                        <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleStatusUpdate(req.id, 'pending')}>
                          Reset
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </main>
    </div>
  );
}
