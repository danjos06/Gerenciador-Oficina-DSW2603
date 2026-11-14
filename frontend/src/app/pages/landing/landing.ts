import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthService } from '../../services/auth';
import { cepTemFormatoValido, consultarCep, mascararCep, montarLinkWhatsapp, soDigitos } from '../../shared/contato';
import { Icon } from '../../shared/icon/icon';
import { OficinaService } from '../../services/oficina';

interface Servico { icone: string; titulo: string; desc: string }

@Component({
  selector: 'app-landing',
  imports: [FormsModule, Icon, RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {
  private s = inject(OficinaService);
  private auth = inject(AuthService);
  cfg = environment.oficina;
  ano = new Date().getFullYear();

  servicos: Servico[] = [
    { icone: 'wrench', titulo: 'Revisão preventiva', desc: 'Inspeção completa, diagnóstico e recomendações para evitar surpresas no caminho.' },
    { icone: 'car', titulo: 'Freios e pastilhas', desc: 'Troca de pastilhas, discos e manutenção do sistema de frenagem com foco em segurança.' },
    { icone: 'dashboard', titulo: 'Troca de óleo e filtro', desc: 'Manutenção periódica com óleo sintético, filtro e acompanhamento do veículo.' },
    { icone: 'users', titulo: 'Alinhamento e balanceamento', desc: 'Ajuste de direção, suspensão e rodas para melhorar estabilidade e economia.' },
    { icone: 'gauge', titulo: 'Suspensão e direção', desc: 'Amortecedores, buchas e terminais revisados para um rodar firme e confortável.' },
    { icone: 'zap', titulo: 'Diagnóstico elétrico', desc: 'Leitura de falhas, bateria, alternador e chicotes com laudo claro antes do reparo.' },
    { icone: 'settings', titulo: 'Embreagem e câmbio', desc: 'Troca de kit de embreagem e revisão de câmbio com peças de procedência.' },
    { icone: 'snowflake', titulo: 'Ar-condicionado', desc: 'Higienização, carga de gás e reparo para manter a cabine agradável o ano todo.' },
  ];
  diferenciais = [
    { icone: 'shield-check', titulo: 'Orçamento transparente', desc: 'Você recebe um diagnóstico claro antes do serviço e aprova cada item antes da execução.' },
    { icone: 'clock', titulo: 'Retorno rápido', desc: 'Priorizamos a entrega no prazo combinado para você voltar a rodar com tranquilidade.' },
    { icone: 'message', titulo: 'Atendimento humano', desc: 'Fale diretamente com o mecânico responsável pelo seu veículo e acompanhe o andamento com clareza.' },
  ];

  form = { nome: '', telefone: '', cep: '', placa: '', veiculo: '', servico: '' };
  enviado = signal(false);
  erroCep = signal('');
  enviando = signal(false);

  rolar(id: string): void {
    if (typeof document !== 'undefined') document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  aoDigitarTelefone(event: Event): void {
    if (!(event.target instanceof HTMLInputElement)) return;
    event.target.value = soDigitos(event.target.value).slice(0, 11);
    this.form.telefone = event.target.value;
  }

  aoDigitarCep(): void {
    this.form.cep = mascararCep(this.form.cep);
    this.erroCep.set('');
  }

  pedirServico(texto: string): void {
    this.form.servico = texto;
    this.enviado.set(false);
    this.rolar('contato');
  }

  async enviar(f: NgForm): Promise<void> {
    if (f.invalid) {
      f.control.markAllAsTouched();
      return;
    }

    if (!cepTemFormatoValido(this.form.cep)) {
      this.erroCep.set('CEP inválido. Use 8 números, ex.: 04567-000.');
      return;
    }

    const dados = { ...this.form };
    const emailCliente = this.auth.sessao()?.email;
    this.s.enviarSolicitacao(dados.nome, dados.telefone, dados.servico, dados.cep, dados.placa, dados.veiculo, emailCliente);

    const aba = typeof window !== 'undefined' ? window.open('about:blank', '_blank') : null;
    let endereco = '';
    this.enviando.set(true);
    try {
      const info = await consultarCep(dados.cep);
      if (info) endereco = `${info.logradouro}, ${info.bairro} - ${info.localidade}/${info.uf}`;
    } catch {
      endereco = '';
    } finally {
      this.enviando.set(false);
    }

    const link = montarLinkWhatsapp({
      nome: dados.nome,
      telefone: dados.telefone,
      cep: dados.cep,
      endereco,
      placa: dados.placa,
      veiculo: dados.veiculo,
      servico: dados.servico,
    });
    if (typeof window !== 'undefined') {
      if (aba) aba.location.href = link;
      else window.location.assign(link);
    }

    this.form = { nome: '', telefone: '', cep: '', placa: '', veiculo: '', servico: '' };
    f.resetForm(this.form);
    this.enviado.set(true);
    this.s.notificar('Solicitação enviada! Entraremos em contato em até 1 dia útil.');
  }
}