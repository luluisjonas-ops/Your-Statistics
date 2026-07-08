import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import { LogoLockup } from "@/components/app/Logo";
import { useAuth } from "@/context/AuthContext";
import { formatApiError } from "@/lib/api";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const u = await login(email, password);
      toast.success(`Bem-vindo, ${u.name.split(" ")[0]}!`);
      if (u.role === "admin") nav("/master");
      else if (u.status !== "aprovado") nav("/pending-approval");
      else nav(loc.state?.from?.pathname || "/app/dashboard");
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground grid lg:grid-cols-2">
      {/* Left / brand panel */}
      <div className="relative hidden lg:flex flex-col p-12 bg-secondary/40 overflow-hidden">
        <div className="absolute inset-0 ys-grid-bg opacity-70" />
        <div className="relative">
          <Link to="/" data-testid="login-brand-link"><LogoLockup /></Link>
        </div>
        <div className="relative mt-auto max-w-md">
          <div className="text-xs tracking-widest uppercase text-primary font-semibold">Sua empresa, no controle</div>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight leading-tight">
            Cada real, cada cliente e cada oportunidade — sob o mesmo teto.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Um ERP feito para você olhar os números e tomar decisões em segundos.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8" data-testid="login-back">
            <ArrowLeft className="h-4 w-4" /> voltar
          </Link>
          <div className="lg:hidden mb-8"><LogoLockup /></div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Entrar</h1>
          <p className="mt-2 text-sm text-muted-foreground">Acesse sua conta Your-Statistics.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">E-mail</label>
              <input
                type="email" required data-testid="login-email-input"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                placeholder="voce@empresa.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Senha</label>
                <button type="button" className="text-xs text-primary hover:underline" data-testid="login-forgot" onClick={() => toast.info("Em breve. Fale conosco no WhatsApp.")}>Esqueci minha senha</button>
              </div>
              <div className="relative mt-1.5">
                <input
                  type={show ? "text" : "password"} required data-testid="login-password-input"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-4 pr-11 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  placeholder="••••••••"
                />
                <button type="button" data-testid="login-toggle-show" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2 dark:bg-rose-950/30 dark:border-rose-900/40" data-testid="login-error">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} data-testid="login-submit-btn" className="ys-btn-primary w-full h-11 rounded-xl font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? "Entrando…" : (<>Entrar <ArrowRight className="h-4 w-4" /></>)}
            </button>

            <div className="relative py-2">
              <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
              <div className="relative bg-background w-fit mx-auto px-3 text-xs text-muted-foreground">ou</div>
            </div>

            <button type="button" onClick={() => { const redirectUrl = window.location.origin + "/auth/callback"; window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`; }} data-testid="login-google-btn" className="w-full h-11 rounded-xl border border-border hover:bg-accent text-sm font-medium">
              Continuar com Google
            </button>
            <button type="button" onClick={() => toast.info("Sign in with Apple exige suas credenciais Apple Developer (Team ID, Key ID e arquivo .p8). Nos envie por WhatsApp que ativamos em minutos.")} data-testid="login-apple-btn" className="w-full h-11 rounded-xl border border-border hover:bg-accent text-sm font-medium">
              Continuar com Apple
            </button>
          </form>

          <div className="mt-8 text-sm text-muted-foreground text-center">
            Não tem conta?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline" data-testid="login-to-register">
              Criar conta
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
