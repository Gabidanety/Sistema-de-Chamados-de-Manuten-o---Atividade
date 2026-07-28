import React from 'react';
import { Ticket } from '../types';
import { ClipboardList, AlertOctagon, Wrench, CheckCircle2, Clock, PackageCheck } from 'lucide-react';

interface StatsCardsProps {
  tickets: Ticket[];
  onSelectStatusFilter?: (status: string) => void;
  activeStatusFilter?: string;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  tickets,
  onSelectStatusFilter,
  activeStatusFilter = 'Todos',
}) => {
  const total = tickets.length;
  const abertos = tickets.filter((t) => t.status === 'Aberto').length;
  const emAndamento = tickets.filter((t) => t.status === 'Em Andamento').length;
  const aguardandoPeca = tickets.filter((t) => t.status === 'Aguardando Peça').length;
  const encerrados = tickets.filter((t) => t.status === 'Encerrado').length;
  const criticos = tickets.filter((t) => (t.prioridade === 'Crítica' || t.prioridade === 'Alta') && t.status !== 'Encerrado').length;

  const stats = [
    {
      id: 'Todos',
      label: 'Total de Chamados',
      count: total,
      icon: ClipboardList,
      color: 'text-slate-200',
      bgColor: 'bg-slate-800/80',
      borderColor: 'border-slate-700/60',
    },
    {
      id: 'Aberto',
      label: 'Chamados em Aberto',
      count: abertos,
      icon: AlertOctagon,
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/30',
      borderColor: 'border-amber-500/30',
      badge: abertos > 0 ? `${abertos} pendente${abertos > 1 ? 's' : ''}` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'Em Andamento',
      label: 'Em Atendimento',
      count: emAndamento,
      icon: Wrench,
      color: 'text-blue-400',
      bgColor: 'bg-blue-950/30',
      borderColor: 'border-blue-500/30',
    },
    {
      id: 'Aguardando Peça',
      label: 'Aguardando Peças',
      count: aguardandoPeca,
      icon: PackageCheck,
      color: 'text-purple-400',
      bgColor: 'bg-purple-950/30',
      borderColor: 'border-purple-500/30',
    },
    {
      id: 'Encerrado',
      label: 'Encerrados / Solucionados',
      count: encerrados,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/30',
      borderColor: 'border-emerald-500/30',
    },
  ];

  return (
    <div className="space-y-3">
      {criticos > 0 && (
        <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center justify-between shadow-sm animate-pulse">
          <div className="flex items-center space-x-2">
            <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>Atenção:</strong> Existem <strong>{criticos}</strong> chamado(s) com prioridade <strong>Alta ou Crítica</strong> aguardando resolução.
            </span>
          </div>
          <span className="text-[11px] font-mono uppercase bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 rounded font-bold">
            Prioridade
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isActive = activeStatusFilter === stat.id;

          return (
            <button
              key={stat.id}
              onClick={() => onSelectStatusFilter && onSelectStatusFilter(stat.id)}
              className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                stat.bgColor
              } ${stat.borderColor} ${
                isActive ? 'ring-2 ring-amber-500 scale-[1.02] shadow-lg' : 'hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 line-clamp-1">{stat.label}</span>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>

              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-white tracking-tight">{stat.count}</span>
                {stat.badge && (
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${stat.badgeColor}`}>
                    {stat.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
