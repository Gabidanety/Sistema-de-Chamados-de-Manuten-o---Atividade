import React from 'react';
import { Ticket, UserRole } from '../types';
import {
  Wrench,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  PackageCheck,
  ChevronRight,
  Building2,
  Calendar,
  Activity,
  ArrowUpRight,
  Flame,
} from 'lucide-react';

interface ChamadoCardProps {
  ticket: Ticket;
  userRole: UserRole;
  onViewDetails: (ticket: Ticket) => void;
  onStartService?: (ticket: Ticket) => void;
  onCloseTicket?: (ticket: Ticket) => void;
  viewMode?: 'grid' | 'list';
}

export const ChamadoCard: React.FC<ChamadoCardProps> = ({
  ticket,
  userRole,
  onViewDetails,
  onStartService,
  onCloseTicket,
  viewMode = 'grid',
}) => {
  const isOperador = userRole === 'operador';
  const isMecanico = userRole === 'mecanico';

  // Priority color config
  const getPriorityBadge = (pri: Ticket['prioridade']) => {
    switch (pri) {
      case 'Crítica':
        return {
          bg: 'bg-rose-950/60 text-rose-300 border-rose-500/40',
          dot: 'bg-rose-500',
          icon: Flame,
        };
      case 'Alta':
        return {
          bg: 'bg-orange-950/60 text-orange-300 border-orange-500/40',
          dot: 'bg-orange-500',
          icon: AlertTriangle,
        };
      case 'Média':
        return {
          bg: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-500',
          icon: Activity,
        };
      case 'Baixa':
      default:
        return {
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          dot: 'bg-slate-400',
          icon: Activity,
        };
    }
  };

  // Status badge config
  const getStatusBadge = (status: Ticket['status']) => {
    switch (status) {
      case 'Aberto':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          icon: Clock,
          label: 'Aberto (Pendente)',
        };
      case 'Em Andamento':
        return {
          bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          icon: Wrench,
          label: 'Em Atendimento',
        };
      case 'Aguardando Peça':
        return {
          bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          icon: PackageCheck,
          label: 'Aguardando Peça',
        };
      case 'Encerrado':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: CheckCircle2,
          label: 'Encerrado / Solucionado',
        };
    }
  };

  const priorityConfig = getPriorityBadge(ticket.prioridade);
  const statusConfig = getStatusBadge(ticket.status);
  const StatusIcon = statusConfig.icon;
  const PriorityIcon = priorityConfig.icon;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition shadow-md group">
        <div className="flex items-start space-x-3.5 flex-1 min-w-0">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 shrink-0 mt-0.5">
            <Wrench className="w-5 h-5" />
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-400">
                {ticket.codigo || `#CHM-${ticket.id.slice(-4)}`}
              </span>
              <h3 className="text-sm font-bold text-white truncate">{ticket.titulo}</h3>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border flex items-center space-x-1 ${statusConfig.bg}`}>
                <StatusIcon className="w-3 h-3" />
                <span>{statusConfig.label}</span>
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border flex items-center space-x-1 ${priorityConfig.bg}`}>
                <PriorityIcon className="w-3 h-3" />
                <span>{ticket.prioridade}</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
              <span className="flex items-center space-x-1 text-slate-300">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span><strong>Equipamento:</strong> {ticket.equipamento} ({ticket.setor})</span>
              </span>
              <span className="flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Op: {ticket.operador_nome}</span>
              </span>
              <span className="flex items-center space-x-1 text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(ticket.data_abertura)}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800 justify-end">
          {/* Mechanic Actions */}
          {isMecanico && ticket.status === 'Aberto' && onStartService && (
            <button
              onClick={() => onStartService(ticket)}
              className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-bold transition flex items-center space-x-1"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Iniciar Atendimento</span>
            </button>
          )}

          {isMecanico && (ticket.status === 'Em Andamento' || ticket.status === 'Aguardando Peça') && onCloseTicket && (
            <button
              onClick={() => onCloseTicket(ticket)}
              className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold transition flex items-center space-x-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Encerra Chamado</span>
            </button>
          )}

          <button
            onClick={() => onViewDetails(ticket)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition flex items-center space-x-1"
          >
            <span>Ver Detalhes</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-xl hover:-translate-y-0.5 group">
      {/* Top Bar: Code, Priority & Status */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
            {ticket.codigo || `#CHM-${ticket.id.slice(-4)}`}
          </span>

          <div className="flex items-center space-x-1.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center space-x-1 ${priorityConfig.bg}`}>
              <PriorityIcon className="w-3 h-3" />
              <span>{ticket.prioridade}</span>
            </span>
          </div>
        </div>

        {/* Title & Equipment */}
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition line-clamp-1">
            {ticket.titulo}
          </h3>
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-1">
            <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="font-semibold text-slate-300 truncate">{ticket.equipamento}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 truncate">{ticket.setor}</span>
          </div>
        </div>
      </div>

      {/* Problem Description Snippet */}
      <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
          {ticket.descricao}
        </p>
      </div>

      {/* Metadata & Status Badge */}
      <div className="space-y-2.5 pt-1 border-t border-slate-800/80 text-xs">
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 ${statusConfig.bg}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{statusConfig.label}</span>
          </span>

          <span className="text-[11px] font-medium text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            {ticket.categoria}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <div className="flex items-center space-x-1 truncate">
            <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">Op: <strong>{ticket.operador_nome}</strong></span>
          </div>
          {ticket.mecanico_nome && (
            <div className="flex items-center space-x-1 truncate text-amber-300">
              <Wrench className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">Mec: {ticket.mecanico_nome}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 flex items-center gap-2">
        {/* Mechanic Actions */}
        {isMecanico && ticket.status === 'Aberto' && onStartService && (
          <button
            onClick={() => onStartService(ticket)}
            className="flex-1 py-2 px-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Atender</span>
          </button>
        )}

        {isMecanico && (ticket.status === 'Em Andamento' || ticket.status === 'Aguardando Peça') && onCloseTicket && (
          <button
            onClick={() => onCloseTicket(ticket)}
            className="flex-1 py-2 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Encerrar</span>
          </button>
        )}

        <button
          onClick={() => onViewDetails(ticket)}
          className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer"
        >
          <span>Ver Detalhes</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
