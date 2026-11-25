import {
  cepTemFormatoValido,
  mascararCep,
  montarLinkWhatsapp,
  montarLinkWhatsappOrdem,
  normalizarTelefoneWhatsapp,
} from './contato';

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

  it('builds a WhatsApp link for a service order using the client phone', () => {
    expect(normalizarTelefoneWhatsapp('(11) 99999-8888')).toBe('5511999998888');
    expect(normalizarTelefoneWhatsapp('5511999998888')).toBe('5511999998888');

    const link = montarLinkWhatsappOrdem(
      {
        numero: 42,
        cliente: 'João da Silva',
        veiculo: 'Honda Civic',
        placa: 'ABC-1D23',
        servico: 'Troca de óleo',
        itensServico: [{ descricao: 'Troca de óleo', quantidade: 1, precoUnitario: 120 }],
        itensPeca: [{ nome: 'Filtro de óleo', quantidade: 1, precoUnitario: 45 }],
        valorServico: 120,
        valorPecas: 45,
        status: 'Em execução',
        valor: 165,
        box: true,
        criadaEm: new Date().toISOString(),
      },
      '(11) 99999-8888',
      'Peça/produto "Filtro de óleo" adicionado à OS',
    );

    expect(link).toContain('https://wa.me/5511999998888?text=');
    const decoded = decodeURIComponent(link);
    expect(decoded).toContain('Ordem de Serviço #42');
    expect(decoded).toContain('Filtro de óleo');
    expect(decoded).toContain('Troca de óleo');
    expect(decoded).toContain('Atualização: Peça/produto "Filtro de óleo" adicionado à OS');
  });
});
