import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Icon } from '../../../shared/icon/icon';
import { classeStatus } from '../../../shared/status';
import { AuthService } from '../../../services/auth';
import { OficinaService } from '../../../services/oficina';

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
const pct = (a: number, b: number) => b === 0 ? (a === 0 ? 0 : null) : ((a - b) / b) * 100;

@Component({
  selector: 'app-visao-geral',
  imports: [CurrencyPipe, DecimalPipe, FormsModule, RouterLink, Icon],
  templateUrl: './visao-geral.html',
  styleUrl: './visao-geral.css',
})
export class VisaoGeral {
  s = inject(OficinaService);
  private auth = inject(AuthService);
  primeiroNome = computed(() => (this.auth.sessao()?.nome ?? environment.usuario.nome).split(' ')[0]);
  meses = this.s.mesesOrdenados;
  abs = Math.abs;
  classeStatus = classeStatus;
  hoje = (() => {
    const t = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
    return t.charAt(0).toUpperCase() + t.slice(1);
  })();
  boxes = Array.from({ length: this.s.boxesTotal }, (_, i) => i);

  lucro = computed(() => this.s.mesAtual().faturamento - this.s.mesAtual().despesas);
  margem = computed(() => this.s.mesAtual().faturamento
    ? (this.lucro() / this.s.mesAtual().faturamento) * 100
    : 0);
  periodo = computed(() => {
    const chave = this.s.mesAtual().chave;
    if (!chave) return 'Sem período financeiro cadastrado';
    const [a, m] = chave.split('-').map(Number);
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
      { rotulo: 'Ticket médio', valor: m.concluidas ? Math.round(m.faturamento / m.concluidas) : 0, icone: 'receipt', delta: null, rodape: `concluídas em ${m.nome.split(' ')[0].toLowerCase()}`, destaque: `${m.concluidas} OS`, escuro: false },
    ];
  });

  pctReceita = computed(() => this.s.mesAtual().faturamento
    ? (this.s.mesAtual().despesas / this.s.mesAtual().faturamento) * 100
    : 0);
  pctDespesas = computed(() => Math.min(100, this.pctReceita()));
  difDespesas = computed(() => {
    const p = this.s.mesAnterior();
    return p ? this.s.mesAtual().despesas - p.despesas : null;
  });

  // gráfico
  grafico = computed(() => {
    const W = 600, padL = 46, padR = 6, topo = 8, base = 158;
    const idx = this.s.mesIndice();
    const ini = Math.max(0, idx - 5);
    const lista = this.s.mesesOrdenados().slice(ini, ini + 6);
    const maiorValor = Math.max(0, ...lista.flatMap((m) => [m.faturamento, m.despesas]));
    const max = Math.max(10000, Math.ceil(maiorValor / 10000) * 10000);
    const gw = (W - padL - padR) / lista.length;
    const y = (v: number) => base - (Math.max(0, v) / max) * (base - topo);
    const barras = lista.map((m, i) => {
      const cx = padL + (i + 0.5) * gw;
      const luc = m.faturamento - m.despesas;
      return {
        chave: m.chave, rotulo: m.abrev, sel: m.chave === this.s.mesChave(), cx, cy: y(luc),
        x1: cx - 19, y1: y(m.faturamento), h1: base - y(m.faturamento),
        x2: cx + 3, y2: y(m.despesas), h2: base - y(m.despesas),
        lucro: `${(luc / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1 })} mil`,
        dica: `${m.nome}: faturamento ${brl(m.faturamento)}, despesas ${brl(m.despesas)}, lucro ${brl(luc)}`,
      };
    });
    return {
      barras,
      linha: barras.map((b) => `${b.cx},${b.cy}`).join(' '),
      grades: [0, 0.25, 0.5, 0.75, 1].map((fracao) => {
        const valor = max * fracao;
        return { y: y(valor), rotulo: valor === 0 ? '0' : `${valor / 1000} mil` };
      }),
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
