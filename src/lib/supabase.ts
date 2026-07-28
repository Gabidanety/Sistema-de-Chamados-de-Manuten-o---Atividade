import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Ticket } from '../types';
import { INITIAL_TICKETS } from './initialData';

const STORAGE_KEY_TICKETS = 'chamados_manutencao_v1';
const STORAGE_KEY_SUPABASE_URL = 'supabase_config_url';
const STORAGE_KEY_SUPABASE_KEY = 'supabase_config_key';

// Check environment variables first, then localStorage overrides
export function getStoredSupabaseConfig() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || '';

  const localUrl = localStorage.getItem(STORAGE_KEY_SUPABASE_URL) || '';
  const localKey = localStorage.getItem(STORAGE_KEY_SUPABASE_KEY) || '';

  const url = localUrl || envUrl;
  const key = localKey || envKey;

  return {
    url,
    key,
    isConfigured: Boolean(url && key && url.startsWith('http')),
  };
}

export function saveSupabaseConfig(url: string, key: string) {
  if (url) localStorage.setItem(STORAGE_KEY_SUPABASE_URL, url.trim());
  else localStorage.removeItem(STORAGE_KEY_SUPABASE_URL);

  if (key) localStorage.setItem(STORAGE_KEY_SUPABASE_KEY, key.trim());
  else localStorage.removeItem(STORAGE_KEY_SUPABASE_KEY);

  // Re-initialize client
  initSupabaseClient();
}

let supabaseClient: SupabaseClient | null = null;

export function initSupabaseClient(): SupabaseClient | null {
  const { url, key, isConfigured } = getStoredSupabaseConfig();
  if (isConfigured) {
    try {
      supabaseClient = createClient(url, key);
      return supabaseClient;
    } catch (err) {
      console.error('Erro ao inicializar Supabase:', err);
      supabaseClient = null;
    }
  } else {
    supabaseClient = null;
  }
  return null;
}

// Initial client load
initSupabaseClient();

export function getSupabaseClient() {
  return supabaseClient;
}

// Local Storage helpers for fallback
function getLocalTickets(): Ticket[] {
  const data = localStorage.getItem(STORAGE_KEY_TICKETS);
  if (!data) {
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(INITIAL_TICKETS));
    return INITIAL_TICKETS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_TICKETS;
  }
}

function saveLocalTickets(tickets: Ticket[]) {
  localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(tickets));
}

// Unified Data API (Supabase or LocalStorage)
export async function fetchAllTickets(): Promise<{ tickets: Ticket[]; isFromSupabase: boolean; error?: string }> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client
        .from('chamados')
        .select('*')
        .order('data_abertura', { ascending: false });

      if (error) {
        console.warn('Supabase query error, falling back to local storage:', error.message);
        return { tickets: getLocalTickets(), isFromSupabase: false, error: error.message };
      }

      if (data && Array.isArray(data)) {
        // Format ticket codes if missing
        const formatted: Ticket[] = data.map((item, idx) => ({
          id: item.id,
          codigo: item.codigo || `#CHM-${1000 + idx + 1}`,
          titulo: item.titulo || 'Chamado de Manutenção',
          equipamento: item.equipamento || 'N/I',
          setor: item.setor || 'Geral',
          prioridade: item.prioridade || 'Média',
          categoria: item.categoria || 'Mecânica',
          descricao: item.descricao || '',
          status: item.status || 'Aberto',
          operador_nome: item.operador_nome || 'Operador',
          operador_id: item.operador_id,
          mecanico_nome: item.mecanico_nome,
          mecanico_id: item.mecanico_id,
          descricao_solucao: item.descricao_solucao,
          pecas_utilizadas: item.pecas_utilizadas,
          tempo_manutencao: item.tempo_manutencao,
          causa_raiz: item.causa_raiz,
          data_abertura: item.data_abertura || new Date().toISOString(),
          data_inicio: item.data_inicio,
          data_encerramento: item.data_encerramento,
        }));

        return { tickets: formatted, isFromSupabase: true };
      }
    } catch (err: any) {
      console.error('Erro de conexão Supabase:', err);
      return { tickets: getLocalTickets(), isFromSupabase: false, error: err?.message || 'Falha na conexão' };
    }
  }

  // Fallback to local storage
  return { tickets: getLocalTickets(), isFromSupabase: false };
}

export async function createNewTicket(newTicketData: Omit<Ticket, 'id' | 'codigo' | 'status' | 'data_abertura'>): Promise<{ ticket: Ticket; isFromSupabase: boolean }> {
  const id = 'chm-' + Date.now();
  const timestamp = new Date().toISOString();

  const ticket: Ticket = {
    ...newTicketData,
    id,
    codigo: `#CHM-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'Aberto',
    data_abertura: timestamp,
  };

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('chamados')
        .insert([
          {
            titulo: ticket.titulo,
            equipamento: ticket.equipamento,
            setor: ticket.setor,
            prioridade: ticket.prioridade,
            categoria: ticket.categoria,
            descricao: ticket.descricao,
            status: ticket.status,
            operador_nome: ticket.operador_nome,
            operador_id: ticket.operador_id,
            data_abertura: ticket.data_abertura,
          }
        ])
        .select()
        .single();

      if (!error && data) {
        const createdSupabaseTicket: Ticket = {
          ...ticket,
          id: data.id,
          codigo: data.codigo || ticket.codigo,
        };
        // Also update local cache for smooth fallback
        const local = getLocalTickets();
        saveLocalTickets([createdSupabaseTicket, ...local]);
        return { ticket: createdSupabaseTicket, isFromSupabase: true };
      } else {
        console.warn('Erro ao inserir no Supabase, salvando localmente:', error?.message);
      }
    } catch (e) {
      console.error('Erro Supabase insert:', e);
    }
  }

  // Local fallback
  const local = getLocalTickets();
  const updated = [ticket, ...local];
  saveLocalTickets(updated);
  return { ticket, isFromSupabase: false };
}

export async function updateExistingTicket(updatedTicket: Ticket): Promise<{ isFromSupabase: boolean }> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { error } = await client
        .from('chamados')
        .update({
          status: updatedTicket.status,
          mecanico_nome: updatedTicket.mecanico_nome,
          mecanico_id: updatedTicket.mecanico_id,
          descricao_solucao: updatedTicket.descricao_solucao,
          pecas_utilizadas: updatedTicket.pecas_utilizadas,
          tempo_manutencao: updatedTicket.tempo_manutencao,
          causa_raiz: updatedTicket.causa_raiz,
          data_inicio: updatedTicket.data_inicio,
          data_encerramento: updatedTicket.data_encerramento,
        })
        .eq('id', updatedTicket.id);

      if (!error) {
        // Also sync local
        const local = getLocalTickets();
        const newLocal = local.map(t => t.id === updatedTicket.id ? updatedTicket : t);
        saveLocalTickets(newLocal);
        return { isFromSupabase: true };
      }
    } catch (err) {
      console.error('Erro ao atualizar chamado no Supabase:', err);
    }
  }

  // Local fallback
  const local = getLocalTickets();
  const newLocal = local.map(t => t.id === updatedTicket.id ? updatedTicket : t);
  saveLocalTickets(newLocal);
  return { isFromSupabase: false };
}

export async function deleteTicketById(ticketId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('chamados').delete().eq('id', ticketId);
    } catch (e) {
      console.error('Erro ao excluir do Supabase:', e);
    }
  }

  const local = getLocalTickets();
  const newLocal = local.filter(t => t.id !== ticketId);
  saveLocalTickets(newLocal);
  return true;
}
