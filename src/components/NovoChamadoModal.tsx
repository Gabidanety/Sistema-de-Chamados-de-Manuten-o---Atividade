import React, { useState } from 'react';
import { User, TicketPriority, TicketCategory } from '../types';
import { X, PlusCircle, AlertOctagon, Wrench, Building2, AlignLeft, CheckCircle2 } from 'lucide-react';

interface NovoChamadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticketData: {
    titulo: string;
    equipamento: string;
    setor: string;
    prioridade: TicketPriority;
    categoria: TicketCategory;
    descricao: string;
    operador_nome: string;
    operador_id: string;
  }) => Promise<void>;
  user: User;
}

export const NovoChamadoModal: React.FC<NovoChamadoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
}) => {
  const [titulo, setTitulo] = useState('');
  const [equipamento, setEquipamento] = useState('');
  const [setor, setSetor] = useState('Linha de Produção 1');
  const [prioridade, setPrioridade] = useState<TicketPriority>('Média');
  const [categoria, setCategoria] = useState<TicketCategory>('Mecânica');
  const [descricao, setDescricao] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !equipamento.trim() || !descricao.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        titulo: titulo.trim(),
        equipamento: equipamento.trim(),
        setor: setor.trim(),
        prioridade,
        categoria,
        descricao: descricao.trim(),
        operador_nome: user.nome,
        operador_id: user.id,
      });
      // Reset form
      setTitulo('');
      setEquipamento('');
      setDescricao('');
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error('Erro ao abrir chamado:', err);
      setIsSubmitting(false);
    }
  };

  const setoresOpcoes = [
    'Linha de Produção 1',
    'Linha de Produção 2',
    'Setor de Estamparia',
    'Usinagem de Precisão',
    'Célula de Caldeiraria / Solda',
    'Montagem Final',
    'Embalagem e Expedição',
    'Injeção Plástica',
    'Utilidades / Compressores',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Abertura de Chamado de Manutenção</h3>
              <p className="text-xs text-slate-400">Preencha as informações descritivas do problema observado</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Operator Info Readonly Banner */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-400">Operador Solicitante:</span>
            <span className="font-bold text-amber-300">{user.nome} ({user.cargo})</span>
          </div>

          {/* Title / Problem Summary */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
              Título / Resumo da Falha <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="ex: Ruído excessivo no motor principal"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Equipment & Sector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Equipamento / Máquina <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={equipamento}
                onChange={(e) => setEquipamento(e.target.value)}
                placeholder="ex: Torno CNC 02, Prensa 120T"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Setor / Localização
              </label>
              <select
                value={setor}
                onChange={(e) => setSetor(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {setoresOpcoes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Nível de Prioridade
              </label>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as TicketPriority)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-amber-300"
              >
                <option value="Baixa">Baixa (Pode aguardar)</option>
                <option value="Média">Média (Aparelho operando com restrição)</option>
                <option value="Alta">Alta (Risco de parada de linha)</option>
                <option value="Crítica">Crítica (Máquina totalmente parada)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Tipo / Categoria da Falha
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as TicketCategory)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Mecânica">Mecânica</option>
                <option value="Elétrica">Elétrica</option>
                <option value="Hidráulica">Hidráulica</option>
                <option value="Pneumática">Pneumática</option>
                <option value="Lubrificação">Lubrificação</option>
                <option value="Operacional">Operacional</option>
              </select>
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
              Descrição Detalhada do Problema <span className="text-amber-400">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva detalhadamente o sintoma, se houve vazamento, estalo, aquecimento, travamento, código de erro no painel, etc..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
            />
          </div>

          {/* Modal Actions */}
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
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Registrando...' : 'Confirmar e Abrir Chamado'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
