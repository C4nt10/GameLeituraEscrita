/**
 * Conversão de áudio pro motor de reconhecimento (D-45).
 *
 * O microfone (lib de PCM em tempo real) entrega **PCM de 16 bits**, em
 * chunks base64 de tamanho arbitrário; `whisper.rn` (`transcribeData`) espera
 * **float32** entre -1 e 1. Verificado nos tipos do pacote (whisper.rn
 * 0.7.4): "base64 encoded float32 PCM data or ArrayBuffer".
 *
 * Decodificador base64 próprio, de propósito: não depende de `atob`/`Buffer`
 * existirem no runtime do aparelho, e é testável em Jest.
 */

const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const VALOR_DO_CARACTERE: Record<string, number> = {};
for (let i = 0; i < ALFABETO.length; i++) VALOR_DO_CARACTERE[ALFABETO[i]] = i;

export function base64ParaBytes(base64: string): Uint8Array {
  const limpo = base64.replace(/=+$/, '');
  const bytes = new Uint8Array(Math.floor((limpo.length * 3) / 4));

  let buffer = 0;
  let bitsNoBuffer = 0;
  let saida = 0;
  for (let i = 0; i < limpo.length; i++) {
    buffer = (buffer << 6) | VALOR_DO_CARACTERE[limpo[i]];
    bitsNoBuffer += 6;
    if (bitsNoBuffer >= 8) {
      bitsNoBuffer -= 8;
      bytes[saida++] = (buffer >> bitsNoBuffer) & 0xff;
    }
  }
  return bytes;
}

/**
 * Junta os chunks (na ordem em que chegaram) **antes** de formar as
 * amostras — uma amostra de 2 bytes pode ter sido partida entre dois
 * chunks. Byte solto no final é descartado.
 */
export function pcm16ParaFloat32(chunksBase64: string[]): Float32Array {
  const pedacos = chunksBase64.map(base64ParaBytes);
  const totalBytes = pedacos.reduce((soma, p) => soma + p.length, 0);

  const todos = new Uint8Array(totalBytes);
  let deslocamento = 0;
  for (const pedaco of pedacos) {
    todos.set(pedaco, deslocamento);
    deslocamento += pedaco.length;
  }

  const amostras = Math.floor(totalBytes / 2);
  const view = new DataView(todos.buffer, todos.byteOffset, totalBytes);
  const audio = new Float32Array(amostras);
  for (let i = 0; i < amostras; i++) {
    audio[i] = view.getInt16(i * 2, true) / 32768;
  }
  return audio;
}
