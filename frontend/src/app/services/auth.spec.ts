import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth';
import { OficinaService } from './oficina';

describe('AuthService', () => {
  let auth: AuthService;

  beforeEach(() => {
    localStorage.removeItem('oficina-do-joe.sessao');
    localStorage.removeItem('oficina-do-joe.contas');
    localStorage.removeItem('oficina-do-joe.dados.v1');
    localStorage.removeItem('torque.sessao');
    localStorage.removeItem('torque.contas');
    localStorage.removeItem('torque.dados.v1');
    TestBed.configureTestingModule({});
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => {
    auth.logout();
    localStorage.removeItem('oficina-do-joe.contas');
    localStorage.removeItem('oficina-do-joe.dados.v1');
    localStorage.removeItem('torque.sessao');
    localStorage.removeItem('torque.contas');
    localStorage.removeItem('torque.dados.v1');
  });

  it('authenticates administrators and employees but not customers', () => {
    expect(auth.login('admin@oficina.com', 'admin123')).toBe('admin');
    expect(auth.perfil()).toBe('admin');

    auth.logout();
    expect(auth.login('cliente@oficina.com', 'cliente123')).toBeNull();
    expect(auth.perfil()).toBeNull();
  });

  it('keeps customer service requests available without a customer login', () => {
    const oficina = TestBed.inject(OficinaService);

    oficina.enviarSolicitacao('Cliente Teste', '(11) 99999-0000', 'Revisão', '04567-000', 'ABC1D23', 'Carro teste');

    expect(oficina.solicitacoes()[0].email).toBeUndefined();
    expect(oficina.clientes().some((cliente) => cliente.nome === 'Cliente Teste')).toBe(true);

    auth.login('admin@oficina.com', 'admin123');
    oficina.transformarSolicitacaoEmOrdem(oficina.solicitacoes()[0]);

    expect(oficina.solicitacoes()).toHaveLength(0);
    expect(oficina.ordens()[0]).toMatchObject({
      cliente: 'Cliente Teste',
      placa: 'ABC1D23',
      servico: 'Revisão',
      status: 'Em diagnóstico',
    });
  });

  it('lets admins create accounts with normalized unique emails and protects fixed and own accounts', () => {
    auth.login('admin@oficina.com', 'admin123');

    expect(auth.criarConta('Nova Admin', '  Nova.Admin@exemplo.com ', 'senha123', 'admin')).toEqual({ ok: true });
    expect(auth.criarConta('Duplicado', 'ADMIN@OFICINA.COM', 'senha123', 'admin').ok).toBe(false);
    expect(auth.login('NOVA.ADMIN@EXEMPLO.COM', 'senha123')).toBe('admin');
    expect(auth.alterarPerfil('nova.admin@exemplo.com', 'funcionario')).toMatchObject({ ok: false });
    expect(auth.removerConta('nova.admin@exemplo.com')).toMatchObject({ ok: false });

    auth.logout();
    auth.login('admin@oficina.com', 'admin123');
    expect(auth.alterarPerfil('ADMIN@OFICINA.COM', 'funcionario')).toMatchObject({ ok: false });
    expect(auth.removerConta('ADMIN@OFICINA.COM')).toMatchObject({ ok: false });
    expect(auth.alterarPerfil('nova.admin@exemplo.com', 'funcionario').ok).toBe(true);
    expect(auth.login('nova.admin@exemplo.com', 'senha123')).toBe('funcionario');
    expect(auth.removerConta('nova.admin@exemplo.com')).toMatchObject({ ok: false });
    auth.logout();
    auth.login('admin@oficina.com', 'admin123');
    expect(auth.removerConta('nova.admin@exemplo.com').ok).toBe(true);
  });

  it('denies account management to clients and treats legacy accounts without a profile as clients', () => {
    localStorage.setItem('oficina-do-joe.contas', JSON.stringify([
      { nome: 'Cliente Antigo', email: 'antigo@exemplo.com', senha: 'senha123' },
    ]));

    expect(auth.login('ANTIGO@EXEMPLO.COM', 'senha123')).toBeNull();
    expect(auth.perfil()).toBeNull();
    expect(auth.listarContas()).toEqual([]);
    expect(auth.criarConta('Nova Conta', 'nova@exemplo.com', 'senha123', 'admin')).toMatchObject({ ok: false, erro: 'Sem permissão.' });
    expect(auth.alterarPerfil('antigo@exemplo.com', 'admin')).toMatchObject({ ok: false, erro: 'Sem permissão.' });
    expect(auth.removerConta('antigo@exemplo.com')).toMatchObject({ ok: false, erro: 'Sem permissão.' });
  });

  it('lets admins create employee accounts that authenticate with the employee profile', () => {
    auth.login('admin@oficina.com', 'admin123');
    expect(auth.criarConta('Funcionário Teste', 'funcionario@exemplo.com', 'senha123', 'funcionario').ok).toBe(true);

    auth.logout();
    expect(auth.login('FUNCIONARIO@EXEMPLO.COM', 'senha123')).toBe('funcionario');
    expect(auth.perfil()).toBe('funcionario');
    expect(auth.criarConta('Outro Usuário', 'outro@exemplo.com', 'senha123', 'admin')).toMatchObject({ ok: false, erro: 'Sem permissão.' });
  });
});
