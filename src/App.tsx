import React, { useState, useEffect, useMemo } from 'react';
import { User, Ticket, TicketStatus, TicketPriority, TicketCategory } from './types';
import { getSavedUser, saveUserSession, clearUserSession } from './lib/auth';
import {
  fetchAllTickets,
  createNewTicket,
  updateExistingTicket,
  deleteTicketById,
  getStoredSupabaseConfig,
} from './lib/supabase';
import { Header } from './components/Header';
import { LoginForm } from './components/LoginForm';
import { StatsCards } from './components/StatsCards';
import { FilterBar } from './components/FilterBar';
import { ChamadoCard } from './components/ChamadoCard';
import { NovoChamadoModal } from './components/NovoChamadoModal';
import { EncerrarChamadoModal } from './components/EncerrarChamadoModal';
import { ChamadoDetalhesModal } from './components/ChamadoDetalhesModal';
import { SupabaseModal } from './components/SupabaseModal';
import {
  Wrench,
  Plus,
  RefreshCw,
  Inbox,
  CheckCircle2,
  AlertCircle,
  Database,
  Search,
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [selectedPriority, setSelectedPriority] = useState<string>('Todas');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals state
  const [isNovoModalOpen, setIsNovoModalOpen] = useState(false);
  const [isEncerrarModalOpen, setIsEncerrarModalOpen] = useState(false);
  const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Auto-login from storage on mount
  useEffect(() => {
    const saved = getSavedUser();
    if (saved) {
      setCurrentUser(saved);
    }
    const config = getStoredSupabaseConfig();
    setIsSupabaseConnected(config.isConfigured);
  }, []);

  // Show Toast notification helper
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Load tickets function
  const loadTickets = async () => {
    setIsRefreshing(true);
    const res = await fetchAllTickets();
    setTickets(res.tickets);
    setIsSupabaseConnected(res.isFromSupabase);
    setIsRefreshing(false);
    setLoadingTickets(false);

    if (res.error) {
      console.warn('Notice from Supabase load:', res.error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadTickets();
    }
  }, [currentUser]);

  // Login handler
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    saveUserSession(user);
    showToast(`Bem-vindo, ${user.nome}! Acesso como ${user.role.toUpperCase()} concedido.`, 'info');
  };

  // Logout handler
  const handleLogout = () => {
    clearUserSession();
    setCurrentUser(null);
    showToast('Você saiu do sistema.', 'info');
  };

  // Create new ticket handler (Operator)
  const handleCreateTicket = async (ticketData: {
    titulo: string;
    equipamento: string;
    setor: string;
    prioridade: TicketPriority;
    categoria: TicketCategory;
    descricao: string;
    operador_nome: string;
    operador_id: string;
  }) => {
    const res = await createNewTicket(ticketData);
    setTickets((prev) => [res.ticket, ...prev]);
    showToast(
      `Chamado ${res.ticket.codigo} criado com sucesso! ${
        res.isFromSupabase ? '(Salvo no Supabase)' : '(Salvo em Modo Local)'
      }`,
      'success'
    );
  };

  // Start Service Handler (Mechanic)
  const handleStartService = async (ticket: Ticket) => {
    if (!currentUser) return;
    const nowISO = new Date().toISOString();
    const updated: Ticket = {
      ...ticket,
      status: 'Em Andamento',
      mecanico_nome: currentUser.nome,
      mecanico_id: currentUser.id,
      data_inicio: ticket.data_inicio || nowISO,
    };

    const res = await updateExistingTicket(updated);
    setTickets((prev) => prev.map((t) => (t.id === ticket.id ? updated : t)));
    showToast(`Atendimento iniciado para o chamado ${ticket.codigo}!`, 'info');
  };

  // Update/Close ticket handler (Mechanic)
  const handleUpdateTicket = async (updatedTicket: Ticket) => {
    const res = await updateExistingTicket(updatedTicket);
    setTickets((prev) => prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)));
    showToast(
      `Chamado ${updatedTicket.codigo} atualizado para "${updatedTicket.status}"!`,
      'success'
    );
  };

  // Delete ticket handler
  const handleDeleteTicket = async (ticketId: string) => {
    await deleteTicketById(ticketId);
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    showToast('Chamado excluído com sucesso.', 'info');
  };

  // Filtered tickets calculation
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesTitle = t.titulo.toLowerCase().includes(term);
        const matchesEquip = t.equipamento.toLowerCase().includes(term);
        const matchesSetor = t.setor.toLowerCase().includes(term);
        const matchesCode = (t.codigo || '').toLowerCase().includes(term);
        const matchesOp = t.operador_nome.toLowerCase().includes(term);
        const matchesMec = (t.mecanico_nome || '').toLowerCase().includes(term);

        if (!matchesTitle && !matchesEquip && !matchesSetor && !matchesCode && !matchesOp && !matchesMec) {
          return false;
        }
      }

      // Status
      if (selectedStatus !== 'Todos' && t.status !== selectedStatus) {
        return false;
      }

      // Priority
      if (selectedPriority !== 'Todas' && t.prioridade !== selectedPriority) {
        return false;
      }

      // Category
      if (selectedCategory !== 'Todas' && t.categoria !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [tickets, searchTerm, selectedStatus, selectedPriority, selectedCategory]);

  // If not authenticated, render Login Form
  if (!currentUser) {
    return (
      <>
        <LoginForm
          onLoginSuccess={handleLoginSuccess}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          isSupabaseConnected={isSupabaseConnected}
        />
        <SupabaseModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
          onSaved={() => {
            const config = getStoredSupabaseConfig();
            setIsSupabaseConnected(config.isConfigured);
          }}
        />
      </>
    );
  }

  const isOperador = currentUser.role === 'operador';
  const isMecanico = currentUser.role === 'mecanico';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center space-x-2.5 ${
              toast.type === 'success'
                ? 'bg-emerald-950 border-emerald-500/40 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-950 border-rose-500/40 text-rose-200'
                : 'bg-blue-950 border-blue-500/40 text-blue-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        user={currentUser}
        onLogout={handleLogout}
        isSupabaseConnected={isSupabaseConnected}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onRefreshData={loadTickets}
        isRefreshing={isRefreshing}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Stats Cards */}
        <StatsCards
          tickets={tickets}
          activeStatusFilter={selectedStatus}
          onSelectStatusFilter={(status) => setSelectedStatus(status)}
        />

        {/* Filter and Action Bar */}
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          selectedPriority={selectedPriority}
          onPriorityChange={setSelectedPriority}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenNovoChamado={() => setIsNovoModalOpen(true)}
          isOperador={isOperador}
        />

        {/* Content List / Grid */}
        {loadingTickets ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Carregando chamados do sistema...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-16 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-4 p-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
              <Inbox className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Nenhum chamado encontrado</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                Não existem chamados cadastrados para os filtros selecionados ou ainda nenhum chamado foi aberto.
              </p>
            </div>
            {isOperador && (
              <button
                onClick={() => setIsNovoModalOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs inline-flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Abrir Novo Chamado Agora</span>
              </button>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-3'
            }
          >
            {filteredTickets.map((ticket) => (
              <ChamadoCard
                key={ticket.id}
                ticket={ticket}
                userRole={currentUser.role}
                viewMode={viewMode}
                onViewDetails={(t) => {
                  setSelectedTicket(t);
                  setIsDetalhesModalOpen(true);
                }}
                onStartService={handleStartService}
                onCloseTicket={(t) => {
                  setSelectedTicket(t);
                  setIsEncerrarModalOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500 space-y-1">
        <p>SIGMA — Sistema de Gestão de Chamados de Manutenção Industrial</p>
        <p className="text-[11px] text-slate-600">
          Credenciais: Operador (operador / operador123) | Mecânico (mecanico / mecanico123)
        </p>
      </footer>

      {/* Modals */}
      <NovoChamadoModal
        isOpen={isNovoModalOpen}
        onClose={() => setIsNovoModalOpen(false)}
        onSubmit={handleCreateTicket}
        user={currentUser}
      />

      <EncerrarChamadoModal
        isOpen={isEncerrarModalOpen}
        onClose={() => {
          setIsEncerrarModalOpen(false);
          setSelectedTicket(null);
        }}
        ticket={selectedTicket}
        onSubmit={handleUpdateTicket}
        user={currentUser}
      />

      <ChamadoDetalhesModal
        isOpen={isDetalhesModalOpen}
        onClose={() => {
          setIsDetalhesModalOpen(false);
          setSelectedTicket(null);
        }}
        ticket={selectedTicket}
        currentUser={currentUser}
        onStartService={handleStartService}
        onCloseTicket={(t) => {
          setIsDetalhesModalOpen(false);
          setSelectedTicket(t);
          setIsEncerrarModalOpen(true);
        }}
        onDeleteTicket={handleDeleteTicket}
      />

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onSaved={loadTickets}
      />
    </div>
  );
}
