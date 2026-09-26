import { cicloDeBlocos } from './tema';

/**
 * Funções puras do padrão visual "Letra Viva" (D-50 a D-55). Separadas dos
 * componentes de propósito: o projeto não tem teste de componente, então
 * tudo que dá pra decidir sem renderizar é decidido aqui e testado.
 */

/** Cor do bloco da letra `indice`, deslocada pelo índice do desafio (guia: ciclo de 5). */
export function corDoBloco(indice: number, indiceDoDesafio: number) {
  return cicloDeBlocos[(indice + indiceDoDesafio) % cicloDeBlocos.length];
}

const ROTULO_DO_TEMA: Record<string, string> = {
  animais: 'Animais',
  comida: 'Comida',
  casa: 'Casa',
  corpo: 'Corpo',
  natureza: 'Natureza',
  acoes: 'Ações',
};

/** Nome do tema pra tela — o identificador (`acoes`) nunca é exibido (A-33). */
export function rotuloDoTema(identificador: string): string {
  return (
    ROTULO_DO_TEMA[identificador] ?? identificador.charAt(0).toUpperCase() + identificador.slice(1)
  );
}

export type IconeDeEstrela = 'cheia' | 'meia' | 'vazia';
const TOTAL_DE_ESTRELAS = 5;

/** 5 posições a partir de um valor de 0 a 5 em meias estrelas (FR-007, D-20). Sem mínimo de 1. */
export function estrelasParaIcones(valor: number): IconeDeEstrela[] {
  const meias = Math.round(Math.max(0, Math.min(TOTAL_DE_ESTRELAS, valor)) * 2);
  return Array.from({ length: TOTAL_DE_ESTRELAS }, (_, i) => {
    const restante = meias - i * 2;
    if (restante >= 2) return 'cheia';
    if (restante === 1) return 'meia';
    return 'vazia';
  });
}

/** Mensagem do resultado: sempre positiva; rodada sem erro ganha destaque (CU-05). */
export function mensagemDoResultado(estrelas: number, erros: number): string {
  if (erros === 0) return 'Perfeito, sem nenhum erro!';
  if (estrelas >= 4) return 'Mandou muito bem!';
  if (estrelas >= 3) return 'Boa! Cada rodada fica mais fácil.';
  return 'Você foi até o fim. Isso é o que conta!';
}

/** "Reduzir movimento" do sistema ligado → duração 0 (D-54). */
export function duracaoDoMovimento(ms: number, reduzirMovimento: boolean): number {
  return reduzirMovimento ? 0 : ms;
}
