import React, { useState, useEffect } from 'react';
import { Ticket, User, TicketStatus } from '../types';
import { X, CheckCircle2, Wrench, PackageCheck, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

interface EncerrarChamadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  onSubmit: (updatedTicket: Ticket) => Promise<void>;
  user: User;
}

export const EncerrarChamadoModal: React.FC<EncerrarChamadoModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onSubmit,
  user,
}) => {
  const [descricaoSolucao, setDescricaoSolucao] = useState('');
  const [pecasUtilizadas, setPecasUtilizadas] = useState('');
  const [tempoManutencao, setTempoManutencao] = useState('1 hora');
  const [causaRaiz, setCausaRaiz] = useState('Desgaste natural');
  const [statusFinal, setStatusFinal] = useState<TicketStatus>('Encerrado');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (ticket) {
      setDescricaoSolucao(ticket.descricao_solucao || '');
      setPecasUtilizadas(ticket.pecas_utilizadas || '');
      setTempoManutencao(ticket.tempo_manutencao || '1 hora');
      setCausaRaiz(ticket.causa_raiz || 'Desgaste natural');
      setStatusFinal(ticket.status === 'Aguardando Peça' ? 'Aguardando Peça' : 'Encerrado');
    }
  }, [ticket]);

  if (!isOpen || !ticket) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricaoSolucao.trim()) return;

    setIsSubmitting(true);
    try {
      const nowISO = new Date().toISOString();
      const updated: Ticket = {
        ...ticket,
        status: statusFinal,
        mecanico_nome: user.nome,
        mecanico_id: user.id,
        descricao_solucao: descricaoSolucao.trim(),
        pecas_utilizadas: pecasUtilizadas.trim(),
        tempo_manutencao: tempoManutencao.trim(),
        causa_raiz: causaRaiz.trim(),
        data_inicio: ticket.data_inicio || nowISO,
        data_encerramento: statusFinal === 'Encerrado' ? nowISO : undefined,
      };

      await onSubmit(updated);
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error('Erro ao encerrar chamado:', err);
      setIsSubmitting(false);
    }
  };

  const causasOpcoes = [
    'Desgaste natural por tempo de uso',
    'Falha mecânica / fadiga de material',
    'Falta de lubrificação / contaminação',
    'Ajuste / folga de componente',
    'Falha operacional ou sobrecarga',
    'Umidade ou contaminação na linha pneumática/hidráulica',
    'Componente elétrico / queimado',
    'Outros / A investigar',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Encerramento de Chamado ({ticket.codigo || `#CHM-${ticket.id.slice(-4)}`})
              </h3>
              <p className="text-xs text-slate-400">Descreva as ações técnicas tomadas para sanar a falha</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Summary Card */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">{ticket.titulo}</span>
              <span className="text-amber-400 font-semibold">{ticket.equipamento} ({ticket.setor})</span>
            </div>
            <p className="text-slate-400 line-clamp-2 italic">"{ticket.descricao}"</p>
            <div className="text-[11px] text-slate-500 pt-1">
              Aberto por: <strong className="text-slate-300">{ticket.operador_nome}</strong>
            </div>
          </div>

          {/* Mechanic Badge */}
          <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-300">Mecânico Responsável:</span>
            <span className="font-bold text-emerald-300">{user.nome} ({user.cargo})</span>
          </div>

          {/* Solution Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
              Descrição da Solução / O que foi feito <span className="text-emerald-400">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={descricaoSolucao}
              onChange={(e) => setDescricaoSolucao(e.target.value)}
              placeholder="Descreva detalhadamente a intervenção realizada (ex: trocado rolamento, realizado reaperto de conexões hidráulicas, limpeza e regulagem de válvulas...)"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
            />
          </div>

          {/* Parts Used */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
              Peças / Componentes Substituídos ou Utilizados
            </label>
            <input
              type="text"
              value={pecasUtilizadas}
              onChange={(e) => setPecasUtilizadas(e.target.value)}
              placeholder="ex: 1x Rolamento 6205, 2L Óleo ISO VG 68, Filtro de Sucção"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Maintenance Time & Root Cause */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Tempo de Manutenção / Intervenção
              </label>
              <input
                type="text"
                value={tempoManutencao}
                onChange={(e) => setTempoManutencao(e.target.value)}
                placeholder="ex: 45 min, 2 horas"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Causa Raiz Identificada
              </label>
              <select
                value={causaRaiz}
                onChange={(e) => setCausaRaiz(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {causasOpcoes.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Final Choice */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
              Status do Chamado após Intervenção
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatusFinal('Encerrado')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer ${
                  statusFinal === 'Encerrado'
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/50'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Encerrar (Solucionado)</span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFinal('Aguardando Peça')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer ${
                  statusFinal === 'Aguardando Peça'
                    ? 'bg-purple-950 border-purple-500 text-purple-300 ring-2 ring-purple-500/50'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <PackageCheck className="w-4 h-4 text-purple-400" />
                <span>Aguardando Peça</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Salvando...' : 'Salvar e Finalizar Intervenção'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
