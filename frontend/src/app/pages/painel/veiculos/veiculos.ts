import { Component, inject } from '@angular/core';
import { OficinaService } from '../../../services/oficina';

@Component({
  selector: 'app-veiculos',
  template: `
    <h1 class="pagina-titulo">Veículos</h1>
    <p class="pagina-sub">Todos os veículos que já passaram pela oficina.</p>
    <section class="card lista">
      <div class="rolagem">
        <table class="tabela">
          <thead><tr><th>Placa</th><th>Veículo</th><th>Cliente</th><th class="dir">OS</th><th class="dir">Em andamento</th></tr></thead>
          <tbody>
            @for (v of s.veiculos(); track v.placa) {
              <tr>
                <td class="forte">{{ v.placa }}</td><td>{{ v.veiculo }}</td><td>{{ v.cliente }}</td>
                <td class="dir">{{ v.os }}</td>
                <td class="dir">@if (v.ativas) { <span class="pilula s-exec">{{ v.ativas }}</span> } @else { <span class="mut">—</span> }</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
  styles: `.lista{margin-top:18px;overflow:hidden}.rolagem{overflow-x:auto}.rolagem .tabela{min-width:560px}`,
})
export class Veiculos {
  s = inject(OficinaService);
}
