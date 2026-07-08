import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Wallet, TrendingUp, TrendingDown, ArrowLeftRight,
  Landmark, Zap, CreditCard, Users, Truck, Package, Boxes, UserSquare2,
  CalendarDays, FileBarChart, Settings, LifeBuoy, Sparkles, LogOut, Menu, X, ShieldCheck,
} from "lucide-react";
import { LogoLockup, LogoMark } from "./Logo";
import { useAuth } from "@/context/AuthContext";

const groups = [
  {
    label: "Principal",
    items: [
      { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard, testid: "nav-dashboard" },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { to: "/app/financial", label: "Visão Financeira", icon: Wallet, testid: "nav-financial" },
      { to: "/app/revenues", label: "Receitas", icon: TrendingUp, testid: "nav-revenues" },
      { to: "/app/expenses", label: "Despesas", icon: TrendingDown, testid: "nav-expenses" },
      { to: "/app/cashflow", label: "Fluxo de Caixa", icon: ArrowLeftRight, testid: "nav-cashflow" },
      { to: "/app/banks", label: "Bancos", icon: Landmark, testid: "nav-banks", soon: true },
      { to: "/app/pix", label: "PIX", icon: Zap, testid: "nav-pix", soon: true },
      { to: "/app/cards", label: "Cartões", icon: CreditCard, testid: "nav-cards", soon: true },
    ],
  },
  {
    label: "Gestão",
    items: [
      { to: "/app/clients", label: "Clientes", icon: Users, testid: "nav-clients", soon: true },
      { to: "/app/suppliers", label: "Fornecedores", icon: Truck, testid: "nav-suppliers", soon: true },
      { to: "/app/products", label: "Produtos", icon: Package, testid: "nav-products", soon: true },
      { to: "/app/stock", label: "Estoque", icon: Boxes, testid: "nav-stock", soon: true },
      { to: "/app/employees", label: "Funcionários", icon: UserSquare2, testid: "nav-employees", soon: true },
      { to: "/app/agenda", label: "Agenda", icon: CalendarDays, testid: "nav-agenda", soon: true },
    ],
  },
  {
    label: "Inteligência",
    items: [
      { to: "/app/ai", label: "IA Financeira", icon: Sparkles, testid: "nav-ai", soon: true },
      { to: "/app/reports", label: "Relatórios", icon: FileBarChart, testid: "nav-reports", soon: true },
    ],
  },
  {
    label: "Sistema",
    items: [
      { to: "/app/settings", label: "Configurações", icon: Settings, testid: "nav-settings", soon: true },
      { to: "/app/support", label: "Ajuda & Suporte", icon: LifeBuoy, testid: "nav-support", soon: true },
    ],
  },
];

function SidebarInner({ onClose }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-6 h-[68px] border-b border-border">
        <NavLink to="/app/dashboard" onClick={onClose} data-testid="sidebar-logo">
          <LogoLockup />
        </NavLink>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2" data-testid="sidebar-close">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto ys-scrollbar px-3 py-4 space-y-6">
        {user?.role === "admin" && (
          <NavLink
            to="/master"
            data-testid="nav-master"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground hover:bg-accent"
              }`
            }
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Painel Master</span>
          </NavLink>
        )}
        {groups.map((g) => (
          <div key={g.label}>
            <div className="px-3 pb-2 text-[11px] tracking-[0.14em] uppercase font-semibold text-muted-foreground">
              {g.label}
            </div>
            <div className="space-y-1">
              {g.items.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  data-testid={it.testid}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                      isActive
                        ? "bg-accent text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                    }`
                  }
                >
                  <span className="flex items-center gap-3">
                    <it.icon className="h-4 w-4" />
                    {it.label}
                  </span>
                  {it.soon && (
                    <span className="text-[10px] tracking-wider uppercase text-muted-foreground/70 border border-border rounded-md px-1.5 py-0.5">
                      em breve
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary grid place-items-center font-semibold">
            {(user?.name || "?")[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate" data-testid="sidebar-user-name">{user?.name}</div>
            <div className="text-xs text-muted-foreground truncate">{user?.company}</div>
          </div>
          <button
            onClick={async () => { await logout(); nav("/login"); }}
            className="p-2 rounded-lg hover:bg-accent"
            data-testid="sidebar-logout"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppShell({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden lg:flex w-[280px] border-r border-border bg-card sticky top-0 h-screen">
        <SidebarInner />
      </aside>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="fixed left-0 top-0 h-screen w-[280px] bg-card border-r border-border z-50 lg:hidden"
            >
              <SidebarInner onClose={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <main className="flex-1 min-w-0">
        <header className="ys-glass sticky top-0 z-30 h-[68px] flex items-center px-4 md:px-8 lg:px-10">
          <button
            className="lg:hidden mr-3 p-2 rounded-lg border border-border"
            onClick={() => setOpen(true)}
            data-testid="open-sidebar-btn"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="lg:hidden"><LogoMark size={28} /></div>
          <div className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
            <span className="hidden sm:inline">Controle inteligente. Crescimento sem limites.</span>
          </div>
        </header>
        <div className="p-4 md:p-8 lg:p-10">{children}</div>
      </main>
    </div>
  );
}
