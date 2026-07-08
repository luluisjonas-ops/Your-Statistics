import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Clock, LogOut, RefreshCw } from "lucide-react";
import { LogoLockup } from "@/components/app/Logo";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import WhatsAppModal from "@/components/app/WhatsAppModal";

export default function PendingApproval() {
  const { user, logout, refresh } = useAuth();
  const nav = useNavigate();
  const [wa, setWa] = useState("+5573981891863");
  const [waOpen, setWaOpen] = useState(false);

  useEffect(() => {
    api.get("/config/public").then((r) => setWa(r.data.whatsapp)).catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.status === "aprovado" && user?.role !== "admin") nav("/app/dashboard");
    if (user?.role === "admin") nav("/master");
  }, [user, nav]);

  const message = `Olá! Sou ${user?.name || ""} da ${user?.company || ""}. Fiz meu cadastro no Your-Statistics (e-mail: ${user?.email}) e gostaria de liberar meu acesso.`;

  return (
    <div className="min-h-screen bg-background text-foreground grid place-items-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-lg ys-card p-8 sm:p-10 text-center"
        data-testid="pending-card"
      >
        <div className="flex justify-center"><LogoLockup /></div>
        <div className="mt-8 mx-auto h-14 w-14 rounded-2xl bg-primary/10 text-primary grid place-items-center">
          <Clock className="h-6 w-6" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight">Sua conta está em análise</h1>
        <p className="mt-3 text-muted-foreground">
          Recebemos seu cadastro, <strong className="text-foreground">{user?.name?.split(" ")[0]}</strong>. Assim que aprovarmos,
          você receberá acesso completo ao painel Your-Statistics.
        </p>
        <div className="mt-8 flex flex-col gap-2">
          <button onClick={()=>setWaOpen(true)} data-testid="pending-whatsapp-btn" className="ys-btn-primary rounded-xl h-11 inline-flex items-center justify-center gap-2 font-medium">
            <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
          </button>
          <button onClick={refresh} data-testid="pending-refresh" className="rounded-xl h-11 border border-border hover:bg-accent inline-flex items-center justify-center gap-2 text-sm">
            <RefreshCw className="h-4 w-4" /> Verificar novamente
          </button>
          <button onClick={async () => { await logout(); nav("/login"); }} data-testid="pending-logout" className="mt-3 text-sm text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1">
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </motion.div>
      <WhatsAppModal open={waOpen} onClose={()=>setWaOpen(false)} defaultMessage={message} />
      <div className="hidden">{wa}</div>
    </div>
  );
}
