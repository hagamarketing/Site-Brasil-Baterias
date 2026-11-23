/** Dados da loja. Troque aqui e o site inteiro acompanha. */
export const site = {
  nome: 'Brasil Baterias',
  nomeLegal: 'A Brasil Baterias',
  url: 'https://abrasilbaterias.com',
  titulo: 'Brasil Baterias | Loja de Baterias Automotivas em Marília',
  descricao:
    'Encontre a bateria certa para seu carro e faça o pedido pelo WhatsApp. Entrega e instalação grátis em Marília.',
  cidade: 'Marília',
  estado: 'SP',
  fundacao: 1980,
  whatsapp: '551434330722',
  telefone: '(14) 3433-0722',
  telefoneLink: 'tel:+551434330722',
  email: 'abrasilbaterias@gmail.com',
  endereco: {
    rua: 'Av. Pedro de Toledo, 1894',
    bairro: 'Palmital',
    cep: '17509-022',
    mapa: 'https://maps.google.com/?q=Av.+Pedro+de+Toledo,+1894+-+Palmital,+Mar%C3%ADlia+-+SP',
  },
  horarios: [
    { dia: 'Segunda a sexta', horas: '8h às 18h' },
    { dia: 'Sábado', horas: '8h às 13h' },
  ],
} as const;

/** Link do WhatsApp com mensagem pronta. */
export function linkWhatsApp(mensagem = 'Olá, vim pelo site e gostaria de falar com um vendedor.'): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}

export const navegacao = [
  { rotulo: 'Fazer pedido', href: '#pedido-secao' },
  { rotulo: 'Mais vendidas', href: '#mais-vendidas' },
  { rotulo: 'Como funciona', href: '#como-funciona' },
  { rotulo: 'Dúvidas', href: '#duvidas' },
] as const;
