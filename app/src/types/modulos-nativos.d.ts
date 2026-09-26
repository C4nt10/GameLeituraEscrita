/**
 * Tipos dos módulos nativos de voz. O `index.d.ts` do pacote de PCM declara um
 * módulo ambiente com outro nome ("react-native-live-audio-stream"), então o
 * import por `@fugood/react-native-audio-pcm-stream` não tem tipo — declarado
 * aqui do jeito que o `index.js` do pacote realmente exporta.
 */
declare module '@fugood/react-native-audio-pcm-stream' {
  interface OpcoesGravador {
    sampleRate: number;
    channels: number;
    bitsPerSample: number;
    audioSource?: number;
    bufferSize?: number;
  }
  const AudioRecord: {
    init: (opcoes: OpcoesGravador) => void;
    start: () => void;
    stop: () => Promise<string>;
    on: (evento: 'data', callback: (base64: string) => void) => unknown;
  };
  export default AudioRecord;
}

/** Modelo ggml do whisper — asset empacotado pelo Metro (ver `metro.config.js`). */
declare module '*.bin' {
  const asset: number;
  export default asset;
}
