import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/app/ProtectedRoute";
import AppShell from "@/components/app/AppShell";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import PendingApproval from "@/pages/PendingApproval";
import MasterPanel from "@/pages/MasterPanel";
import Dashboard from "@/pages/Dashboard";
import TransactionsPage from "@/pages/TransactionsPage";
import ComingSoon from "@/pages/ComingSoon";

function Shell({ children }) { return <AppShell>{children}</AppShell>; }

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors closeButton />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pending-approval" element={
            <ProtectedRoute><PendingApproval /></ProtectedRoute>
          } />

          <Route path="/master" element={
            <ProtectedRoute admin><MasterPanel /></ProtectedRoute>
          } />

          <Route path="/app/dashboard" element={<ProtectedRoute><Shell><Dashboard /></Shell></ProtectedRoute>} />
          <Route path="/app/financial" element={<ProtectedRoute><Shell><TransactionsPage type="all" title="Visão Financeira" subtitle="Todos os seus lançamentos em um só lugar." /></Shell></ProtectedRoute>} />
          <Route path="/app/revenues" element={<ProtectedRoute><Shell><TransactionsPage type="receita" title="Receitas" subtitle="Cadastre e acompanhe todas as entradas da sua empresa." /></Shell></ProtectedRoute>} />
          <Route path="/app/expenses" element={<ProtectedRoute><Shell><TransactionsPage type="despesa" title="Despesas" subtitle="Registre saídas e categorize os gastos por fornecedor, tipo e status." /></Shell></ProtectedRoute>} />
          <Route path="/app/cashflow" element={<ProtectedRoute><Shell><TransactionsPage type="all" title="Fluxo de Caixa" subtitle="Entradas e saídas em ordem cronológica." /></Shell></ProtectedRoute>} />

          {["banks","pix","cards","clients","suppliers","products","stock","employees","agenda","ai","reports","settings","support"].map((p) => (
            <Route key={p} path={`/app/${p}`} element={
              <ProtectedRoute><Shell><ComingSoon title={{
                banks:"Bancos", pix:"PIX", cards:"Cartões", clients:"Clientes", suppliers:"Fornecedores",
                products:"Produtos", stock:"Estoque", employees:"Funcionários", agenda:"Agenda",
                ai:"IA Financeira", reports:"Relatórios", settings:"Configurações", support:"Ajuda & Suporte",
              }[p]} /></Shell></ProtectedRoute>
            } />
          ))}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
