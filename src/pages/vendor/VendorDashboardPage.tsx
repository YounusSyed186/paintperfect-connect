import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Upload, CheckCircle, Clock, Image, Palette, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';

interface PaintingRequest {
  id: string;
  room_types: any;
  estimated_cost: number;
  status: string;
  created_at: string;
  profiles?: {
    name: string;
  } | null;
}

interface Design {
  id: string;
  title: string;
  image_url: string;
  category: string;
  tags: string[];
  created_at: string;
}

export const VendorDashboardPage = () => {
  const [requests, setRequests] = useState<PaintingRequest[]>([]);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [showUploadCard, setShowUploadCard] = useState(false);
  const [newDesign, setNewDesign] = useState({
    title: '',
    category: '',
    tags: '',
    imageFile: null as File | null,
  });
  const [uploading, setUploading] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    fetchAssignedRequests();
    fetchMyDesigns();
  }, [user]);

  const fetchAssignedRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('painting_requests')
        .select(`
          *,
          profiles:user_id (name)
        `)
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data as any || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch assigned requests",
        variant: "destructive",
      });
    }
  };

  const handleUploadDesign = async () => {
    if (!user) return;

    if (!newDesign.title || !newDesign.category || !newDesign.imageFile) {
      toast({
        title: 'Missing fields',
        description: 'Title, category, and image are required.',
        variant: 'destructive',
      });
      return;
    }

    const tagsArray = newDesign.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      setUploading(true);

      const fileExt = newDesign.imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('designs')
        .upload(filePath, newDesign.imageFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('designs').getPublicUrl(filePath);
      const publicURL = data?.publicUrl;

      if (!publicURL) {
        throw new Error('Failed to retrieve public image URL');
      }

      const { error: insertError } = await supabase.from('painting_designs').insert({
        title: newDesign.title,
        category: newDesign.category,
        tags: tagsArray,
        image_url: publicURL,
        vendor_id: user.id,
      });

      if (insertError) throw insertError;

      toast({
        title: 'Design uploaded',
        description: `${newDesign.title} has been added.`,
      });

      setShowUploadCard(false);
      setNewDesign({ title: '', category: '', tags: '', imageFile: null });
      fetchMyDesigns();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload design.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const fetchMyDesigns = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('painting_designs')
        .select('*')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDesigns(data || []);
      setLoading(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch your designs",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('painting_requests')
        .update({ status: newStatus as any })
        .eq('id', requestId);

      if (error) throw error;

      await supabase
        .from('job_updates')
        .insert({
          request_id: requestId,
          status: newStatus as any,
          notes: `Status updated to ${newStatus.replace('_', ' ')}`
        });

      toast({
        title: "Status updated",
        description: `Request status changed to ${newStatus.replace('_', ' ')}`,
      });

      fetchAssignedRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'accepted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getRoomSummary = (roomTypes: any) => {
    if (!roomTypes) return 'No rooms specified';

    const rooms = Object.entries(roomTypes).map(([room, count]) =>
      `${count} ${room}${Number(count) > 1 ? 's' : ''}`
    );

    return rooms.join(', ');
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return 'accepted';
      case 'accepted': return 'in_progress';
      case 'in_progress': return 'completed';
      default: return null;
    }
  };

  const getStats = () => {
    const totalRequests = requests.length;
    const completedRequests = requests.filter(r => r.status === 'completed').length;
    const totalDesigns = designs.length;
    const totalEarnings = requests
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + (r.estimated_cost || 0), 0);

    return { totalRequests, completedRequests, totalDesigns, totalEarnings };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Vendor Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your projects and showcase your designs</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 text-white border-0 shadow-lg transition-transform hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Active Projects</CardTitle>
              <Clock className="w-5 h-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalRequests}</div>
              <p className="text-xs opacity-80 mt-1">Assigned to you</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-700 dark:to-green-800 text-white border-0 shadow-lg transition-transform hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Completed</CardTitle>
              <CheckCircle className="w-5 h-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.completedRequests}</div>
              <p className="text-xs opacity-80 mt-1">Successfully finished</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-700 dark:to-purple-800 text-white border-0 shadow-lg transition-transform hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Designs</CardTitle>
              <Palette className="w-5 h-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalDesigns}</div>
              <p className="text-xs opacity-80 mt-1">In your portfolio</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-700 dark:to-orange-800 text-white border-0 shadow-lg transition-transform hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Earnings</CardTitle>
              <DollarSign className="w-5 h-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{stats.totalEarnings.toLocaleString()}</div>
              <p className="text-xs opacity-80 mt-1">From completed projects</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-background shadow-sm dark:bg-gray-800">
            <TabsTrigger 
              value="requests" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Clock className="w-4 h-4" />
              Assigned Projects ({requests.length})
            </TabsTrigger>
            <TabsTrigger 
              value="designs" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Image className="w-4 h-4" />
              My Portfolio ({designs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            {requests.length === 0 ? (
              <Card className="shadow-lg border-0 dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="text-center py-16">
                  <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 dark:text-white">No projects assigned</h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Projects will appear here when admin assigns them to you. Keep your portfolio updated to attract more clients!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {requests.map((request) => (
                  <Card 
                    key={request.id} 
                    className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 dark:bg-gray-800 dark:border-gray-700"
                  >
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border-b dark:border-gray-700">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <CardTitle className="text-xl text-gray-900 dark:text-white">
                            {getRoomSummary(request.room_types)}
                          </CardTitle>
                          <CardDescription className="text-gray-600 dark:text-gray-400">
                            Customer: {request.profiles?.name} •
                            Created {new Date(request.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge className={`${getStatusColor(request.status)} border font-medium px-3 py-1`}>
                          {request.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Project Value
                          </p>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            ₹{request.estimated_cost?.toLocaleString()}
                          </p>
                        </div>

                        {getNextStatus(request.status) && (
                          <Button
                            onClick={() => updateRequestStatus(request.id, getNextStatus(request.status)!)}
                            className="bg-primary hover:bg-primary/90 shadow-md transition-transform hover:scale-105"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as {getNextStatus(request.status)?.replace('_', ' ')}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="designs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">My Design Portfolio</h2>
              <Button 
                onClick={() => setShowUploadCard(true)}
                className="bg-primary hover:bg-primary/90 shadow-md transition-transform hover:scale-105"
              >
                <Plus className="mr-2 h-4 w-4" />
                Upload Design
              </Button>
            </div>

            {showUploadCard && (
              <Card className="shadow-lg border-0 dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border-b dark:border-gray-700">
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <Upload className="w-5 h-5" />
                    Upload New Design
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Add a new design to your portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="dark:text-gray-300">Design Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter design title"
                        value={newDesign.title}
                        onChange={(e) => setNewDesign({ ...newDesign, title: e.target.value })}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category" className="dark:text-gray-300">Category</Label>
                      <Input
                        id="category"
                        placeholder="e.g., Interior, Exterior, Abstract"
                        value={newDesign.category}
                        onChange={(e) => setNewDesign({ ...newDesign, category: e.target.value })}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags" className="dark:text-gray-300">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      placeholder="e.g., modern, colorful, minimalist"
                      value={newDesign.tags}
                      onChange={(e) => setNewDesign({ ...newDesign, tags: e.target.value })}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image" className="dark:text-gray-300">Design Image</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setNewDesign({ ...newDesign, imageFile: e.target.files?.[0] || null })
                      }
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white file:dark:bg-gray-600 file:dark:text-white"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={handleUploadDesign} 
                      disabled={uploading}
                      className="bg-primary hover:bg-primary/90 transition-transform hover:scale-105"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : 'Upload Design'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowUploadCard(false)}
                      className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {designs.length === 0 && !showUploadCard ? (
              <Card className="shadow-lg border-0 dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="text-center py-16">
                  <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Palette className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 dark:text-white">No designs uploaded</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Upload your painting designs to showcase your work and attract more clients
                  </p>
                  <Button 
                    onClick={() => setShowUploadCard(true)}
                    className="bg-primary hover:bg-primary/90 transition-transform hover:scale-105"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Your First Design
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {designs.map((design) => (
                  <Card 
                    key={design.id} 
                    className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 dark:bg-gray-800 dark:border-gray-700 overflow-hidden group"
                  >
                    <div className="aspect-square overflow-hidden relative">
                      <img
                        src={design.image_url}
                        alt={design.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 dark:text-white">{design.title}</h3>
                      <Badge 
                        variant="secondary" 
                        className="mb-3 dark:bg-gray-700 dark:text-white"
                      >
                        {design.category}
                      </Badge>
                      <div className="flex flex-wrap gap-1">
                        {design.tags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs dark:border-gray-600 dark:text-gray-300"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};