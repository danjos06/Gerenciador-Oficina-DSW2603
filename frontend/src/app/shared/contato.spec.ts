import { cepTemFormatoValido, mascararCep, montarLinkWhatsapp } from './contato';

describe('contact helpers', () => {
  it('formats and validates Brazilian postal codes', () => {
    expect(mascararCep('04567000')).toBe('04567-000');
    expect(cepTemFormatoValido('04567-000')).toBe(true);
    expect(cepTemFormatoValido('00000-000')).toBe(false);
    expect(cepTemFormatoValido('1234')).toBe(false);
  });

  it('encodes the request details in a WhatsApp link', () => {
    const link = montarLinkWhatsapp({
      nome: 'Cliente',
      telefone: '11999990000',
      cep: '04567-000',
      placa: 'ABC1D23',
      veiculo: 'Carro teste',
      servico: 'Revisão',
    });

    expect(link).toContain('https://wa.me/5511984568569?text=');
    expect(decodeURIComponent(link)).toContain('Serviço: Revisão');
  });
});
