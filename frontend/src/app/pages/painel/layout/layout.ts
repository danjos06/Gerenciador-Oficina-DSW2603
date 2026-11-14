import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Icon } from '../../../shared/icon/icon';
import { AuthService } from '../../../services/auth';
import { OficinaService } from '../../../services/oficina';

const TITULOS: Record<string, string> = {
  '': 'Visão geral', ordens: 'Ordens de serviço', clientes: 'Clientes', veiculos: 'Veículos',
  financeiro: 'Financeiro', orcamentos: 'Orçamentos', configuracoes: 'Configurações',
};

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  s = inject(OficinaService);
  auth = inject(AuthService);
  private router = inject(Router);
  cfg = environment;

  aberta = signal(typeof window === 'undefined' || window.innerWidth > 900);

  itens = [
    { caminho: '', rotulo: 'Visão geral', icone: 'dashboard' },
    { caminho: 'ordens', rotulo: 'Ordens de serviço', icone: 'clipboard' },
    { caminho: 'clientes', rotulo: 'Clientes', icone: 'users' },
    { caminho: 'veiculos', rotulo: 'Veículos', icone: 'car' },
    { caminho: 'financeiro', rotulo: 'Financeiro', icone: 'wallet' },
    { caminho: 'orcamentos', rotulo: 'Orçamentos', icone: 'chart' },
  ];

  constructor() {
    if (this.auth.perfil() === 'admin') {
      this.itens.push({ caminho: 'configuracoes', rotulo: 'Configurações', icone: 'settings' });
    }
  }

  //Quando foi atualizado
  private url = toSignal(this.router.events.pipe(filter((e) => e instanceof NavigationEnd), map(() => this.router.url)), { initialValue: this.router.url });
  titulo = computed(() => TITULOS[this.url().split('?')[0].split('/')[2] ?? ''] ?? 'Visão geral');
  atualizado = `${String(this.s.carregadoEm.getHours()).padStart(2, '0')}h${String(this.s.carregadoEm.getMinutes()).padStart(2, '0')}`;
  alternar(): void {
    this.aberta.update((v) => !v);
  }

  navegou(): void {
    if (typeof window !== 'undefined' && window.innerWidth <= 900) this.aberta.set(false);
  }

  sair(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}