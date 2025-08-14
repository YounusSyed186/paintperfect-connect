import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Heart, Eye, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/layout/NavBarMain'; // ✅ Import your navbar

const categories = ['All', 'Interior', 'Exterior', 'Commercial', 'Artistic', 'Restoration'];

export const GalleryPage = () => {
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('painting_designs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching designs:', error);
      } else {
        setGalleryItems(data || []);
      }
      setLoading(false);
    };
    fetchGallery();
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const filteredItems = galleryItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (item: any) => {
    console.log('Added to cart:', item);
    alert(`${item.title} has been added to your cart!`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ✅ Navbar at the top */}
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      {/* Header */}
      <section className="py-20 bg-gradient-to-b from-primary/10 to-transparent">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-5xl font-bold mb-6">Our Gallery</h1>
          <p className="text-xl text-muted-foreground">
            Explore our portfolio of stunning transformations and artistic creations
          </p>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
          </div>

          <div className={`flex flex-wrap gap-2 ${showFilters ? 'block' : 'hidden lg:flex'} w-full lg:w-auto`}>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground mb-6">
                Showing {filteredItems.length} of {galleryItems.length} projects
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <Badge className="absolute top-3 left-3 bg-background/90">{item.category}</Badge>
                    </div>

                    <CardContent className="p-6">
                      <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                      <p className="text-muted-foreground mb-4 text-sm">{item.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Heart className="h-4 w-4" /> <span>{item.likes || 0}</span>
                          <Eye className="h-4 w-4 ml-4" /> <span>{item.views || 0}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleAddToCart(item)}>
                            <ShoppingCart className="h-4 w-4 mr-1" /> Add to Cart
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">No projects found.</p>
                  <Button variant="outline" onClick={() => { setSelectedCategory('All'); setSearchTerm(''); }}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};
