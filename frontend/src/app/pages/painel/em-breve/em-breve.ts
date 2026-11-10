import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-em-breve',
  imports: [RouterLink],
  template: `
    <h1 class="pagina-titulo">{{ titulo }}</h1>
    <section class="card vazio">
      <h2>Esta área entra na próxima etapa.</h2>
      <p class="mut">O rascunho do Figma cobre a visão geral e a landing page. Esta seção está reservada no menu para evolução do sistema.</p>
      <a class="btn primary" routerLink="/painel">Voltar à visão geral</a>
    </section>
  `,
  styles: `.vazio{margin-top:20px;padding:48px 24px;text-align:center;display:grid;gap:10px;justify-items:center}.vazio h2{font-size:18px;font-weight:500}`,
})
export class EmBreve {
  titulo = inject(ActivatedRoute).snapshot.data['titulo'] as string;
}
