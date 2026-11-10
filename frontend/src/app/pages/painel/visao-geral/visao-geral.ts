import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Icon } from '../../../shared/icon/icon';
import { classeStatus } from '../../../shared/status';
import { MESES, OficinaService } from '../../../services/oficina';

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
const pct = (a: number, b: number) => ((a - b) / b) * 100;

@Component({
  selector: 'app-visao-geral',
  imports: [CurrencyPipe, DecimalPipe, FormsModule, RouterLink, Icon],
  templateUrl: './visao-geral.html',
  styleUrl: './visao-geral.css',
})
export class VisaoGeral {
  s = inject(OficinaService);
  primeiroNome = environment.usuario.nome.split(' ')[0];
  meses = MESES;
  abs = Math.abs;
  classeStatus = classeStatus;
  hoje = (() => {
    const t = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
    return t.charAt(0).toUpperCase() + t.slice(1);
  })();
  boxes = Array.from({ length: this.s.boxesTotal }, (_, i) => i);

  lucro = computed(() => this.s.mesAtual().faturamento - this.s.mesAtual().despesas);
  margem = computed(() => (this.lucro() / this.s.mesAtual().faturamento) * 100);
  periodo = computed(() => {
    const [a, m] = this.s.mesAtual().chave.split('-').map(Number);
    const ultimo = new Date(a, m, 0).getDate();
    const mm = String(m).padStart(2, '0');
    return `01/${mm}/${a} a ${ultimo}/${mm}/${a}`;
  });
  hojeCurto = new Date().toLocaleDateString('pt-BR');
  brl = brl;

  kpis = computed(() => {
    const m = this.s.mesAtual();
    const p = this.s.mesAnterior();
    const ant = p ? `vs. ${p.nome.split(' ')[0].toLowerCase()}` : 'sem mês anterior';
    const luc = m.faturamento - m.despesas;
    return [
      { rotulo: 'Faturamento', valor: m.faturamento, icone: 'arrow-down-left', delta: p ? pct(m.faturamento, p.faturamento) : null, rodape: ant, destaque: '', escuro: false },
      { rotulo: 'Despesas', valor: m.despesas, icone: 'arrow-up-right', delta: p ? pct(m.despesas, p.despesas) : null, rodape: ant, destaque: '', escuro: false },
      { rotulo: 'Lucro líquido', valor: luc, icone: 'trending-up', delta: p ? pct(luc, p.faturamento - p.despesas) : null, rodape: ant, destaque: '', escuro: true },
      { rotulo: 'Ticket médio', valor: Math.round(m.faturamento / m.concluidas), icone: 'receipt', delta: null, rodape: `concluídas em ${m.nome.split(' ')[0].toLowerCase()}`, destaque: `${m.concluidas} OS`, escuro: false },
    ];
  });

  composicao = computed(() => {
    const d = this.s.mesAtual().despesas;
    const base = [
      { nome: 'Peças e insumos', pct: 55, cor: '#191e24' },
      { nome: 'Equipe', pct: 25, cor: '#6a7581' },
      { nome: 'Estrutura e contas', pct: 14, cor: '#b7bec6' },
      { nome: 'Impostos e taxas', pct: 6, cor: '#27a9e1' },
    ];
    return base.map((b) => ({ ...b, valor: Math.round((d * b.pct) / 100) }));
  });
  pctReceita = computed(() => (this.s.mesAtual().despesas / this.s.mesAtual().faturamento) * 100);
  difDespesas = computed(() => {
    const p = this.s.mesAnterior();
    return p ? this.s.mesAtual().despesas - p.despesas : null;
  });

  // gráfico
  grafico = computed(() => {
    const W = 600, padL = 46, padR = 6, topo = 8, base = 158, max = 60000;
    const idx = this.s.mesIndice();
    const ini = Math.max(0, idx - 5);
    const lista = MESES.slice(ini, ini + 6);
    const gw = (W - padL - padR) / lista.length;
    const y = (v: number) => base - (Math.max(0, v) / max) * (base - topo);
    const barras = lista.map((m, i) => {
      const cx = padL + (i + 0.5) * gw;
      const luc = m.faturamento - m.despesas;
      return {
        rotulo: m.abrev, sel: m.chave === this.s.mesChave(), cx, cy: y(luc),
        x1: cx - 19, y1: y(m.faturamento), h1: base - y(m.faturamento),
        x2: cx + 3, y2: y(m.despesas), h2: base - y(m.despesas),
        lucro: `${(luc / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1 })} mil`,
        dica: `${m.nome}: faturamento ${brl(m.faturamento)}, despesas ${brl(m.despesas)}, lucro ${brl(luc)}`,
      };
    });
    return {
      barras,
      linha: barras.map((b) => `${b.cx},${b.cy}`).join(' '),
      grades: [0, 15000, 30000, 45000, 60000].map((v) => ({ y: y(v), rotulo: v === 0 ? '0' : `${v / 1000} mil` })),
      W, padL,
    };
  });

  ultimas = computed(() => [...this.s.ordens()].sort((a, b) => b.numero - a.numero).slice(0, 4));

  entrega = computed(() => {
    const o = this.s.proximaEntrega();
    if (!o) return null;
    const d = new Date(o.entrega!);
    const mesmoDia = d.toDateString() === new Date().toDateString();
    const dia = mesmoDia ? 'HOJE' : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const hora = `${d.getHours()}H${d.getMinutes() ? String(d.getMinutes()).padStart(2, '0') : ''}`;
    return { titulo: `${dia}, ${hora}`, texto: `${o.veiculo} · ${o.cliente}` };
  });
}
