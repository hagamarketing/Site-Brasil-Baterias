/** Dados estruturados (Google): loja local. */
export const lojaSchema = {
  "@context": "https://schema.org",
  "@type": "AutoPartsStore",
  "@id": "https://abrasilbaterias.com/#loja",
  "name": "A Brasil Baterias",
  "url": "https://abrasilbaterias.com/",
  "logo": "https://abrasilbaterias.com/imagens/logo.png",
  "image": "https://abrasilbaterias.com/imagens/fachada-brasil-baterias.webp",
  "description": "Loja de baterias automotivas em Marília desde 1980. Entrega e instalação grátis em até 50 minutos.",
  "telephone": "+55-14-3433-0722",
  "email": "abrasilbaterias@gmail.com",
  "foundingDate": "1980",
  "priceRange": "$$",
  "paymentAccepted": "Pix, cartão de crédito, cartão de débito, dinheiro",
  "currenciesAccepted": "BRL",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Av. Pedro de Toledo, 1894 - Palmital",
    "addressLocality": "Marília",
    "addressRegion": "SP",
    "postalCode": "17509-022",
    "addressCountry": "BR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -22.20706,
    "longitude": -49.95144
  },
  "hasMap": "https://maps.google.com/?q=A+Brasil+Baterias+Av.+Pedro+de+Toledo,+1894+Mar%C3%ADlia",
  "areaServed": {
    "@type": "City",
    "name": "Marília",
    "sameAs": "https://pt.wikipedia.org/wiki/Mar%C3%ADlia"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
      ],
      "opens": "08:00",
      "closes": "18:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "08:00",
      "closes": "13:00"
    }
  ],
  "brand": [
    {
      "@type": "Brand",
      "name": "Moura"
    },
    {
      "@type": "Brand",
      "name": "Zetta"
    }
  ],
  "sameAs": [
    "https://www.instagram.com/abrasilbaterias/",
    "https://www.facebook.com/abrasilbateriasmarilia/"
  ]
} as const;
