import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ServicoCatalogo } from '../../../entities/oficina';
import { AuthService } from '../../../services/auth';
import { OficinaService } from '../../../services/oficina';

@Component({
  selector: 'app-servicos',
  imports: [CurrencyPipe, FormsModule],
  template: `
    <div class="cabeca">
      <div>
        <h1 class="pagina-titulo">Serviços</h1>
        <p class="pagina-sub">Cadastre e mantenha a tabela de serviços (mão de obra) da oficina.</p>
      </div>
      @if (podeEditar) { <button class="btn primary" type="button" (click)="abrirNovo()">Novo serviço</button> }
    </div>

    @if (podeEditar && formAberto) {
      <form class="card editor" #f="ngForm" (ngSubmit)="salvar(f)" novalidate>
        <h2>{{ servicoEditando === null ? 'Novo serviço' : 'Editar serviço' }}</h2>
        <div class="campos">
          <label>Descrição do serviço<input name="descricao" [(ngModel)]="form.descricao" required placeholder="Ex.: Revisão e troca de óleo" /></label>
          <label>Preço padrão (R$)<input name="precoPadrao" type="number" min="0" step="0.01" [(ngModel)]="form.precoPadrao" required /></label>
          <label>Tempo estimado (minutos)<input name="tempoEstimadoMinutos" type="number" min="1" step="5" [(ngModel)]="form.tempoEstimadoMinutos" placeholder="Ex.: 60" /></label>
        </div>
        @if (f.submitted && f.invalid) { <span class="erro">Informe a descrição e o preço padrão do serviço.</span> }
        <div class="acoes">
          <button class="btn primary" type="submit">Salvar serviço</button>
          <button class="btn" type="button" (click)="cancelar()">Cancelar</button>
        </div>
      </form>
    }

    <section class="card lista">
      <div class="rolagem">
        <table class="tabela">
          <thead>
            <tr>
              <th>Serviço</th>
              <th>Tempo estimado</th>
              <th class="dir">Preço padrão</th>
              @if (podeEditar) { <th>Ações</th> }
            </tr>
          </thead>
          <tbody>
            @for (sv of s.catalogoServicos(); track sv.id) {
              <tr>
                <td class="forte">{{ sv.descricao }}</td>
                <td>{{ sv.tempoEstimadoMinutos ? (sv.tempoEstimadoMinutos + ' min') : '—' }}</td>
                <td class="dir forte">{{ sv.precoPadrao | currency: 'BRL' : 'symbol' : '1.2-2' }}</td>
                @if (podeEditar) {
                  <td class="col-acoes">
                    <div class="acoes-linha">
                      <button class="btn sm" type="button" (click)="editar(sv)">Editar</button>
                      <button class="btn sm excluir" type="button" (click)="excluir(sv.id, sv.descricao)">Excluir</button>
                    </div>
                  </td>
                }
              </tr>
            }
            @empty { <tr><td [attr.colspan]="podeEditar ? 4 : 3" class="mut vazio">Nenhum serviço cadastrado no catálogo.</td></tr> }
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
export class Servicos {
  s = inject(OficinaService);
  podeEditar = inject(AuthService).perfil() === 'admin';
  formAberto = false;
  servicoEditando: number | null = null;
  form = this.vazio();

  private vazio() {
    return { descricao: '', precoPadrao: null as number | null, tempoEstimadoMinutos: 60 };
  }

  abrirNovo(): void {
    this.form = this.vazio();
    this.servicoEditando = null;
    this.formAberto = true;
  }

  editar(sv: ServicoCatalogo): void {
    this.form = {
      descricao: sv.descricao,
      precoPadrao: sv.precoPadrao,
      tempoEstimadoMinutos: sv.tempoEstimadoMinutos ?? 60,
    };
    this.servicoEditando = sv.id;
    this.formAberto = true;
  }

  salvar(f: NgForm): void {
    if (f.invalid) {
      f.control.markAllAsTouched();
      return;
    }
    this.s.salvarServicoCatalogo(
      {
        descricao: this.form.descricao,
        precoPadrao: this.form.precoPadrao ?? 0,
        tempoEstimadoMinutos: this.form.tempoEstimadoMinutos ?? 60,
      },
      this.servicoEditando ?? undefined,
    );
    this.cancelar();
  }

  excluir(id: number, descricao: string): void {
    if (typeof confirm === 'undefined' || confirm(`Excluir o serviço "${descricao}" do catálogo?`)) {
      this.s.excluirServicoCatalogo(id);
    }
  }

  cancelar(): void {
    this.formAberto = false;
    this.servicoEditando = null;
    this.form = this.vazio();
  }
}
