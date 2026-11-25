import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Icon } from '../../../shared/icon/icon';
import { montarLinkWhatsappOrdem, normalizarTelefoneWhatsapp } from '../../../shared/contato';
import { classeStatus } from '../../../shared/status';
import { ItemPecaOS, ItemServicoOS, OrdemServico, STATUS_LISTA, StatusOS } from '../../../entities/oficina';
import { AuthService } from '../../../services/auth';
import { OficinaService } from '../../../services/oficina';

@Component({
  selector: 'app-ordens',
  imports: [CurrencyPipe, DatePipe, FormsModule, Icon],
  templateUrl: './ordens.html',
  styleUrl: './ordens.css',
})
export class Ordens {
  s = inject(OficinaService);
  private auth = inject(AuthService);
  podeEditar = this.auth.perfil() === 'admin';
  statusLista = STATUS_LISTA;
  classeStatus = classeStatus;

  busca = signal('');
  filtro = signal<StatusOS | 'Todas'>('Todas');
  formAberto = signal(false);
  ordemGerenciando = signal<number | null>(null);
  ofertaWhatsapp = signal<{ numero: number; motivo: string } | null>(null);
  sugestoesBusca = signal<Array<{ cliente: string; veiculo: string; placa: string }>>([]);

  novo = this.vazio();
  itensServicoForm = signal<ItemServicoOS[]>([]);
  itensPecaForm = signal<ItemPecaOS[]>([]);

  rascunhoServico = { descricao: '', quantidade: 1, precoUnitario: null as number | null };
  rascunhoPeca = { nome: '', quantidade: 1, precoUnitario: null as number | null };

  edicaoServico = { descricao: '', quantidade: 1, precoUnitario: null as number | null };
  edicaoPeca = { nome: '', quantidade: 1, precoUnitario: null as number | null };

  filtradas = computed(() => {
    const q = this.busca().trim().toLowerCase();
    return [...this.s.ordens()]
      .sort((a, b) => b.numero - a.numero)
      .filter((o) => this.filtro() === 'Todas' || o.status === this.filtro())
      .filter((o) => !q || `${o.numero} ${o.cliente} ${o.veiculo} ${o.placa} ${o.servico} ${o.pecasTexto ?? ''}`.toLowerCase().includes(q));
  });
  total = computed(() => this.filtradas().reduce((t, o) => t + o.valor, 0));

  totalServicosForm = computed(() =>
    this.itensServicoForm().reduce((t, item) => t + item.quantidade * item.precoUnitario, 0),
  );
  totalPecasForm = computed(() =>
    this.itensPecaForm().reduce((t, item) => t + item.quantidade * item.precoUnitario, 0),
  );

  ordemSelecionada = computed(() => {
    const num = this.ordemGerenciando();
    return num === null ? null : (this.s.ordens().find((o) => o.numero === num) ?? null);
  });

  contar(st: StatusOS | 'Todas'): number {
    return st === 'Todas' ? this.s.ordens().length : this.s.ordens().filter((o) => o.status === st).length;
  }

  private vazio() {
    return {
      cliente: '',
      veiculo: '',
      placa: '',
      status: 'Em diagnóstico' as StatusOS,
      entrega: '',
    };
  }

  private atualizarSugestoesLocais(termo: string): void {
    const q = termo.trim().toLowerCase();
    if (!q) {
      this.sugestoesBusca.set([]);
      return;
    }
    const resultados: Array<{ cliente: string; veiculo: string; placa: string }> = [];
    for (const c of this.s.registrosClientes()) {
      if (c.veiculos.length === 0 && c.nome.toLowerCase().includes(q)) {
        resultados.push({ cliente: c.nome, veiculo: '', placa: '' });
      }
      for (const v of c.veiculos) {
        if (
          c.nome.toLowerCase().includes(q)
          || v.placa.toLowerCase().includes(q)
          || v.modelo.toLowerCase().includes(q)
        ) {
          resultados.push({ cliente: c.nome, veiculo: v.modelo, placa: v.placa });
        }
      }
    }
    this.sugestoesBusca.set(resultados.slice(0, 5));
  }

  async aoDigitarCliente(): Promise<void> {
    const nome = this.novo.cliente.trim();
    this.atualizarSugestoesLocais(nome);
    if (nome.length < 2) return;

    const exatoLocal = this.s.registrosClientes().find(
      (c) => c.nome.toLocaleLowerCase() === nome.toLocaleLowerCase(),
    );
    if (exatoLocal && exatoLocal.veiculos.length > 0) {
      this.novo.veiculo = exatoLocal.veiculos[0].modelo;
      this.novo.placa = exatoLocal.veiculos[0].placa;
      this.sugestoesBusca.set([]);
      return;
    }

    const res = await this.s.buscarClientePorNomeOuPlaca(nome, 'cliente');
    if (res && res.cliente.toLocaleLowerCase() === this.novo.cliente.trim().toLocaleLowerCase()) {
      if (res.veiculo) this.novo.veiculo = res.veiculo;
      if (res.placa) this.novo.placa = res.placa;
    }
  }

  async aoDigitarPlaca(): Promise<void> {
    this.novo.placa = this.novo.placa.toUpperCase();
    const placa = this.novo.placa.trim();
    this.atualizarSugestoesLocais(placa);
    if (placa.length < 3) return;

    const res = await this.s.buscarClientePorNomeOuPlaca(placa, 'placa');
    if (res) {
      if (res.cliente) this.novo.cliente = res.cliente;
      if (res.veiculo) this.novo.veiculo = res.veiculo;
      if (res.placa && placa.replace(/[^A-Z0-9]/g, '').length >= 7) {
        this.novo.placa = res.placa;
        this.sugestoesBusca.set([]);
      }
    }
  }

  selecionarSugestao(item: { cliente: string; veiculo: string; placa: string }): void {
    this.novo.cliente = item.cliente;
    if (item.veiculo) this.novo.veiculo = item.veiculo;
    if (item.placa) this.novo.placa = item.placa;
    this.sugestoesBusca.set([]);
  }

  aoDigitarRascunhoServico(alvo: { descricao: string; precoUnitario: number | null }): void {
    const encontrado = this.s.catalogoServicos().find(
      (sv) => sv.descricao.toLocaleLowerCase() === alvo.descricao.trim().toLocaleLowerCase(),
    );
    if (encontrado) {
      alvo.precoUnitario = encontrado.precoPadrao;
    }
  }

  aoDigitarRascunhoPeca(alvo: { nome: string; precoUnitario: number | null }): void {
    const encontrada = this.s.catalogoPecas().find(
      (p) => p.nome.toLocaleLowerCase() === alvo.nome.trim().toLocaleLowerCase(),
    );
    if (encontrada) {
      alvo.precoUnitario = encontrada.precoVenda;
    }
  }

  adicionarServicoForm(): void {
    const desc = this.rascunhoServico.descricao.trim();
    if (!desc) return;
    const qtd = Math.max(1, Number(this.rascunhoServico.quantidade) || 1);
    const preco = Number(this.rascunhoServico.precoUnitario) || 0;
    this.itensServicoForm.update((l) => [...l, { descricao: desc, quantidade: qtd, precoUnitario: preco }]);
    this.rascunhoServico = { descricao: '', quantidade: 1, precoUnitario: null };
  }

  removerServicoForm(indice: number): void {
    this.itensServicoForm.update((l) => l.filter((_, i) => i !== indice));
  }

  adicionarPecaForm(): void {
    const nome = this.rascunhoPeca.nome.trim();
    if (!nome) return;
    const qtd = Math.max(1, Number(this.rascunhoPeca.quantidade) || 1);
    const preco = Number(this.rascunhoPeca.precoUnitario) || 0;
    this.itensPecaForm.update((l) => [...l, { nome, quantidade: qtd, precoUnitario: preco }]);
    this.rascunhoPeca = { nome: '', quantidade: 1, precoUnitario: null };
  }

  removerPecaForm(indice: number): void {
    this.itensPecaForm.update((l) => l.filter((_, i) => i !== indice));
  }

  salvar(f: NgForm): void {
    if (f.invalid) {
      f.control.markAllAsTouched();
      return;
    }
    if (this.rascunhoServico.descricao.trim()) {
      this.adicionarServicoForm();
    }
    if (this.rascunhoPeca.nome.trim()) {
      this.adicionarPecaForm();
    }
    if (this.itensServicoForm().length === 0 && this.itensPecaForm().length === 0) {
      this.s.notificar('Adicione pelo menos um serviço ou peça na OS.');
      return;
    }

    this.s.criarOrdem({
      cliente: this.novo.cliente,
      veiculo: this.novo.veiculo,
      placa: this.novo.placa,
      itensServico: this.itensServicoForm(),
      itensPeca: this.itensPecaForm(),
      status: this.novo.status,
      entrega: this.novo.entrega,
    });
    this.novo = this.vazio();
    this.itensServicoForm.set([]);
    this.itensPecaForm.set([]);
    this.sugestoesBusca.set([]);
    f.resetForm(this.novo);
    this.formAberto.set(false);
  }

  excluir(numero: number): void {
    if (typeof confirm === 'undefined' || confirm(`Excluir a OS #${numero}?`)) this.s.excluirOrdem(numero);
  }

  async abrirGerenciarItens(o: OrdemServico): Promise<void> {
    if (this.ordemGerenciando() === o.numero) {
      this.ordemGerenciando.set(null);
      return;
    }
    this.ordemGerenciando.set(o.numero);
    this.edicaoServico = { descricao: '', quantidade: 1, precoUnitario: null };
    this.edicaoPeca = { nome: '', quantidade: 1, precoUnitario: null };
    await this.s.carregarDetalhesOrdemApi(o.numero);
  }

  async adicionarServicoOrdem(numero: number): Promise<void> {
    const desc = this.edicaoServico.descricao.trim();
    if (!desc) return;
    await this.s.adicionarItemServicoNaOrdem(numero, {
      descricao: desc,
      quantidade: Math.max(1, Number(this.edicaoServico.quantidade) || 1),
      precoUnitario: Number(this.edicaoServico.precoUnitario) || 0,
    });
    this.edicaoServico = { descricao: '', quantidade: 1, precoUnitario: null };
    this.ofertaWhatsapp.set({ numero, motivo: `Serviço "${desc}" adicionado à OS` });
  }

  async removerServicoOrdem(numero: number, indice: number, itemId?: number): Promise<void> {
    await this.s.removerItemServicoDaOrdem(numero, indice, itemId);
    this.ofertaWhatsapp.set({ numero, motivo: 'Lista de serviços da OS atualizada' });
  }

  async adicionarPecaOrdem(numero: number): Promise<void> {
    const nome = this.edicaoPeca.nome.trim();
    if (!nome) return;
    await this.s.adicionarItemPecaNaOrdem(numero, {
      nome,
      quantidade: Math.max(1, Number(this.edicaoPeca.quantidade) || 1),
      precoUnitario: Number(this.edicaoPeca.precoUnitario) || 0,
    });
    this.edicaoPeca = { nome: '', quantidade: 1, precoUnitario: null };
    this.ofertaWhatsapp.set({ numero, motivo: `Peça/produto "${nome}" adicionado à OS` });
  }

  async removerPecaOrdem(numero: number, indice: number, itemId?: number): Promise<void> {
    await this.s.removerItemPecaDaOrdem(numero, indice, itemId);
    this.ofertaWhatsapp.set({ numero, motivo: 'Lista de peças/produtos da OS atualizada' });
  }

  telefoneDaOrdem(o: OrdemServico): string {
    return this.s.obterTelefoneCliente(o.cliente, o.placa);
  }

  enviarWhatsapp(o: OrdemServico, motivo?: string): void {
    const telefone = this.telefoneDaOrdem(o);
    if (!normalizarTelefoneWhatsapp(telefone)) {
      this.s.notificar(`O cliente ${o.cliente} não possui telefone cadastrado. Atualize o cadastro na aba Clientes.`);
      return;
    }
    const link = montarLinkWhatsappOrdem(o, telefone, motivo);
    if (typeof window !== 'undefined') {
      window.open(link, '_blank', 'noopener');
    }
    if (this.ofertaWhatsapp()?.numero === o.numero) {
      this.ofertaWhatsapp.set(null);
    }
  }

  enviarOfertaWhatsapp(): void {
    const oferta = this.ofertaWhatsapp();
    if (!oferta) return;
    const ordem = this.s.ordens().find((o) => o.numero === oferta.numero);
    if (!ordem) {
      this.ofertaWhatsapp.set(null);
      return;
    }
    this.enviarWhatsapp(ordem, oferta.motivo);
  }

  mudar(numero: number, status: string): void {
    this.s.mudarStatus(numero, status as StatusOS);
  }
}
