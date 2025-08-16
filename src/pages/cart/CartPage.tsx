// src/pages/CartPage.tsx
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, ChevronDown, ChevronUp, Plus, Minus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CartItemWithDesign {
    id: string;
    design_id: string;
    design_title: string;
    design_image: string;
    quantity: number;
    created_at: string | null;
    price?: number;
    vendor_id?: string;
}

interface Category {
    id: string;
    value: string;
}

interface Pricing {
    id: string;
    category_id: string;
    price_value: number;
}


export default function CartPage() {
    const { user } = useAuth();
    const [items, setItems] = useState<CartItemWithDesign[]>([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

    const [categories, setCategories] = useState<Category[]>([]);
    const [pricing, setPricing] = useState<Pricing[]>([]);
    const [roomCounts, setRoomCounts] = useState<Record<string, Record<string, number>>>({});
    const [dimensions, setDimensions] = useState<Record<string, { length: string; breadth: string }>>({});
    const [dimensionImages, setDimensionImages] = useState<Record<string, File | null>>({});
    const [dimensionPreviews, setDimensionPreviews] = useState<Record<string, string>>({});

    // Fetch categories and pricing
    useEffect(() => {
        const fetchMeta = async () => {
            const { data: catData } = await supabase.from("categories").select("*").eq("type", "room");
            const { data: priceData } = await supabase.from("pricing").select("*");
            setCategories(catData || []);
            setPricing(priceData || []);
        };
        fetchMeta();
    }, []);

    // Fetch cart items
    const fetchCart = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("cart_items")
            .select(`
        id,
        design_id,
        quantity,
        created_at,
        painting_designs (
          title,
          image_url,
          vendor_id
        )
      `) as any;

        if (error) console.error(error);
        else {
            const formatted = data?.map((item: any) => ({
                id: item.id,
                design_id: item.design_id,
                quantity: item.quantity,
                created_at: item.created_at,
                design_title: item.painting_designs?.title ?? "",
                design_image: item.painting_designs?.image_url ?? "",
                vendor_id: item.painting_designs?.vendor_id,
            })) || [];
            setItems(formatted);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (user?.id) fetchCart();
    }, [user?.id]);

    const removeItem = async (id: string) => {
        setRemovingId(id);
        const { error } = await supabase.from("cart_items").delete().eq("id", id);
        if (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to remove item",
                variant: "destructive",
            });
        } else {
            setItems(prev => prev.filter(i => i.id !== id));
            toast({
                title: "Success",
                description: "Item removed from cart",
            });
        }
        setRemovingId(null);
    };

    const handleRoomChange = (itemId: string, roomType: string, change: number) => {
        setRoomCounts(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                [roomType]: Math.max(0, ((prev[itemId]?.[roomType] || 0) + change))
            }
        }));
    };

    const handleDimensionChange = (itemId: string, field: "length" | "breadth", value: string) => {
        setDimensions(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                [field]: value
            }
        }));
    };

    const handleImageChange = (itemId: string, file: File | null) => {
        setDimensionImages(prev => ({ ...prev, [itemId]: file }));
        setDimensionPreviews(prev => ({ ...prev, [itemId]: file ? URL.createObjectURL(file) : "" }));
    };

    const calculateItemPrice = (itemId: string) => {
        const rooms = roomCounts[itemId] || {};
        const dim = dimensions[itemId] || { length: "0", breadth: "0" };
        const length = parseFloat(dim.length) || 10;
        const breadth = parseFloat(dim.breadth) || 10;
        let total = 0;
        Object.entries(rooms).forEach(([roomType, count]) => {
            if (count > 0) {
                const cat = categories.find(c => c.value === roomType);
                const priceInfo = cat ? pricing.find(p => p.category_id === cat.id) : null;
                if (priceInfo) total += priceInfo.price_value * length * breadth * count;
            }
        });
        return total;
    };

    const totalPrice = items.reduce((sum, i) => sum + calculateItemPrice(i.id), 0);
   const handleCheckout = async () => {
    if (!user) return;

    try {
        setLoading(true);

        for (const item of items) {
            const rooms = roomCounts[item.id] || {};
            const dims = dimensions[item.id] || { length: "", breadth: "" };
            const dimensionFile = dimensionImages[item.id] || null;

            if (Object.keys(rooms).length === 0) continue;

            let imageUrl = "";
            if (dimensionFile) {
                const fileName = `${user.id}/${item.id}_${Date.now()}`;
                const { error: uploadError } = await supabase.storage
                    .from("dimensions")
                    .upload(fileName, dimensionFile);
                if (uploadError) throw uploadError;

                const { publicUrl } = supabase.storage
                    .from("dimensions")
                    .getPublicUrl(fileName);
                imageUrl = publicUrl;
            }

            const requestData = {
                user_id: user.id,
                vendor_id: item.vendor_id || null,
                room_types: rooms,
                dimensions: dims,
                estimated_cost: calculateItemPrice(item.id),
                dimension_image: imageUrl,
            };

            const { error: insertError } = await supabase.from("painting_requests").insert(requestData);
            if (insertError) throw insertError;

            // Delete the cart item after successful request creation
            const { error: deleteError } = await supabase.from("cart_items").delete().eq("id", item.id);
            if (deleteError) throw deleteError;
        }

        toast({ title: "Checkout Complete", description: "All requests submitted!" });

        // Clear local state
        setItems([]);
        setRoomCounts({});
        setDimensions({});
        setDimensionImages({});
        setDimensionPreviews({});
    } catch (error: any) {
        console.error("Checkout error:", error);
        toast({
            title: "Failed to complete checkout",
            description: error.message,
            variant: "destructive",
        });
    } finally {
        setLoading(false);
    }
};



    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="animate-spin h-12 w-12 text-primary" />
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">Your Cart</h1>

            {items.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-lg text-gray-600 dark:text-gray-400">Your cart is empty</p>
                </div>
            )}

            <div className="space-y-4">
                {items.map(item => (
                    <Card key={item.id} className="bg-white dark:bg-gray-800 shadow-sm">
                        <CardHeader className="flex flex-row justify-between items-center p-4">
                            <div className="flex items-center space-x-4">
                                <img
                                    src={item.design_image}
                                    alt={item.design_title}
                                    className="w-16 h-16 rounded-md object-cover"
                                />
                                <CardTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                    {item.design_title}
                                </CardTitle>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setExpandedItemId(prev => prev === item.id ? null : item.id)}
                                >
                                    {expandedItemId === item.id ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                    <span className="ml-2">Details</span>
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeItem(item.id)}
                                    disabled={removingId === item.id}
                                >
                                    {removingId === item.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </CardHeader>

                        {expandedItemId === item.id && (
                            <CardContent className="p-4 pt-0 border-t dark:border-gray-700">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Room Types</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {categories.map(cat => (
                                                <div key={cat.id} className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{cat.value}</span>
                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => handleRoomChange(item.id, cat.value, -1)}
                                                            disabled={!roomCounts[item.id]?.[cat.value]}
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                        <span className="w-8 text-center">
                                                            {roomCounts[item.id]?.[cat.value] || 0}
                                                        </span>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => handleRoomChange(item.id, cat.value, 1)}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor={`length-${item.id}`}>Length (ft)</Label>
                                            <Input
                                                id={`length-${item.id}`}
                                                type="number"
                                                value={dimensions[item.id]?.length || ""}
                                                onChange={e => handleDimensionChange(item.id, "length", e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor={`breadth-${item.id}`}>Breadth (ft)</Label>
                                            <Input
                                                id={`breadth-${item.id}`}
                                                type="number"
                                                value={dimensions[item.id]?.breadth || ""}
                                                onChange={e => handleDimensionChange(item.id, "breadth", e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Dimension Reference Image</Label>
                                        <div className="mt-2 flex items-center space-x-4">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => e.target.files && handleImageChange(item.id, e.target.files[0])}
                                                className="max-w-xs"
                                            />
                                            {dimensionPreviews[item.id] && (
                                                <img
                                                    src={dimensionPreviews[item.id]}
                                                    alt="Dimension preview"
                                                    className="h-16 w-16 rounded-md object-cover border dark:border-gray-600"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        )}

                        <CardFooter className="p-4 border-t dark:border-gray-700 flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {expandedItemId === item.id ? "Estimated Price" : "Expand to configure"}
                            </span>
                            {expandedItemId === item.id && (
                                <span className="font-medium text-lg text-primary">
                                    ₹{calculateItemPrice(item.id).toLocaleString()}
                                </span>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {items.length > 0 && (
                <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Order Summary</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {items.length} item{items.length !== 1 ? 's' : ''} in cart
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                            <p className="text-2xl font-bold text-primary">
                                ₹{totalPrice.toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <Button
                        className="w-full mt-6"
                        size="lg"
                        onClick={handleCheckout}
                    >
                        Proceed to Checkout
                    </Button>
                </div>
            )}
        </div>
    );
}