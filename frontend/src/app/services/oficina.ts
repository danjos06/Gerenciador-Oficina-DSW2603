import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Cliente, ClienteResumo, ItemPecaOS, ItemServicoOS, MesFinanceiro, OrdemServico, PecaCatalogo, ServicoCatalogo, Solicitacao, StatusOS, VeiculoCliente } from '../entities/oficina';
import { environment } from '../environments/environment';
import { AuthService } from './auth';

export const MESES: MesFinanceiro[] = [
  { chave: '2026-03', nome: 'Março de 2026', abrev: 'Mar', faturamento: 30000, despesas: 23000, concluidas: 33 },
  { chave: '2026-04', nome: 'Abril de 2026', abrev: 'Abr', faturamento: 32000, despesas: 24000, concluidas: 35 },
  { chave: '2026-05', nome: 'Maio de 2026', abrev: 'Mai', faturamento: 36000, despesas: 25200, concluidas: 40 },
  { chave: '2026-06', nome: 'Junho de 2026', abrev: 'Jun', faturamento: 34000, despesas: 25000, concluidas: 38 },
  { chave: '2026-07', nome: 'Julho de 2026', abrev: 'Jul', faturamento: 41000, despesas: 27800, concluidas: 45 },
  { chave: '2026-08', nome: 'Agosto de 2026', abrev: 'Ago', faturamento: 45000, despesas: 30600, concluidas: 50 },
  { chave: '2026-09', nome: 'Setembro de 2026', abrev: 'Set', faturamento: 48600, despesas: 32400, concluidas: 54 },
];

const CHAVE_ARMAZENAMENTO = 'oficina-do-joe.dados.v1';
const CHAVE_ARMAZENAMENTO_ANTIGA = 'torque.dados.v1';
const MES_VAZIO: MesFinanceiro = {
  chave: '',
  nome: 'Sem período cadastrado',
  abrev: '—',
  faturamento: 0,
  despesas: 0,
  concluidas: 0,
};

function descreverMes(chave: string): Pick<MesFinanceiro, 'nome' | 'abrev'> {
  const [ano, mes] = chave.split('-').map(Number);
  const data = new Date(ano, mes - 1, 1);
  const nome = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(data);
  const abrev = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(data).replace('.', '');
  return {
    nome: nome.charAt(0).toLocaleUpperCase('pt-BR') + nome.slice(1),
    abrev: abrev.charAt(0).toLocaleUpperCase('pt-BR') + abrev.slice(1),
  };
}

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
  private readonly auth = inject(AuthService);
  readonly ordens = signal<OrdemServico[]>(sementeOrdens());
  readonly meses = signal<MesFinanceiro[]>([...MESES]);
  readonly mesesOrdenados = computed(() => [...this.meses()].sort((a, b) => a.chave.localeCompare(b.chave)));
  readonly solicitacoes = signal<Solicitacao[]>([]);
  readonly registrosClientes = signal<Cliente[]>([]);
  readonly catalogoPecas = signal<PecaCatalogo[]>([]);
  readonly catalogoServicos = signal<ServicoCatalogo[]>([]);
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
  readonly mesIndice = computed(() => this.mesesOrdenados().findIndex((m) => m.chave === this.mesChave()));
  readonly mesAtual = computed(() => this.meses().find((m) => m.chave === this.mesChave()) ?? MES_VAZIO);
  readonly mesAnterior = computed(() => {
    const indice = this.mesIndice();
    return indice > 0 ? this.mesesOrdenados()[indice - 1] : undefined;
  });

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
    for (const c of this.registrosClientes()) {
      for (const v of c.veiculos) {
        const placa = v.placa.toUpperCase();
        if (!placa) continue;
        mapa.set(placa, { placa, veiculo: v.modelo, cliente: c.nome, os: 0, ativas: 0 });
      }
    }
    for (const o of this.ordens()) {
      const placa = o.placa.toUpperCase();
      const v = mapa.get(placa) ?? { placa: o.placa, veiculo: o.veiculo, cliente: o.cliente, os: 0, ativas: 0 };
      v.os++;
      if (o.status !== 'Concluída') v.ativas++;
      mapa.set(placa, v);
    }
    return [...mapa.values()].sort((a, b) => a.veiculo.localeCompare(b.veiculo));
  });

  constructor() {
    this.carregar();
    effect(() => this.salvar(this.ordens(), this.solicitacoes(), this.registrosClientes(), this.meses(), this.mesChave(), this.catalogoPecas(), this.catalogoServicos()));
    effect(() => {
      const token = this.auth.token();
      if (token) {
        void this.sincronizarComBackend();
      }
    });
  }

  private statusParaBack(status: StatusOS): string {
    if (status === 'Aguard. aprovação') return 'AGUARDANDO_PECA';
    if (status === 'Em execução') return 'EM_ANDAMENTO';
    if (status === 'Pronto para retirada') return 'CONCLUIDA';
    if (status === 'Concluída') return 'ENTREGUE';
    return 'ABERTA';
  }

  private statusParaFront(statusBack: string): StatusOS {
    const s = (statusBack ?? '').toUpperCase();
    if (s === 'AGUARDANDO_APROVACAO' || s === 'AGUARDANDO_PECA') return 'Aguard. aprovação';
    if (s === 'EM_ANDAMENTO' || s === 'EM_EXECUCAO' || s === 'TESTE_QUALIDADE') return 'Em execução';
    if (s === 'CONCLUIDA' || s === 'PRONTO') return 'Pronto para retirada';
    if (s === 'ENTREGUE' || s === 'CONCLUIDO') return 'Concluída';
    return 'Em diagnóstico';
  }

  private gerarCpfFicticio(semente: string): string {
    const digitos = semente.replace(/\D/g, '');
    const sufixo = String(Date.now()).slice(-11);
    return (digitos + sufixo).slice(0, 11).padEnd(11, '0');
  }

  async sincronizarComBackend(): Promise<void> {
    if (!this.auth.token()) {
      this.auth.notificarFallback();
      return;
    }

    try {
      const headers = this.auth.headersAuth();
      const [resClientes, resVeiculos, resOrdens] = await Promise.all([
        fetch(`${environment.apiUrl}/clientes`, { headers }),
        fetch(`${environment.apiUrl}/veiculos`, { headers }),
        fetch(`${environment.apiUrl}/ordens-servico`, { headers }),
      ]);

      if (resClientes.status === 401 || resVeiculos.status === 401 || resOrdens.status === 401) {
        this.auth.logout();
        return;
      }

      if (!resClientes.ok || !resVeiculos.ok || !resOrdens.ok) {
        return;
      }

      this.auth.marcarBackendOnline();

      const clientesBack = await resClientes.json();
      const veiculosBack = await resVeiculos.json();
      const ordensBack = await resOrdens.json();

      try {
        const [resPecasCat, resServicosCat] = await Promise.all([
          fetch(`${environment.apiUrl}/pecas`, { headers }),
          fetch(`${environment.apiUrl}/servicos`, { headers }),
        ]);
        if (resPecasCat.ok) {
          const pecasRaw = await resPecasCat.json();
          if (Array.isArray(pecasRaw)) {
            this.catalogoPecas.set(
              pecasRaw.map((p: Record<string, any>) => {
                const ref = Number(p['precoReferencia'] ?? p['precoVenda'] ?? 0);
                return {
                  id: Number(p['id']),
                  codigoFabricante: p['codigo'] ? String(p['codigo']) : p['codigoFabricante'] ? String(p['codigoFabricante']) : undefined,
                  nome: String(p['nome'] ?? ''),
                  precoCusto: Number(p['precoCusto'] ?? ref),
                  precoVenda: ref,
                  quantidadeEstoque: Number(p['quantidadeEstoque'] ?? 10),
                  ativo: Boolean(p['ativo'] ?? true),
                };
              }),
            );
          }
        }
        if (resServicosCat.ok) {
          const servicosRaw = await resServicosCat.json();
          if (Array.isArray(servicosRaw)) {
            this.catalogoServicos.set(
              servicosRaw.map((sv: Record<string, any>) => ({
                id: Number(sv['id']),
                descricao: String(sv['nome'] ?? sv['descricao'] ?? ''),
                precoPadrao: Number(sv['precoReferencia'] ?? sv['precoPadrao'] ?? 0),
                tempoEstimadoMinutos: Number(sv['minutosEstimados'] ?? sv['tempoEstimadoMinutos'] ?? 60),
                ativo: Boolean(sv['ativo'] ?? true),
              })),
            );
          }
        }
      } catch {
        // Ignora caso catálogos falhem isoladamente
      }

      if (Array.isArray(clientesBack)) {
        const listaClientes: Cliente[] = [];
        for (const c of clientesBack) {
          const veiculosDoCliente: VeiculoCliente[] = [];
          if (Array.isArray(veiculosBack)) {
            for (const v of veiculosBack) {
              if (v.cliente && v.cliente.id === c.id) {
                veiculosDoCliente.push({
                  placa: String(v.placa ?? '').toUpperCase(),
                  modelo: `${v.marca ?? ''} ${v.modelo ?? ''}`.trim(),
                });
              }
            }
          }
          const enderecoBanco = String(c.endereco ?? '');
          const cepExtraido = enderecoBanco.match(/\d{5}-?\d{3}/)?.[0] ?? enderecoBanco;
          listaClientes.push({
            id: Number(c.id),
            nome: String(c.nome ?? ''),
            telefone: String(c.telefone ?? ''),
            cep: cepExtraido,
            endereco: enderecoBanco,
            veiculos: veiculosDoCliente,
          });
        }
        this.registrosClientes.set(listaClientes);
      }

      if (Array.isArray(ordensBack)) {
        const listaOrdens: OrdemServico[] = [];
        for (const os of ordensBack) {
          let valorOrdem = 0;
          let valorServico = 0;
          let valorPecas = 0;
          let pecasTexto = '';
          let servicoTexto = String(os.problemaRelatado ?? os.queixaCliente ?? '');
          let itensServico: ItemServicoOS[] = [];
          let itensPeca: ItemPecaOS[] = [];
          try {
            const resResumo = await fetch(`${environment.apiUrl}/ordens-servico/${os.id}/resumo`, { headers });
            if (resResumo.ok) {
              const resumo = await resResumo.json();
              valorServico = Number(resumo.totalServicos ?? 0);
              valorPecas = Number(resumo.totalPecas ?? 0);
              valorOrdem = Number(resumo.valorTotal ?? resumo.valorTotalOrdem ?? (valorServico + valorPecas));
              if (Array.isArray(resumo.pecas) && resumo.pecas.length > 0) {
                itensPeca = resumo.pecas.map((p: Record<string, any>) => ({
                  id: Number(p['id']),
                  pecaId: p['peca']?.id ? Number(p['peca'].id) : undefined,
                  nome: String(p['peca']?.nome ?? 'Peça'),
                  quantidade: Number(p['quantidade'] ?? 1),
                  precoUnitario: Number(p['precoUnitario'] ?? p['precoUnitarioCobrado'] ?? 0),
                }));
                pecasTexto = itensPeca
                  .map((p) => (p.quantidade > 1 ? `${p.quantidade}x ${p.nome}` : p.nome))
                  .join(', ');
              }
              if (Array.isArray(resumo.servicos) && resumo.servicos.length > 0) {
                itensServico = resumo.servicos.map((sv: Record<string, any>) => ({
                  id: Number(sv['id']),
                  servicoId: sv['servico']?.id ? Number(sv['servico'].id) : undefined,
                  descricao: String(sv['servico']?.nome ?? sv['servico']?.descricao ?? 'Serviço'),
                  quantidade: Number(sv['quantidade'] ?? 1),
                  precoUnitario: Number(sv['precoUnitario'] ?? sv['precoCobrado'] ?? 0),
                }));
                const nomesServicos = itensServico
                  .map((sv) => (sv.quantidade > 1 ? `${sv.quantidade}x ${sv.descricao}` : sv.descricao))
                  .filter(Boolean)
                  .join(', ');
                if (nomesServicos) servicoTexto = nomesServicos;
              }
            }
          } catch {
            valorOrdem = 0;
          }

          const statusFront = this.statusParaFront(String(os.status ?? 'DIAGNOSTICO'));
          const veiculoNome = os.veiculo
            ? `${os.veiculo.marca ?? ''} ${os.veiculo.modelo ?? ''}`.trim()
            : '';

          listaOrdens.push({
            numero: Number(os.id),
            cliente: String(os.cliente?.nome ?? ''),
            veiculo: veiculoNome,
            placa: String(os.veiculo?.placa ?? '').toUpperCase(),
            servico: servicoTexto,
            pecasTexto,
            valorServico,
            valorPecas,
            itensServico,
            itensPeca,
            status: statusFront,
            valor: valorOrdem,
            box: statusFront === 'Em diagnóstico' || statusFront === 'Em execução',
            entrega: os.previsaoEntrega ? new Date(os.previsaoEntrega).toISOString() : undefined,
            criadaEm: os.criadoEm ? new Date(os.criadoEm).toISOString() : new Date().toISOString(),
          });
        }
        this.ordens.set(listaOrdens);
      }

      const ehSementeMeses =
        this.meses().length === MESES.length
        && this.meses().every((m, idx) => m.chave === MESES[idx].chave && m.faturamento === MESES[idx].faturamento);
      if (ehSementeMeses) {
        this.meses.set([]);
        this.mesChave.set('');
      }
      this.recalcularMesesDasOrdens();
    } catch {
      this.auth.notificarFallback();
    }
  }

  private recalcularMesesDasOrdens(): void {
    const porMes = new Map<string, { faturamento: number; despesas: number; concluidas: number }>();
    for (const o of this.ordens()) {
      const chave = (o.criadaEm || new Date().toISOString()).slice(0, 7);
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(chave)) continue;
      const atual = porMes.get(chave) ?? { faturamento: 0, despesas: 0, concluidas: 0 };
      atual.faturamento += Number(o.valor) || 0;
      atual.despesas += Number(o.valorPecas ?? 0) || 0;
      if (o.status === 'Concluída') atual.concluidas += 1;
      porMes.set(chave, atual);
    }

    if (porMes.size === 0) return;

    const existentes = new Map(this.meses().map((m) => [m.chave, m]));
    for (const [chave, resumo] of porMes.entries()) {
      existentes.set(chave, {
        chave,
        ...descreverMes(chave),
        faturamento: resumo.faturamento,
        despesas: resumo.despesas,
        concluidas: resumo.concluidas,
      });
    }

    const novaLista = [...existentes.values()].sort((a, b) => a.chave.localeCompare(b.chave));
    this.meses.set(novaLista);
    if (!novaLista.some((m) => m.chave === this.mesChave())) {
      const maisRecente = novaLista[novaLista.length - 1];
      this.mesChave.set(maisRecente?.chave ?? '');
    }
  }

  // ---- ações ----
  adicionarMes(dados: Pick<MesFinanceiro, 'chave' | 'faturamento' | 'despesas' | 'concluidas'>): boolean {
    if (!this.somenteAdmin()) return false;
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(dados.chave)
      || !Number.isFinite(dados.faturamento) || dados.faturamento < 0
      || !Number.isFinite(dados.despesas) || dados.despesas < 0
      || !Number.isInteger(dados.concluidas) || dados.concluidas < 0) {
      this.notificar('Informe um mês válido e valores financeiros não negativos.');
      return false;
    }
    if (this.meses().some((mes) => mes.chave === dados.chave)) {
      this.notificar('Já existe um registro financeiro para esse mês.');
      return false;
    }

    this.meses.update((lista) => [...lista, { ...dados, ...descreverMes(dados.chave) }]);
    this.mesChave.set(dados.chave);
    this.notificar('Registro financeiro cadastrado.');
    return true;
  }

  atualizarMes(chave: string, dados: Pick<MesFinanceiro, 'faturamento' | 'despesas' | 'concluidas'>): boolean {
    if (!this.somenteAdmin()) return false;
    if (!Number.isFinite(dados.faturamento) || dados.faturamento < 0
      || !Number.isFinite(dados.despesas) || dados.despesas < 0
      || !Number.isInteger(dados.concluidas) || dados.concluidas < 0) {
      this.notificar('Informe valores financeiros válidos e não negativos.');
      return false;
    }
    if (!this.meses().some((mes) => mes.chave === chave)) {
      this.notificar('O registro financeiro não foi encontrado.');
      return false;
    }

    this.meses.update((lista) => lista.map((mes) => mes.chave === chave ? { ...mes, ...dados } : mes));
    this.notificar('Registro financeiro atualizado.');
    return true;
  }

  excluirMes(chave: string): void {
    if (!this.somenteAdmin()) return;
    const restante = this.meses().filter((mes) => mes.chave !== chave);
    if (restante.length === this.meses().length) {
      this.notificar('O registro financeiro não foi encontrado.');
      return;
    }

    this.meses.set(restante);
    if (this.mesChave() === chave) {
      const maisRecente = [...restante].sort((a, b) => b.chave.localeCompare(a.chave))[0];
      this.mesChave.set(maisRecente?.chave ?? '');
    }
    this.notificar('Registro financeiro excluído.');
  }

  criarOrdem(d: {
    cliente: string;
    veiculo: string;
    placa: string;
    servico?: string;
    valor?: number;
    valorServico?: number;
    pecasTexto?: string;
    valorPecas?: number;
    itensServico?: ItemServicoOS[];
    itensPeca?: ItemPecaOS[];
    status: StatusOS;
    entrega?: string;
  }): void {
    if (!this.somenteAdmin()) return;
    const numero = Math.max(1000, ...this.ordens().map((o) => o.numero)) + 1;
    const itensServico: ItemServicoOS[] = d.itensServico && d.itensServico.length > 0
      ? d.itensServico.map((s) => ({ ...s, quantidade: Math.max(1, Number(s.quantidade) || 1), precoUnitario: Number(s.precoUnitario) || 0 }))
      : d.servico?.trim()
        ? [{ descricao: d.servico.trim(), quantidade: 1, precoUnitario: d.valorServico !== undefined ? Number(d.valorServico) || 0 : Number(d.valor) || 0 }]
        : [];
    const itensPeca: ItemPecaOS[] = d.itensPeca && d.itensPeca.length > 0
      ? d.itensPeca.map((p) => ({ ...p, quantidade: Math.max(1, Number(p.quantidade) || 1), precoUnitario: Number(p.precoUnitario) || 0 }))
      : d.pecasTexto?.trim()
        ? [{ nome: d.pecasTexto.trim(), quantidade: 1, precoUnitario: Number(d.valorPecas) || 0 }]
        : [];

    const valorServico = itensServico.length > 0
      ? itensServico.reduce((acc, s) => acc + s.quantidade * s.precoUnitario, 0)
      : (d.valorServico !== undefined ? Number(d.valorServico) || 0 : Number(d.valor) || 0);
    const valorPecas = itensPeca.length > 0
      ? itensPeca.reduce((acc, p) => acc + p.quantidade * p.precoUnitario, 0)
      : (Number(d.valorPecas) || 0);
    const valorTotal = itensServico.length > 0 || itensPeca.length > 0 || d.valorServico !== undefined || d.valorPecas !== undefined
      ? valorServico + valorPecas
      : Number(d.valor) || 0;

    const servicoTexto = itensServico.length > 0
      ? itensServico.map((s) => (s.quantidade > 1 ? `${s.quantidade}x ${s.descricao}` : s.descricao)).join(', ')
      : (d.servico?.trim() ?? '');
    const pecasTexto = itensPeca.length > 0
      ? itensPeca.map((p) => (p.quantidade > 1 ? `${p.quantidade}x ${p.nome}` : p.nome)).join(', ')
      : (d.pecasTexto?.trim() ?? '');

    const nova: OrdemServico = {
      numero,
      cliente: d.cliente.trim(),
      veiculo: d.veiculo.trim(),
      placa: d.placa.trim().toUpperCase(),
      servico: servicoTexto,
      pecasTexto,
      valorServico,
      valorPecas,
      itensServico,
      itensPeca,
      status: d.status,
      valor: valorTotal,
      box: d.status === 'Em diagnóstico' || d.status === 'Em execução',
      entrega: d.entrega ? new Date(d.entrega).toISOString() : undefined,
      criadaEm: new Date().toISOString(),
    };
    const clienteAntes = this.registrosClientes().find(
      (c) => c.nome.toLocaleLowerCase() === nova.cliente.toLocaleLowerCase(),
    );
    this.ordens.update((l) => [nova, ...l]);
    this.adicionarVeiculoAoCliente(nova.cliente, nova.veiculo, nova.placa);
    if (this.auth.token()) this.recalcularMesesDasOrdens();
    this.notificar(`OS #${numero} criada com sucesso.`);
    void this.criarOrdemApi(nova, clienteAntes);
  }

  async buscarClientePorNomeOuPlaca(termo: string, modo: 'cliente' | 'placa'): Promise<{ cliente: string; veiculo: string; placa: string } | null> {
    const q = termo.trim().toLocaleLowerCase();
    if (!q) return null;

    if (modo === 'cliente') {
      const local = this.registrosClientes().find((c) => c.nome.toLocaleLowerCase() === q)
        ?? this.registrosClientes().find((c) => c.nome.toLocaleLowerCase().includes(q));
      if (local && local.veiculos.length > 0) {
        return { cliente: local.nome, veiculo: local.veiculos[0].modelo, placa: local.veiculos[0].placa };
      }
      if (this.auth.token()) {
        try {
          const headers = this.auth.headersAuth();
          const res = await fetch(`${environment.apiUrl}/clientes/${encodeURIComponent(termo.trim())}`, { headers });
          if (res.ok) {
            const lista = await res.json();
            if (Array.isArray(lista) && lista.length > 0) {
              const cli = lista[0];
              const resVeic = await fetch(`${environment.apiUrl}/veiculos/cliente/${cli.id}`, { headers });
              if (resVeic.ok) {
                const veics = await resVeic.json();
                if (Array.isArray(veics) && veics.length > 0) {
                  const v = veics[0];
                  return {
                    cliente: String(cli.nome ?? ''),
                    veiculo: `${v.marca ?? ''} ${v.modelo ?? ''}`.trim(),
                    placa: String(v.placa ?? '').toUpperCase(),
                  };
                }
              }
              return { cliente: String(cli.nome ?? ''), veiculo: '', placa: '' };
            }
          }
        } catch {
          // Ignora falha de busca
        }
      }
    } else {
      const placaLimpa = termo.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      for (const c of this.registrosClientes()) {
        const v = c.veiculos.find((veic) => veic.placa.toUpperCase().replace(/[^A-Z0-9]/g, '') === placaLimpa);
        if (v) {
          return { cliente: c.nome, veiculo: v.modelo, placa: v.placa.toUpperCase() };
        }
      }
      if (this.auth.token() && placaLimpa.length >= 7) {
        try {
          const headers = this.auth.headersAuth();
          const res = await fetch(`${environment.apiUrl}/veiculos/${encodeURIComponent(termo.trim().toUpperCase())}`, { headers });
          if (res.ok) {
            const v = await res.json();
            return {
              cliente: String(v.cliente?.nome ?? ''),
              veiculo: `${v.marca ?? ''} ${v.modelo ?? ''}`.trim(),
              placa: String(v.placa ?? '').toUpperCase(),
            };
          }
        } catch {
          // Ignora falha de busca
        }
      }
    }
    return null;
  }

  async adicionarItemServicoNaOrdem(numero: number, item: ItemServicoOS): Promise<void> {
    if (!this.somenteAdmin()) return;
    const qtd = Math.max(1, Number(item.quantidade) || 1);
    const preco = Number(item.precoUnitario) || 0;
    const novoItem: ItemServicoOS = {
      id: Date.now(),
      descricao: item.descricao.trim(),
      quantidade: qtd,
      precoUnitario: preco,
    };

    this.ordens.update((lista) =>
      lista.map((o) => {
        if (o.numero !== numero) return o;
        const itensServico = [...(o.itensServico ?? []), novoItem];
        const valorServico = itensServico.reduce((acc, s) => acc + s.quantidade * s.precoUnitario, 0);
        const valorPecas = o.valorPecas ?? 0;
        const servico = itensServico.map((s) => (s.quantidade > 1 ? `${s.quantidade}x ${s.descricao}` : s.descricao)).join(', ');
        return { ...o, itensServico, servico, valorServico, valor: valorServico + valorPecas };
      }),
    );
    if (this.auth.token()) this.recalcularMesesDasOrdens();

    if (this.auth.token()) {
      const idReal = await this.resolverIdOrdem(numero);
      await this.registrarServicoNaOrdemApi(idReal, novoItem.descricao, novoItem.precoUnitario, novoItem.quantidade);
      await this.carregarDetalhesOrdemApi(idReal);
    }
  }

  async removerItemServicoDaOrdem(numero: number, indice: number, itemId?: number): Promise<void> {
    if (!this.somenteAdmin()) return;
    this.ordens.update((lista) =>
      lista.map((o) => {
        if (o.numero !== numero) return o;
        const itensServico = (o.itensServico ?? []).filter((_, idx) => idx !== indice);
        const valorServico = itensServico.reduce((acc, s) => acc + s.quantidade * s.precoUnitario, 0);
        const valorPecas = o.valorPecas ?? 0;
        const servico = itensServico.map((s) => (s.quantidade > 1 ? `${s.quantidade}x ${s.descricao}` : s.descricao)).join(', ');
        return { ...o, itensServico, servico, valorServico, valor: valorServico + valorPecas };
      }),
    );
    if (this.auth.token()) this.recalcularMesesDasOrdens();

    if (this.auth.token() && itemId && itemId < 1_000_000_000) {
      const idReal = await this.resolverIdOrdem(numero);
      await this.removerServicoDaOrdemApi(idReal, itemId);
    }
  }

  async adicionarItemPecaNaOrdem(numero: number, item: ItemPecaOS): Promise<void> {
    if (!this.somenteAdmin()) return;
    const qtd = Math.max(1, Number(item.quantidade) || 1);
    const preco = Number(item.precoUnitario) || 0;
    const novoItem: ItemPecaOS = {
      id: Date.now(),
      nome: item.nome.trim(),
      quantidade: qtd,
      precoUnitario: preco,
    };

    this.ordens.update((lista) =>
      lista.map((o) => {
        if (o.numero !== numero) return o;
        const itensPeca = [...(o.itensPeca ?? []), novoItem];
        const valorPecas = itensPeca.reduce((acc, p) => acc + p.quantidade * p.precoUnitario, 0);
        const valorServico = o.valorServico ?? o.valor;
        const pecasTexto = itensPeca.map((p) => (p.quantidade > 1 ? `${p.quantidade}x ${p.nome}` : p.nome)).join(', ');
        return { ...o, itensPeca, pecasTexto, valorPecas, valor: valorServico + valorPecas };
      }),
    );
    if (this.auth.token()) this.recalcularMesesDasOrdens();

    if (this.auth.token()) {
      const idReal = await this.resolverIdOrdem(numero);
      await this.registrarPecaSimplesNaOrdemApi(idReal, novoItem.nome, novoItem.precoUnitario, novoItem.quantidade);
      await this.carregarDetalhesOrdemApi(idReal);
    }
  }

  async removerItemPecaDaOrdem(numero: number, indice: number, itemId?: number): Promise<void> {
    if (!this.somenteAdmin()) return;
    this.ordens.update((lista) =>
      lista.map((o) => {
        if (o.numero !== numero) return o;
        const itensPeca = (o.itensPeca ?? []).filter((_, idx) => idx !== indice);
        const valorPecas = itensPeca.reduce((acc, p) => acc + p.quantidade * p.precoUnitario, 0);
        const valorServico = o.valorServico ?? 0;
        const pecasTexto = itensPeca.map((p) => (p.quantidade > 1 ? `${p.quantidade}x ${p.nome}` : p.nome)).join(', ');
        return { ...o, itensPeca, pecasTexto, valorPecas, valor: valorServico + valorPecas };
      }),
    );
    if (this.auth.token()) this.recalcularMesesDasOrdens();

    if (this.auth.token() && itemId && itemId < 1_000_000_000) {
      const idReal = await this.resolverIdOrdem(numero);
      await this.removerPecaDaOrdemApi(idReal, itemId);
    }
  }

  mudarStatus(numero: number, status: StatusOS): void {
    if (!this.somenteAdmin()) return;
    this.ordens.update((l) =>
      l.map((o) => {
        if (o.numero !== numero) return o;
        const box = status === 'Em diagnóstico' || status === 'Em execução' ? true : status === 'Aguard. aprovação' ? o.box : false;
        return { ...o, status, box };
      }),
    );
    if (this.auth.token()) this.recalcularMesesDasOrdens();
    this.notificar(`OS #${numero}: ${status.toLowerCase()}.`);
    void this.mudarStatusApi(numero, status);
  }

  excluirOrdem(numero: number): void {
    if (!this.somenteAdmin()) return;
    this.ordens.update((l) => l.filter((o) => o.numero !== numero));
    if (this.auth.token()) this.recalcularMesesDasOrdens();
    this.notificar(`OS #${numero} excluída.`);
    void this.excluirOrdemApi(numero);
  }

  atualizarValorOrdem(numero: number, valor: number): boolean {
    if (!this.somenteAdmin()) return false;
    if (!Number.isFinite(valor) || valor < 0) {
      this.notificar('Informe um valor válido e não negativo.');
      return false;
    }
    if (!this.ordens().some((ordem) => ordem.numero === numero)) {
      this.notificar('Ordem de serviço não encontrada.');
      return false;
    }

    this.ordens.update((lista) =>
      lista.map((ordem) =>
        ordem.numero === numero
          ? { ...ordem, valor, valorServico: valor - (ordem.valorPecas ?? 0) }
          : ordem,
      ),
    );
    if (this.auth.token()) this.recalcularMesesDasOrdens();
    this.notificar(`Valor da OS #${numero} atualizado.`);
    void this.atualizarValorOrdemApi(numero, valor);
    return true;
  }

  atualizarValoresOrdem(numero: number, valorServico: number, valorPecas: number): boolean {
    if (!this.somenteAdmin()) return false;
    if (!Number.isFinite(valorServico) || valorServico < 0 || !Number.isFinite(valorPecas) || valorPecas < 0) {
      this.notificar('Informe valores válidos e não negativos para serviço e peças.');
      return false;
    }
    if (!this.ordens().some((ordem) => ordem.numero === numero)) {
      this.notificar('Ordem de serviço não encontrada.');
      return false;
    }

    const valorTotal = valorServico + valorPecas;
    this.ordens.update((lista) =>
      lista.map((ordem) =>
        ordem.numero === numero
          ? { ...ordem, valorServico, valorPecas, valor: valorTotal }
          : ordem,
      ),
    );
    if (this.auth.token()) this.recalcularMesesDasOrdens();
    this.notificar(`Valores da OS #${numero} atualizados.`);
    void this.atualizarValoresOrdemApi(numero, valorServico, valorPecas);
    return true;
  }

  salvarPecaCatalogo(
    dados: { codigoFabricante?: string; nome: string; precoCusto: number; precoVenda: number; quantidadeEstoque: number },
    id?: number,
  ): void {
    if (!this.somenteAdmin()) return;
    const nome = dados.nome.trim();
    const codigoFabricante = dados.codigoFabricante?.trim() || undefined;
    const precoCusto = Number(dados.precoCusto) || 0;
    const precoVenda = Number(dados.precoVenda) || 0;
    const quantidadeEstoque = Math.max(0, Math.trunc(Number(dados.quantidadeEstoque) || 0));

    const existente = id !== undefined ? this.catalogoPecas().find((p) => p.id === id) : undefined;
    const item: PecaCatalogo = {
      id: existente?.id ?? Math.max(Date.now(), ...this.catalogoPecas().map((p) => p.id + 1)),
      codigoFabricante,
      nome,
      precoCusto,
      precoVenda,
      quantidadeEstoque,
      ativo: true,
    };

    this.catalogoPecas.update((lista) =>
      existente ? lista.map((p) => (p.id === existente.id ? item : p)) : [item, ...lista],
    );
    this.notificar(existente ? 'Peça atualizada com sucesso.' : 'Peça cadastrada com sucesso.');
    void this.salvarPecaCatalogoApi(item, existente?.id);
  }

  excluirPecaCatalogo(id: number): void {
    if (!this.somenteAdmin()) return;
    this.catalogoPecas.update((lista) => lista.filter((p) => p.id !== id));
    this.notificar('Peça excluída do catálogo.');
    void this.excluirPecaCatalogoApi(id);
  }

  salvarServicoCatalogo(
    dados: { descricao: string; precoPadrao: number; tempoEstimadoMinutos?: number },
    id?: number,
  ): void {
    if (!this.somenteAdmin()) return;
    const descricao = dados.descricao.trim();
    const precoPadrao = Number(dados.precoPadrao) || 0;
    const tempoEstimadoMinutos = dados.tempoEstimadoMinutos ? Math.max(1, Math.trunc(Number(dados.tempoEstimadoMinutos))) : 60;

    const existente = id !== undefined ? this.catalogoServicos().find((sv) => sv.id === id) : undefined;
    const item: ServicoCatalogo = {
      id: existente?.id ?? Math.max(Date.now(), ...this.catalogoServicos().map((sv) => sv.id + 1)),
      descricao,
      precoPadrao,
      tempoEstimadoMinutos,
      ativo: true,
    };

    this.catalogoServicos.update((lista) =>
      existente ? lista.map((sv) => (sv.id === existente.id ? item : sv)) : [item, ...lista],
    );
    this.notificar(existente ? 'Serviço atualizado com sucesso.' : 'Serviço cadastrado com sucesso.');
    void this.salvarServicoCatalogoApi(item, existente?.id);
  }

  excluirServicoCatalogo(id: number): void {
    if (!this.somenteAdmin()) return;
    this.catalogoServicos.update((lista) => lista.filter((sv) => sv.id !== id));
    this.notificar('Serviço excluído do catálogo.');
    void this.excluirServicoCatalogoApi(id);
  }

  enviarSolicitacao(
    nome: string,
    telefone: string,
    servico: string,
    cep: string,
    placa: string,
    veiculo: string,
    email?: string,
    numero?: string,
    endereco?: string,
  ): void {
    const id = Date.now();
    const nomeLimpo = nome.trim();
    const telefoneLimpo = telefone.trim();
    const placaLimpa = placa.trim().toUpperCase();
    const emailLimpo = email?.trim().toLowerCase();
    const cepLimpo = cep.trim();
    const numeroLimpo = numero?.trim() ?? '';
    const enderecoFinal = endereco?.trim() || cepLimpo;

    const dadosCliente = {
      nome: nomeLimpo,
      telefone: telefoneLimpo,
      cep: cepLimpo,
      numero: numeroLimpo,
      endereco: enderecoFinal,
      placa: placaLimpa,
      modelo: veiculo.trim(),
    };

    this.salvarCadastroClienteInterno(dadosCliente);
    if (this.auth.token()) {
      void this.salvarClienteApi(dadosCliente);
    }

    this.solicitacoes.update((l) => [{
      id,
      email: emailLimpo,
      nome: nomeLimpo,
      telefone: telefoneLimpo,
      servico: servico.trim(),
      cep: cepLimpo,
      numero: numeroLimpo,
      endereco: enderecoFinal,
      placa: placaLimpa,
      veiculo: veiculo.trim(),
      criadaEm: new Date().toISOString(),
    }, ...l]);
  }

  salvarCadastroCliente(dados: { nome: string; telefone: string; cep: string; numero?: string; endereco?: string; placa: string; modelo: string }, id?: number): void {
    if (!this.somenteAdmin()) return;
    this.salvarCadastroClienteInterno(dados, id);
    void this.salvarClienteApi(dados, id);
  }

  private salvarCadastroClienteInterno(dados: { nome: string; telefone: string; cep: string; numero?: string; endereco?: string; placa: string; modelo: string }, id?: number): void {
    const nome = dados.nome.trim();
    const veiculo = dados.modelo.trim();
    const placa = dados.placa.trim().toUpperCase();
    const alvo = id === undefined
      ? this.registrosClientes().find((c) => c.nome.toLocaleLowerCase() === nome.toLocaleLowerCase() || (dados.telefone && c.telefone === dados.telefone.trim()))
      : this.registrosClientes().find((c) => c.id === id);
    const enderecoFinal = dados.endereco?.trim() || alvo?.endereco || dados.cep.trim();
    const cadastro: Cliente = {
      id: alvo?.id ?? Math.max(Date.now(), ...this.registrosClientes().map((c) => c.id + 1)),
      nome,
      telefone: dados.telefone.trim(),
      cep: dados.cep.trim(),
      numero: dados.numero?.trim() ?? alvo?.numero,
      endereco: enderecoFinal,
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
    if (!this.somenteAdmin()) return;
    this.registrosClientes.update((lista) => lista.filter((c) => c.id !== id));
    this.notificar('Cliente excluído.');
    void this.excluirClienteApi(id);
  }

  private adicionarVeiculoAoCliente(nome: string, modelo: string, placa: string): void {
    const existente = this.registrosClientes().find((c) => c.nome.toLocaleLowerCase() === nome.toLocaleLowerCase());
    this.salvarCadastroClienteInterno({
      nome,
      telefone: existente?.telefone ?? '',
      cep: existente?.cep ?? '',
      placa,
      modelo,
    }, existente?.id);
  }

  atenderSolicitacao(id: number): void {
    if (!this.somenteAdmin()) return;
    this.solicitacoes.update((l) => l.filter((s) => s.id !== id));
    this.notificar('Solicitação marcada como atendida.');
  }

  transformarSolicitacaoEmOrdem(s: Solicitacao): void {
    if (!this.somenteAdmin()) return;
    const numero = Math.max(1000, ...this.ordens().map((o) => o.numero)) + 1;
    const nova: OrdemServico = {
      numero,
      cliente: s.nome,
      veiculo: s.veiculo,
      placa: s.placa,
      servico: s.servico,
      status: 'Em diagnóstico',
      valor: 0,
      box: true,
      criadaEm: new Date().toISOString(),
    };

    this.ordens.update((lista) => [nova, ...lista]);
    this.atenderSolicitacao(s.id);
    this.notificar(`OS #${numero} criada a partir da solicitação.`);
    void this.criarOrdemApi(nova);
  }

  // ---- integração com o backend ----
  private readonly ordensEmCriacao = new Map<number, Promise<number | null>>();

  private async extrairMensagemErro(res: Response, padrao: string): Promise<string> {
    try {
      const dados = await res.json();
      if (typeof dados?.message === 'string' && dados.message.trim()) return dados.message.trim();
      if (typeof dados?.detail === 'string' && dados.detail.trim()) return dados.detail.trim();
      if (typeof dados?.error === 'string' && dados.error.trim() && dados.error !== 'Not Found') return dados.error.trim();
    } catch {
      // Ignora erro de parse JSON
    }
    return padrao;
  }

  private async resolverIdOrdem(numero: number): Promise<number> {
    const pendente = this.ordensEmCriacao.get(numero);
    if (pendente) {
      const idCriado = await pendente;
      if (idCriado) return idCriado;
    }
    return numero;
  }

  private async garantirClienteEVeiculoNoBackend(
    dados: { nome: string; telefone: string; cep: string; numero?: string; endereco?: string; placa: string; modelo: string },
    idCliente?: number,
  ): Promise<{ clienteId: number; veiculoId?: number } | null> {
    if (!this.auth.token()) {
      this.auth.notificarFallback();
      return null;
    }

    const headers = this.auth.headersAuth();
    const enderecoParaBanco = (dados.endereco ?? '').trim() || dados.cep.trim();
    const placaLimpa = dados.placa.trim().toUpperCase();
    const modeloLimpo = dados.modelo.trim() || 'Veículo';

    // Se a placa já existe no banco, aproveitamos o veículo e o cliente dono dele
    let veiculoExistente: Record<string, any> | null = null;
    if (placaLimpa) {
      const resPlaca = await fetch(`${environment.apiUrl}/veiculos/${encodeURIComponent(placaLimpa)}`, { headers });
      if (resPlaca.ok) {
        veiculoExistente = await resPlaca.json();
      }
    }

    let clienteSalvo: Record<string, unknown> | null = null;

    if (veiculoExistente?.['cliente']?.id && !idCliente) {
      clienteSalvo = veiculoExistente['cliente'];
    }

    if (!clienteSalvo && idCliente && idCliente < 1_000_000_000) {
      const resBusca = await fetch(`${environment.apiUrl}/clientes/id/${idCliente}`, { headers });
      if (resBusca.ok) {
        const atual = await resBusca.json();
        const resPut = await fetch(`${environment.apiUrl}/clientes/${idCliente}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            nome: dados.nome.trim() || atual.nome,
            cpfCnpj: atual.cpfCnpj ?? null,
            telefone: dados.telefone.trim() || atual.telefone || '11999999999',
            endereco: enderecoParaBanco || atual.endereco || null,
            email: atual.email ?? null,
          }),
        });
        clienteSalvo = resPut.ok ? await resPut.json() : atual;
      }
    }

    if (!clienteSalvo && dados.nome.trim()) {
      const resLista = await fetch(`${environment.apiUrl}/clientes/${encodeURIComponent(dados.nome.trim())}`, { headers });
      if (resLista.ok) {
        const encontrados = await resLista.json();
        if (Array.isArray(encontrados) && encontrados.length > 0) {
          const exato = encontrados.find(
            (c: Record<string, any>) => String(c['nome'] ?? '').toLocaleLowerCase() === dados.nome.trim().toLocaleLowerCase(),
          ) ?? encontrados[0];
          if (enderecoParaBanco && exato.endereco !== enderecoParaBanco) {
            const resAtualiza = await fetch(`${environment.apiUrl}/clientes/${exato.id}`, {
              method: 'PUT',
              headers,
              body: JSON.stringify({
                nome: dados.nome.trim(),
                cpfCnpj: exato.cpfCnpj ?? null,
                telefone: dados.telefone.trim() || exato.telefone || '11999999999',
                endereco: enderecoParaBanco,
                email: exato.email ?? null,
              }),
            });
            clienteSalvo = resAtualiza.ok ? await resAtualiza.json() : exato;
          } else {
            clienteSalvo = exato;
          }
        }
      }
    }

    if (!clienteSalvo) {
      const resPost = await fetch(`${environment.apiUrl}/clientes`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          nome: dados.nome.trim(),
          cpfCnpj: null,
          telefone: dados.telefone.trim() || '11999999999',
          endereco: enderecoParaBanco || null,
        }),
      });
      if (resPost.ok) {
        clienteSalvo = await resPost.json();
      }
    }

    if (!clienteSalvo || typeof clienteSalvo['id'] !== 'number') return null;
    let clienteId = clienteSalvo['id'];

    let veiculoId: number | undefined;

    if (placaLimpa) {
      if (veiculoExistente?.['id']) {
        veiculoId = Number(veiculoExistente['id']);
        // Garante que o clienteId enviado na OS seja o proprietário real do veículo no banco
        if (veiculoExistente['cliente']?.id) {
          clienteId = Number(veiculoExistente['cliente'].id);
        }
      } else {
        const partes = modeloLimpo.split(' ');
        const marca = partes[0] || 'Geral';
        const modelo = partes.slice(1).join(' ') || modeloLimpo;
        const resNovoVeiculo = await fetch(`${environment.apiUrl}/veiculos`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            placa: placaLimpa,
            marca,
            modelo,
            ano: new Date().getFullYear(),
            cliente: { id: clienteId },
          }),
        });
        if (resNovoVeiculo.ok) {
          const vCriado = await resNovoVeiculo.json();
          veiculoId = Number(vCriado.id);
        }
      }
    }

    this.auth.marcarBackendOnline();
    return { clienteId, veiculoId };
  }

  private async salvarClienteApi(dados: { nome: string; telefone: string; cep: string; numero?: string; endereco?: string; placa: string; modelo: string }, id?: number): Promise<void> {
    try {
      const res = await this.garantirClienteEVeiculoNoBackend(dados, id);
      if (res) {
        await this.sincronizarComBackend();
      }
    } catch {
      this.auth.notificarFallback();
    }
  }

  private async excluirClienteApi(id: number): Promise<void> {
    if (!this.auth.token()) {
      this.auth.notificarFallback();
      return;
    }
    try {
      const r = await fetch(`${environment.apiUrl}/clientes/${id}`, {
        method: 'DELETE',
        headers: this.auth.headersAuth(),
      });
      if (r.ok || r.status === 204) {
        this.auth.marcarBackendOnline();
      }
    } catch {
      this.auth.notificarFallback();
    }
  }

  private async criarOrdemApi(nova: OrdemServico, clienteReferencia?: Cliente): Promise<void> {
    if (!this.auth.token()) {
      this.auth.notificarFallback();
      return;
    }
    const execucao = (async (): Promise<number | null> => {
      try {
        const cExistente = clienteReferencia
          ?? this.registrosClientes().find((c) => c.nome.toLocaleLowerCase() === nova.cliente.toLocaleLowerCase());
        const vinculo = await this.garantirClienteEVeiculoNoBackend({
          nome: nova.cliente,
          telefone: cExistente?.telefone || '11999999999',
          cep: cExistente?.cep ?? '',
          numero: cExistente?.numero,
          endereco: cExistente?.endereco ?? cExistente?.cep ?? '',
          placa: nova.placa,
          modelo: nova.veiculo,
        }, cExistente?.id);

        if (!vinculo || !vinculo.veiculoId) {
          this.ordens.update((lista) => lista.filter((o) => o.numero !== nova.numero));
          this.recalcularMesesDasOrdens();
          this.notificar('Não foi possível vincular cliente/veículo no servidor para criar a OS.');
          return null;
        }

        const headers = this.auth.headersAuth();
        const resOs = await fetch(`${environment.apiUrl}/ordens-servico`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            cliente: { id: vinculo.clienteId },
            veiculo: { id: vinculo.veiculoId },
            problemaRelatado: nova.servico || nova.pecasTexto || 'Manutenção geral',
            quilometragem: 10000,
            status: this.statusParaBack(nova.status),
            previsaoEntrega: nova.entrega ? nova.entrega.slice(0, 10) : null,
          }),
        });

        if (!resOs.ok) {
          const msgErro = await this.extrairMensagemErro(resOs, 'Não foi possível criar a OS no servidor.');
          this.ordens.update((lista) => lista.filter((o) => o.numero !== nova.numero));
          this.recalcularMesesDasOrdens();
          this.notificar(msgErro);
          return null;
        }
        const osCriada = await resOs.json();
        const idReal = Number(osCriada.id);

        const listaServicos = nova.itensServico ?? [];
        const listaPecas = nova.itensPeca ?? [];

        for (const s of listaServicos) {
          if (s.descricao.trim() || s.precoUnitario > 0) {
            await this.registrarServicoNaOrdemApi(idReal, s.descricao, s.precoUnitario, s.quantidade);
          }
        }

        for (const p of listaPecas) {
          if (p.nome.trim() || p.precoUnitario > 0) {
            await this.registrarPecaSimplesNaOrdemApi(idReal, p.nome, p.precoUnitario, p.quantidade);
          }
        }

        this.ordens.update((lista) =>
          lista.map((o) => (o.numero === nova.numero ? { ...o, numero: idReal } : o)),
        );
        await this.carregarDetalhesOrdemApi(idReal);
        this.auth.marcarBackendOnline();
        return idReal;
      } catch {
        this.auth.notificarFallback();
        return null;
      } finally {
        this.ordensEmCriacao.delete(nova.numero);
      }
    })();

    this.ordensEmCriacao.set(nova.numero, execucao);
    await execucao;
  }

  private async obterOuCriarServicoNoCatalogo(descricao: string, valor: number): Promise<number | null> {
    const headers = this.auth.headersAuth();
    const descLimpa = (descricao || 'Serviço de oficina').trim();
    const local = this.catalogoServicos().find(
      (sv) => sv.id < 1_000_000_000 && sv.descricao.toLocaleLowerCase() === descLimpa.toLocaleLowerCase(),
    );
    if (local) return local.id;

    try {
      const resBusca = await fetch(`${environment.apiUrl}/servicos/nome/${encodeURIComponent(descLimpa)}`, { headers });
      if (resBusca.ok) {
        const encontrados = await resBusca.json();
        if (Array.isArray(encontrados)) {
          const exato = encontrados.find(
            (sv: Record<string, any>) => String(sv['nome'] ?? '').toLocaleLowerCase() === descLimpa.toLocaleLowerCase(),
          ) ?? encontrados[0];
          if (exato?.id) return Number(exato.id);
        }
      }
    } catch {
      // Continua para criação
    }

    const resCatalogo = await fetch(`${environment.apiUrl}/servicos`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        nome: descLimpa,
        descricao: descLimpa,
        precoReferencia: valor,
        minutosEstimados: 60,
        ativo: true,
      }),
    });
    if (!resCatalogo.ok) return null;
    const servicoCatalogo = await resCatalogo.json();
    return Number(servicoCatalogo.id);
  }

  private async obterOuCriarPecaNoCatalogo(nomePeca: string, valorUnitario: number): Promise<number | null> {
    const headers = this.auth.headersAuth();
    const nomeLimpo = (nomePeca || 'Peça').trim();
    const local = this.catalogoPecas().find(
      (p) => p.id < 1_000_000_000 && p.nome.toLocaleLowerCase() === nomeLimpo.toLocaleLowerCase(),
    );
    if (local) return local.id;

    try {
      const resBusca = await fetch(`${environment.apiUrl}/pecas/nome/${encodeURIComponent(nomeLimpo)}`, { headers });
      if (resBusca.ok) {
        const encontrados = await resBusca.json();
        if (Array.isArray(encontrados)) {
          const exato = encontrados.find(
            (p: Record<string, any>) => String(p['nome'] ?? '').toLocaleLowerCase() === nomeLimpo.toLocaleLowerCase(),
          ) ?? encontrados[0];
          if (exato?.id) return Number(exato.id);
        }
      }
    } catch {
      // Continua para criação
    }

    const resCatalogo = await fetch(`${environment.apiUrl}/pecas`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        nome: nomeLimpo,
        codigo: null,
        precoReferencia: valorUnitario,
        ativo: true,
      }),
    });
    if (!resCatalogo.ok) return null;
    const pecaCatalogo = await resCatalogo.json();
    return Number(pecaCatalogo.id);
  }

  private async registrarServicoNaOrdemApi(ordemId: number, descricao: string, valorUnitario: number, quantidade = 1): Promise<void> {
    const headers = this.auth.headersAuth();
    const servicoId = await this.obterOuCriarServicoNoCatalogo(descricao, valorUnitario);
    if (!servicoId) return;

    await fetch(`${environment.apiUrl}/ordens-servico/${ordemId}/servicos`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        servico: { id: servicoId },
        quantidade: Math.max(1, Number(quantidade) || 1),
        precoUnitario: valorUnitario,
        extra: false,
        metodoAprovacao: 'PRESENCIAL',
      }),
    });
  }

  private async registrarPecaSimplesNaOrdemApi(ordemId: number, nomePeca: string, valorUnitario: number, quantidade = 1): Promise<void> {
    const headers = this.auth.headersAuth();
    const pecaId = await this.obterOuCriarPecaNoCatalogo(nomePeca, valorUnitario);
    if (!pecaId) return;

    await fetch(`${environment.apiUrl}/ordens-servico/${ordemId}/pecas`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        peca: { id: pecaId },
        quantidade: Math.max(1, Number(quantidade) || 1),
        precoUnitario: valorUnitario,
        origem: 'NOVA',
        pendente: false,
      }),
    });
  }

  private async salvarPecaCatalogoApi(item: PecaCatalogo, idExistente?: number): Promise<void> {
    if (!this.auth.token()) {
      this.auth.notificarFallback();
      return;
    }
    try {
      const headers = this.auth.headersAuth();
      const ehIdBack = idExistente !== undefined && idExistente < 1_000_000_000;
      const url = ehIdBack ? `${environment.apiUrl}/pecas/${idExistente}` : `${environment.apiUrl}/pecas`;
      const method = ehIdBack ? 'PUT' : 'POST';
      const r = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          codigo: item.codigoFabricante ?? null,
          nome: item.nome,
          precoReferencia: item.precoVenda || item.precoCusto || 0,
          ativo: true,
        }),
      });
      if (!r.ok) return;
      const salvo = await r.json();
      const idReal = Number(salvo.id);
      this.catalogoPecas.update((lista) =>
        lista.map((p) => (p.id === item.id ? { ...p, id: idReal } : p)),
      );
      this.auth.marcarBackendOnline();
    } catch {
      this.auth.notificarFallback();
    }
  }

  private async excluirPecaCatalogoApi(id: number): Promise<void> {
    if (!this.auth.token()) {
      this.auth.notificarFallback();
      return;
    }
    try {
      const r = await fetch(`${environment.apiUrl}/pecas/${id}`, {
        method: 'DELETE',
        headers: this.auth.headersAuth(),
      });
      if (r.ok || r.status === 204) {
        this.auth.marcarBackendOnline();
      }
    } catch {
      this.auth.notificarFallback();
    }
  }

  private async salvarServicoCatalogoApi(item: ServicoCatalogo, idExistente?: number): Promise<void> {
    if (!this.auth.token()) {
      this.auth.notificarFallback();
      return;
    }
    try {
      const headers = this.auth.headersAuth();
      const ehIdBack = idExistente !== undefined && idExistente < 1_000_000_000;
      const url = ehIdBack ? `${environment.apiUrl}/servicos/${idExistente}` : `${environment.apiUrl}/servicos`;
      const method = ehIdBack ? 'PUT' : 'POST';
      const r = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          nome: item.descricao,
          descricao: item.descricao,
          precoReferencia: item.precoPadrao,
          minutosEstimados: item.tempoEstimadoMinutos ?? 60,
          ativo: true,
        }),
      });
      if (!r.ok) return;
      const salvo = await r.json();
      const idReal = Number(salvo.id);
      this.catalogoServicos.update((lista) =>
        lista.map((sv) => (sv.id === item.id ? { ...sv, id: idReal } : sv)),
      );
      this.auth.marcarBackendOnline();
    } catch {
      this.auth.notificarFallback();
    }
  }

  private async excluirServicoCatalogoApi(id: number): Promise<void> {
    if (!this.auth.token()) {
      this.auth.notificarFallback();
      return;
    }
    try {
      const r = await fetch(`${environment.apiUrl}/servicos/${id}`, {
        method: 'DELETE',
        headers: this.auth.headersAuth(),
      });
      if (r.ok || r.status === 204) {
        this.auth.marcarBackendOnline();
      }
    } catch {
      this.auth.notificarFallback();
    }
  }

  private async mudarStatusApi(numero: number, status: StatusOS): Promise<void> {
    if (!this.auth.token()) {
      this.auth.notificarFallback();
      return;
    }
    try {
      const idReal = await this.resolverIdOrdem(numero);
      const statusEnum = this.statusParaBack(status);
      const r = await fetch(`${environment.apiUrl}/ordens-servico/${idReal}/status`, {
        method: 'PATCH',
        headers: this.auth.headersAuth(),
        body: JSON.stringify({
          novoStatus: statusEnum,
          justificativa: `Status alterado para ${status} pelo painel`,
        }),
      });
      if (r.ok) {
        this.auth.marcarBackendOnline();
      } else {
        const msg = await this.extrairMensagemErro(
          r,
          'Não foi possível alterar o status: verifique se a OS está salva ou possui pendências.',
        );
        this.notificar(msg);
        await this.sincronizarComBackend();
      }
    } catch {
      this.auth.notificarFallback();
    }
  }

  private async atualizarValorOrdemApi(numero: number, valor: number): Promise<void> {
    if (!this.auth.token()) {
      this.auth.notificarFallback();
      return;
    }
    try {
      const idReal = await this.resolverIdOrdem(numero);
      const headers = this.auth.headersAuth();
      const resItens = await fetch(`${environment.apiUrl}/ordens-servico/${idReal}/servicos`, { headers });
      if (!resItens.ok) return;
      const itens = await resItens.json();

      if (Array.isArray(itens) && itens.length > 0) {
        const primeiro = itens[0];
        await fetch(`${environment.apiUrl}/ordens-servico/${idReal}/servicos/${primeiro.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            servico: { id: primeiro.servico?.id },
            quantidade: Number(primeiro.quantidade ?? 1),
            precoUnitario: valor,
            extra: Boolean(primeiro.extra),
            metodoAprovacao: primeiro.metodoAprovacao ?? 'PRESENCIAL',
          }),
        });
      } else {
        const ordemLocal = this.ordens().find((o) => o.numero === idReal || o.numero === numero);
        await this.registrarServicoNaOrdemApi(idReal, ordemLocal?.servico ?? 'Serviço geral', valor);
      }
      this.auth.marcarBackendOnline();
    } catch {
      this.auth.notificarFallback();
    }
  }

  private async atualizarValoresOrdemApi(numero: number, valorServico: number, valorPecas: number): Promise<void> {
    if (!this.auth.token()) {
      this.auth.notificarFallback();
      return;
    }
    try {
      const idReal = await this.resolverIdOrdem(numero);
      await this.atualizarValorOrdemApi(idReal, valorServico);
      const headers = this.auth.headersAuth();
      const resPecas = await fetch(`${environment.apiUrl}/ordens-servico/${idReal}/pecas`, { headers });
      if (resPecas.ok) {
        const pecas = await resPecas.json();
        if (Array.isArray(pecas) && pecas.length > 0) {
          const primeira = pecas[0];
          await fetch(`${environment.apiUrl}/ordens-servico/${idReal}/pecas/${primeira.id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              peca: { id: primeira.peca?.id },
              quantidade: Number(primeira.quantidade ?? 1),
              precoUnitario: valorPecas,
              origem: primeira.origem ?? 'NOVA',
              pendente: Boolean(primeira.pendente),
            }),
          });
        } else if (valorPecas > 0) {
          const ordemLocal = this.ordens().find((o) => o.numero === idReal || o.numero === numero);
          await this.registrarPecaSimplesNaOrdemApi(idReal, ordemLocal?.pecasTexto || 'Peças da OS', valorPecas);
        }
      }
      this.auth.marcarBackendOnline();
    } catch {
      this.auth.notificarFallback();
    }
  }

  private async excluirOrdemApi(numero: number): Promise<void> {
    if (!this.auth.token()) {
      this.auth.notificarFallback();
      return;
    }
    try {
      const idReal = await this.resolverIdOrdem(numero);
      const r = await fetch(`${environment.apiUrl}/ordens-servico/${idReal}`, {
        method: 'DELETE',
        headers: this.auth.headersAuth(),
      });
      if (r.ok || r.status === 204) {
        this.auth.marcarBackendOnline();
      } else {
        const msg = await this.extrairMensagemErro(r, 'Não foi possível excluir/cancelar a OS.');
        this.notificar(msg);
        await this.sincronizarComBackend();
      }
    } catch {
      this.auth.notificarFallback();
    }
  }

  async carregarDetalhesOrdemApi(ordemId: number): Promise<{
    pecas: Array<{ id: number; nome: string; quantidade: number; precoUnitario: number; origemPeca: string; statusPeca: string }>;
    servicos: Array<{ id: number; descricao: string; precoCobrado: number; extra: boolean; aprovadoCliente: boolean }>;
    resumo: { totalServicos: number; totalPecas: number; valorTotalOrdem: number };
    historico: Array<{ id: number; statusAnterior: string; statusNovo: string; dataAlteracao: string; alteradoPor: string }>;
  } | null> {
    if (!this.auth.token()) {
      this.auth.notificarFallback();
      return null;
    }

    try {
      const idReal = await this.resolverIdOrdem(ordemId);
      const headers = this.auth.headersAuth();
      const [resPecas, resServicos, resResumo, resHistorico] = await Promise.all([
        fetch(`${environment.apiUrl}/ordens-servico/${idReal}/pecas`, { headers }),
        fetch(`${environment.apiUrl}/ordens-servico/${idReal}/servicos`, { headers }),
        fetch(`${environment.apiUrl}/ordens-servico/${idReal}/resumo`, { headers }),
        fetch(`${environment.apiUrl}/ordens-servico/${idReal}/historico`, { headers }),
      ]);

      if (!resPecas.ok || !resServicos.ok || !resResumo.ok || !resHistorico.ok) {
        return null;
      }

      this.auth.marcarBackendOnline();
      const pecasRaw = await resPecas.json();
      const servicosRaw = await resServicos.json();
      const resumoRaw = await resResumo.json();
      const historicoRaw = await resHistorico.json();

      const pecas = Array.isArray(pecasRaw)
        ? pecasRaw.map((p: Record<string, any>) => ({
            id: Number(p['id']),
            nome: String(p['peca']?.nome ?? 'Peça'),
            quantidade: Number(p['quantidade'] ?? 1),
            precoUnitario: Number(p['precoUnitario'] ?? p['precoUnitarioCobrado'] ?? 0),
            origemPeca: String(p['origem'] ?? p['origemPeca'] ?? 'NOVA'),
            statusPeca: p['pendente'] ? 'PENDENTE' : 'INSTALADA',
          }))
        : [];

      const servicos = Array.isArray(servicosRaw)
        ? servicosRaw.map((sv: Record<string, any>) => ({
            id: Number(sv['id']),
            descricao: String(sv['servico']?.nome ?? sv['servico']?.descricao ?? 'Serviço'),
            quantidade: Number(sv['quantidade'] ?? 1),
            precoCobrado: Number(sv['precoUnitario'] ?? sv['precoCobrado'] ?? 0),
            extra: Boolean(sv['extra']),
            aprovadoCliente: Boolean(sv['aprovadoEm'] || sv['metodoAprovacao'] || sv['aprovadoCliente']),
          }))
        : [];

      const resumo = {
        totalServicos: Number(resumoRaw?.totalServicos ?? 0),
        totalPecas: Number(resumoRaw?.totalPecas ?? 0),
        valorTotalOrdem: Number(resumoRaw?.valorTotal ?? resumoRaw?.valorTotalOrdem ?? 0),
      };

      const historico = Array.isArray(historicoRaw)
        ? historicoRaw.map((h: Record<string, any>) => ({
            id: Number(h['id']),
            statusAnterior: String(h['statusAnterior'] ?? '—'),
            statusNovo: String(h['statusNovo'] ?? ''),
            dataAlteracao: String(h['criadoEm'] ?? h['dataAlteracao'] ?? ''),
            alteradoPor: String(h['usuario']?.nome ?? h['alteradoPor']?.nome ?? 'Sistema'),
          }))
        : [];

      const pecasTexto = pecas.map((p) => (p.quantidade > 1 ? `${p.quantidade}x ${p.nome}` : p.nome)).join(', ');
      const servicoTexto = servicos.map((sv) => (sv.quantidade > 1 ? `${sv.quantidade}x ${sv.descricao}` : sv.descricao)).join(', ');
      const itensServico: ItemServicoOS[] = servicos.map((sv) => ({
        id: sv.id,
        descricao: sv.descricao,
        quantidade: sv.quantidade,
        precoUnitario: sv.precoCobrado,
      }));
      const itensPeca: ItemPecaOS[] = pecas.map((p) => ({
        id: p.id,
        nome: p.nome,
        quantidade: p.quantidade,
        precoUnitario: p.precoUnitario,
      }));
      this.ordens.update((lista) =>
        lista.map((o) =>
          o.numero === idReal || o.numero === ordemId
            ? {
                ...o,
                numero: idReal,
                servico: servicoTexto || o.servico,
                pecasTexto,
                itensServico,
                itensPeca,
                valorServico: resumo.totalServicos,
                valorPecas: resumo.totalPecas,
                valor: resumo.valorTotalOrdem,
              }
            : o,
        ),
      );
      this.recalcularMesesDasOrdens();

      return { pecas, servicos, resumo, historico };
    } catch {
      this.auth.notificarFallback();
      return null;
    }
  }

  async adicionarPecaNaOrdemApi(
    ordemId: number,
    dados: { nome: string; quantidade: number; precoUnitario: number; origemPeca: string; statusPeca: string },
  ): Promise<boolean> {
    if (!this.somenteAdmin()) return false;
    if (!this.auth.token()) {
      this.auth.notificarFallback();
      return false;
    }

    try {
      const headers = this.auth.headersAuth();
      const pecaId = await this.obterOuCriarPecaNoCatalogo(dados.nome, dados.precoUnitario);
      if (!pecaId) return false;

      const origemMap = dados.origemPeca === 'CLIENTE' ? 'CLIENTE' : dados.origemPeca === 'USADA' ? 'USADA' : 'NOVA';
      const pendente = dados.statusPeca === 'PENDENTE' || dados.statusPeca === 'AGUARDANDO_ENTREGA';

      const resItem = await fetch(`${environment.apiUrl}/ordens-servico/${ordemId}/pecas`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          peca: { id: pecaId },
          quantidade: dados.quantidade,
          precoUnitario: dados.precoUnitario,
          origem: origemMap,
          pendente,
        }),
      });

      if (!resItem.ok) return false;
      this.auth.marcarBackendOnline();
      this.notificar('Peça adicionada à OS.');
      return true;
    } catch {
      this.auth.notificarFallback();
      return false;
    }
  }

  async removerPecaDaOrdemApi(ordemId: number, itemId: number): Promise<boolean> {
    if (!this.somenteAdmin()) return false;
    if (!this.auth.token()) {
      this.auth.notificarFallback();
      return false;
    }
    try {
      const r = await fetch(`${environment.apiUrl}/ordens-servico/${ordemId}/pecas/${itemId}`, {
        method: 'DELETE',
        headers: this.auth.headersAuth(),
      });
      if (!r.ok && r.status !== 204) return false;
      this.auth.marcarBackendOnline();
      this.notificar('Peça removida da OS.');
      return true;
    } catch {
      this.auth.notificarFallback();
      return false;
    }
  }

  async adicionarServicoDetalhadoNaOrdemApi(
    ordemId: number,
    dados: { descricao: string; precoCobrado: number; extra: boolean; aprovadoCliente: boolean },
  ): Promise<boolean> {
    if (!this.somenteAdmin()) return false;
    if (!this.auth.token()) {
      this.auth.notificarFallback();
      return false;
    }

    try {
      const headers = this.auth.headersAuth();
      const servicoId = await this.obterOuCriarServicoNoCatalogo(dados.descricao, dados.precoCobrado);
      if (!servicoId) return false;

      const resItem = await fetch(`${environment.apiUrl}/ordens-servico/${ordemId}/servicos`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          servico: { id: servicoId },
          quantidade: 1,
          precoUnitario: dados.precoCobrado,
          extra: dados.extra,
          metodoAprovacao: dados.aprovadoCliente ? 'PRESENCIAL' : null,
        }),
      });

      if (!resItem.ok) return false;
      this.auth.marcarBackendOnline();
      this.notificar('Serviço adicionado à OS.');
      return true;
    } catch {
      this.auth.notificarFallback();
      return false;
    }
  }

  async removerServicoDaOrdemApi(ordemId: number, itemId: number): Promise<boolean> {
    if (!this.somenteAdmin()) return false;
    if (!this.auth.token()) {
      this.auth.notificarFallback();
      return false;
    }
    try {
      const r = await fetch(`${environment.apiUrl}/ordens-servico/${ordemId}/servicos/${itemId}`, {
        method: 'DELETE',
        headers: this.auth.headersAuth(),
      });
      if (!r.ok && r.status !== 204) return false;
      this.auth.marcarBackendOnline();
      this.notificar('Serviço removido da OS.');
      return true;
    } catch {
      this.auth.notificarFallback();
      return false;
    }
  }

  private somenteAdmin(): boolean {
    if (this.auth.perfil() === 'admin') return true;
    this.notificar('Somente um administrador pode fazer alterações.');
    return false;
  }

  //Exporta Relatório
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
    a.download = `oficina-do-joe-relatorio-${m.chave}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.notificar('Relatório exportado.');
  }

  notificar(msg: string): void {
    this.toast.set(msg);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.toast.set(null), 4000);
  }

  //Persistência Local
  private carregar(): void {
    try {
      const bruto = typeof localStorage !== 'undefined'
        ? localStorage.getItem(CHAVE_ARMAZENAMENTO) ?? localStorage.getItem(CHAVE_ARMAZENAMENTO_ANTIGA)
        : null;
      if (bruto && typeof localStorage !== 'undefined' && !localStorage.getItem(CHAVE_ARMAZENAMENTO)) {
        localStorage.setItem(CHAVE_ARMAZENAMENTO, bruto);
      }
      if (!bruto) {
        this.migrarClientesDasOrdens();
        return;
      }
      const d = JSON.parse(bruto);
      if (Array.isArray(d.ordens)) this.ordens.set(d.ordens);
      if (Array.isArray(d.meses)) this.meses.set(d.meses);
      if (typeof d.mesChave === 'string') this.mesChave.set(d.mesChave);
      if (Array.isArray(d.solicitacoes)) this.solicitacoes.set(d.solicitacoes);
      if (Array.isArray(d.catalogoPecas)) this.catalogoPecas.set(d.catalogoPecas);
      if (Array.isArray(d.catalogoServicos)) this.catalogoServicos.set(d.catalogoServicos);
      if (Array.isArray(d.clientes)) this.registrosClientes.set(d.clientes);
      else this.migrarClientesDasOrdens();
      if (!this.meses().some((mes) => mes.chave === this.mesChave())) {
        const maisRecente = [...this.meses()].sort((a, b) => b.chave.localeCompare(a.chave))[0];
        this.mesChave.set(maisRecente?.chave ?? '');
      }
    } catch {
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

  private salvar(
    ordens: OrdemServico[],
    solicitacoes: Solicitacao[],
    clientes: Cliente[],
    meses: MesFinanceiro[],
    mesChave: string,
    catalogoPecas: PecaCatalogo[],
    catalogoServicos: ServicoCatalogo[],
  ): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
          CHAVE_ARMAZENAMENTO,
          JSON.stringify({ ordens, solicitacoes, clientes, meses, mesChave, catalogoPecas, catalogoServicos }),
        );
      }
    } catch {}
  }
}