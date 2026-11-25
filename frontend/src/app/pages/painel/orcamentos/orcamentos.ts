import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { OficinaService } from '../../../services/oficina';
import { Icon } from '../../../shared/icon/icon';
import { montarLinkWhatsappOrdem, normalizarTelefoneWhatsapp } from '../../../shared/contato';

@Component({
  selector: 'app-orcamentos',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, Icon],
  template: `
    <div class="cabeca">
      <div>
        <h1 class="pagina-titulo">Orçamentos</h1>
        <p class="pagina-sub">Some peças e materiais ao valor da mão de obra ou vincule itens diretamente a uma Ordem de Serviço.</p>
      </div>
    </div>

    <section class="card calculadora">
      <div>
        <h2>Calcular orçamento rápido</h2>
        <p class="mut">Informe o total de peças e materiais e o valor da mão de obra.</p>
      </div>

      <div class="campos">
        <label class="campo">Peças e materiais (R$)
          <input name="materiais" type="number" min="0" step="0.01" [ngModel]="materiais()" (ngModelChange)="materiais.set($event === null ? null : +$event)" placeholder="0,00" />
        </label>
        <label class="campo">Mão de obra (R$)
          <input name="maoDeObra" type="number" min="0" step="0.01" [ngModel]="maoDeObra()" (ngModelChange)="maoDeObra.set($event === null ? null : +$event)" placeholder="0,00" />
        </label>
      </div>

      @if (valoresInvalidos()) {
        <p class="erro" role="alert">Os valores de peças, materiais e mão de obra não podem ser negativos.</p>
      }
      <div class="resultado">
        <span>Total do orçamento</span>
        <strong>{{ total() | currency: 'BRL' : 'symbol' : '1.2-2' }}</strong>
      </div>
      <div class="acoes">
        <button class="btn" type="button" (click)="limpar()">Limpar cálculo</button>
      </div>
    </section>

    <section class="card calculadora detalhe-os">
      <div>
        <h2>Peças, Serviços e Histórico por Ordem de Serviço</h2>
        <p class="mut">Selecione uma OS para detalhar peças, serviços (mão de obra), resumo financeiro e histórico de status no banco.</p>
      </div>

      <div class="campos">
        <label class="campo">Ordem de Serviço
          <select name="ordemSelecionada" [ngModel]="ordemId()" (ngModelChange)="selecionarOrdem($event)">
            <option [ngValue]="null">Selecione uma OS...</option>
            @for (o of s.ordens(); track o.numero) {
              <option [ngValue]="o.numero">OS #{{ o.numero }} — {{ o.cliente }} ({{ o.veiculo }} · {{ o.placa }})</option>
            }
          </select>
        </label>
      </div>

      @if (ordemId() !== null) {
        <div class="acoes">
          <button class="btn sm btn-whats" type="button" (click)="enviarWhatsappOrdemSelecionada()">
            <app-icon name="message" [size]="15" /> Enviar OS no WhatsApp
          </button>
        </div>

        @if (ofertaWhatsapp(); as motivo) {
          <div class="aviso-whats" role="status">
            <div class="aviso-whats-texto">
              <strong>{{ motivo }}.</strong>
              <span>Deseja enviar a OS #{{ ordemId() }} atualizada por WhatsApp para o cliente?</span>
            </div>
            <div class="acoes">
              <button class="btn sm btn-whats" type="button" (click)="enviarWhatsappOrdemSelecionada(motivo)">
                <app-icon name="message" [size]="15" /> Enviar agora
              </button>
              <button class="btn sm" type="button" (click)="ofertaWhatsapp.set(null)">Agora não</button>
            </div>
          </div>
        }

        <div class="resumo-os">
          <div><span>Total em Peças</span><strong>{{ resumo().totalPecas | currency: 'BRL' : 'symbol' : '1.2-2' }}</strong></div>
          <div><span>Total em Serviços</span><strong>{{ resumo().totalServicos | currency: 'BRL' : 'symbol' : '1.2-2' }}</strong></div>
          <div class="destaque"><span>Valor Total da OS</span><strong>{{ resumo().valorTotalOrdem | currency: 'BRL' : 'symbol' : '1.2-2' }}</strong></div>
        </div>

        @if (podeEditar) {
          <div class="grade-forms">
            <form class="subcard" (ngSubmit)="adicionarPeca()">
              <h3>Adicionar Peça à OS</h3>
              <div class="campos">
                <label class="campo">Peça<input name="nomePeca" [(ngModel)]="formPeca.nome" required placeholder="Ex.: Pastilha de freio" /></label>
                <label class="campo">Qtd.<input name="qtdPeca" type="number" min="1" [(ngModel)]="formPeca.quantidade" required /></label>
                <label class="campo">Preço unit. (R$)<input name="precoPeca" type="number" min="0" step="0.01" [(ngModel)]="formPeca.precoUnitario" required /></label>
                <label class="campo">Origem
                  <select name="origemPeca" [(ngModel)]="formPeca.origemPeca">
                    <option value="OFICINA">Oficina</option>
                    <option value="CLIENTE">Cliente</option>
                  </select>
                </label>
                <label class="campo">Status da peça
                  <select name="statusPeca" [(ngModel)]="formPeca.statusPeca">
                    <option value="INSTALADA">Instalada</option>
                    <option value="EM_ESTOQUE">Em estoque</option>
                    <option value="AGUARDANDO_ENTREGA">Aguardando entrega</option>
                  </select>
                </label>
              </div>
              <button class="btn primary sm" type="submit">Vincular peça</button>
            </form>

            <form class="subcard" (ngSubmit)="adicionarServico()">
              <h3>Adicionar Serviço / Mão de Obra à OS</h3>
              <div class="campos">
                <label class="campo">Descrição<input name="descServico" [(ngModel)]="formServico.descricao" required placeholder="Ex.: Troca de pastilhas" /></label>
                <label class="campo">Valor (R$)<input name="valorServico" type="number" min="0" step="0.01" [(ngModel)]="formServico.precoCobrado" required /></label>
              </div>
              <button class="btn primary sm" type="submit">Vincular serviço</button>
            </form>
          </div>
        }

        <div class="listas-os">
          <div>
            <h3>Peças vinculadas ({{ pecas().length }})</h3>
            <table class="tabela">
              <thead><tr><th>Peça</th><th>Qtd</th><th>Origem</th><th>Status</th><th class="dir">Unit.</th>@if (podeEditar) { <th></th> }</tr></thead>
              <tbody>
                @for (p of pecas(); track p.id) {
                  <tr>
                    <td>{{ p.nome }}</td>
                    <td>{{ p.quantidade }}</td>
                    <td>{{ p.origemPeca }}</td>
                    <td>{{ p.statusPeca }}</td>
                    <td class="dir">{{ p.precoUnitario | currency: 'BRL' : 'symbol' : '1.2-2' }}</td>
                    @if (podeEditar) {
                      <td class="dir"><button class="btn sm excluir" type="button" (click)="removerPeca(p.id)">Remover</button></td>
                    }
                  </tr>
                } @empty {
                  <tr><td colspan="6" class="mut">Nenhuma peça registrada no banco para esta OS.</td></tr>
                }
              </tbody>
            </table>
          </div>

          <div>
            <h3>Serviços vinculados ({{ servicos().length }})</h3>
            <table class="tabela">
              <thead><tr><th>Serviço</th><th class="dir">Valor</th>@if (podeEditar) { <th></th> }</tr></thead>
              <tbody>
                @for (sv of servicos(); track sv.id) {
                  <tr>
                    <td>{{ sv.descricao }}</td>
                    <td class="dir">{{ sv.precoCobrado | currency: 'BRL' : 'symbol' : '1.2-2' }}</td>
                    @if (podeEditar) {
                      <td class="dir"><button class="btn sm excluir" type="button" (click)="removerServico(sv.id)">Remover</button></td>
                    }
                  </tr>
                } @empty {
                  <tr><td colspan="3" class="mut">Nenhum serviço registrado no banco para esta OS.</td></tr>
                }
              </tbody>
            </table>
          </div>

          <div>
            <h3>Histórico de Status ({{ historico().length }})</h3>
            <table class="tabela">
              <thead><tr><th>De</th><th>Para</th><th>Responsável</th><th>Data</th></tr></thead>
              <tbody>
                @for (h of historico(); track h.id) {
                  <tr>
                    <td>{{ h.statusAnterior }}</td>
                    <td class="forte">{{ h.statusNovo }}</td>
                    <td>{{ h.alteradoPor }}</td>
                    <td class="mut">{{ h.dataAlteracao ? (h.dataAlteracao | date: 'dd/MM/yyyy HH:mm') : '—' }}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="4" class="mut">Nenhuma mudança de status registrada no banco para esta OS.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </section>
  `,
  styles: `
    .cabeca{margin-bottom:18px}
    .calculadora{max-width:960px;padding:22px;display:grid;gap:18px;margin-bottom:18px}
    .calculadora h2{font-size:18px;font-weight:500;margin-bottom:4px}
    .calculadora h3{font-size:15px;font-weight:600;margin-bottom:8px}
    .campos{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px}
    .campo select{height:40px;padding:0 10px;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--text)}
    .resultado{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:18px;background:var(--ink);border-radius:12px;color:#fff}
    .resultado strong{font-size:24px;font-weight:600}
    .resumo-os{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}
    .resumo-os > div{padding:14px;border:1px solid var(--line);border-radius:10px;display:grid;gap:4px}
    .resumo-os > div.destaque{background:var(--ink);color:#fff;border-color:var(--ink)}
    .grade-forms{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px}
    .subcard{padding:14px;border:1px solid var(--line);border-radius:10px;display:grid;gap:12px;background:#f8fafc}
    .listas-os{display:grid;gap:18px}
    .erro,.excluir{color:#a5362b;font-size:13px}
    .acoes{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
    .btn-whats{border-color:#15803d;color:#166534;background:#f0fdf4;display:inline-flex;align-items:center;gap:6px}
    .btn-whats:hover{background:#dcfce7}
    .aviso-whats{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 14px;border-radius:10px;border:1px solid #86efac;background:#f0fdf4;color:#14532d;font-size:13px}
    .aviso-whats-texto{display:grid;gap:2px}
    @media(max-width:560px){.calculadora{padding:16px}.resultado{align-items:flex-start;flex-direction:column}}
  `,
})
export class Orcamentos {
  s = inject(OficinaService);
  podeEditar = inject(AuthService).perfil() === 'admin';

  materiais = signal<number | null>(null);
  maoDeObra = signal<number | null>(null);
  valoresInvalidos = computed(() => (this.materiais() ?? 0) < 0 || (this.maoDeObra() ?? 0) < 0);
  total = computed(() => (this.materiais() ?? 0) + (this.maoDeObra() ?? 0));

  ordemId = signal<number | null>(null);
  ofertaWhatsapp = signal<string | null>(null);
  pecas = signal<Array<{ id: number; nome: string; quantidade: number; precoUnitario: number; origemPeca: string; statusPeca: string }>>([]);
  servicos = signal<Array<{ id: number; descricao: string; precoCobrado: number; extra: boolean; aprovadoCliente: boolean }>>([]);
  resumo = signal<{ totalServicos: number; totalPecas: number; valorTotalOrdem: number }>({ totalServicos: 0, totalPecas: 0, valorTotalOrdem: 0 });
  historico = signal<Array<{ id: number; statusAnterior: string; statusNovo: string; dataAlteracao: string; alteradoPor: string }>>([]);

  formPeca = { nome: '', quantidade: 1, precoUnitario: 0, origemPeca: 'OFICINA', statusPeca: 'INSTALADA' };
  formServico = { descricao: '', precoCobrado: 0 };

  limpar(): void {
    this.materiais.set(null);
    this.maoDeObra.set(null);
  }

  async selecionarOrdem(id: number | null): Promise<void> {
    this.ordemId.set(id);
    this.ofertaWhatsapp.set(null);
    if (id === null) {
      this.pecas.set([]);
      this.servicos.set([]);
      this.resumo.set({ totalServicos: 0, totalPecas: 0, valorTotalOrdem: 0 });
      this.historico.set([]);
      return;
    }
    await this.recarregarDetalhes(id);
  }

  private async recarregarDetalhes(id: number): Promise<void> {
    const detalhes = await this.s.carregarDetalhesOrdemApi(id);
    if (detalhes) {
      this.pecas.set(detalhes.pecas);
      this.servicos.set(detalhes.servicos);
      this.resumo.set(detalhes.resumo);
      this.historico.set(detalhes.historico);
    }
  }

  async adicionarPeca(): Promise<void> {
    const id = this.ordemId();
    if (id === null || !this.formPeca.nome.trim() || this.formPeca.quantidade < 1 || this.formPeca.precoUnitario < 0) return;
    const nome = this.formPeca.nome.trim();
    const ok = await this.s.adicionarPecaNaOrdemApi(id, this.formPeca);
    if (ok) {
      this.formPeca = { nome: '', quantidade: 1, precoUnitario: 0, origemPeca: 'OFICINA', statusPeca: 'INSTALADA' };
      await this.recarregarDetalhes(id);
      this.ofertaWhatsapp.set(`Peça/produto "${nome}" adicionado à OS`);
    }
  }

  async removerPeca(itemId: number): Promise<void> {
    const id = this.ordemId();
    if (id === null) return;
    const ok = await this.s.removerPecaDaOrdemApi(id, itemId);
    if (ok) {
      await this.recarregarDetalhes(id);
      this.ofertaWhatsapp.set('Lista de peças/produtos da OS atualizada');
    }
  }

  async adicionarServico(): Promise<void> {
    const id = this.ordemId();
    if (id === null || !this.formServico.descricao.trim() || this.formServico.precoCobrado < 0) return;
    const desc = this.formServico.descricao.trim();
    const ok = await this.s.adicionarServicoDetalhadoNaOrdemApi(id, {
      descricao: this.formServico.descricao,
      precoCobrado: this.formServico.precoCobrado,
      extra: false,
      aprovadoCliente: true,
    });
    if (ok) {
      this.formServico = { descricao: '', precoCobrado: 0 };
      await this.recarregarDetalhes(id);
      this.ofertaWhatsapp.set(`Serviço "${desc}" adicionado à OS`);
    }
  }

  async removerServico(itemId: number): Promise<void> {
    const id = this.ordemId();
    if (id === null) return;
    const ok = await this.s.removerServicoDaOrdemApi(id, itemId);
    if (ok) {
      await this.recarregarDetalhes(id);
      this.ofertaWhatsapp.set('Lista de serviços da OS atualizada');
    }
  }

  enviarWhatsappOrdemSelecionada(motivo?: string): void {
    const id = this.ordemId();
    if (id === null) return;
    const ordem = this.s.ordens().find((o) => o.numero === id);
    if (!ordem) return;
    const telefone = this.s.obterTelefoneCliente(ordem.cliente, ordem.placa);
    if (!normalizarTelefoneWhatsapp(telefone)) {
      this.s.notificar(`O cliente ${ordem.cliente} não possui telefone cadastrado. Atualize o cadastro na aba Clientes.`);
      return;
    }
    const link = montarLinkWhatsappOrdem(ordem, telefone, motivo);
    if (typeof window !== 'undefined') {
      window.open(link, '_blank', 'noopener');
    }
    this.ofertaWhatsapp.set(null);
  }
}
