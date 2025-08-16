import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Palette, Home, Building, Brush, Star, ArrowRight, Sparkles, Users, Award, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Navbar } from '@/components/layout/NavBarMain';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'framer-motion';

interface Design {
  id: string;
  title: string;
  image_url: string;
  category: string;
  tags: string[];
  created_at: string;
  vendor_id: string;
}

const stats = [
  { icon: Users, label: "Happy Clients", value: "500+", color: "text-blue-500" },
  { icon: Brush, label: "Projects Completed", value: "1000+", color: "text-green-500" },
  { icon: Award, label: "Awards Won", value: "50+", color: "text-yellow-500" },
  { icon: TrendingUp, label: "Years Experience", value: "14+", color: "text-purple-500" },
];

const features = [
  {
    icon: Home,
    title: "Interior Painting",
    description: "Transform your indoor spaces with premium quality paints and expert craftsmanship.",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: Building,
    title: "Exterior Painting",
    description: "Weather-resistant coatings that protect and beautify your property's exterior.",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: Palette,
    title: "Custom Designs",
    description: "Unique artistic designs tailored to your personal style and preferences.",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: Sparkles,
    title: "Premium Finishes",
    description: "Specialty textures and finishes that add elegance to any space.",
    gradient: "from-orange-500 to-red-500"
  }
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren"
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export const LandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredDesigns, setFeaturedDesigns] = useState<Design[]>([]);
  const [allDesigns, setAllDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  // Intersection observers for scroll animations
  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '-50px 0px'
  });

  const [featuresRef, featuresInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '-50px 0px'
  });

  const [designsRef, designsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '-50px 0px'
  });

  const [aboutRef, aboutInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '-50px 0px'
  });

  const [ctaRef, ctaInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '-50px 0px'
  });

  const fetchDesigns = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('painting_designs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      setAllDesigns(data || []);
      setFeaturedDesigns(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch designs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    fetchDesigns();
  }, [fetchDesigns]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode, isMounted]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % featuredDesigns.length);
  }, [featuredDesigns.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + featuredDesigns.length) % featuredDesigns.length);
  }, [featuredDesigns.length]);

  // Smooth scroll to sections
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header/Navbar */}
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} scrollToSection={scrollToSection} />

      {/* Hero Section */}
      <section 
        id="home"
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden mt-16"
      >
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-pink-900/20"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
            initial={{ opacity: 0 }}
            animate={heroInView ? {
              opacity: 1,
              y: [0, -20, 0],
              x: [0, 20, 0],
            } : {}}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          ></motion.div>
          <motion.div 
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
            initial={{ opacity: 0 }}
            animate={heroInView ? {
              opacity: 1,
              y: [0, 20, 0],
              x: [0, -20, 0],
            } : {}}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          ></motion.div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="space-y-8"
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
              variants={containerVariants}
            >
              <motion.div className="space-y-6" variants={itemVariants}>
                <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                  <Sparkles className="w-4 h-4 text-primary mr-2" />
                  <span className="text-sm font-medium text-primary">Transform Your Space Today</span>
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  Dive into creativity with our
                  <span className="text-gradient block"> painting</span> 
                  services
                </h1>
                
                <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                  Transform your space with professional painting services. From interior design to exterior makeovers, we bring your vision to life with premium quality and expert craftsmanship.
                </p>
              </motion.div>

              <motion.div className="flex flex-col sm:flex-row gap-4" variants={itemVariants}>
                <Link to="/auth">
                  <Button size="lg" className="gradient-primary hover:opacity-90 text-white font-semibold px-8 py-4 hover-lift">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/gallery">
                  <Button variant="outline" size="lg" className="px-8 py-4 hover-lift">
                    View Gallery
                  </Button>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div 
                className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8"
                variants={containerVariants}
              >
                {stats.map((stat, index) => (
                  <motion.div 
                    key={index} 
                    className="text-center"
                    variants={itemVariants}
                    custom={index}
                  >
                    <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={heroInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative h-96 lg:h-[600px] overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80"
                  alt="Beautiful painted room"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Floating cards */}
              <motion.div 
                className="absolute -bottom-6 -left-6 glass-effect rounded-xl p-4 shadow-xl"
                initial={{ opacity: 0 }}
                animate={heroInView ? {
                  opacity: 1,
                  y: [0, -10, 0]
                } : {}}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Home className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Interior Painting</div>
                    <div className="text-sm text-gray-300">Premium Quality</div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="absolute -top-6 -right-6 glass-effect rounded-xl p-4 shadow-xl"
                initial={{ opacity: 0 }}
                animate={heroInView ? {
                  opacity: 1,
                  y: [0, -15, 0]
                } : {}}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Exterior Painting</div>
                    <div className="text-sm text-gray-300">Weather Resistant</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        id="services"
        ref={featuresRef}
        className="py-20 bg-muted/30"
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={fadeInVariants}
          >
            <h2 className="text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional painting solutions tailored to meet your unique needs and exceed your expectations
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={containerVariants}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="group hover:shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1 border-0 bg-gradient-to-br from-background to-muted/50">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Designs Section */}
      <AnimatePresence>
        {featuredDesigns.length > 0 && (
          <section 
            id="gallery"
            ref={designsRef}
            className="py-20"
          >
            <div className="container mx-auto px-4">
              <motion.div 
                className="text-center mb-16"
                initial="hidden"
                animate={designsInView ? "visible" : "hidden"}
                variants={fadeInVariants}
              >
                <h2 className="text-4xl font-bold mb-4">Featured Design Collections</h2>
                <p className="text-xl text-muted-foreground">Discover our most popular painting transformations</p>
              </motion.div>

              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-semibold">Latest Designs</h3>
                  {featuredDesigns.length > 3 && (
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={prevSlide} className="hover-lift">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={nextSlide} className="hover-lift">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <motion.div 
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                  initial="hidden"
                  animate={designsInView ? "visible" : "hidden"}
                  variants={containerVariants}
                >
                  {featuredDesigns.map((design, index) => (
                    <motion.div 
                      key={design.id} 
                      variants={itemVariants}
                      layout
                    >
                      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1 group">
                        <div className="aspect-[4/3] overflow-hidden relative">
                          <img
                            src={design.image_url}
                            alt={design.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <Badge className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm">{design.category}</Badge>
                        </div>
                        <CardContent className="p-6">
                          <h3 className="font-semibold text-lg mb-2">{design.title}</h3>
                          <div className="flex flex-wrap gap-1">
                            {design.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </section>
        )}
      </AnimatePresence>

      {/* About Section */}
      <section 
        id="about"
        ref={aboutRef}
        className="py-20 bg-muted/30"
      >
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: -50 }}
              animate={aboutInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-4xl font-bold">About PaintPerfect</h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
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
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <Brush className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-lg">Professional Excellence</div>
                  <div className="text-muted-foreground">Certified painters with years of experience</div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={aboutInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <img
                src="https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=600&auto=format&fit=crop&q=80"
                alt="Our painting team at work"
                className="w-full h-96 object-cover rounded-2xl shadow-2xl"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        ref={ctaRef}
        className="py-20"
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={ctaInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-r from-primary via-purple-600 to-pink-600 border-0">
              <div className="absolute inset-0 bg-black/20"></div>
              <CardContent className="relative z-10 p-12 text-center text-white">
                <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Space?</h2>
                <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                  Get started with a free consultation and let our experts bring your vision to life with professional painting services.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/auth">
                    <Button size="lg" variant="secondary" className="px-8 py-4 hover:-translate-y-1 transition-transform duration-300">
                      Start Your Project
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/services">
                    <Button size="lg" variant="outline" className="px-8 py-4 border-white text-white hover:bg-white hover:text-primary hover:-translate-y-1 transition-transform duration-300">
                      View Services
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
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
                <li><Link to="/services" className="hover:text-primary transition-colors">Interior Painting</Link></li>
                <li><Link to="/services" className="hover:text-primary transition-colors">Exterior Painting</Link></li>
                <li><Link to="/services" className="hover:text-primary transition-colors">Commercial Services</Link></li>
                <li><Link to="/services" className="hover:text-primary transition-colors">Restoration</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link to="/gallery" className="hover:text-primary transition-colors">Gallery</Link></li>
                <li><Link to="/services" className="hover:text-primary transition-colors">Services</Link></li>
                <li><Link to="/auth" className="hover:text-primary transition-colors">Contact</Link></li>
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