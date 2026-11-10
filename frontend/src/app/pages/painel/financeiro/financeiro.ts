import { Component, inject } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { MESES, OficinaService } from '../../../services/oficina';

@Component({
  selector: 'app-financeiro',
  imports: [CurrencyPipe, DecimalPipe],
  template: `
    <h1 class="pagina-titulo">Financeiro</h1>
    <p class="pagina-sub">Resumo mensal. Clique em um mês para destacá-lo na visão geral.</p>
    <section class="card lista">
      <div class="rolagem">
        <table class="tabela">
          <thead><tr><th>Mês</th><th class="dir">Faturamento</th><th class="dir">Despesas</th><th class="dir">Lucro líquido</th><th class="dir">Margem</th><th class="dir">OS concluídas</th><th class="dir">Ticket médio</th></tr></thead>
          <tbody>
            @for (m of meses; track m.chave) {
              <tr [class.sel]="m.chave === s.mesChave()" (click)="s.mesChave.set(m.chave)" tabindex="0" (keydown.enter)="s.mesChave.set(m.chave)">
                <td class="forte">{{ m.nome }}</td>
                <td class="dir">{{ m.faturamento | currency: 'BRL' : 'symbol' : '1.0-0' }}</td>
                <td class="dir">{{ m.despesas | currency: 'BRL' : 'symbol' : '1.0-0' }}</td>
                <td class="dir forte">{{ m.faturamento - m.despesas | currency: 'BRL' : 'symbol' : '1.0-0' }}</td>
                <td class="dir">{{ ((m.faturamento - m.despesas) / m.faturamento) * 100 | number: '1.1-1' }}%</td>
                <td class="dir">{{ m.concluidas }}</td>
                <td class="dir">{{ m.faturamento / m.concluidas | currency: 'BRL' : 'symbol' : '1.0-0' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
  styles: `.lista{margin-top:18px;overflow:hidden}.rolagem{overflow-x:auto}.rolagem .tabela{min-width:760px}tr{cursor:pointer}tr:hover td{background:#f7f8fa}tr.sel td{background:var(--blue-soft)}`,
})
export class Financeiro {
  s = inject(OficinaService);
  meses = [...MESES].reverse();
}
