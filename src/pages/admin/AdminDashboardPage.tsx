import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, ClipboardList, Settings, UserCheck, TrendingUp, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface PaintingRequest {
  id: string;
  user_id: string;
  vendor_id: string | null;
  created_at: string;
  room_photo_url: string;
  dimension_image: string;
  dimensions: any;
  estimated_cost: number;
  room_types: any;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed';
  user?: {
    name: string;
    profile_image?: string;
  };
  vendor?: {
    name: string;
    company_name: string | null;
  };
}

interface Vendor {
  user_id: string;
  name: string;
  company_name: string | null;
  is_approved?: boolean;
}

export const AdminDashboardPage = () => {
  const [requests, setRequests] = useState<PaintingRequest[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingVendors, setPendingVendors] = useState<Vendor[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<{ [requestId: string]: string }>({});

  useEffect(() => {
    fetchAllRequests();
    fetchVendors();
  }, []);

  const fetchAllRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('painting_requests')
        .select(`
          *,
          user:profiles!fk_user(name, profile_image),
          vendor:profiles!painting_requests_vendor_id_fkey(name, company_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching painting requests',
        description: error.message || 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const sendRequestToVendor = async (requestId: string, vendorId: string) => {
    const { data, error } = await supabase
      .from('vendor_requests')
      .insert([
        {
          request_id: requestId,
          vendor_id: vendorId,
          status: 'pending',
        },
      ]);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Request Sent', description: 'Vendor has been notified.' });
      fetchAllRequests();
    }
  };

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name, company_name, is_approved')
        .eq('role', 'vendor');

      if (error) throw error;
      setVendors(data.filter((v) => v.is_approved));
      setPendingVendors(data.filter((v) => !v.is_approved));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch vendors',
        variant: 'destructive',
      });
    }
  };

  const approveVendor = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: true })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Vendor Approved',
        description: 'Vendor has been approved successfully.',
      });

      fetchVendors();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to approve vendor',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
      case 'accepted':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'in_progress':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'completed':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
    }
  };

  const getRoomSummary = (roomTypes: any) => {
    if (!roomTypes) return 'No rooms specified';
    return Object.entries(roomTypes)
      .map(([room, count]) => `${count} ${room}${Number(count) > 1 ? 's' : ''}`)
      .join(', ');
  };

  const getStats = () => {
    const totalRequests = requests.length;
    const pendingRequests = requests.filter((r) => r.status === 'pending').length;
    const completedRequests = requests.filter((r) => r.status === 'completed').length;
    const totalRevenue = requests
      .filter((r) => r.status === 'completed')
      .reduce((sum, r) => sum + (r.estimated_cost || 0), 0);

    return { totalRequests, pendingRequests, completedRequests, totalRevenue };
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage requests, vendors, and system settings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-none bg-gradient-to-br from-blue-600 to-blue-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <ClipboardList className="w-5 h-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalRequests}</div>
              <p className="text-xs opacity-80 mt-1">All time requests</p>
            </CardContent>
          </Card>

          <Card className="border-none bg-gradient-to-br from-amber-600 to-amber-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="w-5 h-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pendingRequests}</div>
              <p className="text-xs opacity-80 mt-1">Awaiting assignment</p>
            </CardContent>
          </Card>

          <Card className="border-none bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <UserCheck className="w-5 h-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.completedRequests}</div>
              <p className="text-xs opacity-80 mt-1">Successfully finished</p>
            </CardContent>
          </Card>

          <Card className="border-none bg-gradient-to-br from-violet-600 to-violet-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="w-5 h-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs opacity-80 mt-1">From completed projects</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-background">
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              All Requests
            </TabsTrigger>
            <TabsTrigger value="vendors" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Vendors
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Pending Approvals
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* All Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            {requests.length === 0 ? (
              <Card className="p-8 text-center">
                <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No requests found</h3>
                <p className="text-muted-foreground">There are currently no painting requests</p>
              </Card>
            ) : (
              requests.map((request) => (
                <Card key={request.id} className="hover:shadow-sm transition-shadow border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{getRoomSummary(request.room_types)}</CardTitle>
                        <CardDescription className="flex flex-wrap items-center gap-2">
                          <span>Customer: {request.user?.name || 'N/A'}</span>
                          <span className="text-muted-foreground">•</span>
                          <span>Created: {new Date(request.created_at).toLocaleDateString()}</span>
                        </CardDescription>
                      </div>
                      <Badge className={`${getStatusColor(request.status)} border`}>
                        {request.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Estimated Cost</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          ₹{request.estimated_cost?.toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Assigned Vendor</p>
                        <p className="text-sm font-medium">
                          {request.vendor
                            ? `${request.vendor.name}${request.vendor.company_name ? ` (${request.vendor.company_name})` : ''}`
                            : 'Not assigned'}
                        </p>
                      </div>
                      <div className="flex justify-end">
                        {request.status === 'pending' && !request.vendor_id && (
                          <div className="flex gap-2 items-center">
                            <Select
                              onValueChange={(vendorId) =>
                                setSelectedVendors((prev) => ({ ...prev, [request.id]: vendorId }))
                              }
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Select Vendor" />
                              </SelectTrigger>
                              <SelectContent>
                                {vendors.map((vendor) => (
                                  <SelectItem key={vendor.user_id} value={vendor.user_id}>
                                    {vendor.name} {vendor.company_name && `(${vendor.company_name})`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              disabled={!selectedVendors[request.id]}
                              onClick={() => sendRequestToVendor(request.id, selectedVendors[request.id])}
                            >
                              Assign
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Pending Vendors Tab */}
          <TabsContent value="pending" className="space-y-4">
            {pendingVendors.length === 0 ? (
              <Card className="p-8 text-center">
                <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No pending requests</h3>
                <p className="text-muted-foreground">All vendor applications have been processed</p>
              </Card>
            ) : (
              pendingVendors.map((vendor) => (
                <Card key={vendor.user_id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg text-foreground">{vendor.name}</h3>
                      {vendor.company_name && (
                        <p className="text-sm text-muted-foreground">{vendor.company_name}</p>
                      )}
                      <Badge variant="secondary">Pending Approval</Badge>
                    </div>
                    <Button 
                      onClick={() => approveVendor(vendor.user_id)}
                      variant="success"
                    >
                      Approve Vendor
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Approved Vendors Tab */}
          <TabsContent value="vendors" className="space-y-4">
            {vendors.length === 0 ? (
              <Card className="p-8 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No approved vendors</h3>
                <p className="text-muted-foreground">Approve vendors to see them listed here</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {vendors.map((vendor) => (
                  <Card key={vendor.user_id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg text-foreground">{vendor.name}</h3>
                        {vendor.company_name && (
                          <p className="text-sm text-muted-foreground">{vendor.company_name}</p>
                        )}
                        <Badge variant="outline" className="border-green-500/30 text-green-600 dark:text-green-400">
                          Approved Vendor
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm text-muted-foreground">Active</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Settings className="w-5 h-5" />
                  System Settings
                </CardTitle>
                <CardDescription>
                  Manage categories, pricing, and other system configurations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-foreground">Category Management</h4>
                      <p className="text-sm text-muted-foreground">Add or modify room and paint categories</p>
                      <Button variant="outline" size="sm">Manage Categories</Button>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-foreground">Pricing Configuration</h4>
                      <p className="text-sm text-muted-foreground">Update pricing for different services</p>
                      <Button variant="outline" size="sm">Update Pricing</Button>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};