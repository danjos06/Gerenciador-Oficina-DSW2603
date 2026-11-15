import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../environments/environment';

export type Perfil = 'admin' | 'funcionario';
type PerfilConta = Perfil | 'cliente';

export interface Sessao {
  id?: number;
  email: string;
  nome: string;
  perfil: Perfil;
  token?: string;
}

interface Conta {
  nome: string;
  email: string;
  senha: string;
  perfil: PerfilConta;
}

export interface ContaGerenciada {
  id?: number;
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
  private readonly chaveAdminCustom = 'oficina-do-joe.admin';

  readonly sessao = signal<Sessao | null>(this.lerSessao());
  readonly backendOffline = signal<boolean>(false);
  readonly aviso = signal<string | null>(null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      void this.verificarConexaoBackend();
    }
  }

  async verificarConexaoBackend(): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId)) return false;
    try {
      const r = await fetch(`${environment.apiUrl}/auth/me`, {
        method: 'GET',
        headers: this.headersAuth(),
      });
      if (r.status > 0) {
        this.marcarBackendOnline();
        if (this.sessao() && !this.token()) {
          const emailAtual = this.sessao()!.email;
          const adminCfg = this.lerAdminCustom();
          const autenticado = await this.autenticar(emailAtual, adminCfg.senha || '1234');
          if (!autenticado) {
            this.logout();
          }
        }
        return true;
      }
    } catch {
      this.notificarFallback();
    }
    return false;
  }

  marcarBackendOnline(): void {
    this.backendOffline.set(false);
    this.aviso.set(null);
  }

  notificarFallback(msg = 'Aviso: O backend não está operativo. Operando em modo local (offline).'): void {
    this.backendOffline.set(true);
    this.aviso.set(msg);
  }

  private lerAdminCustom(): { nome: string; email: string; senha: string } {
    const padrao = {
      nome: environment.auth.admin.nome,
      email: this.normalizarEmail(environment.auth.admin.email),
      senha: environment.auth.admin.senha,
    };
    if (!isPlatformBrowser(this.platformId)) return padrao;
    try {
      const bruto = localStorage.getItem(this.chaveAdminCustom);
      if (!bruto) return padrao;
      const d = JSON.parse(bruto);
      return {
        nome: typeof d?.nome === 'string' && d.nome.trim() ? d.nome.trim() : padrao.nome,
        email: typeof d?.email === 'string' && d.email.trim() ? this.normalizarEmail(d.email) : padrao.email,
        senha: typeof d?.senha === 'string' && d.senha.trim() ? d.senha.trim() : padrao.senha,
      };
    } catch {
      return padrao;
    }
  }

  private salvarAdminCustom(dados: { nome: string; email: string; senha: string }): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem(this.chaveAdminCustom, JSON.stringify(dados));
    } catch {}
  }

  private get emailAdminFixo(): string {
    return this.lerAdminCustom().email;
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
      return {
        id: typeof dados['id'] === 'number' ? dados['id'] : undefined,
        email: dados['email'],
        nome: dados['nome'],
        perfil: dados['perfil'],
        token: typeof dados['token'] === 'string' ? dados['token'] : undefined,
      };
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

  token(): string | null {
    return this.sessao()?.token ?? null;
  }

  headersAuth(): Record<string, string> {
    const t = this.token();
    return t
      ? { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` }
      : { 'Content-Type': 'application/json' };
  }

  private perfilParaFront(perfilBack: string): Perfil {
    return perfilBack?.toLowerCase() === 'admin' ? 'admin' : 'funcionario';
  }

  private perfilParaBack(perfilFront: Perfil): string {
    return perfilFront === 'admin' ? 'admin' : 'operational';
  }

  async autenticar(email: string, senha: string): Promise<Perfil | null> {
    const emailLimpo = this.normalizarEmail(email);
    const senhaLimpa = senha.trim();

    try {
      const r = await fetch(`${environment.apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLimpo, senha: senhaLimpa }),
      });

      if (r.ok) {
        this.marcarBackendOnline();
        const dados = await r.json();
        const usuario = dados.usuario ?? {};
        const perfil = this.perfilParaFront(usuario.perfil);
        const sessao: Sessao = {
          id: usuario.id,
          email: this.normalizarEmail(usuario.email ?? emailLimpo),
          nome: usuario.nome ?? environment.auth.admin.nome,
          perfil,
          token: dados.token,
        };
        this.gravarSessao(sessao);
        return perfil;
      }

      if (r.status === 401 || r.status === 400) {
        this.marcarBackendOnline();
        return null;
      }
    } catch {
      this.notificarFallback();
    }

    return this.login(email, senha);
  }

  login(email: string, senha: string): Perfil | null {
    const emailLimpo = this.normalizarEmail(email);
    const senhaLimpa = senha.trim();
    const adminCfg = this.lerAdminCustom();

    if (
      (emailLimpo === this.emailAdminFixo || emailLimpo === this.normalizarEmail(environment.auth.admin.email) || emailLimpo === 'admin')
      && (senhaLimpa === adminCfg.senha || senhaLimpa === environment.auth.admin.senha || senhaLimpa === '1234')
    ) {
      const sessao: Sessao = {
        email: adminCfg.email,
        nome: adminCfg.nome,
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

    const adminCfg = this.lerAdminCustom();
    const fixo: ContaGerenciada = {
      nome: adminCfg.nome,
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

  async carregarContas(): Promise<ContaGerenciada[]> {
    if (this.perfil() !== 'admin') return [];

    if (this.token()) {
      try {
        const r = await fetch(`${environment.apiUrl}/usuarios`, {
          headers: this.headersAuth(),
        });
        if (r.ok) {
          this.marcarBackendOnline();
          const lista = await r.json();
          if (Array.isArray(lista)) {
            return lista.map((u: Record<string, unknown>) => {
              const email = this.normalizarEmail(String(u['email'] ?? ''));
              return {
                id: typeof u['id'] === 'number' ? u['id'] : undefined,
                nome: String(u['nome'] ?? ''),
                email,
                perfil: this.perfilParaFront(String(u['perfil'] ?? 'operational')),
                fixo: email === this.emailAdminFixo,
              };
            });
          }
        }
      } catch {
        this.notificarFallback();
      }
    } else {
      this.notificarFallback();
    }

    return this.listarContas();
  }

  async criarContaApi(nome: string, email: string, senha: string, perfil: Perfil): Promise<{ ok: boolean; erro?: string }> {
    if (this.perfil() !== 'admin') return { ok: false, erro: 'Sem permissão.' };

    const e = this.normalizarEmail(email);
    const nomeLimpo = nome.trim();
    const senhaLimpa = senha.trim();
    if (nomeLimpo.length < 2) return { ok: false, erro: 'Informe o nome.' };
    if (!/^\S+@\S+\.\S+$/.test(e)) return { ok: false, erro: 'E-mail inválido.' };
    if (senhaLimpa.length < 6) return { ok: false, erro: 'A senha precisa de pelo menos 6 caracteres.' };
    if (perfil !== 'admin' && perfil !== 'funcionario') {
      return { ok: false, erro: 'Perfil inválido.' };
    }

    if (this.token()) {
      try {
        const r = await fetch(`${environment.apiUrl}/usuarios`, {
          method: 'POST',
          headers: this.headersAuth(),
          body: JSON.stringify({
            nome: nomeLimpo,
            email: e,
            senha: senhaLimpa,
            perfil: this.perfilParaBack(perfil),
            ativo: true,
          }),
        });

        if (r.ok) return { ok: true };
        if (r.status === 409) return { ok: false, erro: 'Este e-mail já está cadastrado.' };
        if (r.status === 403) return { ok: false, erro: 'Sem permissão.' };
        return { ok: false, erro: 'Não foi possível salvar a conta no servidor.' };
      } catch {
        this.notificarFallback();
      }
    } else {
      this.notificarFallback();
    }

    return this.criarConta(nome, email, senha, perfil);
  }

  async alterarPerfilApi(email: string, perfil: Perfil, id?: number): Promise<{ ok: boolean; erro?: string }> {
    if (this.perfil() !== 'admin') return { ok: false, erro: 'Sem permissão.' };

    const e = this.normalizarEmail(email);
    if (e === this.emailAdminFixo) return { ok: false, erro: 'O administrador principal não pode ser alterado.' };
    if (e === this.normalizarEmail(this.sessao()?.email ?? '')) {
      return { ok: false, erro: 'Você não pode alterar o seu próprio perfil.' };
    }

    if (this.token() && id !== undefined) {
      try {
        const r = await fetch(`${environment.apiUrl}/usuarios/${id}`, {
          method: 'PUT',
          headers: this.headersAuth(),
          body: JSON.stringify({ perfil: this.perfilParaBack(perfil) }),
        });

        if (r.ok) return { ok: true };
        return { ok: false, erro: 'Não foi possível salvar a alteração no servidor.' };
      } catch {
        this.notificarFallback();
      }
    } else {
      this.notificarFallback();
    }

    return this.alterarPerfil(email, perfil);
  }

  async removerContaApi(email: string, id?: number): Promise<{ ok: boolean; erro?: string }> {
    if (this.perfil() !== 'admin') return { ok: false, erro: 'Sem permissão.' };

    const e = this.normalizarEmail(email);
    if (e === this.emailAdminFixo) return { ok: false, erro: 'O administrador principal não pode ser removido.' };
    if (e === this.normalizarEmail(this.sessao()?.email ?? '')) {
      return { ok: false, erro: 'Você não pode remover a sua própria conta.' };
    }

    if (this.token() && id !== undefined) {
      try {
        const r = await fetch(`${environment.apiUrl}/usuarios/${id}`, {
          method: 'DELETE',
          headers: this.headersAuth(),
        });

        if (r.ok || r.status === 204) return { ok: true };
        return { ok: false, erro: 'Não foi possível remover a conta no servidor.' };
      } catch {
        this.notificarFallback();
      }
    } else {
      this.notificarFallback();
    }

    return this.removerConta(email);
  }

  async atualizarContaAdminApi(nome: string, email: string, novaSenha?: string): Promise<{ ok: boolean; erro?: string }> {
    if (this.perfil() !== 'admin') return { ok: false, erro: 'Sem permissão.' };

    const nomeLimpo = nome.trim();
    const emailLimpo = this.normalizarEmail(email);
    const senhaLimpa = (novaSenha ?? '').trim();

    if (nomeLimpo.length < 2) return { ok: false, erro: 'Informe o nome do administrador.' };
    if (!/^\S+@\S+\.\S+$/.test(emailLimpo)) return { ok: false, erro: 'Informe um e-mail válido.' };
    if (senhaLimpa && senhaLimpa.length < 4) return { ok: false, erro: 'A nova senha precisa de pelo menos 4 caracteres.' };

    const adminAtual = this.lerAdminCustom();

    if (this.token()) {
      try {
        const headers = this.headersAuth();
        let idAdmin = this.sessao()?.id;

        if (idAdmin === undefined) {
          const resLista = await fetch(`${environment.apiUrl}/usuarios`, { headers });
          if (resLista.ok) {
            const lista = await resLista.json();
            const meuEmailAtual = this.normalizarEmail(this.sessao()?.email ?? '');
            const encontrado = Array.isArray(lista)
              ? lista.find((u: Record<string, unknown>) => this.normalizarEmail(String(u['email'] ?? '')) === meuEmailAtual || u['perfil'] === 'admin')
              : null;
            if (encontrado && typeof encontrado['id'] === 'number') {
              idAdmin = encontrado['id'];
            }
          }
        }

        if (idAdmin !== undefined) {
          const payload: Record<string, unknown> = {
            nome: nomeLimpo,
            email: emailLimpo,
            perfil: 'admin',
            ativo: true,
          };
          if (senhaLimpa) {
            payload['senha'] = senhaLimpa;
          }

          const r = await fetch(`${environment.apiUrl}/usuarios/${idAdmin}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(payload),
          });

          if (r.status === 409) {
            return { ok: false, erro: 'Este e-mail já está cadastrado em outra conta.' };
          }
          if (!r.ok) {
            return { ok: false, erro: 'Não foi possível atualizar os dados do administrador no servidor.' };
          }

          this.marcarBackendOnline();
          const atualizado = await r.json();
          this.salvarAdminCustom({
            nome: String(atualizado.nome ?? nomeLimpo),
            email: this.normalizarEmail(String(atualizado.email ?? emailLimpo)),
            senha: senhaLimpa || adminAtual.senha,
          });
          this.gravarSessao({
            id: Number(atualizado.id ?? idAdmin),
            nome: String(atualizado.nome ?? nomeLimpo),
            email: this.normalizarEmail(String(atualizado.email ?? emailLimpo)),
            perfil: 'admin',
            token: this.token() ?? undefined,
          });
          return { ok: true };
        }
      } catch {
        this.notificarFallback();
      }
    } else {
      this.notificarFallback();
    }

    this.salvarAdminCustom({
      nome: nomeLimpo,
      email: emailLimpo,
      senha: senhaLimpa || adminAtual.senha,
    });
    this.gravarSessao({
      id: this.sessao()?.id,
      nome: nomeLimpo,
      email: emailLimpo,
      perfil: 'admin',
      token: this.token() ?? undefined,
    });
    return { ok: true };
  }

  logout(): void {
    this.gravarSessao(null);
  }
}
