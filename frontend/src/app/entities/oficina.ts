export type StatusOS = 'Em diagnóstico' | 'Aguard. aprovação' | 'Em execução' | 'Pronto para retirada' | 'Concluída';

export const STATUS_LISTA: StatusOS[] = ['Em diagnóstico', 'Aguard. aprovação', 'Em execução', 'Pronto para retirada', 'Concluída'];

export interface OrdemServico {
  numero: number;
  cliente: string;
  veiculo: string;
  placa: string;
  servico: string;
  status: StatusOS;
  valor: number;
  box: boolean;
  entrega?: string; // ISO
  criadaEm: string; // ISO
}

export interface MesFinanceiro {
  chave: string; // 2026-09
  nome: string;
  abrev: string;
  faturamento: number;
  despesas: number;
  concluidas: number;
}

export interface Solicitacao {
  id: number;
  email?: string;
  nome: string;
  telefone: string;
  servico: string;
  cep: string;
  placa: string;
  veiculo: string;
  criadaEm: string;
}

export interface VeiculoCliente {
  placa: string;
  modelo: string;
}

export interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  cep: string;
  veiculos: VeiculoCliente[];
}

export interface ClienteResumo extends Cliente {
  os: number;
  total: number;
}
