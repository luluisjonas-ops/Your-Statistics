import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ children, admin = false }) {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" data-testid="loading-screen">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
          <span className="text-sm">Carregando…</span>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  if (admin && user.role !== "admin") return <Navigate to="/app/dashboard" replace />;
  if (!admin && user.role === "user" && user.status !== "aprovado") {
    return <Navigate to="/pending-approval" replace />;
  }
  return children;
}
