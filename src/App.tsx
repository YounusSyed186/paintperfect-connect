// App.tsx
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

const queryClient = new QueryClient();

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <LandingPage /> {/* Always show landing page, even if logged in */}
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
    <div className="min-h-screen bg-background">
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      {children}
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
                  <AppContent
                    isDarkMode={isDarkMode}
                    toggleDarkMode={toggleDarkMode}
                  />
                }
              />

              {/* Auth */}
              <Route path="/auth" element={<AuthPage />} />

              {/* Role-based Dashboard Redirect */}
              <Route
                path="/dashboard"
                element={<Dashboard />}
              />

              {/* Protected Dashboards */}
              <Route
                path="/user/dashboard"
                element={
                  <ProtectedRoute
                    allowedRoles={["user"]}
                    isDarkMode={isDarkMode}
                    toggleDarkMode={toggleDarkMode}
                  >
                    <UserDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vendor/dashboard"
                element={
                  <ProtectedRoute
                    allowedRoles={["vendor"]}
                    isDarkMode={isDarkMode}
                    toggleDarkMode={toggleDarkMode}
                  >
                    <VendorDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute
                    allowedRoles={["admin"]}
                    isDarkMode={isDarkMode}
                    toggleDarkMode={toggleDarkMode}
                  >
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Other Pages */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
