import { Component, computed, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-orcamentos',
  standalone: true,
  imports: [CurrencyPipe, FormsModule],
  template: `
    <div class="cabeca">
      <div>
        <h1 class="pagina-titulo">Orçamentos</h1>
        <p class="pagina-sub">Some peças e materiais ao valor da mão de obra para calcular o orçamento.</p>
      </div>
    </div>

    <section class="card calculadora">
      <div>
        <h2>Calcular orçamento</h2>
        <p class="mut">Informe o total de peças e materiais e o valor da mão de obra.</p>
      </div>

      <div class="campos">
        <label class="campo">Peças e materiais (R$)
          <input name="materiais" type="number" min="0" step="0.01" [ngModel]="materiais()" (ngModelChange)="materiais.set($event === null ? null : +$event)" placeholder="0,00" />
        </label>
        <label class="campo">Mão de obra (R$)
          <input name="maoDeObra" type="number" min="0" step="0.01" [ngModel]="maoDeObra()" (ngModelChange)="maoDeObra.set($event === null ? null : +$event)" placeholder="0,00" />
        </label>
      </div>

      @if (valoresInvalidos()) {
        <p class="erro" role="alert">Os valores de peças, materiais e mão de obra não podem ser negativos.</p>
      }
      <div class="resultado">
        <span>Total do orçamento</span>
        <strong>{{ total() | currency: 'BRL' : 'symbol' : '1.2-2' }}</strong>
      </div>
      <p class="orientacao">Este cálculo é apenas uma referência. Informe o total manualmente na ordem de serviço.</p>
      <div class="acoes">
        <button class="btn" type="button" (click)="limpar()">Limpar cálculo</button>
      </div>
    </section>
  `,
  styles: `
    .cabeca{margin-bottom:18px}
    .calculadora{max-width:820px;padding:22px;display:grid;gap:18px}
    .calculadora h2{font-size:18px;font-weight:500;margin-bottom:4px}
    .campos{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}
    .resultado{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:18px;background:var(--ink);border-radius:12px;color:#fff}
    .resultado strong{font-size:24px;font-weight:600}
    .erro{color:#a5362b;font-size:13px}
    .orientacao{font-size:13px;color:var(--muted)}
    .acoes{display:flex;gap:8px;flex-wrap:wrap}
    @media(max-width:560px){.calculadora{padding:16px}.resultado{align-items:flex-start;flex-direction:column}}
  `,
})
export class Orcamentos {
  materiais = signal<number | null>(null);
  maoDeObra = signal<number | null>(null);
  valoresInvalidos = computed(() => (this.materiais() ?? 0) < 0 || (this.maoDeObra() ?? 0) < 0);
  total = computed(() => (this.materiais() ?? 0) + (this.maoDeObra() ?? 0));

  limpar(): void {
    this.materiais.set(null);
    this.maoDeObra.set(null);
  }
}
