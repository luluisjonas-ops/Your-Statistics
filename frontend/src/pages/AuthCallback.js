import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { LogoLockup } from "@/components/app/Logo";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
export default function AuthCallback() {
  const nav = useNavigate();
  const { refresh } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const hash = window.location.hash;
    const match = hash.match(/session_id=([^&]+)/);
    if (!match) { nav("/login", { replace: true }); return; }
    const sessionId = decodeURIComponent(match[1]);

    (async () => {
      try {
        const { data } = await api.post("/auth/google/session", { session_id: sessionId });
        localStorage.setItem("ys_token", data.token);
        await refresh();
        toast.success(`Bem-vindo, ${data.user.name.split(" ")[0]}!`);
        // Clean the fragment
        window.history.replaceState(null, "", window.location.pathname);
        if (data.user.role === "admin") nav("/master", { replace: true });
        else if (data.user.status !== "aprovado") nav("/pending-approval", { replace: true });
        else nav("/app/dashboard", { replace: true });
      } catch (e) {
        toast.error(e?.response?.data?.detail || "Falha ao autenticar com Google.");
        nav("/login", { replace: true });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background grid place-items-center">
      <div className="text-center">
        <LogoLockup />
        <div className="mt-6 flex items-center gap-2 justify-center text-sm text-muted-foreground">
          <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
          Autenticando com Google…
        </div>
      </div>
    </div>
  );
}
