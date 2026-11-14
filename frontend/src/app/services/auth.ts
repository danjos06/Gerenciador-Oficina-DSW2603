import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../environments/environment';

export type Perfil = 'admin' | 'funcionario';
type PerfilConta = Perfil | 'cliente';

export interface Sessao {
  email: string;
  nome: string;
  perfil: Perfil;
}

interface Conta {
  nome: string;
  email: string;
  senha: string;
  perfil: PerfilConta;
}

export interface ContaGerenciada {
  nome: string;
  email: string;
  perfil: Perfil;
  fixo: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly chaveSessao = 'oficina-do-joe.sessao';
  private readonly chaveContas = 'oficina-do-joe.contas';

  readonly sessao = signal<Sessao | null>(this.lerSessao());

  private get emailAdminFixo(): string {
    return this.normalizarEmail(environment.auth.admin.email);
  }

  private normalizarEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private lerSessao(): Sessao | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    try {
      const bruto = localStorage.getItem(this.chaveSessao) ?? localStorage.getItem('torque.sessao');
      if (bruto && !localStorage.getItem(this.chaveSessao)) localStorage.setItem(this.chaveSessao, bruto);
      if (!bruto) return null;
      const sessao: unknown = JSON.parse(bruto);
      if (typeof sessao !== 'object' || sessao === null) return null;
      const dados = sessao as Record<string, unknown>;
      if (
        typeof dados['email'] !== 'string'
        || typeof dados['nome'] !== 'string'
        || (dados['perfil'] !== 'admin' && dados['perfil'] !== 'funcionario')
      ) return null;
      return { email: dados['email'], nome: dados['nome'], perfil: dados['perfil'] };
    } catch {
      return null;
    }
  }

  private lerContas(): Conta[] {
    if (!isPlatformBrowser(this.platformId)) return [];

    try {
      const bruto = localStorage.getItem(this.chaveContas) ?? localStorage.getItem('torque.contas');
      if (bruto && !localStorage.getItem(this.chaveContas)) localStorage.setItem(this.chaveContas, bruto);
      if (!bruto) return [];

      const dados: unknown = JSON.parse(bruto);
      if (!Array.isArray(dados)) return [];

      return dados.flatMap((item): Conta[] => {
        if (typeof item !== 'object' || item === null) return [];
        const conta = item as Record<string, unknown>;
        if (typeof conta['nome'] !== 'string' || typeof conta['email'] !== 'string' || typeof conta['senha'] !== 'string') return [];
        const perfil: PerfilConta = conta['perfil'] === 'admin' || conta['perfil'] === 'funcionario'
          ? conta['perfil']
          : 'cliente';
        return [{ nome: conta['nome'], email: this.normalizarEmail(conta['email']), senha: conta['senha'], perfil }];
      });
    } catch {
      return [];
    }
  }

  private salvarContas(contas: Conta[]): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    try {
      localStorage.setItem(this.chaveContas, JSON.stringify(contas));
      return true;
    } catch {
      return false;
    }
  }

  private gravarSessao(s: Sessao | null): void {
    this.sessao.set(s);

    if (!isPlatformBrowser(this.platformId)) return;

    if (s) localStorage.setItem(this.chaveSessao, JSON.stringify(s));
    else localStorage.removeItem(this.chaveSessao);
  }

  isLoggedIn(): boolean {
    return this.sessao() !== null;
  }

  perfil(): Perfil | null {
    return this.sessao()?.perfil ?? null;
  }

  login(email: string, senha: string): Perfil | null {
    const emailLimpo = this.normalizarEmail(email);
    const senhaLimpa = senha.trim();

    if (emailLimpo === this.emailAdminFixo && senhaLimpa === environment.auth.admin.senha) {
      const sessao: Sessao = {
        email: emailLimpo,
        nome: environment.auth.admin.nome,
        perfil: 'admin',
      };
      this.gravarSessao(sessao);
      return 'admin';
    }

    const conta = this.lerContas().find((c) => c.email === emailLimpo && c.senha === senhaLimpa);
    if (conta && conta.perfil !== 'cliente') {
      const perfil = conta.perfil;
      const sessao: Sessao = {
        email: conta.email,
        nome: conta.nome,
        perfil,
      };
      this.gravarSessao(sessao);
      return perfil;
    }

    return null;
  }

  criarConta(nome: string, email: string, senha: string, perfil: Perfil): { ok: boolean; erro?: string } {
    if (this.perfil() !== 'admin') return { ok: false, erro: 'Sem permissão.' };
    if (!isPlatformBrowser(this.platformId)) return { ok: false, erro: 'Operação disponível apenas no navegador.' };

    const e = this.normalizarEmail(email);
    const nomeLimpo = nome.trim();
    const senhaLimpa = senha.trim();
    if (nomeLimpo.length < 2) return { ok: false, erro: 'Informe o nome.' };
    if (!/^\S+@\S+\.\S+$/.test(e)) return { ok: false, erro: 'E-mail inválido.' };
    if (senhaLimpa.length < 6) return { ok: false, erro: 'A senha precisa de pelo menos 6 caracteres.' };
    if (perfil !== 'admin' && perfil !== 'funcionario') {
      return { ok: false, erro: 'Perfil inválido.' };
    }

    const contas = this.lerContas();
    if (
      e === this.emailAdminFixo
      || contas.some((conta) => conta.email === e)
    ) {
      return { ok: false, erro: 'Este e-mail já está cadastrado.' };
    }

    if (!this.salvarContas([...contas, { nome: nomeLimpo, email: e, senha: senhaLimpa, perfil }])) {
      return { ok: false, erro: 'Não foi possível salvar a conta.' };
    }
    return { ok: true };
  }

  listarContas(): ContaGerenciada[] {
    if (this.perfil() !== 'admin') return [];

    const fixo: ContaGerenciada = {
      nome: environment.auth.admin.nome,
      email: this.emailAdminFixo,
      perfil: 'admin',
      fixo: true,
    };
    const outras = this.lerContas()
      .filter((conta): conta is Conta & { perfil: Perfil } =>
        conta.email !== this.emailAdminFixo && conta.perfil !== 'cliente')
      .map(({ nome, email, perfil }) => ({ nome, email, perfil, fixo: false }));
    return [fixo, ...outras];
  }

  alterarPerfil(email: string, perfil: Perfil): { ok: boolean; erro?: string } {
    if (this.perfil() !== 'admin') return { ok: false, erro: 'Sem permissão.' };
    if (!isPlatformBrowser(this.platformId)) return { ok: false, erro: 'Operação disponível apenas no navegador.' };

    const e = this.normalizarEmail(email);
    if (e === this.emailAdminFixo) return { ok: false, erro: 'O administrador principal não pode ser alterado.' };
    if (e === this.normalizarEmail(this.sessao()?.email ?? '')) {
      return { ok: false, erro: 'Você não pode alterar o seu próprio perfil.' };
    }
    if (perfil !== 'admin' && perfil !== 'funcionario') {
      return { ok: false, erro: 'Perfil inválido.' };
    }

    const contas = this.lerContas();
    if (!contas.some((conta) => conta.email === e)) return { ok: false, erro: 'Conta não encontrada.' };
    if (!this.salvarContas(contas.map((conta) => (conta.email === e ? { ...conta, perfil } : conta)))) {
      return { ok: false, erro: 'Não foi possível salvar a alteração.' };
    }
    return { ok: true };
  }

  removerConta(email: string): { ok: boolean; erro?: string } {
    if (this.perfil() !== 'admin') return { ok: false, erro: 'Sem permissão.' };
    if (!isPlatformBrowser(this.platformId)) return { ok: false, erro: 'Operação disponível apenas no navegador.' };

    const e = this.normalizarEmail(email);
    if (e === this.emailAdminFixo) return { ok: false, erro: 'O administrador principal não pode ser removido.' };
    if (e === this.normalizarEmail(this.sessao()?.email ?? '')) {
      return { ok: false, erro: 'Você não pode remover a sua própria conta.' };
    }

    const contas = this.lerContas();
    if (!contas.some((conta) => conta.email === e)) return { ok: false, erro: 'Conta não encontrada.' };
    if (!this.salvarContas(contas.filter((conta) => conta.email !== e))) {
      return { ok: false, erro: 'Não foi possível remover a conta.' };
    }
    return { ok: true };
  }

  logout(): void {
    this.gravarSessao(null);
  }
}
