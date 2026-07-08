import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Copy, ExternalLink, Check, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export default function WhatsAppModal({ open, onClose, defaultMessage }) {
  const [wa, setWa] = useState("+5573981891863");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    api.get("/config/public").then((r) => setWa(r.data.whatsapp)).catch(() => {});
  }, [open]);

  const digits = wa.replace(/\D/g, "");
  const msg = defaultMessage || "Olá, gostaria de contratar o Your-Statistics para minha empresa.";
  const encoded = encodeURIComponent(msg);

  const openLink = (url) => window.open(url, "_blank", "noopener,noreferrer");
  const copyNumber = async () => {
    try { await navigator.clipboard.writeText(wa); setCopied(true); toast.success("Número copiado!"); setTimeout(()=>setCopied(false), 2000); }
    catch { toast.error("Não foi possível copiar. Selecione manualmente."); }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] bg-black/50 grid place-items-center p-4" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
            className="ys-card w-full max-w-md p-6 sm:p-8"
            onClick={(e)=>e.stopPropagation()}
            data-testid="wa-modal"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-emerald-600 font-semibold">WhatsApp</div>
                <h3 className="mt-1 font-display text-2xl font-semibold">Escolha como abrir</h3>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg border border-border"><X className="h-4 w-4"/></button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Se o WhatsApp não abrir direto no seu navegador, use uma das opções abaixo:
            </p>
            <div className="mt-5 space-y-2.5">
              <button data-testid="wa-open-web" onClick={()=>openLink(`https://web.whatsapp.com/send?phone=${digits}&text=${encoded}`)} className="w-full h-11 rounded-xl border border-border hover:bg-accent flex items-center gap-3 px-4 text-sm">
                <ExternalLink className="h-4 w-4 text-emerald-600" /> Abrir no WhatsApp Web
              </button>
              <button data-testid="wa-open-app" onClick={()=>openLink(`https://wa.me/${digits}?text=${encoded}`)} className="w-full h-11 rounded-xl border border-border hover:bg-accent flex items-center gap-3 px-4 text-sm">
                <MessageCircle className="h-4 w-4 text-emerald-600" /> Abrir no app WhatsApp (celular)
              </button>
              <button data-testid="wa-copy-number" onClick={copyNumber} className="w-full h-11 rounded-xl border border-border hover:bg-accent flex items-center gap-3 px-4 text-sm">
                {copied ? <Check className="h-4 w-4 text-emerald-600"/> : <Copy className="h-4 w-4 text-emerald-600"/>}
                Copiar número: <span className="ml-auto font-mono">{wa}</span>
              </button>
            </div>
            <div className="mt-5 text-xs text-muted-foreground">
              Alguns navegadores bloqueiam <span className="font-mono">api.whatsapp.com</span>. Se acontecer, use "WhatsApp Web" ou copie o número.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
