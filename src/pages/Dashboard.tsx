// Dashboard.tsx
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";

export const Dashboard = () => {
  const { profile, signOut } = useAuth();

  useEffect(() => {
    if (profile && profile.role !== "user" && profile.is_approved === false) {
      toast({
        title: "Access Denied",
        description: "Your vendor account is not approved yet.",
        variant: "destructive",
      });

      setTimeout(() => {
        signOut();
      }, 2000);
    }
  }, [profile]);

  if (!profile) return null;

  switch (profile.role) {
    case "user":
      return <Navigate to="/user/dashboard" replace />;
    case "vendor":
      return <Navigate to="/vendor/dashboard" replace />;
    case "admin":
      return <Navigate to="/admin/dashboard" replace />;
    default:
      return <div>Invalid role</div>;
  }
};
