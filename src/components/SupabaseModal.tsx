import React, { useState, useEffect } from 'react';
import { getStoredSupabaseConfig, saveSupabaseConfig, getSupabaseClient } from '../lib/supabase';
import { X, Database, CheckCircle2, Copy, Terminal, ExternalLink, RefreshCw, AlertTriangle } from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const config = getStoredSupabaseConfig();
      setUrl(config.url);
      setKey(config.key);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sqlScript = `-- 1. Executar no Editor SQL do seu projeto no Supabase:
CREATE TABLE IF NOT EXISTS chamados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo VARCHAR(50),
  titulo VARCHAR(255) NOT NULL,
  equipamento VARCHAR(255) NOT NULL,
  setor VARCHAR(255) NOT NULL,
  prioridade VARCHAR(50) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  descricao TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Aberto',
  operador_nome VARCHAR(255) NOT NULL,
  operador_id VARCHAR(255),
  mecanico_nome VARCHAR(255),
  mecanico_id VARCHAR(255),
  descricao_solucao TEXT,
  pecas_utilizadas TEXT,
  tempo_manutencao VARCHAR(50),
  causa_raiz VARCHAR(255),
  data_abertura TIMESTAMPTZ DEFAULT NOW(),
  data_inicio TIMESTAMPTZ,
  data_encerramento TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar segurança e permissões públicas para testes:
ALTER TABLE chamados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir leitura e escrita publica em chamados" 
  ON chamados FOR ALL USING (true) WITH CHECK (true);
`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = () => {
    saveSupabaseConfig(url, key);
    onSaved();
    setTestResult({ success: true, message: 'Chaves salvas com sucesso!' });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    saveSupabaseConfig(url, key);
    
    const client = getSupabaseClient();
    if (!client) {
      setTesting(false);
      setTestResult({ success: false, message: 'URL ou Chave do Supabase inválida.' });
      return;
    }

    try {
      // Try querying the table
      const { error } = await client.from('chamados').select('id').limit(1);
      setTesting(false);

      if (error) {
        if (error.code === '42P01') {
          setTestResult({
            success: false,
            message: 'Conectado ao Supabase, porém a tabela "chamados" ainda não existe. Execute o script SQL abaixo!',
          });
        } else {
          setTestResult({ success: false, message: `Erro ao acessar Supabase: ${error.message}` });
        }
      } else {
        setTestResult({ success: true, message: 'Conexão estabelecida com sucesso com o Supabase!' });
        onSaved();
      }
    } catch (err: any) {
      setTesting(false);
      setTestResult({ success: false, message: `Erro inesperado: ${err?.message || err}` });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Conexão com Supabase</h3>
              <p className="text-xs text-slate-400">Insira suas chaves do Supabase ou configure via terminal</p>
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
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Instructions Option A: Terminal */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Terminal className="w-4 h-4" />
              <span>Opção 1: Inserir via Terminal / .env.example</span>
            </div>
            <p className="text-xs text-slate-300">
              Você pode adicionar no arquivo <code className="text-amber-300 font-mono">.env.example</code> do projeto:
            </p>
            <pre className="p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-emerald-300 border border-slate-800 overflow-x-auto">
{`VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
VITE_SUPABASE_ANON_KEY="sua-chave-anonima-aqui"`}
            </pre>
          </div>

          {/* Instructions Option B: Form Input */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Opção 2: Cole as chaves do Supabase direto aqui</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  SUPABASE URL (Project URL)
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://xyzxyz.supabase.co"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  SUPABASE ANON KEY (Public API Key)
                </label>
                <input
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center space-x-2 border ${
                  testResult.success
                    ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-950/60 border-amber-500/30 text-amber-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing || !url || !key}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 flex items-center space-x-1.5 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>Testar Conexão</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={!url || !key}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Salvar Chaves</span>
              </button>
            </div>
          </div>

          {/* SQL Script Box */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Script SQL para criar a tabela no Supabase
              </span>
              <button
                onClick={handleCopySql}
                className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 rounded-lg transition"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar SQL'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Copie e cole este código no <strong>SQL Editor</strong> do seu painel do Supabase para criar a estrutura automaticamente:
            </p>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48 leading-relaxed">
              {sqlScript}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 rounded-b-2xl flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
