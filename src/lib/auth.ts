import { User } from '../types';

export const PREDEFINED_USERS: Record<string, { user: User; passwordHash: string }> = {
  operador: {
    user: {
      id: 'usr-operador-01',
      login: 'operador',
      nome: 'João Silva (Operador)',
      role: 'operador',
      cargo: 'Operador de Produção',
    },
    passwordHash: 'operador123',
  },
  mecanico: {
    user: {
      id: 'usr-mecanico-01',
      login: 'mecanico',
      nome: 'Carlos Souza (Mecânico)',
      role: 'mecanico',
      cargo: 'Técnico de Manutenção Mecânica',
    },
    passwordHash: 'mecanico123',
  },
};

const STORAGE_KEY_AUTH = 'chamados_auth_user';

export function getSavedUser(): User | null {
  const data = localStorage.getItem(STORAGE_KEY_AUTH);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function saveUserSession(user: User) {
  localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
}

export function clearUserSession() {
  localStorage.removeItem(STORAGE_KEY_AUTH);
}

export function authenticateUser(loginInput: string, passwordInput: string): { success: boolean; user?: User; message?: string } {
  const normalizedLogin = loginInput.trim().toLowerCase();
  
  const found = PREDEFINED_USERS[normalizedLogin];
  if (!found) {
    return {
      success: false,
      message: 'Usuário não encontrado. Utilize "operador" ou "mecanico".',
    };
  }

  if (found.passwordHash !== passwordInput) {
    return {
      success: false,
      message: 'Senha incorreta.',
    };
  }

  return {
    success: true,
    user: found.user,
  };
}
