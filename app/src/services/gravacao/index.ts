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
        bufferSize: 4096,
      });
      AudioRecord.on('data', aoReceberDados);
      AudioRecord.start();
    },
    parar: async () => {
      await AudioRecord.stop();
    },
  },
});
