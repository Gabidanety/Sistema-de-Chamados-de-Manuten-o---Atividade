import React from 'react';
import { Ticket, User } from '../types';
import {
  X,
  Wrench,
  Clock,
  User as UserIcon,
  Building2,
  Calendar,
  CheckCircle2,
  PackageCheck,
  Flame,
  AlertTriangle,
  Activity,
  FileText,
  Trash2,
  Printer,
} from 'lucide-react';

interface ChamadoDetalhesModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  currentUser: User;
  onCloseTicket?: (ticket: Ticket) => void;
  onStartService?: (ticket: Ticket) => void;
  onDeleteTicket?: (ticketId: string) => void;
}

export const ChamadoDetalhesModal: React.FC<ChamadoDetalhesModalProps> = ({
  isOpen,
  onClose,
  ticket,
  currentUser,
  onCloseTicket,
  onStartService,
  onDeleteTicket,
}) => {
  if (!isOpen || !ticket) return null;

  const isMecanico = currentUser.role === 'mecanico';
  const isOperador = currentUser.role === 'operador';

  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl text-slate-100 my-8 print:bg-white print:text-black print:border-none print:shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 print:border-slate-300">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 print:bg-amber-100 print:text-amber-800">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 print:bg-amber-100 print:text-amber-900">
                  {ticket.codigo || `#CHM-${ticket.id.slice(-4)}`}
                </span>
                <span className="text-xs text-slate-400 print:text-slate-600 font-semibold">{ticket.status}</span>
              </div>
              <h3 className="text-base font-bold text-white print:text-black line-clamp-1">{ticket.titulo}</h3>
            </div>
          </div>

          <div className="flex items-center space-x-2 print:hidden">
            <button
              onClick={handlePrint}
              title="Imprimir ordem de serviço"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Machine & Location Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-950 border border-slate-800 rounded-xl print:bg-slate-50 print:border-slate-300 text-xs">
            <div>
              <span className="text-slate-500 block uppercase font-bold text-[10px]">Equipamento</span>
              <span className="font-bold text-slate-200 print:text-black">{ticket.equipamento}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-bold text-[10px]">Setor</span>
              <span className="font-semibold text-slate-300 print:text-black">{ticket.setor}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-bold text-[10px]">Prioridade</span>
              <span className="font-bold text-amber-400 print:text-amber-800">{ticket.prioridade}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-bold text-[10px]">Categoria</span>
              <span className="font-semibold text-slate-300 print:text-black">{ticket.categoria}</span>
            </div>
          </div>

          {/* Section 1: Problem Description by Operator */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>Descrição da Ocorrência (Abertura do Chamado)</span>
            </div>
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-200 leading-relaxed print:bg-white print:text-black">
              {ticket.descricao}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Operador Responsável: <strong className="text-slate-200">{ticket.operador_nome}</strong></span>
              <span>Aberto em: <strong className="text-slate-300">{formatDate(ticket.data_abertura)}</strong></span>
            </div>
          </div>

          {/* Section 2: Mechanic Intervention Report (If exists) */}
          {ticket.descricao_solucao ? (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Wrench className="w-4 h-4" />
                <span>Relatório Técnico de Manutenção</span>
              </div>

              <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-sm text-slate-100 space-y-3">
                <div>
                  <span className="text-xs font-bold text-emerald-400 block mb-1">Ações Realizadas / Solução:</span>
                  <p className="leading-relaxed text-slate-200">{ticket.descricao_solucao}</p>
                </div>

                {ticket.pecas_utilizadas && (
                  <div>
                    <span className="text-xs font-bold text-slate-400 block mb-0.5">Peças Utilizadas:</span>
                    <p className="text-xs text-amber-300 font-mono bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                      {ticket.pecas_utilizadas}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div>
                    <span className="text-slate-400 block">Tempo de Manutenção:</span>
                    <strong className="text-emerald-300">{ticket.tempo_manutencao || 'N/I'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Causa Raiz:</span>
                    <strong className="text-slate-200">{ticket.causa_raiz || 'N/I'}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Mecânico: <strong className="text-amber-300">{ticket.mecanico_nome || 'N/A'}</strong></span>
                <span>Encerrado em: <strong className="text-slate-300">{formatDate(ticket.data_encerramento)}</strong></span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl text-xs text-slate-400 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Aguardando atendimento e relatório técnico do Mecânico.</span>
              </div>
              {ticket.mecanico_nome && (
                <span className="text-amber-300 font-semibold">Mecânico Alocado: {ticket.mecanico_nome}</span>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <span className="font-bold text-slate-400 uppercase text-[11px] tracking-wider block">Histórico de Atendimento</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">1. Abertura</span>
                <span className="font-semibold text-slate-200">{formatDate(ticket.data_abertura)}</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">2. Início do Atendimento</span>
                <span className="font-semibold text-blue-300">{formatDate(ticket.data_inicio)}</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">3. Encerramento</span>
                <span className="font-semibold text-emerald-300">{formatDate(ticket.data_encerramento)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-950/80 border-t border-slate-800 rounded-b-2xl flex flex-wrap items-center justify-between gap-3 print:hidden">
          {onDeleteTicket && (
            <button
              onClick={() => {
                if (confirm('Deseja realmente excluir este chamado?')) {
                  onDeleteTicket(ticket.id);
                  onClose();
                }
              }}
              className="px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir Chamado</span>
            </button>
          )}

          <div className="flex items-center space-x-2 ml-auto">
            {isMecanico && ticket.status === 'Aberto' && onStartService && (
              <button
                onClick={() => {
                  onStartService(ticket);
                  onClose();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1 transition"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Iniciar Atendimento</span>
              </button>
            )}

            {isMecanico && (ticket.status === 'Em Andamento' || ticket.status === 'Aguardando Peça') && onCloseTicket && (
              <button
                onClick={() => {
                  onCloseTicket(ticket);
                  onClose();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1 transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Encerrar Chamado</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
