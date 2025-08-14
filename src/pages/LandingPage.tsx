import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Palette, Home, Building, Brush, Star, ArrowRight, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Navbar } from '@/components/layout/NavBarMain';

interface Design {
  id: string;
  title: string;
  image_url: string;
  category: string;
  tags: string[];
  created_at: string;
  vendor_id: string;
}

const artworks = [
  {
    id: 1,
    title: "Vibrant Abstract",
    artist: "Paint Perfect Team",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400",
  },
  {
    id: 2,
    title: "Serene Landscape",
    artist: "Paint Perfect Team",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
  },
  {
    id: 3,
    title: "Modern Minimalist",
    artist: "Paint Perfect Team",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
  },
];

export const LandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredDesigns, setFeaturedDesigns] = useState<Design[]>([]);
  const [allDesigns, setAllDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    fetchDesigns();
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const fetchDesigns = async () => {
    try {
      const { data, error } = await supabase
        .from('painting_designs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAllDesigns(data || []);
      // Set featured designs as the first 5 designs
      setFeaturedDesigns((data || []).slice(0, 5));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch designs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredDesigns.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredDesigns.length) % featuredDesigns.length);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header/Navbar */}
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}/>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Dive into creativity with our
                  <span className="text-primary"> painting</span> services
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Transform your space with professional painting services. From interior design to exterior makeovers, we bring your vision to life.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/gallery">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    View Gallery
                  </Button>
                </Link>
              </div>

              <div className="flex items-center space-x-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Projects Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">100+</div>
                  <div className="text-sm text-muted-foreground">Happy Clients</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">5★</div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative h-96 lg:h-[500px] overflow-hidden rounded-lg">
                <img
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800"
                  alt="Beautiful painted room"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Floating cards */}
              <div className="absolute -bottom-6 -left-6 bg-card border rounded-lg p-4 shadow-lg">
                <div className="flex items-center space-x-3">
                  <Home className="h-8 w-8 text-primary" />
                  <div>
                    <div className="font-semibold">Interior Painting</div>
                    <div className="text-sm text-muted-foreground">Premium Quality</div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 bg-card border rounded-lg p-4 shadow-lg">
                <div className="flex items-center space-x-3">
                  <Building className="h-8 w-8 text-primary" />
                  <div>
                    <div className="font-semibold">Exterior Painting</div>
                    <div className="text-sm text-muted-foreground">Weather Resistant</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Designs Slider */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Featured Design Collections</h2>
            <p className="text-xl text-muted-foreground">Discover our most popular painting transformations</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : featuredDesigns.length > 0 ? (
            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-semibold">Latest Designs</h3>
                {featuredDesigns.length > 4 && (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={prevSlide}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={nextSlide}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * (100 / Math.min(featuredDesigns.length, 4))}%)` }}
                >
                  {featuredDesigns.map((design) => (
                    <div key={design.id} className={`${featuredDesigns.length >= 4 ? 'w-1/4' : 'w-1/3'} flex-shrink-0 px-2`}>
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-[4/3] overflow-hidden">
                          <img
                            src={design.image_url}
                            alt={design.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <CardContent className="p-4">
                          <Badge variant="secondary" className="mb-2">{design.category}</Badge>
                          <h4 className="font-semibold">{design.title}</h4>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {design.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No designs available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* All Designs Gallery */}
      {allDesigns.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Our Complete Portfolio</h2>
              <p className="text-xl text-muted-foreground">Explore all our painting designs and get inspired</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allDesigns.map((design) => (
                <Card key={design.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={design.image_url}
                      alt={design.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <Badge variant="secondary" className="mb-2">{design.category}</Badge>
                    <h4 className="font-semibold mb-2">{design.title}</h4>
                    <div className="flex flex-wrap gap-1">
                      {design.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/gallery">
                <Button size="lg" variant="outline">
                  View Full Gallery
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">About PaintPerfect</h2>
              <div className="space-y-4 text-lg text-muted-foreground">
                <p>
                  For over a decade, PaintPerfect has been transforming spaces and bringing creative visions to life. We believe that every wall tells a story, and we're here to help you tell yours.
                </p>
                <p>
                  Our team of skilled artisans and professional painters combines traditional craftsmanship with modern techniques to deliver exceptional results that exceed expectations.
                </p>
                <p>
                  From residential interiors to commercial exteriors, we approach each project with the same dedication to quality, attention to detail, and commitment to customer satisfaction.
                </p>
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <Brush className="h-12 w-12 text-primary" />
                <div>
                  <div className="font-semibold text-lg">Professional Excellence</div>
                  <div className="text-muted-foreground">Certified painters with years of experience</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=600"
                alt="Our painting team at work"
                className="w-full h-96 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Artworks Grid */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Masterpieces</h2>
            <p className="text-xl text-muted-foreground">Showcase of our finest work</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : allDesigns.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allDesigns.slice(0, 6).map((design) => (
                <Card key={design.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={design.image_url}
                      alt={design.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-xl mb-2">{design.title}</h3>
                    <p className="text-muted-foreground mb-4">by Paint Perfect Team</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                        ))}
                      </div>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No artworks available yet.</p>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="p-12 text-center bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Space?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get started with a free consultation and let our experts bring your vision to life with professional painting services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg">
                  Start Your Project
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg">
                  Contact Us
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Palette className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">PaintPerfect</span>
              </div>
              <p className="text-muted-foreground">
                Professional painting services that transform your space into a masterpiece.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/services/interior" className="hover:text-primary transition-colors">Interior Painting</Link></li>
                <li><Link to="/services/exterior" className="hover:text-primary transition-colors">Exterior Painting</Link></li>
                <li><Link to="/services/commercial" className="hover:text-primary transition-colors">Commercial Services</Link></li>
                <li><Link to="/services/restoration" className="hover:text-primary transition-colors">Restoration</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link to="/gallery" className="hover:text-primary transition-colors">Gallery</Link></li>
                <li><Link to="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="https://instagram.com" className="hover:text-primary transition-colors">Instagram</a></li>
                <li><a href="https://facebook.com" className="hover:text-primary transition-colors">Facebook</a></li>
                <li><a href="https://twitter.com" className="hover:text-primary transition-colors">Twitter</a></li>
                <li><a href="https://linkedin.com" className="hover:text-primary transition-colors">LinkedIn</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 PaintPerfect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};