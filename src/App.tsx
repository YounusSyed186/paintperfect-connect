// App.tsx
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AuthPage } from "./pages/AuthPage";
import { Dashboard } from "./pages/Dashboard";
import { UserDashboardPage } from "./pages/user/UserDashboardPage";
import { VendorDashboardPage } from "./pages/vendor/VendorDashboardPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { LandingPage } from "./pages/LandingPage";
import { AboutPage } from "./pages/AboutPage";
import { GalleryPage } from "./pages/GalleryPage";
import { ServicesPage } from "./pages/ServicesPage";
import { Navbar } from "@/components/layout/NavBarMain";
import NotFound from "./pages/NotFound";
import CartPage from "./pages/cart/CartPage";

const queryClient = new QueryClient();

// Component to handle page transitions
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("fadeIn");

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage("fadeOut");
    }
  }, [location, displayLocation]);

  return (
    <div
      className={`${transitionStage === "fadeOut" ? "animate-fade-out" : "animate-fade-in"
        }`}
      onAnimationEnd={() => {
        if (transitionStage === "fadeOut") {
          setTransitionStage("fadeIn");
          setDisplayLocation(location);
        }
      }}
    >
      {children}
    </div>
  );
};

// AppContent Component
const AppContent = ({
  isDarkMode,
  toggleDarkMode,
}: {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-pink-900/20">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground animate-pulse">
            Loading your creative space...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background page-transition">
      <LandingPage />
    </div>
  );
};

// ProtectedRoute Component
const ProtectedRoute = ({
  children,
  allowedRoles,
  isDarkMode,
  toggleDarkMode,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-pink-900/20">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground animate-pulse">
            Authenticating...
          </p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  if (!allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background page-transition">
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <div className="pt-20">{children}</div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Landing / Home Page */}
              <Route
                path="/"
                element={
                  <PageTransition>
                    <AppContent
                      isDarkMode={isDarkMode}
                      toggleDarkMode={toggleDarkMode}
                    />
                  </PageTransition>
                }
              />

              {/* Auth */}
              <Route
                path="/auth"
                element={
                  <PageTransition>
                    <AuthPage />
                  </PageTransition>
                }
              />

              {/* Role-based Dashboard Redirect */}
              <Route
                path="/dashboard"
                element={
                  <PageTransition>
                    <Dashboard />
                  </PageTransition>
                }
              />

              {/* Protected Dashboards */}
              <Route
                path="/user/dashboard"
                element={
                  <PageTransition>
                    <ProtectedRoute
                      allowedRoles={["user"]}
                      isDarkMode={isDarkMode}
                      toggleDarkMode={toggleDarkMode}
                    >
                      <UserDashboardPage />
                    </ProtectedRoute>
                  </PageTransition>
                }
              />
              <Route
                path="/vendor/dashboard"
                element={
                  <PageTransition>
                    <ProtectedRoute
                      allowedRoles={["vendor"]}
                      isDarkMode={isDarkMode}
                      toggleDarkMode={toggleDarkMode}
                    >
                      <VendorDashboardPage />
                    </ProtectedRoute>
                  </PageTransition>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <PageTransition>
                    <ProtectedRoute
                      allowedRoles={["admin"]}
                      isDarkMode={isDarkMode}
                      toggleDarkMode={toggleDarkMode}
                    >
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  </PageTransition>
                }
              />

              {/* Other Pages */}
              <Route
                path="/about-us"
                element={
                  <PageTransition>
                    <AboutPage />
                  </PageTransition>
                }
              />
              <Route
                path="/gallery"
                element={
                  <PageTransition>
                    <GalleryPage />
                  </PageTransition>
                }
              />
              <Route path="/cart" element={<PageTransition><CartPage /></PageTransition>} />

              <Route
                path="/services"
                element={
                  <PageTransition>
                    <ServicesPage />
                  </PageTransition>
                }
              />
              <Route
                path="*"
                element={
                  <PageTransition>
                    <NotFound />
                  </PageTransition>
                }
              />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
