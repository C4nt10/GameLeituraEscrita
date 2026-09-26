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
export const gravacao = criarServicoGravacao({
  pedirPermissao: async () => {
    const permissao = await requestRecordingPermissionsAsync();
    return { concedida: permissao.granted, podePedirDeNovo: permissao.canAskAgain };
  },
  gravador: {
    iniciar: (aoReceberDados) => {
      AudioRecord.init({
        sampleRate: 16000,
        channels: 1,
        bitsPerSample: 16,
        audioSource: 6,
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
