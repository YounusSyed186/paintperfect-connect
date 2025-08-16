import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Category {
  id: string;
  value: string;
}

interface Pricing {
  id: string;
  category_id: string;
  price_value: number;
}

interface Design {
  id: string;
  title: string;
  image_url: string;
  vendor_id: string;
}

interface CreateRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDesign: Design | null;
  onRequestCreated?: () => void;
}

export const CreateRequestDialog = ({ open, onOpenChange, onRequestCreated, selectedDesign }: CreateRequestDialogProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [roomCounts, setRoomCounts] = useState<Record<string, number>>({});
  const [dimensions, setDimensions] = useState({ length: '', breadth: '' });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [dimensionImageFile, setDimensionImageFile] = useState<File | null>(null);
  const [dimensionImagePreview, setDimensionImagePreview] = useState<string>('');

  useEffect(() => {
    if (open) {
      fetchCategories();
      fetchPricing();
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*').eq('type', 'room');
      console.log(data)
      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to fetch room categories', variant: 'destructive' });
    }
  };

  const fetchPricing = async () => {
    try {
      const { data, error } = await supabase.from('pricing').select('*');
      if (error) throw error;
      console.log("data",data)
      setPricing(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to fetch pricing information', variant: 'destructive' });
    }
  };

  const fetchDesigns = async () => {
    try {
      const { data, error } = await supabase.from('painting_designs').select('*');
      if (error) throw error;
      setDesigns(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to fetch design portfolio', variant: 'destructive' });
    }
  };

  const updateRoomCount = (roomType: string, change: number) => {
    setRoomCounts(prev => ({ ...prev, [roomType]: Math.max(0, (prev[roomType] || 0) + change) }));
  };

  const calculateEstimatedCost = () => {
    let totalCost = 0;
    Object.entries(roomCounts).forEach(([roomType, count]) => {
      
      if (count > 0) {
        const category = categories.find(c => c.value === roomType);
        if (category) {
          const priceInfo = pricing.find(p => p.category_id === category.id);
          if (priceInfo) {
            const roomArea = dimensions.length && dimensions.breadth ? (parseFloat(dimensions.length) * parseFloat(dimensions.breadth)) : 100;
            totalCost += priceInfo.price_value * roomArea * count;
          }
          // console.log("Category found:", category);
          // console.log("Pricing:", pricing);
          console.log("Price info found:", pricing.find(p => p.category_id === category.id));
        }
      }
    });
    return totalCost;
  };


  const handleDimensionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDimensionImageFile(file);
      setDimensionImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File, bucket: string, path: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!user) return;

    const selectedRooms = Object.fromEntries(
      Object.entries(roomCounts).filter(([_, count]) => count > 0)
    );

    if (!selectedDesign) {
      toast({
        title: 'Select a design',
        description: 'Please choose a design before submitting',
        variant: 'destructive',
      });
      return;
    }

    if (Object.keys(selectedRooms).length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one room',
        variant: 'destructive',
      });
      return;
    }

    if (!dimensionImageFile) {
      toast({
        title: 'Missing Dimension Image',
        description: 'Please upload a dimension image',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Upload dimension image
      const dimensionImageUrl = await uploadImage(dimensionImageFile, 'dimensions', user.id);

      const estimatedCost = calculateEstimatedCost();
      const requestDimensions =
        dimensions.length && dimensions.breadth
          ? {
            length: parseFloat(dimensions.length),
            breadth: parseFloat(dimensions.breadth),
          }
          : null;

      const { error } = await supabase.from('painting_requests').insert({
        user_id: user.id,
        vendor_id: selectedDesign.vendor_id,
        room_types: selectedRooms,
        dimensions: requestDimensions,
        estimated_cost: estimatedCost,
        dimension_image: dimensionImageUrl,
      });

      if (error) throw error;

      toast({
        title: 'Request created!',
        description: 'Your painting request has been submitted successfully.',
      });

      onRequestCreated();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRoomCounts({});
    setDimensions({ length: '', breadth: '' });
    setDimensionImageFile(null);
    setDimensionImagePreview('');
  };

  const estimatedCost = calculateEstimatedCost();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Design & Create Request</DialogTitle>
        </DialogHeader>

        <div>
          <h3 className="text-lg font-semibold mb-2">Select a Design</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {designs.map((design) => (
              <Card
                key={design.id}
                className={`cursor-pointer transition-all border-2 ${selectedDesign?.id === design.id ? 'border-primary' : 'border-transparent'}`}
              >
                <img src={design.image_url} alt={design.title} className="h-40 w-full object-cover rounded-t-md" />
                <CardContent>
                  <p className="font-semibold">{design.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {selectedDesign && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Selected Design</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <img src={selectedDesign.image_url} alt="Selected" className="h-20 w-20 object-cover rounded" />
              <div>
                <p className="font-medium">{selectedDesign.title}</p>
                <p className="text-sm text-muted-foreground">Design ID: {selectedDesign.id}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Select Rooms</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Card key={category.id} className="p-4 flex flex-col items-center">
                  <p className="font-medium mb-2">{category.value}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => updateRoomCount(category.value, -1)}>
                      <Minus size={16} />
                    </Button>
                    <span>{roomCounts[category.value] || 0}</span>
                    <Button variant="outline" size="icon" onClick={() => updateRoomCount(category.value, 1)}>
                      <Plus size={16} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="length">Length (ft)</Label>
            <Input id="length" type="number" value={dimensions.length} onChange={(e) => setDimensions({ ...dimensions, length: e.target.value })} />
          </div>

          <div>
            <Label htmlFor="breadth">Breadth (ft)</Label>
            <Input id="breadth" type="number" value={dimensions.breadth} onChange={(e) => setDimensions({ ...dimensions, breadth: e.target.value })} />
          </div>

          <div>
            <Label htmlFor="dimensionImage">Dimension Image</Label>
            <Input
              id="dimensionImage"
              type="file"
              accept="image/*"
              onChange={handleDimensionImageChange}
            />
            {dimensionImagePreview && (
              <div className="mt-2">
                <img src={dimensionImagePreview} alt="Dimension preview" className="h-40 object-contain" />
              </div>
            )}
          </div>

          <div className="text-right">
            <p className="font-semibold text-lg">Estimated Cost: ₹{estimatedCost.toLocaleString()}</p>
          </div>

          <div className="text-right">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};