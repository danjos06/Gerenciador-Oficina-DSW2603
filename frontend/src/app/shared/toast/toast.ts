import { Component, inject } from '@angular/core';
import { OficinaService } from '../../services/oficina';

@Component({
  selector: 'app-toast',
  template: `@if (s.toast(); as msg) {<div class="toast" role="status">{{ msg }}</div>}`,
  styles: `.toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#191e24;color:#fff;padding:12px 20px;border-radius:10px;font-size:14px;box-shadow:0 8px 24px rgba(0,0,0,.25);z-index:100;max-width:calc(100vw - 32px)}`,
})
export class Toast {
  s = inject(OficinaService);
}
