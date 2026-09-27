import AudioRecord from '@fugood/react-native-audio-pcm-stream';
import { requestRecordingPermissionsAsync } from 'expo-audio';
import { criarServicoGravacao } from './nucleo';

/**
 * Gravação real de microfone (D-45): permissão pelo `expo-audio` (que já
 * está no app), captura PCM em tempo real pela lib nativa — 16 kHz, mono,
 * 16 bits, que é o que o motor de fala consome depois da conversão pra
 * float32 (`services/stt/pcm`). Fonte de áudio 6 = VOICE_RECOGNITION.
 * A lib não grava arquivo: só entrega chunks em memória.
 */
/**
 * Fonte de áudio do Android: 6 = VOICE_RECOGNITION (padrão do `whisper.rn`), 1 = MIC comum. Alguns
 * aparelhos entregam silêncio numa das duas; quando uma tentativa vem sem sinal, a próxima usa a outra.
 */
let audioSource = 6;
export const fonteDoAudio = () => audioSource;
export function alternarFonteDoAudio() {
  audioSource = audioSource === 6 ? 1 : 6;
}

export const gravacao = criarServicoGravacao({
  pedirPermissao: async () => {
    const permissao = await requestRecordingPermissionsAsync();
    return { concedida: permissao.granted, podePedirDeNovo: permissao.canAskAgain };
  },
  gravador: {
    iniciar: async (aoReceberDados) => {
      // `init` devolve uma Promise que rejeita se o microfone não abre (ocupado, sem permissão de
      // fato…). Antes ela era ignorada: `start()` virava um no-op e a criança gravava o vazio.
      await AudioRecord.init({
        sampleRate: 16000,
        channels: 1,
        bitsPerSample: 16,
        audioSource,
        // O mínimo que o aparelho aceitar: a lib descarta os 2 primeiros buffers ("clique"), e com
        // 4096 bytes isso comia ~256 ms do começo da fala.
        bufferSize: 1024,
      });
      AudioRecord.on('data', aoReceberDados);
      AudioRecord.start();
    },
    parar: async () => {
      // A criança toca em parar logo depois de falar: espera um pouco pra não perder o final da
      // palavra (ainda no buffer do microfone) e depois deixa o último pedaço chegar ao JS.
      await new Promise((r) => setTimeout(r, 400));
      await AudioRecord.stop();
      await new Promise((r) => setTimeout(r, 200));
    },
  },
});
