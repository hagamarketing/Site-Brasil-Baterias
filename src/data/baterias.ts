/**
 * Preços por código de bateria (à base de troca). Sem preço aqui, o site mostra
 * "Preço confirmado pelo WhatsApp". O catálogo de veículos fica em veiculos.json.
 */
export const PRECOS: Record<string, number> = {
  M60GD: 450,
  M60AD: 450,
  M60GE: 450,
  M60GX: 450,
  MF60AD: 840,
  MF50ED: 740,
  Z60D: 370,
  MF72LD: 900,
  M100QD: 1050,
  M100HE: 970,
};

export const brl = (n: number): string => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export interface Destaque {
  /** Código usado para buscar o preço; sem código, o preço é "sob consulta". */
  cod?: string;
  marca: 'Moura' | 'Zetta' | 'Heliar';
  titulo: string;
  subtitulo?: string;
  capacidade: string;
  garantia?: string;
  imagem?: string;
  etiqueta?: string;
  mensagem: string;
}

export const destaques: Destaque[] = [
  {
    cod: 'Z60D',
    marca: 'Zetta',
    titulo: 'Zetta 60 Ah',
    capacidade: '60 Ah',
    garantia: '18 meses',
    imagem: '/imagens/zetta.webp',
    mensagem: 'Olá, vim pelo site e tenho interesse na bateria Zetta 60 Ah.',
  },
  {
    cod: 'M60GD',
    marca: 'Moura',
    titulo: 'Moura 60 Ah',
    capacidade: '60 Ah',
    garantia: '24 meses',
    imagem: '/imagens/moura.webp',
    mensagem: 'Olá, vim pelo site e tenho interesse na bateria Moura 60 Ah.',
  },
  {
    marca: 'Heliar',
    titulo: 'Heliar 60 Ah',
    capacidade: '60 Ah',
    imagem: '/imagens/heliar.webp',
    mensagem: 'Olá, vim pelo site e tenho interesse na bateria Heliar 60 Ah.',
  },
  {
    cod: 'MF72LD',
    marca: 'Moura',
    titulo: 'Moura 72 Ah',
    subtitulo: 'Modelo EFB Start-Stop',
    capacidade: '72 Ah',
    garantia: '24 meses',
    imagem: '/imagens/moura.webp',
    etiqueta: 'EFB · Start-Stop',
    mensagem: 'Olá, vim pelo site e tenho interesse na bateria Moura 72 Ah EFB Start-Stop.',
  },
];
