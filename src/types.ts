export type UserRole = 'operador' | 'mecanico' | 'admin';

export interface User {
  id: string;
  login: string;
  nome: string;
  role: UserRole;
  cargo: string;
}

export type TicketStatus = 'Aberto' | 'Em Andamento' | 'Aguardando Peça' | 'Encerrado';

export type TicketPriority = 'Baixa' | 'Média' | 'Alta' | 'Crítica';

export type TicketCategory = 'Mecânica' | 'Elétrica' | 'Hidráulica' | 'Pneumática' | 'Lubrificação' | 'Operacional';

export interface Ticket {
  id: string;
  codigo?: string; // e.g. #CHM-1001
  titulo: string;
  equipamento: string;
  setor: string;
  prioridade: TicketPriority;
  categoria: TicketCategory;
  descricao: string;
  status: TicketStatus;
  operador_nome: string;
  operador_id?: string;
  mecanico_nome?: string;
  mecanico_id?: string;
  descricao_solucao?: string;
  pecas_utilizadas?: string;
  tempo_manutencao?: string; // e.g. "1h 30min"
  causa_raiz?: string;
  data_abertura: string; // ISO date string
  data_inicio?: string;
  data_encerramento?: string;
}

export interface SupabaseConfig {
  url: string;
  key: string;
  isConnected: boolean;
}
