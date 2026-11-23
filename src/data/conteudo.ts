import { site } from './site';

export const sobre = {
  rotulo: 'Sobre nós',
  titulo: 'Com muito orgulho, há 46 anos no mesmo lugar',
  destaque: ['46', 'anos'],
  texto: 'Proporcionando o melhor atendimento, com transparência e honestidade!',
};

export const pedidoCopy = {
  rotulo: 'A melhor loja de Marília desde 1980',
  titulo: 'A bateria do seu veículo entregue e instalada em até 50 minutos',
  destaque: ['entregue', 'e', 'instalada'],
  lead: 'Informe seu carro, veja a bateria indicada e envie o pedido pelo WhatsApp. Você paga só na entrega.',
};

export interface Beneficio {
  valor: number;
  sufixo?: string;
  prefixo?: string;
  texto: string;
  rotulo: string;
}

/** Faixa de benefícios. `valor` anima de 0 até o número ao entrar na tela. */
export const beneficios: Beneficio[] = [
  { valor: 24, sufixo: ' meses', texto: 'de garantia nas baterias Moura, conforme o modelo', rotulo: '24 meses' },
  { valor: 50, sufixo: ' min', texto: 'para entregar e instalar em Marília', rotulo: '50 min' },
  { valor: 0, prefixo: 'R$ ', texto: 'de frete, teste e instalação', rotulo: 'R$ 0' },
  { valor: 5, sufixo: 'x sem juros', texto: 'Parcele suas compras em até 5x sem juros no cartão', rotulo: '5x sem juros' },
];

export const passos = [
  {
    titulo: 'Informe o veículo',
    texto: 'Escolha a montadora, o modelo e o ano. Mostramos a bateria indicada pela engenharia Moura para ele.',
  },
  {
    titulo: 'Envie pelo WhatsApp',
    texto:
      'Preencha endereço e forma de pagamento. O pedido chega pronto para a nossa equipe confirmar o valor e o horário.',
  },
  {
    titulo: 'Receba e pague na entrega',
    texto:
      'O técnico testa sua bateria atual, instala a nova e leva a usada para descarte. Você paga depois da instalação.',
  },
];

export const faq = [
  {
    pergunta: 'Não encontrei a bateria do meu veículo. O que faço?',
    resposta: `Confira a grafia do modelo ou busque só pela montadora. Se ainda assim não aparecer, fale com a gente pelo WhatsApp ou pelo ${site.telefone} e indicamos a bateria certa.`,
  },
  {
    pergunta: 'E se o problema não for a bateria?',
    resposta:
      'Realizamos um teste na sua bateria antes da troca. Se o técnico identificar que o defeito não é a bateria, pode haver cobrança pelo atendimento.',
  },
  {
    pergunta: 'O que significa "valor à base de troca"?',
    resposta:
      'O preço considera a entrega da sua bateria usada no momento da instalação. Pela Lei nº 12.305/2010, a devolução da bateria inservível é obrigatória, e nós cuidamos do descarte correto.',
  },
  {
    pergunta: 'Como faço o pagamento?',
    resposta:
      'O pagamento é feito na entrega, depois da instalação. Aceitamos Pix, cartão de crédito, cartão de débito e dinheiro.',
  },
  {
    pergunta: 'Qual é o horário de atendimento?',
    resposta: 'Segunda a sexta, das 8h às 18h. Sábado, das 8h às 13h.',
  },
];
