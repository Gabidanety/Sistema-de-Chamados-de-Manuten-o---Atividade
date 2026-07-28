import React from 'react';
import { User } from '../types';
import { Wrench, UserCheck, LogOut, Database, Shield, Cpu, RefreshCw } from 'lucide-react';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  isSupabaseConnected: boolean;
  onOpenSupabaseModal: () => void;
  onRefreshData: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  isSupabaseConnected,
  onOpenSupabaseModal,
  onRefreshData,
  isRefreshing = false,
}) => {
  const isOperador = user.role === 'operador';

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Wrench className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg text-slate-100 tracking-tight">SIGMA</h1>
              <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-semibold">
                Manutenção
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Sistema de Chamados Industrial</p>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center space-x-3">
          {/* Refresh Button */}
          <button
            onClick={onRefreshData}
            title="Atualizar dados"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          {/* Supabase Status Indicator */}
          <button
            onClick={onOpenSupabaseModal}
            className={`flex items-center space-x-2 text-xs px-2.5 py-1.5 rounded-lg border transition ${
              isSupabaseConnected
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/50'
                : 'bg-amber-950/40 border-amber-500/30 text-amber-300 hover:bg-amber-900/50'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {isSupabaseConnected ? 'Supabase Conectado' : 'Modo Local (Supabase Próximo)'}
            </span>
            <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          </button>

          {/* User Badge */}
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
              isOperador 
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                : 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
            }`}>
              {isOperador ? <UserCheck className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
            </div>
            <div className="hidden lg:block text-left text-xs">
              <div className="font-semibold text-slate-200">{user.nome}</div>
              <div className="flex items-center space-x-1 text-slate-400">
                <Shield className="w-3 h-3 text-amber-400" />
                <span className="capitalize font-medium text-[11px] text-amber-300">
                  {isOperador ? 'Operador' : 'Mecânico'}
                </span>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            title="Sair do sistema"
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-rose-900/40 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 rounded-lg transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
};
