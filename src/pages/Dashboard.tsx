// Dashboard.tsx
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!profile) return;

    // If vendor is not approved
    if (profile.role !== "user" && profile.is_approved === false) {
      toast({
        title: "Access Denied",
        description: "Your vendor account is not approved yet.",
        variant: "destructive",
      });

      setTimeout(() => {
        signOut();
      }, 2000);
      return;
    }

    // Redirect based on role with page reload
    switch (profile.role) {
      case "user":
        navigate("/user/dashboard");
        break;
      case "vendor":
        navigate("/vendor/dashboard");
        break;
      case "admin":
        navigate("/admin/dashboard");
        break;
      default:
        console.error("Invalid role");
        break;
    }

    // Force full page reload after navigation
    setTimeout(() => {
      window.location.reload();
    }, 50);
  }, [profile, navigate, signOut]);

  return null; // Nothing to render
};
