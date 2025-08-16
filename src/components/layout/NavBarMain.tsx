import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Palette, Sun, Moon, Menu, X, ShoppingCart } from "lucide-react";
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
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking outside or navigating
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen && !(event.target as Element).closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const dashboardPath =
    profile?.role === "admin"
      ? "/admin/dashboard"
      : profile?.role === "vendor"
        ? "/vendor/dashboard"
        : profile?.role === "user"
          ? "/user/dashboard"
          : null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg"
        : "bg-transparent"
        }`}
    >
      <div className="mx-auto w-full max-w-[100vw] overflow-x-hidden px-4 sm:px-6 lg:px-8">
        <nav className="flex h-16 items-center justify-between w-full">
          {/* Logo */}
          <div
            onClick={() => {
              nav("/");
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center space-x-2 cursor-pointer group flex-shrink-0"
          >
            <Palette className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
            <span className="text-xl sm:text-2xl font-bold ">
              PaintPerfect
            </span>
          </div>

          {/* Desktop Menu - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {["Home", "About Us", "Gallery", "Services"].map((item) => (
              <Link
                key={item}
                to={`/${item === "Home" ? "" : item.toLowerCase().replace(" ", "-")}`}
                className="relative text-foreground hover:text-primary transition-colors group text-sm lg:text-base whitespace-nowrap"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="p-2"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            <Link to="/cart" className="hidden sm:inline-flex">
              <Button variant="ghost" size="icon" aria-label="Cart">
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </Link>

            {user && dashboardPath ? (
              <>
                <Link to={dashboardPath} className="hidden sm:block">
                  <Button size="sm" className="gradient-primary whitespace-nowrap">
                    {profile?.role === "admin"
                      ? "Admin"
                      : profile?.role === "vendor"
                        ? "Vendor"
                        : "User"}{" "}
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="whitespace-nowrap hidden sm:block"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth" className="hidden sm:block">
                  <Button variant="outline" size="sm" className="whitespace-nowrap">
                    Log in
                  </Button>
                </Link>
                <Link to="/auth?mode=signup" className="hidden sm:block">
                  <Button size="sm" className="gradient-primary whitespace-nowrap">
                    Sign up
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden p-2 ml-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className={`mobile-menu-container md:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}>
          <div className="bg-background/95 backdrop-blur-xl rounded-lg border border-border/50 p-4 space-y-3">
            {["Home", "About Us", "Gallery", "Services"].map((item) => (
              <Link
                key={item}
                to={`/${item === "Home" ? "" : item.toLowerCase().replace(" ", "-")}`}
                className="block text-foreground hover:text-primary transition-colors py-2 px-2 rounded hover:bg-accent/50 whitespace-nowrap"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item}
              </Link>
            ))}

            <Link
              to="/cart"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-foreground hover:text-primary transition-colors py-2 px-2 rounded hover:bg-accent/50 whitespace-nowrap"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span>Cart</span>
              </div>
            </Link>

            <div className="pt-2 space-y-3 border-t border-border/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="w-full justify-start gap-2"
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
              </Button>

              {user && dashboardPath ? (
                <>
                  <Link to={dashboardPath} className="block w-full" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button size="sm" className="gradient-primary w-full">
                      {profile?.role === "admin"
                        ? "Admin"
                        : profile?.role === "vendor"
                          ? "Vendor"
                          : "User"}{" "}
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/auth?mode=signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button size="sm" className="gradient-primary w-full">
                      Sign up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};