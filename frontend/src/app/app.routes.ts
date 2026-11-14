import { Routes } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { Login } from './pages/login/login';
import { Layout } from './pages/painel/layout/layout';
import { VisaoGeral } from './pages/painel/visao-geral/visao-geral';
import { Ordens } from './pages/painel/ordens/ordens';
import { Clientes } from './pages/painel/clientes/clientes';
import { Veiculos } from './pages/painel/veiculos/veiculos';
import { Financeiro } from './pages/painel/financeiro/financeiro';
import { Configuracoes } from './pages/painel/configuracoes/configuracoes';
import { Orcamentos } from './pages/painel/orcamentos/orcamentos';
import { perfilGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'login', component: Login },
  { path: 'adm', redirectTo: 'painel', pathMatch: 'full' },
  {
    path: 'painel',
    component: Layout,
    canActivate: [perfilGuard(['admin', 'funcionario'])],
    children: [
      { path: '', component: VisaoGeral },
      { path: 'ordens', component: Ordens },
      { path: 'clientes', component: Clientes },
      { path: 'veiculos', component: Veiculos },
      { path: 'financeiro', component: Financeiro },
      { path: 'orcamentos', component: Orcamentos },
      { path: 'relatorios', redirectTo: 'orcamentos', pathMatch: 'full' },
      { path: 'configuracoes', component: Configuracoes, canActivate: [perfilGuard('admin')] },
    ],
  },
  { path: 'minha-area', redirectTo: '', pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];