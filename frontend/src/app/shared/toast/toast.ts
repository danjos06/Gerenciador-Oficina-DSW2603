import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth';
import { OficinaService } from '../../services/oficina';

@Component({
  selector: 'app-toast',
  template: `
    @if (auth.aviso(); as aviso) {
      <div class="aviso-offline" role="alert">{{ aviso }}</div>
    }
    @if (s.toast(); as msg) {
      <div class="toast" role="status">{{ msg }}</div>
    }
  `,
  styles: `
    .aviso-offline{position:fixed;left:50%;top:12px;transform:translateX(-50%);background:#b91c1c;color:#fff;padding:8px 18px;border-radius:999px;font-size:13px;font-weight:600;box-shadow:0 6px 20px rgba(185,28,28,.35);z-index:200;max-width:calc(100vw - 32px);text-align:center}
    .toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#191e24;color:#fff;padding:12px 20px;border-radius:10px;font-size:14px;box-shadow:0 8px 24px rgba(0,0,0,.25);z-index:100;max-width:calc(100vw - 32px)}
  `,
})
export class Toast {
  s = inject(OficinaService);
  auth = inject(AuthService);
}
