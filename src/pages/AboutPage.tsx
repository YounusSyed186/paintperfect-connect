import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Palette, Users, Award, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/NavBarMain'; // ✅ Navbar import

const team = [
  {
    name: "xyz",
    role: "Lead Paint Artist",
    experience: "10+ years",
  },
  {
    name: "xyz",
    role: "Color Specialist",
    experience: "8+ years",
  },
  {
    name: "xyz",
    role: "Interior Designer",
    experience: "12+ years",
  },
];

export const AboutPage = () => {
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
      {/* ✅ Navbar at the top */}
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary/10 to-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">About PaintPerfect</h1>
            <p className="text-xl text-muted-foreground mb-8">
              We're passionate artisans dedicated to transforming spaces through the power of paint, color, and creativity.
            </p>
            <Link to="/auth">
              <Button size="lg">
                Join Our Community
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">Our Story</h2>
              <div className="space-y-4 text-lg text-muted-foreground">
                <p>
                  Founded in 2010, PaintPerfect began as a small family business with a simple mission: to bring beauty and life to every space we touch.
                </p>
                <p>
                  Our founder, Maria Santos, believed that every wall has the potential to tell a story. With this philosophy, we've painted over 1,000 homes and commercial spaces.
                </p>
                <p>
                  Today, we continue to honor that original vision while embracing modern techniques, eco-friendly materials, and innovative design approaches.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=600"
                alt="Our founding story"
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-xl text-muted-foreground">The principles that guide everything we do</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Palette className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Creativity</h3>
              <p className="text-muted-foreground">We believe every space deserves a unique artistic touch that reflects your personality.</p>
            </Card>

            <Card className="text-center p-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality</h3>
              <p className="text-muted-foreground">Premium materials and expert craftsmanship ensure lasting beauty in every project.</p>
            </Card>

            <Card className="text-center p-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Collaboration</h3>
              <p className="text-muted-foreground">We work closely with clients to bring their vision to life, every step of the way.</p>
            </Card>

            <Card className="text-center p-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Reliability</h3>
              <p className="text-muted-foreground">On-time delivery and transparent communication make us a trusted partner.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-xl text-muted-foreground">The talented artists behind every masterpiece</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square overflow-hidden bg-muted/20 flex items-center justify-center">
                  {/* Placeholder if no image */}
                  <span className="text-muted-foreground text-3xl">{member.name[0]}</span>
                </div>
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                  <Badge variant="secondary" className="mb-2">{member.role}</Badge>
                  <p className="text-muted-foreground">{member.experience} experience</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-primary-foreground/80">Projects Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-primary-foreground/80">Happy Clients</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">14</div>
              <div className="text-primary-foreground/80">Years Experience</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-primary-foreground/80">Awards Won</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="p-12 text-center bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <h2 className="text-4xl font-bold mb-4">Ready to Start Your Project?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Let our experienced team transform your space into something extraordinary.
            </p>
            <Link to="/auth">
              <Button size="lg">
                Get Started Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
};
