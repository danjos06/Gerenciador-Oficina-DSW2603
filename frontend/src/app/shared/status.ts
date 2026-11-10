import { StatusOS } from '../entities/oficina';

export function classeStatus(s: StatusOS): string {
  switch (s) {
    case 'Em execução': return 's-exec';
    case 'Aguard. aprovação': return 's-aguard';
    case 'Pronto para retirada': return 's-pronto';
    case 'Concluída': return 's-conc';
    default: return 's-diag';
  }
}
