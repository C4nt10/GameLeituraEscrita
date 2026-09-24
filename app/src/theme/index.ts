/**
 * Tokens visuais — portados de `design/prototipo.html` (protótipo
 * clicável do MVP), não inventados aqui. Mantém a mesma paleta
 * "lousa de sala de aula" nas telas de verdade.
 */
export const cores = {
  lousa: '#1C2E27',
  lousaFenda: '#16241F',
  giz: '#F4EFE1',
  gizFraco: '#C9D6C9',
  gizAmarelo: '#F2C94C',

  papel: '#FFFBF2',
  papelAlt: '#F5EAD3',
  tinta: '#3A2E22',
  tintaFraca: '#8A7B67',
  linha: '#E6D9BC',

  blocoVermelho: '#E85D42',
  blocoVermelhoT: '#FDECE7',
  blocoAzul: '#3E7CB1',
  blocoAzulT: '#E7F1F8',
  blocoAmarelo: '#F2B705',
  blocoAmareloT: '#FEF6DC',
  blocoVerde: '#4C9A5B',
  blocoVerdeT: '#E9F5EB',
  blocoCoral: '#F08A6C',
  blocoCoralT: '#FDECE4',

  categoriaAnimais: '#4C9A5B',
  categoriaComida: '#E08A2B',
  categoriaCasa: '#3E7CB1',
  categoriaCorpo: '#D66B94',
  categoriaNatureza: '#2F9E92',
  categoriaAcoes: '#8B6BB5',
} as const;

export const espacamento = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const raio = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
} as const;

/** Alvo de toque mínimo (Princípio VI — alvo grande, um toque). */
export const ALVO_TOQUE_MINIMO = 56;
