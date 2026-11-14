import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MesFinanceiro } from '../../../entities/oficina';
import { AuthService } from '../../../services/auth';
import { OficinaService } from '../../../services/oficina';

@Component({
  selector: 'app-financeiro',
  imports: [CurrencyPipe, DecimalPipe, FormsModule],
  template: `
    <div class="cabeca">
      <div>
        <h1 class="pagina-titulo">Financeiro</h1>
        <p class="pagina-sub">Cadastre e mantenha os resumos financeiros mensais.</p>
      </div>
      @if (podeEditar) { <button class="btn primary" type="button" (click)="novoRegistro()">Adicionar mês</button> }
    </div>

    @if (podeEditar && formAberto()) {
      <form class="card editor" #f="ngForm" (ngSubmit)="salvar(f)" novalidate>
        <h2>{{ chaveEditando() ? 'Editar registro financeiro' : 'Novo registro financeiro' }}</h2>
        <div class="campos">
          <label class="campo">Mês
            <input type="month" name="chave" [(ngModel)]="form.chave" [readonly]="!!chaveEditando()" required />
          </label>
          <label class="campo">Faturamento
            <input type="number" name="faturamento" [(ngModel)]="form.faturamento" min="0" step="0.01" required />
          </label>
          <label class="campo">Despesas
            <input type="number" name="despesas" [(ngModel)]="form.despesas" min="0" step="0.01" required />
          </label>
          <label class="campo">Ordens concluídas
            <input type="number" name="concluidas" [(ngModel)]="form.concluidas" min="0" step="1" required />
          </label>
        </div>
        @if (erro()) { <p class="erro">{{ erro() }}</p> }
        <div class="acoes">
          <button class="btn primary" type="submit">Salvar</button>
          <button class="btn" type="button" (click)="cancelar()">Cancelar</button>
        </div>
      </form>
    }

    <section class="card lista">
      <div class="rolagem">
        <table class="tabela">
          <thead><tr><th>Mês</th><th class="dir">Faturamento</th><th class="dir">Despesas</th><th class="dir">Lucro líquido</th><th class="dir">Margem</th><th class="dir">OS concluídas</th><th class="dir">Ticket médio</th>@if (podeEditar) { <th>Ações</th> }</tr></thead>
          <tbody>
            @for (m of meses(); track m.chave) {
              <tr [class.sel]="m.chave === s.mesChave()">
                <td><button class="mes-link forte" type="button" (click)="s.mesChave.set(m.chave)">{{ m.nome }}</button></td>
                <td class="dir">{{ m.faturamento | currency: 'BRL' : 'symbol' : '1.0-0' }}</td>
                <td class="dir">{{ m.despesas | currency: 'BRL' : 'symbol' : '1.0-0' }}</td>
                <td class="dir forte">{{ m.faturamento - m.despesas | currency: 'BRL' : 'symbol' : '1.0-0' }}</td>
                <td class="dir">{{ margem(m) | number: '1.1-1' }}%</td>
                <td class="dir">{{ m.concluidas }}</td>
                <td class="dir">{{ ticketMedio(m) | currency: 'BRL' : 'symbol' : '1.0-0' }}</td>
                @if (podeEditar) {
                  <td class="acoes-linha">
                    <button class="btn sm" type="button" (click)="editar(m)">Editar</button>
                    <button class="btn sm excluir" type="button" (click)="excluir(m)">Excluir</button>
                  </td>
                }
              </tr>
            } @empty {
              <tr><td [attr.colspan]="podeEditar ? 8 : 7" class="vazio">Nenhum registro financeiro. Adicione um mês para exibir os dados na visão geral.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
  styles: `
    .cabeca{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap}
    .editor{padding:18px 20px;margin-top:18px;display:grid;gap:14px}
    .editor h2{font-size:16px;font-weight:500}
    .campos{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px}
    .campo input{min-width:0}
    .acoes,.acoes-linha{display:flex;gap:6px;flex-wrap:wrap}
    .erro{color:#a5362b;font-size:13px}
    .lista{margin-top:18px;overflow:hidden}
    .rolagem{overflow-x:auto}
    .rolagem .tabela{min-width:980px}
    tr:hover td{background:#f7f8fa}
    tr.sel td{background:var(--blue-soft)}
    .mes-link{border:0;background:transparent;padding:0;text-align:left}
    .mes-link:hover{text-decoration:underline}
    .excluir{color:#a5362b}
    .vazio{padding:24px;text-align:center;color:var(--muted)}
  `,
})
export class Financeiro {
  s = inject(OficinaService);
  podeEditar = inject(AuthService).perfil() === 'admin';
  meses = computed(() => [...this.s.mesesOrdenados()].reverse());
  formAberto = signal(false);
  chaveEditando = signal<string | null>(null);
  erro = signal('');
  form = this.formVazio();

  private formVazio() {
    return {
      chave: '',
      faturamento: null as number | null,
      despesas: null as number | null,
      concluidas: null as number | null,
    };
  }

  novoRegistro(): void {
    this.form = this.formVazio();
    this.chaveEditando.set(null);
    this.erro.set('');
    this.formAberto.set(true);
  }

  editar(mes: MesFinanceiro): void {
    this.form = {
      chave: mes.chave,
      faturamento: mes.faturamento,
      despesas: mes.despesas,
      concluidas: mes.concluidas,
    };
    this.chaveEditando.set(mes.chave);
    this.erro.set('');
    this.formAberto.set(true);
  }

  salvar(f: NgForm): void {
    if (f.invalid || this.form.faturamento === null || this.form.despesas === null || this.form.concluidas === null) {
      f.control.markAllAsTouched();
      this.erro.set('Preencha todos os campos com valores válidos.');
      return;
    }

    const dados = {
      chave: this.form.chave,
      faturamento: this.form.faturamento,
      despesas: this.form.despesas,
      concluidas: this.form.concluidas,
    };
    const salvo = this.chaveEditando()
      ? this.s.atualizarMes(this.chaveEditando()!, dados)
      : this.s.adicionarMes(dados);

    if (!salvo) {
      this.erro.set('Não foi possível salvar. Verifique se já existe um registro para esse mês.');
      return;
    }
    this.cancelar();
  }

  excluir(mes: MesFinanceiro): void {
    if (typeof confirm === 'undefined' || confirm(`Excluir o registro financeiro de ${mes.nome}?`)) {
      this.s.excluirMes(mes.chave);
    }
  }

  cancelar(): void {
    this.formAberto.set(false);
    this.chaveEditando.set(null);
    this.erro.set('');
    this.form = this.formVazio();
  }

  margem(mes: MesFinanceiro): number {
    return mes.faturamento ? ((mes.faturamento - mes.despesas) / mes.faturamento) * 100 : 0;
  }

  ticketMedio(mes: MesFinanceiro): number {
    return mes.concluidas ? mes.faturamento / mes.concluidas : 0;
  }
}
