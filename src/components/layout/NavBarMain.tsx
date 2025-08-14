import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Palette, Sun, Moon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface NavbarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Navbar = ({ isDarkMode, toggleDarkMode }: NavbarProps) => {
  const nav = useNavigate();
  const { profile, user, signOut } = useAuth();

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
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => nav("/")}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <Palette className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">PaintPerfect</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/about" className="hover:text-primary transition-colors">
              About Us
            </Link>
            <Link to="/gallery" className="hover:text-primary transition-colors">
              Gallery
            </Link>
            <Link to="/services" className="hover:text-primary transition-colors">
              Services
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="p-2"
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
                  <Button size="sm">
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
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
