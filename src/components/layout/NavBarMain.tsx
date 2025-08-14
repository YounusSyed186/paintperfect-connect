import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Palette, Sun, Moon, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

interface NavbarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Navbar = ({ isDarkMode, toggleDarkMode }: NavbarProps) => {
  const nav = useNavigate();
  const { profile, user, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDashboardPath = () => {
    switch (profile?.role) {
      case "admin":
        return "/admin/dashboard";
      case "vendor":
        return "/vendor/dashboard";
      case "user":
        return "/user/dashboard";
      default:
        return null;
    }
  };

  const dashboardPath = getDashboardPath();

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all-smooth ${
      isScrolled 
        ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => nav("/")}
            className="flex items-center space-x-2 cursor-pointer group animate-slide-in-left"
          >
            <div className="relative">
              <Palette className="h-8 w-8 text-primary transition-transform-smooth group-hover:scale-110 animate-glow" />
            </div>
            <span className="text-2xl font-bold text-gradient">PaintPerfect</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8 animate-fade-in">
            <Link 
              to="/" 
              className="relative text-foreground hover:text-primary transition-colors group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all-smooth group-hover:w-full"></span>
            </Link>
            <Link 
              to="/about" 
              className="relative text-foreground hover:text-primary transition-colors group"
            >
              About Us
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all-smooth group-hover:w-full"></span>
            </Link>
            <Link 
              to="/gallery" 
              className="relative text-foreground hover:text-primary transition-colors group"
            >
              Gallery
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all-smooth group-hover:w-full"></span>
            </Link>
            <Link 
              to="/services" 
              className="relative text-foreground hover:text-primary transition-colors group"
            >
              Services
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all-smooth group-hover:w-full"></span>
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4 animate-slide-in-right">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="p-2 hover-lift"
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {user && dashboardPath ? (
              <>
                <Link to={dashboardPath}>
                  <Button size="sm" className="gradient-primary hover:opacity-90 hover-lift">
                    {profile?.role === "admin"
                      ? "Admin Dashboard"
                      : profile?.role === "vendor"
                      ? "Vendor Dashboard"
                      : "User Dashboard"}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="hover-lift"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth" className="hidden sm:block">
                  <Button variant="outline" size="sm" className="hover-lift">
                    Log in
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm" className="gradient-primary hover:opacity-90 hover-lift">
                    Sign up
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 p-4 bg-background/95 backdrop-blur-xl rounded-lg border border-border/50 animate-slide-up">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link 
                to="/gallery" 
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Gallery
              </Link>
              <Link 
                to="/services" 
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Services
              </Link>
              {!user && (
                <Link to="/auth" className="sm:hidden">
                  <Button variant="outline" size="sm" className="w-full">
                    Log in
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};