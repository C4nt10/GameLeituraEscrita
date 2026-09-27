/**
 * Medição e ajuste do áudio que o microfone entrega, antes de gastar segundos
 * do Whisper com ele (D-45). Puro, sem nativo — testável em Jest.
 *
 * Por que existe: num aparelho real o reconhecimento demorou e, no silêncio,
 * respondeu "[SOM DE FUTEBOL]". Sem medir o áudio não dá pra saber se a falha
 * é do microfone (não chega sinal) ou do reconhecimento (chega e não entende).
 */

/** Taxa de amostragem da captura (`services/gravacao`): o Whisper exige 16 kHz. */
export const TAXA_DE_AMOSTRAGEM = 16000;

/**
 * Abaixo disso (~ -46 dBFS) não chegou som nenhum: é o microfone mudo, sem
 * permissão de fato, ocupado por outro app ou bloqueado — não uma criança
 * quieta (mesmo o silêncio de uma sala tem chiado acima disso).
 */
export const PICO_MINIMO = 0.005;

/** Pico-alvo depois de normalizar, e o teto do ganho (ruído fraco não vira barulho). */
const PICO_ALVO = 0.8;
const GANHO_MAXIMO = 30;
/** Já é alto o bastante: não mexe. */
const PICO_JA_ALTO = 0.3;

export interface MedidaDoAudio {
  segundos: number;
  /** Maior amplitude absoluta, de 0 a 1. */
  pico: number;
}

export function medirAudio(audio: Float32Array): MedidaDoAudio {
  let pico = 0;
  for (let i = 0; i < audio.length; i++) {
    const v = Math.abs(audio[i]);
    if (v > pico) pico = v;
  }
  return { segundos: audio.length / TAXA_DE_AMOSTRAGEM, pico };
}

/** Amplifica voz baixa (comum em celular) sem estourar; devolve cópia, nunca altera o original. */
export function normalizarPico(audio: Float32Array): Float32Array {
  const { pico } = medirAudio(audio);
  if (pico === 0 || pico >= PICO_JA_ALTO) return audio;
  const ganho = Math.min(PICO_ALVO / pico, GANHO_MAXIMO);
  const saida = new Float32Array(audio.length);
  for (let i = 0; i < audio.length; i++) saida[i] = audio[i] * ganho;
  return saida;
}

export class SemSinalDeMicrofoneError extends Error {
  constructor() {
    super(
      'O microfone não está captando som. Confira a permissão e se outro app está usando o microfone.',
    );
    this.name = 'SemSinalDeMicrofoneError';
  }
}
