import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { PecaCatalogo } from '../../../entities/oficina';
import { AuthService } from '../../../services/auth';
import { OficinaService } from '../../../services/oficina';

@Component({
  selector: 'app-pecas',
  imports: [CurrencyPipe, FormsModule],
  template: `
    <div class="cabeca">
      <div>
        <h1 class="pagina-titulo">Peças</h1>
        <p class="pagina-sub">Cadastre e mantenha o catálogo de peças e estoque da oficina.</p>
      </div>
      @if (podeEditar) { <button class="btn primary" type="button" (click)="abrirNovo()">Nova peça</button> }
    </div>

    @if (podeEditar && formAberto) {
      <form class="card editor" #f="ngForm" (ngSubmit)="salvar(f)" novalidate>
        <h2>{{ pecaEditando === null ? 'Nova peça' : 'Editar peça' }}</h2>
        <div class="campos">
          <label>Nome da peça<input name="nome" [(ngModel)]="form.nome" required placeholder="Ex.: Pastilha de freio dianteira" /></label>
          <label>Código da peça<input name="codigoFabricante" [(ngModel)]="form.codigoFabricante" placeholder="Ex.: SYL-1420" /></label>
          <label>Preço de referência (R$)<input name="precoVenda" type="number" min="0" step="0.01" [(ngModel)]="form.precoVenda" required /></label>
        </div>
        @if (f.submitted && f.invalid) { <span class="erro">Informe o nome e o preço de referência da peça.</span> }
        <div class="acoes">
          <button class="btn primary" type="submit">Salvar peça</button>
          <button class="btn" type="button" (click)="cancelar()">Cancelar</button>
        </div>
      </form>
    }

    <section class="card lista">
      <div class="rolagem">
        <table class="tabela">
          <thead>
            <tr>
              <th>Peça</th>
              <th>Código</th>
              <th class="dir">Preço de referência</th>
              @if (podeEditar) { <th>Ações</th> }
            </tr>
          </thead>
          <tbody>
            @for (p of s.catalogoPecas(); track p.id) {
              <tr>
                <td class="forte">{{ p.nome }}</td>
                <td>{{ p.codigoFabricante || '—' }}</td>
                <td class="dir forte">{{ p.precoVenda | currency: 'BRL' : 'symbol' : '1.2-2' }}</td>
                @if (podeEditar) {
                  <td class="col-acoes">
                    <div class="acoes-linha">
                      <button class="btn sm" type="button" (click)="editar(p)">Editar</button>
                      <button class="btn sm excluir" type="button" (click)="excluir(p.id, p.nome)">Excluir</button>
                    </div>
                  </td>
                }
              </tr>
            }
            @empty { <tr><td [attr.colspan]="podeEditar ? 4 : 3" class="mut vazio">Nenhuma peça cadastrada no catálogo.</td></tr> }
          </tbody>
        </table>
      </div>
    </section>
  `,
  styles: `
    .cabeca{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
    .editor{padding:18px 20px;margin-top:18px;display:grid;gap:14px}
    .editor h2{font-size:16px;font-weight:500}
    .campos{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px}
    .campos label{display:grid;gap:6px;font-size:13px;color:var(--muted)}
    .campos input{height:40px;padding:0 10px;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--text)}
    .acoes{display:flex;gap:8px;flex-wrap:wrap}
    .vazio{padding:16px 0;text-align:center}
    .lista{overflow:hidden;margin-top:18px}.rolagem{overflow-x:auto}.rolagem .tabela{min-width:560px}
    .col-acoes{white-space:nowrap;width:1%}
    .acoes-linha{display:inline-flex;align-items:center;gap:6px}
    .excluir{color:#a5362b}
    .erro{color:#a5362b;font-size:13px}
  `,
})
export class Pecas {
  s = inject(OficinaService);
  podeEditar = inject(AuthService).perfil() === 'admin';
  formAberto = false;
  pecaEditando: number | null = null;
  form = this.vazio();

  private vazio() {
    return { nome: '', codigoFabricante: '', precoCusto: null as number | null, precoVenda: null as number | null, quantidadeEstoque: 1 };
  }

  abrirNovo(): void {
    this.form = this.vazio();
    this.pecaEditando = null;
    this.formAberto = true;
  }

  editar(peca: PecaCatalogo): void {
    this.form = {
      nome: peca.nome,
      codigoFabricante: peca.codigoFabricante ?? '',
      precoCusto: peca.precoCusto,
      precoVenda: peca.precoVenda,
      quantidadeEstoque: peca.quantidadeEstoque,
    };
    this.pecaEditando = peca.id;
    this.formAberto = true;
  }

  salvar(f: NgForm): void {
    if (f.invalid) {
      f.control.markAllAsTouched();
      return;
    }
    this.s.salvarPecaCatalogo(
      {
        nome: this.form.nome,
        codigoFabricante: this.form.codigoFabricante,
        precoCusto: this.form.precoCusto ?? 0,
        precoVenda: this.form.precoVenda ?? 0,
        quantidadeEstoque: this.form.quantidadeEstoque ?? 0,
      },
      this.pecaEditando ?? undefined,
    );
    this.cancelar();
  }

  excluir(id: number, nome: string): void {
    if (typeof confirm === 'undefined' || confirm(`Excluir a peça "${nome}" do catálogo?`)) {
      this.s.excluirPecaCatalogo(id);
    }
  }

  cancelar(): void {
    this.formAberto = false;
    this.pecaEditando = null;
    this.form = this.vazio();
  }
}
