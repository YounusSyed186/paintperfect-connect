import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Home, Building, Palette, Wrench, CheckCircle, ArrowRight, Clock, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/NavBarMain'; // ✅ Navbar import

const services = [
  {
    icon: Home,
    title: "Interior Painting",
    description: "Transform your indoor spaces with professional interior painting services",
    features: ["Color consultation", "Premium paint brands", "Furniture protection", "Clean-up included"],
    price: "From ₹15/sq ft",
    duration: "2-5 days",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400"
  },
  {
    icon: Building,
    title: "Exterior Painting", 
    description: "Protect and beautify your property with weather-resistant exterior coatings",
    features: ["Surface preparation", "Weather-resistant paints", "Pressure washing", "5-year warranty"],
    price: "From ₹25/sq ft",
    duration: "3-7 days",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400"
  },
  {
    icon: Palette,
    title: "Decorative Finishes",
    description: "Specialty finishes and textures for unique aesthetic appeal",
    features: ["Custom textures", "Faux finishes", "Metallic accents", "Artistic designs"],
    price: "From ₹50/sq ft",
    duration: "3-6 days",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400"
  },
  {
    icon: Wrench,
    title: "Commercial Services",
    description: "Professional painting solutions for offices, retail, and industrial spaces",
    features: ["Minimal disruption", "After-hours work", "Large-scale projects", "Maintenance plans"],
    price: "Custom quote",
    duration: "1-4 weeks",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400"
  }
];

const process = [
  { step: 1, title: "Consultation", description: "Free in-home consultation to discuss your vision and provide detailed quote" },
  { step: 2, title: "Preparation", description: "Thorough surface preparation including cleaning, sanding, and priming" },
  { step: 3, title: "Painting", description: "Professional application using premium materials and proven techniques" },
  { step: 4, title: "Finishing", description: "Final inspection, touch-ups, and complete clean-up of work area" }
];

export const ServicesPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className="min-h-screen bg-background">
      {/* ✅ Navbar */}
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      {/* Header */}
      <section className="py-20 bg-gradient-to-b from-primary/10 to-transparent">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-5xl font-bold mb-6">Our Services</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Professional painting services tailored to meet your unique needs and exceed your expectations
          </p>
          <Link to="/auth">
            <Button size="lg">
              Get Free Quote
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="grid md:grid-cols-2">
                  <div className="aspect-square md:aspect-auto">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <CardHeader className="p-0 mb-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <service.icon className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-xl">{service.title}</CardTitle>
                      </div>
                      <p className="text-muted-foreground text-sm">{service.description}</p>
                    </CardHeader>

                    <CardContent className="p-0 space-y-4">
                      <ul className="space-y-2">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{service.price}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{service.duration}</span>
                        </div>
                      </div>

                      <Button className="w-full" variant="outline">
                        Learn More
                      </Button>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Process</h2>
            <p className="text-xl text-muted-foreground">How we ensure perfect results every time</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <Card key={index} className="text-center relative">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </CardContent>
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">Why Choose PaintPerfect?</h2>
              <div className="space-y-4">
                {["Licensed & Insured", "Quality Guarantee", "Eco-Friendly Options", "Expert Color Consultation"].map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold">{item}</h3>
                      <p className="text-muted-foreground text-sm">
                        {item === "Licensed & Insured" && "Fully licensed professionals with comprehensive insurance coverage"}
                        {item === "Quality Guarantee" && "100% satisfaction guarantee with warranty on all work"}
                        {item === "Eco-Friendly Options" && "Low-VOC and zero-VOC paint options for healthier indoor air"}
                        {item === "Expert Color Consultation" && "Professional color matching and design advice included"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=600"
                alt="Professional painting team"
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <Card className="p-12 text-center bg-primary-foreground/10 border-primary-foreground/20">
            <h2 className="text-4xl font-bold mb-4 text-primary-foreground">Ready to Get Started?</h2>
            <p className="text-xl mb-8 text-primary-foreground/80">
              Contact us today for a free consultation and detailed project quote
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" variant="secondary">
                  Get Free Quote
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Call (555) 123-4567
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};
