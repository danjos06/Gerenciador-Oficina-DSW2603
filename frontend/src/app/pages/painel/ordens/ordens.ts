import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Icon } from '../../../shared/icon/icon';
import { classeStatus } from '../../../shared/status';
import { STATUS_LISTA, StatusOS } from '../../../entities/oficina';
import { OficinaService } from '../../../services/oficina';

@Component({
  selector: 'app-ordens',
  imports: [CurrencyPipe, DatePipe, FormsModule, Icon],
  templateUrl: './ordens.html',
  styleUrl: './ordens.css',
})
export class Ordens {
  s = inject(OficinaService);
  statusLista = STATUS_LISTA;
  classeStatus = classeStatus;

  busca = signal('');
  filtro = signal<StatusOS | 'Todas'>('Todas');
  formAberto = signal(false);
  novo = this.vazio();

  filtradas = computed(() => {
    const q = this.busca().trim().toLowerCase();
    return [...this.s.ordens()]
      .sort((a, b) => b.numero - a.numero)
      .filter((o) => this.filtro() === 'Todas' || o.status === this.filtro())
      .filter((o) => !q || `${o.numero} ${o.cliente} ${o.veiculo} ${o.placa} ${o.servico}`.toLowerCase().includes(q));
  });
  total = computed(() => this.filtradas().reduce((t, o) => t + o.valor, 0));

  contar(st: StatusOS | 'Todas'): number {
    return st === 'Todas' ? this.s.ordens().length : this.s.ordens().filter((o) => o.status === st).length;
  }

  private vazio() {
    return { cliente: '', veiculo: '', placa: '', servico: '', valor: null as number | null, status: 'Em diagnóstico' as StatusOS, entrega: '' };
  }

  salvar(f: NgForm): void {
    if (f.invalid) {
      f.control.markAllAsTouched();
      return;
    }
    this.s.criarOrdem({ ...this.novo, valor: this.novo.valor ?? 0 });
    this.novo = this.vazio();
    f.resetForm(this.novo);
    this.formAberto.set(false);
  }

  excluir(numero: number): void {
    if (typeof confirm === 'undefined' || confirm(`Excluir a OS #${numero}?`)) this.s.excluirOrdem(numero);
  }

  mudar(numero: number, status: string): void {
    this.s.mudarStatus(numero, status as StatusOS);
  }
}
