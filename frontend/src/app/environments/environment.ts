declare global {
  interface Window {
    env?: {
      API_URL?: string;
    };
  }
}

export const environment = {
  production: false,
  get apiUrl(): string {
    if (typeof window !== 'undefined' && window.env?.API_URL && window.env.API_URL.trim()) {
      return window.env.API_URL.trim().replace(/\/+$/, '');
    }
    return 'http://localhost:8080';
  },
  oficina: {
    nome: 'Oficina do Joe',
    cidade: 'São Paulo, SP',
    telefone: '(11) 5181-8082',
    email: 'oficinadojoe@gmail.com',
    endereco: 'R. Laguna, 1128 - Jardim Caravelas, São Paulo - SP',
    horario: 'Segunda a sexta, das 8h às 17h · agendamento online e atendimento presencial.',
  },
  usuario: { nome: 'João Carlos', papel: 'Administrador' },
  auth: {
    admin: {
      email: 'admin@oficina.com',
      senha: 'admin123',
      nome: 'João Carlos',
    },
  },
};
