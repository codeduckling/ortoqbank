export const THEMES = [
  { name: 'ciencias-basicas', label: 'Ciências Básicas', order: 0 },
  { name: 'tumores', label: 'Tumores', order: 1 },
  { name: 'coluna', label: 'Coluna', order: 2 },
  { name: 'mao', label: 'Mão', order: 3 },
  { name: 'ombro-e-cotovelo', label: 'Ombro e Cotovelo', order: 4 },
  { name: 'joelho', label: 'Joelho', order: 5 },
  { name: 'quadril', label: 'Quadril', order: 6 },
  { name: 'pe-e-tornozelo', label: 'Pé e Tornozelo', order: 7 },
  { name: 'ortopedia-pediatrica', label: 'Ortopedia Pediátrica', order: 8 },
] as const;

export type Theme = (typeof THEMES)[number]['name'];
