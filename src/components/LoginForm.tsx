import React, { useState } from 'react';
import { authenticateUser, PREDEFINED_USERS } from '../lib/auth';
import { User } from '../types';
import { Wrench, Shield, KeyRound, UserCheck, ArrowRight, Eye, EyeOff, AlertCircle, Database } from 'lucide-react';

interface LoginFormProps {
  onLoginSuccess: (user: User) => void;
  onOpenSupabaseModal: () => void;
  isSupabaseConnected: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
  onOpenSupabaseModal,
  isSupabaseConnected,
}) => {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!login.trim()) {
      setError('Por favor informe o nome de usuário.');
      return;
    }
    if (!senha) {
      setError('Por favor informe a senha.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = authenticateUser(login, senha);
      setLoading(false);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.message || 'Credenciais inválidas.');
      }
    }, 300);
  };

  const handleQuickLogin = (role: 'operador' | 'mecanico') => {
    const cred = PREDEFINED_USERS[role];
    if (cred) {
      setLogin(cred.user.login);
      setSenha(cred.passwordHash);
      setError(null);
      onLoginSuccess(cred.user);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-slate-950 shadow-xl shadow-amber-500/20 mb-4">
            <Wrench className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Chamados de Manutenção
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Acesso restrito para Operadores e Mecânicos de Manutenção
          </p>
        </div>

        {/* Supabase Status Banner */}
        <div className="mt-6">
          <button
            onClick={onOpenSupabaseModal}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs border transition ${
              isSupabaseConnected
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40'
                : 'bg-amber-950/40 border-amber-500/30 text-amber-300 hover:bg-amber-900/40'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>
                {isSupabaseConnected
                  ? 'Supabase Ativo (Banco de dados em nuvem)'
                  : 'Supabase não configurado (Clique para configurar chaves)'}
              </span>
            </div>
            <span className="font-semibold underline">Configurar</span>
          </button>
        </div>

        {/* Form Card */}
        <div className="mt-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 p-3.5 bg-rose-950/50 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Usuário / Login
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Shield className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="ex: operador ou mecanico"
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Senha
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition text-sm cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Acessando...' : 'Entrar no Sistema'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Credential Buttons Requested by User */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="text-center text-xs font-medium text-slate-400 mb-3">
              Acesso Rápido de Teste (Credenciais Solicitadas):
            </p>
            
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('operador')}
                className="flex items-center justify-between p-3 bg-blue-950/30 hover:bg-blue-900/40 border border-blue-500/30 hover:border-blue-500/60 rounded-xl text-left transition group cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-blue-300 group-hover:text-blue-200">
                    Operador
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    operador / operador123
                  </div>
                </div>
                <UserCheck className="w-4 h-4 text-blue-400 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('mecanico')}
                className="flex items-center justify-between p-3 bg-amber-950/30 hover:bg-amber-900/40 border border-amber-500/30 hover:border-amber-500/60 rounded-xl text-left transition group cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-amber-300 group-hover:text-amber-200">
                    Mecânico
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    mecanico / mecanico123
                  </div>
                </div>
                <Wrench className="w-4 h-4 text-amber-400 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
