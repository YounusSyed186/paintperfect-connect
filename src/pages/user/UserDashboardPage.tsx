import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Calendar, DollarSign, User, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { CreateRequestDialog } from '@/components/requests/CreateRequestDialog';

interface PaintingRequest {
  id: string;
  room_types: any;
  estimated_cost: number;
  status: string;
  created_at: string;
  vendor_id: string | null;
  profiles?: {
    name: string;
    company_name: string | null;
  } | null;
}

export const UserDashboardPage = () => {
  const [requests, setRequests] = useState<PaintingRequest[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('painting_requests')
        .select(`
          *,
          profiles!vendor_id (name, company_name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const transformedData = (data || []).map(request => ({
        ...request,
        profiles: request.profiles && typeof request.profiles === 'object' && !('error' in request.profiles) 
          ? request.profiles 
          : null
      }));
      setRequests(transformedData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch your requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
      case 'accepted': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'in_progress': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'completed': return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'accepted': return '✅';
      case 'in_progress': return '🎨';
      case 'completed': return '🏆';
      default: return '📋';
    }
  };

  const getRoomSummary = (roomTypes: any) => {
    if (!roomTypes) return 'No rooms specified';
    
    const rooms = Object.entries(roomTypes).map(([room, count]) => 
      `${count} ${room}${Number(count) > 1 ? 's' : ''}`
    );
    
    return rooms.join(', ');
  };

  const getStats = () => {
    const totalRequests = requests.length;
    const pendingRequests = requests.filter(r => r.status === 'pending').length;
    const completedRequests = requests.filter(r => r.status === 'completed').length;
    const totalSpent = requests
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + (r.estimated_cost || 0), 0);

    return { totalRequests, pendingRequests, completedRequests, totalSpent };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Painting Projects</h1>
            <p className="text-muted-foreground">Track and manage your painting requests</p>
          </div>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            size="lg"
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-5 w-5" />
            New Project
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <MapPin className="w-5 h-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalRequests}</div>
              <p className="text-xs opacity-80 mt-1">All time projects</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-600 to-amber-700 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="w-5 h-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pendingRequests}</div>
              <p className="text-xs opacity-80 mt-1">Awaiting assignment</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <User className="w-5 h-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.completedRequests}</div>
              <p className="text-xs opacity-80 mt-1">Successfully finished</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-violet-600 to-violet-700 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="w-5 h-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{stats.totalSpent.toLocaleString()}</div>
              <p className="text-xs opacity-80 mt-1">On completed projects</p>
            </CardContent>
          </Card>
        </div>

        {requests.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="text-center py-16">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">No projects yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create your first painting request to get started with transforming your space
              </p>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                size="lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {requests.map((request) => (
              <Card 
                key={request.id} 
                className="hover:shadow-sm transition-shadow border-l-4 border-l-primary"
              >
                <div className="bg-primary/5 px-6 py-4 border-b">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-1">{getStatusIcon(request.status)}</span>
                      <div>
                        <CardTitle className="text-lg text-foreground">
                          {getRoomSummary(request.room_types)}
                        </CardTitle>
                        <CardDescription className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            Created {new Date(request.created_at).toLocaleDateString()}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(request.status)} border font-medium px-3 py-1`}>
                      {request.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Estimated Cost
                      </p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ₹{request.estimated_cost?.toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Assigned Vendor
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {request.profiles ? 
                          `${request.profiles.name}${request.profiles.company_name ? ` (${request.profiles.company_name})` : ''}` : 
                          'Not assigned yet'
                        }
                      </p>
                    </div>
                    <div className="flex justify-end items-center">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <CreateRequestDialog 
          open={showCreateDialog} 
          onOpenChange={setShowCreateDialog}
          onRequestCreated={fetchRequests}
        />
      </div>
    </div>
  );
};