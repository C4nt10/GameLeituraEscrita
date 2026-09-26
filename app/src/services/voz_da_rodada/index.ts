import type { ServicoGravacao } from '../gravacao/nucleo';

/**
 * Cola gravação + reconhecimento de fala na interface que `TelaLeituraVoz`
 * já usa (`iniciarGravacao` / `pararGravacao` → uri / `transcrever(uri)`),
 * sem mexer na tela nem no orquestrador (D-45).
 *
 * Privacidade: o áudio da criança fica **só em memória**, atrás de uma
 * referência opaca, e é descartado assim que é transcrito — nunca vai pra
 * disco nem pra rede (Princípio V; README "áudio de criança").
 */

export interface DepsVoz {
  gravacao: ServicoGravacao;
  transcreverAudio: (audio: Float32Array) => Promise<string>;
}

export interface DependenciasDeVoz {
  iniciarGravacao: () => Promise<void>;
  pararGravacao: () => Promise<string>;
  transcrever: (referencia: string) => Promise<string>;
}

export function criarDependenciasDeVoz({ gravacao, transcreverAudio }: DepsVoz): DependenciasDeVoz {
  const audios = new Map<string, Float32Array>();
  let proximoId = 0;

  return {
    iniciarGravacao: () => gravacao.iniciar(),

    async pararGravacao() {
      const audio = await gravacao.parar();
      const referencia = `audio-em-memoria-${proximoId++}`;
      audios.set(referencia, audio);
      return referencia;
    },

    async transcrever(referencia) {
      const audio = audios.get(referencia);
      if (!audio) return '';
      audios.delete(referencia);
      return transcreverAudio(audio);
    },
  };
}
