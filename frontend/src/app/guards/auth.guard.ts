import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, Perfil } from '../services/auth';

export const perfilGuard = (permitido: Perfil | Perfil[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const perfil = auth.perfil();
    const permitidos = Array.isArray(permitido) ? permitido : [permitido];

    if (perfil && permitidos.includes(perfil)) return true;
    if (perfil === 'admin' || perfil === 'funcionario') return router.createUrlTree(['/painel']);
    return router.createUrlTree(['/login']);
  };
};
