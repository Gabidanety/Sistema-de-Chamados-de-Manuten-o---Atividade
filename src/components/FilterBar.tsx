import React from 'react';
import { Search, Filter, LayoutGrid, List, Plus, X } from 'lucide-react';
import { TicketPriority, TicketCategory } from '../types';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedPriority: string;
  onPriorityChange: (pri: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onOpenNovoChamado: () => void;
  isOperador: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedPriority,
  onPriorityChange,
  selectedCategory,
  onCategoryChange,
  viewMode,
  onViewModeChange,
  onOpenNovoChamado,
  isOperador,
}) => {
  const priorities: (TicketPriority | 'Todas')[] = ['Todas', 'Crítica', 'Alta', 'Média', 'Baixa'];
  const categories: (TicketCategory | 'Todas')[] = [
    'Todas',
    'Mecânica',
    'Elétrica',
    'Hidráulica',
    'Pneumática',
    'Lubrificação',
    'Operacional',
  ];

  const hasActiveFilters = searchTerm || selectedStatus !== 'Todos' || selectedPriority !== 'Todas' || selectedCategory !== 'Todas';

  const clearFilters = () => {
    onSearchChange('');
    onStatusChange('Todos');
    onPriorityChange('Todas');
    onCategoryChange('Todas');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-lg">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por #código, equipamento, setor, título ou operador..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Priority & Category Selects */}
        <div className="flex items-center space-x-2">
          {/* Priority */}
          <select
            value={selectedPriority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="Todas">Prioridade: Todas</option>
            {priorities.filter(p => p !== 'Todas').map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="Todas">Categoria: Todas</option>
            {categories.filter(c => c !== 'Todas').map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-950 border border-slate-700/80 rounded-xl p-0.5">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-slate-800 text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Visualização em Grade"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'list' ? 'bg-slate-800 text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Visualização em Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Open Ticket Button (Special action for Operador) */}
          {isOperador && (
            <button
              onClick={onOpenNovoChamado}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 transition cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Abrir Chamado</span>
            </button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>Filtros ativos aplicados</span>
          </div>
          <button
            onClick={clearFilters}
            className="text-amber-400 hover:underline font-medium text-xs flex items-center space-x-1"
          >
            <span>Limpar Filtros</span>
          </button>
        </div>
      )}
    </div>
  );
};
