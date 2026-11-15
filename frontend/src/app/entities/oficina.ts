export type StatusOS = 'Em diagnóstico' | 'Aguard. aprovação' | 'Em execução' | 'Pronto para retirada' | 'Concluída';

export const STATUS_LISTA: StatusOS[] = ['Em diagnóstico', 'Aguard. aprovação', 'Em execução', 'Pronto para retirada', 'Concluída'];

export interface ItemServicoOS {
  id?: number;
  servicoId?: number;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
}

export interface ItemPecaOS {
  id?: number;
  pecaId?: number;
  nome: string;
  quantidade: number;
  precoUnitario: number;
}

export interface OrdemServico {
  numero: number;
  cliente: string;
  veiculo: string;
  placa: string;
  servico: string;
  pecasTexto?: string;
  valorServico?: number;
  valorPecas?: number;
  itensServico?: ItemServicoOS[];
  itensPeca?: ItemPecaOS[];
  status: StatusOS;
  valor: number;
  box: boolean;
  entrega?: string; // ISO
  criadaEm: string; // ISO
}

export interface PecaCatalogo {
  id: number;
  nome: string;
  codigoFabricante?: string;
  precoCusto: number;
  precoVenda: number;
  quantidadeEstoque: number;
  ativo?: boolean;
}

export interface ServicoCatalogo {
  id: number;
  descricao: string;
  precoPadrao: number;
  tempoEstimadoMinutos?: number;
  ativo?: boolean;
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
  numero?: string;
  endereco?: string;
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
  numero?: string;
  endereco?: string;
  veiculos: VeiculoCliente[];
}

export interface ClienteResumo extends Cliente {
  os: number;
  total: number;
}
