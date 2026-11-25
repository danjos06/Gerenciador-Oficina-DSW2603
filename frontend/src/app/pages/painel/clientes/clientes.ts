import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ClienteResumo } from '../../../entities/oficina';
import { AuthService } from '../../../services/auth';
import { OficinaService } from '../../../services/oficina';
import { cepTemFormatoValido, consultarCep, mascararCep, montarEnderecoCompleto, resumirEnderecoCep } from '../../../shared/contato';

@Component({
  selector: 'app-clientes',
  imports: [CurrencyPipe, DatePipe, FormsModule],
  template: `
    <div class="cabeca">
      <div>
        <h1 class="pagina-titulo">Clientes</h1>
        <p class="pagina-sub">Cadastre e mantenha os dados dos clientes e seus veículos.</p>
      </div>
      @if (podeEditar) { <button class="btn" type="button" (click)="abrirNovo()">Novo cliente</button> }
    </div>

    @if (podeEditar && formAberto) {
      <form class="card editor" #f="ngForm" (ngSubmit)="salvar(f)" novalidate>
        <h2>{{ clienteEditando === null ? 'Novo cliente' : 'Editar cliente' }}</h2>
        <div class="campos">
          <label>Nome<input name="nome" [(ngModel)]="form.nome" required /></label>
          <label>Telefone<input name="telefone" [(ngModel)]="form.telefone" required inputmode="tel" /></label>
          <label>CEP<input name="cep" [(ngModel)]="form.cep" (input)="aoDigitarCep()" maxlength="9" placeholder="00000-000" inputmode="numeric" /></label>
          <label>Número<input name="numero" [(ngModel)]="form.numero" placeholder="Ex.: 123" /></label>
          <label>Endereço (ViaCEP)<input name="enderecoBase" [(ngModel)]="form.enderecoBase" placeholder="Rua, bairro - cidade/UF" /></label>
          <label>Modelo do carro<input name="modelo" [(ngModel)]="form.modelo" /></label>
          <label>Placa<input name="placa" [(ngModel)]="form.placa" /></label>
        </div>
        @if (buscandoCep()) { <small class="mut">Consultando CEP no ViaCEP...</small> }
        @if (erroCep()) { <span class="erro">{{ erroCep() }}</span> }
        @if (f.submitted && f.invalid) { <span class="erro">Informe o nome e o telefone do cliente.</span> }
        <div class="acoes">
          <button class="btn primary" type="submit">Salvar cliente</button>
          <button class="btn" type="button" (click)="cancelar()">Cancelar</button>
        </div>
      </form>
    }

    <section class="card bloco">
      <h2>Solicitações de orçamento <span class="pilula s-aguard">{{ s.solicitacoes().length }}</span></h2>
      @for (x of s.solicitacoes(); track x.id) {
        <div class="sol">
          <div>
            <strong>{{ x.nome }}</strong> · {{ x.telefone }}
            @if (x.email) { <span class="mut"> · {{ x.email }}</span> }
            <p class="mut">{{ x.veiculo }} · {{ x.placa }} · {{ x.endereco || ('CEP ' + x.cep) }}</p>
            <p class="mut">{{ x.servico }} <small>({{ x.criadaEm | date: 'dd/MM HH:mm' }})</small></p>
          </div>
          @if (podeEditar) {
            <div class="acoes-solicitacao">
              <button class="btn sm" (click)="s.transformarSolicitacaoEmOrdem(x)">Transformar em ordem</button>
              <button class="btn sm" (click)="s.atenderSolicitacao(x.id)">Marcar como atendida</button>
            </div>
          }
        </div>
      } @empty {
        <p class="mut vazio">Nenhum pedido novo. Os envios do formulário da landing page aparecem aqui.</p>
      }
    </section>

    <section class="card lista">
      <div class="rolagem">
        <table class="tabela">
          <thead><tr><th>Cliente</th><th>Contato</th><th>Endereço / CEP</th><th>Veículos</th><th class="dir">OS</th><th class="dir">Total</th>@if (podeEditar) { <th>Ações</th> }</tr></thead>
          <tbody>
            @for (c of s.clientes(); track c.id) {
              <tr>
                <td class="forte">{{ c.nome }}</td>
                <td>{{ c.telefone }}</td>
                <td>{{ c.endereco || c.cep || '—' }}</td>
                <td>@for (v of c.veiculos; track v.placa) { <div class="sub">{{ v.modelo }} · {{ v.placa }}</div> }</td>
                <td class="dir">{{ c.os }}</td>
                <td class="dir forte">{{ c.total | currency: 'BRL' : 'symbol' : '1.2-2' }}</td>
                @if (podeEditar) {
                  <td class="col-acoes">
                    <div class="acoes-linha">
                      <button class="btn sm" type="button" (click)="editar(c)">Editar</button>
                      <button class="btn sm excluir" type="button" (click)="excluir(c.id, c.nome)">Excluir</button>
                    </div>
                  </td>
                }
              </tr>
            }
            @empty { <tr><td [attr.colspan]="podeEditar ? 7 : 6" class="mut vazio">Nenhum cliente cadastrado.</td></tr> }
          </tbody>
        </table>
      </div>
    </section>
  `,
  styles: `
    .cabeca{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
    .editor{padding:18px 20px;margin-top:18px;display:grid;gap:14px}
    .editor h2{font-size:16px;font-weight:500}
    .campos{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px}
    .campos label{display:grid;gap:6px;font-size:13px;color:var(--muted)}
    .campos input{height:40px;padding:0 10px;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--text)}
    .acoes{display:flex;gap:8px;flex-wrap:wrap}
    .bloco{padding:18px 20px;margin:18px 0 14px;display:grid;gap:10px}
    .bloco h2{font-size:16px;font-weight:500;display:flex;gap:8px;align-items:center}
    .sol{display:flex;justify-content:space-between;align-items:center;gap:12px;background:#f4f6f8;border-radius:10px;padding:12px 14px;flex-wrap:wrap}
    .sol p{margin-top:4px}
    .acoes-solicitacao{display:flex;gap:8px;flex-wrap:wrap}
    .vazio{padding:8px 0;text-align:center}
    .lista{overflow:hidden}.rolagem{overflow-x:auto}.rolagem .tabela{min-width:560px}
    .col-acoes{white-space:nowrap;width:1%}
    .acoes-linha{display:inline-flex;align-items:center;gap:6px}
    .excluir{color:#a5362b}
    .erro{color:#a5362b;font-size:13px}
  `,
})
export class Clientes {
  s = inject(OficinaService);
  podeEditar = inject(AuthService).perfil() === 'admin';
  formAberto = false;
  clienteEditando: number | null = null;
  buscandoCep = signal(false);
  erroCep = signal('');
  form = this.vazio();

  private vazio() {
    return { nome: '', telefone: '', cep: '', numero: '', enderecoBase: '', modelo: '', placa: '' };
  }

  async aoDigitarCep(): Promise<void> {
    this.form.cep = mascararCep(this.form.cep);
    this.erroCep.set('');

    if (!cepTemFormatoValido(this.form.cep)) return;

    const cepBuscado = this.form.cep;
    this.buscandoCep.set(true);
    try {
      const info = await consultarCep(cepBuscado);
      if (this.form.cep !== cepBuscado) return;
      if (!info) {
        this.erroCep.set('CEP não encontrado no ViaCEP.');
        return;
      }
      this.form.enderecoBase = resumirEnderecoCep(info);
    } catch {
      // Ignora falha de rede ao consultar CEP
    } finally {
      if (this.form.cep === cepBuscado) {
        this.buscandoCep.set(false);
      }
    }
  }

  abrirNovo(): void {
    this.form = this.vazio();
    this.erroCep.set('');
    this.clienteEditando = null;
    this.formAberto = true;
  }

  editar(cliente: ClienteResumo): void {
    const principal = cliente.veiculos[0];
    this.erroCep.set('');
    this.form = {
      nome: cliente.nome,
      telefone: cliente.telefone,
      cep: cliente.cep,
      numero: cliente.numero ?? '',
      enderecoBase: cliente.endereco ?? '',
      modelo: principal?.modelo ?? '',
      placa: principal?.placa ?? '',
    };
    this.clienteEditando = cliente.id;
    this.formAberto = true;
  }

  async salvar(f: NgForm): Promise<void> {
    if (f.invalid) {
      f.control.markAllAsTouched();
      return;
    }

    if (this.form.cep && !cepTemFormatoValido(this.form.cep)) {
      this.erroCep.set('CEP inválido. Use 8 números.');
      return;
    }

    let baseEndereco = this.form.enderecoBase.trim();
    if (this.form.cep && !baseEndereco) {
      try {
        const info = await consultarCep(this.form.cep);
        if (!info) {
          this.erroCep.set('CEP não encontrado no ViaCEP.');
          return;
        }
        baseEndereco = resumirEnderecoCep(info);
      } catch {
        // Fallback caso ViaCEP esteja inacessível
      }
    }

    const enderecoCompleto = montarEnderecoCompleto(baseEndereco, this.form.numero, this.form.cep);

    this.s.salvarCadastroCliente(
      {
        nome: this.form.nome,
        telefone: this.form.telefone,
        cep: this.form.cep,
        numero: this.form.numero,
        endereco: enderecoCompleto,
        modelo: this.form.modelo,
        placa: this.form.placa,
      },
      this.clienteEditando ?? undefined,
    );
    this.cancelar();
  }

  excluir(id: number, nome: string): void {
    if (typeof confirm === 'undefined' || confirm(`Excluir o cadastro de ${nome}?`)) this.s.excluirCliente(id);
  }

  cancelar(): void {
    this.formAberto = false;
    this.clienteEditando = null;
    this.erroCep.set('');
    this.form = this.vazio();
  }
}
