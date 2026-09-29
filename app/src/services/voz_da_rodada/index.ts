import type { ServicoGravacao } from '../gravacao/nucleo';
import {
  acolchoarComSilencio,
  medirAudio,
  normalizarPico,
  PICO_MINIMO,
  SemSinalDeMicrofoneError,
} from '../stt/audio';

/** Silêncio acrescentado em cada ponta antes do Whisper (o microfone corta as pontas). */
const SILENCIO_NAS_PONTAS_S = 0.5;

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
  transcreverAudio: (audio: Float32Array, opcoes?: { prompt?: string }) => Promise<string>;
  /** Chamado quando o microfone não entregou sinal — quem liga pode trocar a fonte de áudio pra próxima tentativa. */
  aoFicarSemSinal?: () => void;
  /** Fonte de áudio em uso (só pro diagnóstico). */
  fonteDoAudio?: () => number;
  /** Modelo de fala que este build carregou (só pro diagnóstico — A-17). */
  nomeDoModelo?: () => string | null;
  /** Resposta bruta do Whisper na última transcrição (só pro diagnóstico). */
  textoBrutoDoMotor?: () => string | null;
}

export interface DependenciasDeVoz {
  iniciarGravacao: () => Promise<void>;
  pararGravacao: () => Promise<string>;
  /** `prompt`: vocabulário do desafio atual (`stt/prompt.ts`) — opcional, melhora o acerto sem custo extra. */
  transcrever: (referencia: string, prompt?: string) => Promise<string>;
  /**
   * Linha técnica da última tentativa ("áudio 2,4 s · volume 12% · reconheceu em 7,1 s") —
   * mostra se o microfone entregou som e quanto o reconhecimento demorou. `null` antes da primeira.
   */
  diagnostico: () => string | null;
}

const segundos = (n: number) => `${n.toFixed(1).replace('.', ',')} s`;

export function criarDependenciasDeVoz({
  gravacao,
  transcreverAudio,
  aoFicarSemSinal,
  fonteDoAudio,
  textoBrutoDoMotor,
  nomeDoModelo,
}: DepsVoz): DependenciasDeVoz {
  const audios = new Map<string, Float32Array>();
  let proximoId = 0;
  let ultimoDiagnostico: string | null = null;

  return {
    iniciarGravacao: () => gravacao.iniciar(),

    async pararGravacao() {
      const audio = await gravacao.parar();
      const referencia = `audio-em-memoria-${proximoId++}`;
      audios.set(referencia, audio);
      return referencia;
    },

    async transcrever(referencia, prompt) {
      const audio = audios.get(referencia);
      if (!audio) return '';
      audios.delete(referencia);

      const medida = medirAudio(audio);
      const fonte = fonteDoAudio ? ` · fonte ${fonteDoAudio()}` : '';
      const modelo = nomeDoModelo?.() ? ` · modelo ${nomeDoModelo()}` : '';
      const base = `áudio ${segundos(medida.segundos)} · volume ${Math.round(medida.pico * 100)}%${fonte}${modelo}`;
      ultimoDiagnostico = base;

      // Sem sinal nenhum: o problema é o microfone. Não gasta segundos do Whisper com silêncio
      // digital (que ainda por cima ele "descreve" com marcações inventadas).
      if (medida.pico < PICO_MINIMO) {
        aoFicarSemSinal?.();
        throw new SemSinalDeMicrofoneError();
      }

      const inicio = Date.now();
      const texto = await transcreverAudio(
        acolchoarComSilencio(normalizarPico(audio), SILENCIO_NAS_PONTAS_S),
        prompt ? { prompt } : {},
      );
      const bruto = textoBrutoDoMotor?.();
      const oQueDisse =
        bruto === undefined || bruto === null
          ? ''
          : ` · whisper: ${bruto === '' ? '(nada)' : `"${bruto}"`}`;
      ultimoDiagnostico = `${base} · reconheceu em ${segundos((Date.now() - inicio) / 1000)}${oQueDisse}`;
      return texto;
    },

    diagnostico: () => ultimoDiagnostico,
  };
}
