import { Routes } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { Layout } from './pages/painel/layout/layout';
import { VisaoGeral } from './pages/painel/visao-geral/visao-geral';
import { Ordens } from './pages/painel/ordens/ordens';
import { Clientes } from './pages/painel/clientes/clientes';
import { Veiculos } from './pages/painel/veiculos/veiculos';
import { Financeiro } from './pages/painel/financeiro/financeiro';
import { EmBreve } from './pages/painel/em-breve/em-breve';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'adm', redirectTo: 'painel', pathMatch: 'full' },
  {
    path: 'painel',
    component: Layout,
    children: [
      { path: '', component: VisaoGeral },
      { path: 'ordens', component: Ordens },
      { path: 'clientes', component: Clientes },
      { path: 'veiculos', component: Veiculos },
      { path: 'financeiro', component: Financeiro },
      { path: 'estoque', component: EmBreve, data: { titulo: 'Estoque' } },
      { path: 'relatorios', component: EmBreve, data: { titulo: 'Relatórios' } },
      { path: 'configuracoes', component: EmBreve, data: { titulo: 'Configurações' } },
    ],
  },
  { path: '**', redirectTo: '' },
];
