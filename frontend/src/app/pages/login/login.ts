import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="login-wrap">
      <div class="login-box">
        <h1>Entrar</h1>
        <p>Entre com sua conta de administrador ou funcionário.</p>

        <form #f="ngForm" (ngSubmit)="enviar(f)" novalidate>
          <label>
            <span>E-mail</span>
            <input type="email" name="email" [(ngModel)]="form.email" required placeholder="admin@oficina.com" />
          </label>

          <label>
            <span>Senha</span>
            <input type="password" name="senha" [(ngModel)]="form.senha" required placeholder="••••••••" />
          </label>

          @if (erro()) {
            <div class="erro">{{ erro() }}</div>
          }

          <button type="submit">Entrar</button>
        </form>

        <div class="links">
          <a routerLink="/">Voltar para a home</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: grid;
      place-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a, #111827);
      font-family: Arial, sans-serif;
    }

    .login-wrap {
      width: 100%;
      display: grid;
      place-items: center;
      padding: 20px;
    }

    .login-box {
      width: min(440px, 100%);
      background: #fff;
      border-radius: 18px;
      padding: 30px 22px;
      box-shadow: 0 18px 45px rgba(0, 0, 0, 0.18);
    }

    h1 {
      margin: 0 0 10px;
      color: #0f172a;
      font-size: 2rem;
    }

    p {
      margin: 0 0 20px;
      color: #475569;
    }

    form {
      display: grid;
      gap: 18px;
    }

    label {
      display: grid;
      gap: 8px;
      color: #1f2937;
      font-weight: 600;
    }

    input {
      width: 100%;
      padding: 12px 14px;
      border: 1px solid #d1d5db;
      border-radius: 10px;
      font-size: 1rem;
      box-sizing: border-box;
    }

    input:focus {
      outline: 2px solid #60a5fa;
      border-color: transparent;
    }

    .erro {
      color: #b91c1c;
      background: #fee2e2;
      border: 1px solid #fecaca;
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 0.92rem;
    }

    button {
      border: none;
      border-radius: 10px;
      background: #2563eb;
      color: white;
      padding: 12px 16px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
    }

    button:hover {
      background: #1d4ed8;
    }

    .demo {
      margin-top: 20px;
      padding: 12px 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      color: #334155;
      line-height: 1.5;
    }

    .demo strong {
      display: block;
      margin-bottom: 6px;
    }

    .demo p {
      margin: 0;
    }

    .links {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin-top: 18px;
      flex-wrap: wrap;
    }

    a {
      color: #2563eb;
      text-decoration: none;
      font-weight: 600;
    }
  `,
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  form = {
    email: '',
    senha: '',
  };

  erro = signal('');

  constructor() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/painel']);
    }
  }

  enviar(f: NgForm): void {
    if (f.invalid) {
      f.control.markAllAsTouched();
      this.erro.set('Preencha os campos obrigatórios.');
      return;
    }

    const perfil = this.auth.login(this.form.email, this.form.senha);
    if (perfil) {
      this.router.navigate(['/painel']);
      return;
    }

    this.erro.set('E-mail ou senha inválidos.');
    this.form.senha = '';
  }
}
