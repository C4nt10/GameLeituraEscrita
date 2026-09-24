import * as Speech from 'expo-speech';
import { createAudioPlayer, type AudioSource } from 'expo-audio';

/**
 * tts — fala palavras/frases/enunciados com a síntese do aparelho, e toca
 * os clipes gravados pro conjunto fechado de letras/fonemas — síntese
 * pronuncia fonema isolado mal (D-27, FR-020).
 */

export interface OpcoesFala {
  voz?: string;
  taxa?: number;
  tom?: number;
}

/** Fala um texto (palavra, frase ou enunciado) com a voz do aparelho. Resolve quando termina. */
export function falar(texto: string, opcoes: OpcoesFala = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    Speech.speak(texto, {
      language: 'pt-BR',
      voice: opcoes.voz,
      rate: opcoes.taxa,
      pitch: opcoes.tom,
      onDone: () => resolve(),
      onStopped: () => resolve(),
      onError: (erro) => reject(erro),
    });
  });
}

/** Interrompe qualquer fala em andamento (D-12 — som toca uma vez, botão repete). */
export function pararFala(): void {
  Speech.stop();
}

/**
 * Mapa identificador → fonte do clipe gravado (letra ou fonema). Fica
 * vazio até os ~52 clipes existirem como asset em `app/assets/audio/` —
 * quando existirem, a tela que monta este mapa passa
 * `require('../../assets/audio/<arquivo>')` por identificador (Metro
 * exige `require` estático, não dá pra montar o caminho em tempo de
 * execução). Ver `app/assets/audio/` — hoje só tem o `.gitkeep`.
 */
export type MapaDeClipes = Record<string, AudioSource>;

/**
 * Toca o clipe gravado de uma letra/fonema. Lança erro se o
 * identificador não estiver no mapa — não tenta "cair" pra síntese, que
 * D-27 proíbe explicitamente pra este conjunto (pronúncia de fonema
 * isolado por síntese sai errada).
 */
export function tocarClipe(mapa: MapaDeClipes, identificador: string): Promise<void> {
  const fonte = mapa[identificador];
  if (!fonte) {
    return Promise.reject(new Error(`Clipe não encontrado pro identificador "${identificador}"`));
  }

  return new Promise((resolve, reject) => {
    try {
      const player = createAudioPlayer(fonte);
      const remover = player.addListener('playbackStatusUpdate', (status) => {
        if (status.didJustFinish) {
          remover.remove();
          player.remove();
          resolve();
        }
      });
      player.play();
    } catch (erro) {
      reject(erro);
    }
  });
}
