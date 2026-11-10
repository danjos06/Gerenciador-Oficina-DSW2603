import { Injectable, computed, effect, signal } from '@angular/core';
import { Cliente, ClienteResumo, MesFinanceiro, OrdemServico, Solicitacao, StatusOS, VeiculoCliente } from '../entities/oficina';

export const MESES: MesFinanceiro[] = [
  { chave: '2026-03', nome: 'Março de 2026', abrev: 'Mar', faturamento: 30000, despesas: 23000, concluidas: 33 },
  { chave: '2026-04', nome: 'Abril de 2026', abrev: 'Abr', faturamento: 32000, despesas: 24000, concluidas: 35 },
  { chave: '2026-05', nome: 'Maio de 2026', abrev: 'Mai', faturamento: 36000, despesas: 25200, concluidas: 40 },
  { chave: '2026-06', nome: 'Junho de 2026', abrev: 'Jun', faturamento: 34000, despesas: 25000, concluidas: 38 },
  { chave: '2026-07', nome: 'Julho de 2026', abrev: 'Jul', faturamento: 41000, despesas: 27800, concluidas: 45 },
  { chave: '2026-08', nome: 'Agosto de 2026', abrev: 'Ago', faturamento: 45000, despesas: 30600, concluidas: 50 },
  { chave: '2026-09', nome: 'Setembro de 2026', abrev: 'Set', faturamento: 48600, despesas: 32400, concluidas: 54 },
];

const CHAVE_ARMAZENAMENTO = 'torque.dados.v1';

function quando(dias: number, hora = 9): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  d.setHours(hora, 0, 0, 0);
  return d.toISOString();
}

function sementeOrdens(): OrdemServico[] {
  const o = (numero: number, cliente: string, veiculo: string, placa: string, servico: string, status: StatusOS, valor: number, box: boolean, entrega?: string): OrdemServico => ({
    numero, cliente, veiculo, placa, servico, status, valor, box, entrega, criadaEm: quando(-(1049 - numero) / 2),
  });
  return [
    o(1048, 'Ana Martins', 'Honda Civic', 'FGH-2J34', 'Revisão e freios', 'Em execução', 1280, true, quando(0, 17)),
    o(1047, 'Carlos Oliveira', 'VW Gol', 'ABC-1D23', 'Troca de embreagem', 'Aguard. aprovação', 2150, true, quando(2, 12)),
    o(1046, 'Juliana Costa', 'Hyundai HB20', 'DEF-4G56', 'Troca de óleo', 'Pronto para retirada', 390, false, quando(1, 10)),
    o(1045, 'Pedro Santos', 'Fiat Argo', 'JKL-7M89', 'Diagnóstico elétrico', 'Em diagnóstico', 180, true, quando(1, 16)),
    o(1044, 'Marina Duarte', 'Toyota Corolla', 'MNO-1P23', 'Alinhamento e balanceamento', 'Aguard. aprovação', 260, false),
    o(1043, 'Rafael Mendes', 'Chevrolet Onix', 'QRS-4T56', 'Suspensão dianteira', 'Em execução', 1450, true, quando(3, 15)),
    o(1042, 'Luciana Prado', 'Renault Kwid', 'UVW-7X89', 'Revisão preventiva', 'Pronto para retirada', 620, false, quando(0, 18)),
    o(1041, 'Bruno Teixeira', 'Jeep Renegade', 'XYZ-2A34', 'Freios e pastilhas', 'Aguard. aprovação', 890, false),
    o(1040, 'Paulo Ramos', 'VW Polo', 'BCD-5E67', 'Troca de óleo e filtro', 'Concluída', 340, false),
    o(1039, 'Sandra Lima', 'Fiat Mobi', 'GHI-8J90', 'Revisão preventiva', 'Concluída', 480, false),
  ];
}

@Injectable({ providedIn: 'root' })
export class OficinaService {
  readonly ordens = signal<OrdemServico[]>(sementeOrdens());
  readonly solicitacoes = signal<Solicitacao[]>([]);
  readonly registrosClientes = signal<Cliente[]>([]);
  readonly mesChave = signal('2026-09');
  readonly toast = signal<string | null>(null);
  readonly carregadoEm = new Date();
  private timer?: ReturnType<typeof setTimeout>;

  // ---- derivados: operação ----
  readonly abertas = computed(() => this.ordens().filter((o) => o.status !== 'Concluída'));
  readonly aguardando = computed(() => this.abertas().filter((o) => o.status === 'Aguard. aprovação').length);
  readonly paraRetirada = computed(() => this.abertas().filter((o) => o.status === 'Pronto para retirada').length);
  readonly boxesTotal = 6;
  readonly boxesOcupados = computed(() => Math.min(this.boxesTotal, this.abertas().filter((o) => o.box).length));
  readonly proximaEntrega = computed(() =>
    this.abertas()
      .filter((o) => !!o.entrega && new Date(o.entrega).getTime() >= Date.now() - 3600_000)
      .sort((a, b) => a.entrega!.localeCompare(b.entrega!))[0],
  );

  // ---- derivados: financeiro ----
  readonly mesIndice = computed(() => MESES.findIndex((m) => m.chave === this.mesChave()));
  readonly mesAtual = computed(() => MESES[this.mesIndice()]);
  readonly mesAnterior = computed(() => MESES[this.mesIndice() - 1] as MesFinanceiro | undefined);

  // ---- derivados: cadastros ----
  readonly clientes = computed<ClienteResumo[]>(() => {
    const mapa = new Map<string, { cliente: Cliente; veiculos: Map<string, VeiculoCliente>; os: number; total: number }>();
    for (const cliente of this.registrosClientes()) {
      mapa.set(cliente.nome.toLocaleLowerCase(), {
        cliente,
        veiculos: new Map(cliente.veiculos.map((v) => [v.placa.toUpperCase(), v])),
        os: 0,
        total: 0,
      });
    }
    for (const o of this.ordens()) {
      const chave = o.cliente.toLocaleLowerCase();
      const c = mapa.get(chave);
      if (!c) continue;
      c.veiculos.set(o.placa.toUpperCase(), { placa: o.placa, modelo: o.veiculo });
      c.os++;
      c.total += o.valor;
    }
    return [...mapa.values()]
      .map(({ cliente, veiculos, os, total }) => ({ ...cliente, veiculos: [...veiculos.values()], os, total }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  });

  readonly veiculos = computed(() => {
    const mapa = new Map<string, { placa: string; veiculo: string; cliente: string; os: number; ativas: number }>();
    for (const o of this.ordens()) {
      const v = mapa.get(o.placa) ?? { placa: o.placa, veiculo: o.veiculo, cliente: o.cliente, os: 0, ativas: 0 };
      v.os++;
      if (o.status !== 'Concluída') v.ativas++;
      mapa.set(o.placa, v);
    }
    return [...mapa.values()].sort((a, b) => a.veiculo.localeCompare(b.veiculo));
  });

  constructor() {
    this.carregar();
    effect(() => this.salvar(this.ordens(), this.solicitacoes(), this.registrosClientes()));
  }

  // ---- ações ----
  criarOrdem(d: { cliente: string; veiculo: string; placa: string; servico: string; valor: number; status: StatusOS; entrega?: string }): void {
    const numero = Math.max(1000, ...this.ordens().map((o) => o.numero)) + 1;
    const nova: OrdemServico = {
      numero,
      cliente: d.cliente.trim(),
      veiculo: d.veiculo.trim(),
      placa: d.placa.trim().toUpperCase(),
      servico: d.servico.trim(),
      status: d.status,
      valor: Number(d.valor) || 0,
      box: d.status === 'Em diagnóstico' || d.status === 'Em execução',
      entrega: d.entrega ? new Date(d.entrega).toISOString() : undefined,
      criadaEm: new Date().toISOString(),
    };
    this.ordens.update((l) => [nova, ...l]);
    this.adicionarVeiculoAoCliente(nova.cliente, nova.veiculo, nova.placa);
    this.notificar(`OS #${numero} criada com sucesso.`);
  }

  mudarStatus(numero: number, status: StatusOS): void {
    this.ordens.update((l) =>
      l.map((o) => {
        if (o.numero !== numero) return o;
        const box = status === 'Em diagnóstico' || status === 'Em execução' ? true : status === 'Aguard. aprovação' ? o.box : false;
        return { ...o, status, box };
      }),
    );
    this.notificar(`OS #${numero}: ${status.toLowerCase()}.`);
  }

  excluirOrdem(numero: number): void {
    this.ordens.update((l) => l.filter((o) => o.numero !== numero));
    this.notificar(`OS #${numero} excluída.`);
  }

  enviarSolicitacao(nome: string, telefone: string, servico: string, cep: string, placa: string, veiculo: string): void {
    const id = Date.now();
    const nomeLimpo = nome.trim();
    const telefoneLimpo = telefone.trim();
    const placaLimpa = placa.trim().toUpperCase();
    this.salvarCadastroCliente({ nome: nomeLimpo, telefone: telefoneLimpo, cep: cep.trim(), placa: placaLimpa, modelo: veiculo.trim() });
    this.solicitacoes.update((l) => [{
      id, nome: nomeLimpo, telefone: telefoneLimpo, servico: servico.trim(), cep: cep.trim(),
      placa: placaLimpa, veiculo: veiculo.trim(), criadaEm: new Date().toISOString(),
    }, ...l]);
  }

  salvarCadastroCliente(dados: { nome: string; telefone: string; cep: string; placa: string; modelo: string }, id?: number): void {
    const nome = dados.nome.trim();
    const veiculo = dados.modelo.trim();
    const placa = dados.placa.trim().toUpperCase();
    const alvo = id === undefined
      ? this.registrosClientes().find((c) => c.nome.toLocaleLowerCase() === nome.toLocaleLowerCase() || (dados.telefone && c.telefone === dados.telefone.trim()))
      : this.registrosClientes().find((c) => c.id === id);
    const cadastro: Cliente = {
      id: alvo?.id ?? Math.max(Date.now(), ...this.registrosClientes().map((c) => c.id + 1)),
      nome,
      telefone: dados.telefone.trim(),
      cep: dados.cep.trim(),
      veiculos: [...(alvo?.veiculos ?? [])],
    };
    if (veiculo || placa) {
      const indice = cadastro.veiculos.findIndex((v) => v.placa.toUpperCase() === placa);
      const novoVeiculo = { placa, modelo: veiculo };
      if (indice >= 0) cadastro.veiculos[indice] = novoVeiculo;
      else if (id !== undefined && cadastro.veiculos.length > 0) cadastro.veiculos[0] = novoVeiculo;
      else cadastro.veiculos.push(novoVeiculo);
    }
    if (alvo && alvo.nome !== nome) {
      this.ordens.update((ordens) => ordens.map((o) => o.cliente === alvo.nome ? { ...o, cliente: nome } : o));
    }
    this.registrosClientes.update((lista) => alvo
      ? lista.map((c) => c.id === alvo.id ? cadastro : c)
      : [cadastro, ...lista]);
    this.notificar(alvo ? 'Cliente atualizado com sucesso.' : 'Cliente cadastrado com sucesso.');
  }

  excluirCliente(id: number): void {
    this.registrosClientes.update((lista) => lista.filter((c) => c.id !== id));
    this.notificar('Cliente excluído.');
  }

  private adicionarVeiculoAoCliente(nome: string, modelo: string, placa: string): void {
    const existente = this.registrosClientes().find((c) => c.nome.toLocaleLowerCase() === nome.toLocaleLowerCase());
    this.salvarCadastroCliente({
      nome,
      telefone: existente?.telefone ?? '',
      cep: existente?.cep ?? '',
      placa,
      modelo,
    }, existente?.id);
  }

  atenderSolicitacao(id: number): void {
    this.solicitacoes.update((l) => l.filter((s) => s.id !== id));
    this.notificar('Solicitação marcada como atendida.');
  }

  exportarRelatorio(): void {
    const m = this.mesAtual();
    const linhas = [
      ['Relatório', m.nome],
      ['Faturamento', m.faturamento],
      ['Despesas', m.despesas],
      ['Lucro líquido', m.faturamento - m.despesas],
      ['OS concluídas', m.concluidas],
      [],
      ['OS', 'Cliente', 'Veículo', 'Placa', 'Serviço', 'Status', 'Valor'],
      ...this.ordens().map((o) => [o.numero, o.cliente, o.veiculo, o.placa, o.servico, o.status, o.valor]),
    ];
    const csv = linhas.map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `torque-relatorio-${m.chave}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.notificar('Relatório exportado.');
  }

  notificar(msg: string): void {
    this.toast.set(msg);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.toast.set(null), 4000);
  }

  // ---- persistência local (opcional) ----
  private carregar(): void {
    try {
      const bruto = typeof localStorage !== 'undefined' ? localStorage.getItem(CHAVE_ARMAZENAMENTO) : null;
      if (!bruto) {
        this.migrarClientesDasOrdens();
        return;
      }
      const d = JSON.parse(bruto);
      if (Array.isArray(d.ordens)) this.ordens.set(d.ordens);
      if (Array.isArray(d.solicitacoes)) this.solicitacoes.set(d.solicitacoes);
      if (Array.isArray(d.clientes)) this.registrosClientes.set(d.clientes);
      else this.migrarClientesDasOrdens();
    } catch {
      /* dados corrompidos: segue com a semente */
    }
  }

  private migrarClientesDasOrdens(): void {
    const clientes = new Map<string, Cliente>();
    for (const ordem of this.ordens()) {
      const chave = ordem.cliente.toLocaleLowerCase();
      const cliente = clientes.get(chave) ?? {
        id: Date.now() + clientes.size,
        nome: ordem.cliente,
        telefone: '',
        cep: '',
        veiculos: [],
      };
      if (!cliente.veiculos.some((v) => v.placa.toUpperCase() === ordem.placa.toUpperCase())) {
        cliente.veiculos.push({ placa: ordem.placa, modelo: ordem.veiculo });
      }
      clientes.set(chave, cliente);
    }
    this.registrosClientes.set([...clientes.values()]);
  }

  private salvar(ordens: OrdemServico[], solicitacoes: Solicitacao[], clientes: Cliente[]): void {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify({ ordens, solicitacoes, clientes }));
    } catch {
      /* armazenamento indisponível */
    }
  }
}
