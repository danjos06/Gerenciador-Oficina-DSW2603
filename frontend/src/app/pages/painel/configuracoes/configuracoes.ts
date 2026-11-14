import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService, Perfil } from '../../../services/auth';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="cabeca">
      <div>
        <h1 class="pagina-titulo">Usuários e acessos</h1>
        <p class="pagina-sub">Cadastre contas e gerencie os perfis de acesso.</p>
      </div>
    </div>

    <form class="card editor" (ngSubmit)="criar()">
      <h2>Cadastrar conta</h2>
      <div class="campos">
        <label class="campo">Nome<input name="nome" [(ngModel)]="form.nome" placeholder="Nome" required /></label>
        <label class="campo">E-mail<input name="email" type="email" [(ngModel)]="form.email" placeholder="E-mail" required /></label>
        <label class="campo">Senha<input name="senha" type="password" [(ngModel)]="form.senha" placeholder="Senha (mín. 6)" required minlength="6" /></label>
        <label class="campo">Perfil
          <select name="perfil" [(ngModel)]="form.perfil">
            <option value="funcionario">Funcionário</option>
            <option value="admin">Administrador</option>
          </select>
        </label>
      </div>
      <div class="acoes">
        <button class="btn primary" type="submit">Cadastrar conta</button>
      </div>
    </form>

    @if (erro()) { <p class="mensagem erro" role="alert">{{ erro() }}</p> }
    @if (ok()) { <p class="mensagem ok" role="status">{{ ok() }}</p> }

    <section class="card lista">
      <div class="rolagem">
        <table class="tabela">
          <thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Ações</th></tr></thead>
          <tbody>
            @for (c of contas(); track c.email) {
              <tr>
                <td class="forte">{{ c.nome }}{{ c.fixo ? ' (principal)' : '' }}</td>
                <td>{{ c.email }}</td>
                <td>
                  @if (c.fixo || c.email === meuEmail) {
                    {{ nomePerfil(c.perfil) }}
                  } @else {
                    <select [ngModel]="c.perfil" [name]="'perfil-' + c.email" (ngModelChange)="mudarPerfil(c.email, $event)">
                      <option value="funcionario">Funcionário</option>
                      <option value="admin">Administrador</option>
                    </select>
                  }
                </td>
                <td>
                  @if (!c.fixo && c.email !== meuEmail) {
                    <button class="btn sm excluir" type="button" (click)="remover(c.email)">Remover</button>
                  } @else if (c.email === meuEmail) {
                    <span class="mut">Conta atual</span>
                  }
                </td>
              </tr>
            } @empty {
              <tr><td colspan="4" class="mut vazio">Nenhuma conta cadastrada.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
  styles: `
    .cabeca{margin-bottom:18px}
    .editor{padding:18px 20px;display:grid;gap:14px}
    .editor h2{font-size:16px;font-weight:500}
    .campos{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px}
    .acoes{display:flex;gap:8px;flex-wrap:wrap}
    .lista{overflow:hidden;margin-top:18px}
    .rolagem{overflow-x:auto}
    .rolagem .tabela{min-width:560px}
    .tabela select{height:36px;max-width:180px;padding:0 10px;border:1px solid var(--line);border-radius:8px;background:#fff}
    .excluir{color:#a5362b}
    .mensagem{margin-top:12px;font-size:14px}
    .erro{color:#a5362b}
    .ok{color:#17703f}
    .vazio{padding:18px;text-align:center}
  `,
})
export class Configuracoes {
  private auth = inject(AuthService);
  meuEmail = this.auth.sessao()?.email.trim().toLowerCase() ?? '';
  form = { nome: '', email: '', senha: '', perfil: 'funcionario' as Perfil };
  contas = signal(this.auth.listarContas());
  erro = signal('');
  ok = signal('');

  private atualizar(): void {
    this.contas.set(this.auth.listarContas());
  }

  nomePerfil(perfil: Perfil): string {
    if (perfil === 'admin') return 'Administrador';
    if (perfil === 'funcionario') return 'Funcionário';
    return 'Funcionário';
  }

  criar(): void {
    this.erro.set('');
    this.ok.set('');
    const resultado = this.auth.criarConta(this.form.nome, this.form.email, this.form.senha, this.form.perfil);
    if (!resultado.ok) {
      this.erro.set(resultado.erro ?? 'Erro ao cadastrar.');
      return;
    }

    this.ok.set('Conta cadastrada.');
    this.form = { nome: '', email: '', senha: '', perfil: 'funcionario' };
    this.atualizar();
  }

  mudarPerfil(email: string, perfil: Perfil): void {
    this.erro.set('');
    this.ok.set('');
    const resultado = this.auth.alterarPerfil(email, perfil);
    if (!resultado.ok) this.erro.set(resultado.erro ?? 'Erro ao alterar.');
    else this.ok.set('Perfil atualizado.');
    this.atualizar();
  }

  remover(email: string): void {
    if (typeof confirm === 'undefined' || !confirm('Remover esta conta?')) return;
    this.erro.set('');
    this.ok.set('');
    const resultado = this.auth.removerConta(email);
    if (!resultado.ok) this.erro.set(resultado.erro ?? 'Erro ao remover.');
    else this.ok.set('Conta removida.');
    this.atualizar();
  }
}
