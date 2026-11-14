import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth';
import { OficinaService } from './oficina';

describe('monthly financial records', () => {
  let oficina: OficinaService;

  beforeEach(() => {
    localStorage.removeItem('oficina-do-joe.dados.v1');
    localStorage.removeItem('torque.dados.v1');
    localStorage.removeItem('oficina-do-joe.sessao');
    TestBed.configureTestingModule({});
    TestBed.inject(AuthService).login('admin@oficina.com', 'admin123');
    oficina = TestBed.inject(OficinaService);
  });

  afterEach(() => {
    TestBed.inject(AuthService).logout();
    localStorage.removeItem('oficina-do-joe.dados.v1');
    localStorage.removeItem('torque.dados.v1');
  });

  it('creates, lists, updates and deletes a monthly record', () => {
    expect(oficina.adicionarMes({
      chave: '2027-01',
      faturamento: 12000,
      despesas: 7000,
      concluidas: 12,
    })).toBe(true);
    TestBed.flushEffects();

    expect(oficina.meses().find((mes) => mes.chave === '2027-01')).toMatchObject({
      nome: 'Janeiro de 2027',
      faturamento: 12000,
    });
    expect(oficina.mesAtual().chave).toBe('2027-01');
    expect(JSON.parse(localStorage.getItem('oficina-do-joe.dados.v1') ?? '{}').mesChave).toBe('2027-01');

    expect(oficina.atualizarMes('2027-01', {
      faturamento: 15000,
      despesas: 8000,
      concluidas: 15,
    })).toBe(true);
    TestBed.flushEffects();
    expect(oficina.mesAtual()).toMatchObject({ faturamento: 15000, despesas: 8000, concluidas: 15 });

    oficina.excluirMes('2027-01');
    TestBed.flushEffects();
    expect(oficina.meses().some((mes) => mes.chave === '2027-01')).toBe(false);
    expect(oficina.mesAtual().chave).not.toBe('2027-01');
  });

  it('rejects duplicate months and invalid values', () => {
    expect(oficina.adicionarMes({
      chave: '2026-09',
      faturamento: 1,
      despesas: 1,
      concluidas: 1,
    })).toBe(false);
    expect(oficina.adicionarMes({
      chave: '2027-13',
      faturamento: 1,
      despesas: 1,
      concluidas: 1,
    })).toBe(false);
    expect(oficina.atualizarMes('2026-09', {
      faturamento: -1,
      despesas: 1,
      concluidas: 1,
    })).toBe(false);
  });

  it('allows admins to manually update an order value', () => {
    const numero = oficina.ordens()[0].numero;
    expect(oficina.atualizarValorOrdem(numero, 425.5)).toBe(true);
    expect(oficina.ordens().find((ordem) => ordem.numero === numero)?.valor).toBe(425.5);
    expect(oficina.atualizarValorOrdem(numero, -1)).toBe(false);
  });

  it('keeps employee accounts in read-only mode', () => {
    const auth = TestBed.inject(AuthService);
    auth.logout();
    auth.login('admin@oficina.com', 'admin123');
    auth.criarConta('Funcionário', 'funcionario@exemplo.com', 'senha123', 'funcionario');
    auth.logout();
    auth.login('funcionario@exemplo.com', 'senha123');

    const numero = oficina.ordens()[0].numero;
    const valorAnterior = oficina.ordens()[0].valor;
    expect(oficina.atualizarValorOrdem(numero, 99)).toBe(false);
    expect(oficina.adicionarMes({
      chave: '2027-01',
      faturamento: 12000,
      despesas: 7000,
      concluidas: 12,
    })).toBe(false);
    oficina.mudarStatus(numero, 'Concluída');
    expect(oficina.ordens()[0].valor).toBe(valorAnterior);
    expect(oficina.ordens()[0].status).not.toBe('Concluída');
    expect(oficina.meses().some((mes) => mes.chave === '2027-01')).toBe(false);
  });
});
