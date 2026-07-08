import React from "react";
import { Construction } from "lucide-react";

export default function ComingSoon({ title = "Em breve" }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="ys-card p-10 text-center max-w-lg" data-testid="coming-soon">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 text-primary grid place-items-center">
          <Construction className="h-6 w-6" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 text-muted-foreground">
          Este módulo faz parte da <strong className="text-foreground">próxima fase</strong> do Your-Statistics.
          Vamos liberar em breve com a mesma qualidade do painel financeiro.
        </p>
      </div>
    </div>
  );
}
