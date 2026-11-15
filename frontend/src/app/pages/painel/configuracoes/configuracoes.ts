import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService, ContaGerenciada, Perfil } from '../../../services/auth';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="cabeca">
      <div>
        <h1 class="pagina-titulo">Usuários e acessos</h1>
        <p class="pagina-sub">Personalize sua conta de administrador, cadastre funcionários e gerencie os perfis de acesso.</p>
      </div>
    </div>

    <form class="card editor" (ngSubmit)="salvarAdmin()">
      <h2>Personalizar conta de administrador</h2>
      <div class="campos">
        <label class="campo">Nome do administrador
          <input name="adminNome" [(ngModel)]="formAdmin.nome" placeholder="Seu nome" required />
        </label>
        <label class="campo">E-mail de acesso
          <input name="adminEmail" type="email" [(ngModel)]="formAdmin.email" placeholder="admin@oficina.com" required />
        </label>
        <label class="campo">Nova senha (opcional)
          <input name="adminSenha" type="password" [(ngModel)]="formAdmin.senha" placeholder="Deixe em branco para manter a atual" />
        </label>
      </div>
      <div class="acoes">
        <button class="btn primary" type="submit">Salvar dados do administrador</button>
      </div>
    </form>

    <form class="card editor" (ngSubmit)="criar()">
      <h2>Cadastrar nova conta</h2>
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
                    <select [ngModel]="c.perfil" [name]="'perfil-' + c.email" (ngModelChange)="mudarPerfil(c, $event)">
                      <option value="funcionario">Funcionário</option>
                      <option value="admin">Administrador</option>
                    </select>
                  }
                </td>
                <td>
                  @if (!c.fixo && c.email !== meuEmail) {
                    <button class="btn sm excluir" type="button" (click)="remover(c)">Remover</button>
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
    .editor{padding:18px 20px;display:grid;gap:14px;margin-bottom:18px}
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
  formAdmin = {
    nome: this.auth.sessao()?.nome ?? '',
    email: this.auth.sessao()?.email ?? '',
    senha: '',
  };
  form = { nome: '', email: '', senha: '', perfil: 'funcionario' as Perfil };
  contas = signal<ContaGerenciada[]>(this.auth.listarContas());
  erro = signal('');
  ok = signal('');

  constructor() {
    void this.atualizar();
  }

  private async atualizar(): Promise<void> {
    this.contas.set(await this.auth.carregarContas());
    this.meuEmail = this.auth.sessao()?.email.trim().toLowerCase() ?? '';
    this.formAdmin.nome = this.auth.sessao()?.nome ?? '';
    this.formAdmin.email = this.auth.sessao()?.email ?? '';
  }

  nomePerfil(perfil: Perfil): string {
    if (perfil === 'admin') return 'Administrador';
    if (perfil === 'funcionario') return 'Funcionário';
    return 'Funcionário';
  }

  async salvarAdmin(): Promise<void> {
    this.erro.set('');
    this.ok.set('');
    const resultado = await this.auth.atualizarContaAdminApi(
      this.formAdmin.nome,
      this.formAdmin.email,
      this.formAdmin.senha,
    );
    if (!resultado.ok) {
      this.erro.set(resultado.erro ?? 'Erro ao atualizar administrador.');
      return;
    }

    this.formAdmin.senha = '';
    this.ok.set('Dados do administrador atualizados com sucesso.');
    await this.atualizar();
  }

  async criar(): Promise<void> {
    this.erro.set('');
    this.ok.set('');
    const resultado = await this.auth.criarContaApi(this.form.nome, this.form.email, this.form.senha, this.form.perfil);
    if (!resultado.ok) {
      this.erro.set(resultado.erro ?? 'Erro ao cadastrar.');
      return;
    }

    this.ok.set('Conta cadastrada.');
    this.form = { nome: '', email: '', senha: '', perfil: 'funcionario' };
    await this.atualizar();
  }

  async mudarPerfil(conta: ContaGerenciada, perfil: Perfil): Promise<void> {
    this.erro.set('');
    this.ok.set('');
    const resultado = await this.auth.alterarPerfilApi(conta.email, perfil, conta.id);
    if (!resultado.ok) this.erro.set(resultado.erro ?? 'Erro ao alterar.');
    else this.ok.set('Perfil atualizado.');
    await this.atualizar();
  }

  async remover(conta: ContaGerenciada): Promise<void> {
    if (typeof confirm === 'undefined' || !confirm('Remover esta conta?')) return;
    this.erro.set('');
    this.ok.set('');
    const resultado = await this.auth.removerContaApi(conta.email, conta.id);
    if (!resultado.ok) this.erro.set(resultado.erro ?? 'Erro ao remover.');
    else this.ok.set('Conta removida.');
    await this.atualizar();
  }
}
