export interface EnderecoCep {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

export const soDigitos = (v: string): string => (v ?? '').replace(/\D/g, '');

export function mascararCep(v: string): string {
  const d = soDigitos(v).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export function cepTemFormatoValido(v: string): boolean {
  const d = soDigitos(v);
  return d.length === 8 && !/^(\d)\1{7}$/.test(d);
}

export async function consultarCep(v: string): Promise<EnderecoCep | null> {
  const d = soDigitos(v);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);

  try {
    const r = await fetch(`https://viacep.com.br/ws/${d}/json/`, { signal: ctrl.signal });
    if (!r.ok) throw new Error('Falha na consulta do CEP');
    const j = await r.json();
    if (j.erro) return null;
    return {
      cep: j.cep,
      logradouro: j.logradouro,
      bairro: j.bairro,
      localidade: j.localidade,
      uf: j.uf,
    };
  } finally {
    clearTimeout(timer);
  }
}

export function resumirEnderecoCep(info: EnderecoCep): string {
  const ruaBairro = [info.logradouro, info.bairro].filter(Boolean).join(', ');
  const cidadeUf = [info.localidade, info.uf].filter(Boolean).join('/');
  return [ruaBairro, cidadeUf].filter(Boolean).join(' - ');
}

export function montarEnderecoCompleto(baseEndereco: string, numero: string, cep: string): string {
  const base = baseEndereco.trim();
  const num = numero.trim();
  const cepFormatado = mascararCep(cep);
  const partes: string[] = [];

  if (base) {
    partes.push(num ? `${base}, nº ${num}` : base);
  } else if (num) {
    partes.push(`Nº ${num}`);
  }

  if (cepFormatado) {
    partes.push(`CEP ${cepFormatado}`);
  }

  return partes.join(' - ');
}

export const WHATSAPP_OFICINA = '5511984568569';

export interface DadosSolicitacao {
  nome: string;
  telefone: string;
  cep: string;
  endereco?: string;
  placa: string;
  veiculo: string;
  servico: string;
}

export function montarLinkWhatsapp(d: DadosSolicitacao): string {
  const linhas = [
    '*Nova solicitação de serviço*',
    `Nome: ${d.nome}`,
    `Telefone: ${d.telefone}`,
    `CEP: ${d.cep}${d.endereco ? ` (${d.endereco})` : ''}`,
    `Veículo: ${d.veiculo}`,
    `Placa: ${d.placa}`,
    `Serviço: ${d.servico}`,
  ];

  return `https://wa.me/${WHATSAPP_OFICINA}?text=${encodeURIComponent(linhas.join('\n'))}`;
}
