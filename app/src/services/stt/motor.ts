import type { RecursoCapacidade } from '../capacidade_aparelho';

/**
 * Núcleo do motor de reconhecimento de fala offline (D-45). O contexto do
 * `whisper.rn` entra por injeção (`services/stt/index.ts` liga o real) —
 * assim a lógica (carregar uma vez, motivo legível quando falha, idioma,
 * áudio vazio) é testável sem o módulo nativo.
 */

export interface ContextoWhisper {
  transcribeData: (
    dados: ArrayBuffer,
    opcoes: {
      language: string;
      temperature?: number;
      temperatureInc?: number;
      prompt?: string;
    },
  ) => { promise: Promise<{ result: string }> };
  release: () => Promise<void>;
}

export interface DepsMotor {
  /** Carrega o modelo e devolve o contexto. Lança `ModeloNaoBaixadoError` se o modelo ainda não está no aparelho. */
  iniciarContexto: () => Promise<ContextoWhisper>;
}

/**
 * D-56: o modelo não vem mais embutido no app — é baixado pro aparelho no
 * primeiro uso (`services/stt/download`). `stt/index.ts` só chama
 * `iniciarContexto` depois de confirmar que o arquivo já está no aparelho;
 * esta classe cobre a sobra (arquivo apagado entre a checagem e o uso, por
 * exemplo) com um motivo que ainda faz sentido pra criança/adulto.
 */
export class ModeloNaoBaixadoError extends Error {
  constructor() {
    super('O reconhecimento de voz ainda não foi baixado neste aparelho.');
    this.name = 'ModeloNaoBaixadoError';
  }
}

const MOTIVO_FALHA = 'Não foi possível iniciar o reconhecimento de voz neste aparelho.';

/**
 * O Whisper não devolve "nada" quando não há fala: no silêncio ou num ruído ele
 * *descreve* o som — "[SOM DE FUTEBOL]", "(música)", "*aplausos*", "♪" — ou
 * inventa uma legenda ("Legendas pela comunidade Amara.org"). Isso não é o que
 * a criança leu: sai do texto, e se não sobra nada o app trata como "não ouvi
 * nada" (que não conta erro, Princípio III) em vez de mostrar um "Eu entendi"
 * absurdo. Só tira marcação entre [], () e ** e frases conhecidas — palavra
 * comum como "Obrigado" fica.
 */
const MARCACAO_DE_RUIDO = /\[[^\]]*\]|\([^)]*\)|\*[^*]*\*|[♪♫]/g;
const FRASES_INVENTADAS = [/legendas?\s+pela\s+comunidade\s+amara\.org/gi, /amara\.org/gi];

export function limparTranscricao(texto: string): string {
  let limpo = texto.replace(MARCACAO_DE_RUIDO, ' ');
  for (const frase of FRASES_INVENTADAS) limpo = limpo.replace(frase, ' ');
  return limpo.replace(/\s+/g, ' ').trim();
}

/**
 * O `transcribeData` do `whisper.rn` decodifica o **ArrayBuffer como PCM de 16 bits**
 * (`decodePcm16`, cpp/jsi/RNWhisperJSI.cpp) e divide por 32767 — não lê float32, apesar
 * do comentário nos tipos ("base64 encoded float32 PCM data or ArrayBuffer"). Entregar
 * float32 aqui virava ruído e o Whisper respondia "[Som de futebol]" pra voz clara.
 */
export function paraPcm16(audio: Float32Array): Int16Array {
  const saida = new Int16Array(audio.length);
  for (let i = 0; i < audio.length; i++) {
    const v = Math.max(-1, Math.min(1, audio[i]));
    saida[i] = Math.round(v * 32767);
  }
  return saida;
}

export interface MotorStt {
  verificar: () => Promise<RecursoCapacidade>;
  /** Texto reconhecido (sem espaço sobrando); `''` se não há áudio. */
  transcrever: (audio: Float32Array, opcoes?: OpcoesTranscricao) => Promise<string>;
  /** O que o Whisper respondeu na última transcrição, antes da limpeza — só pra diagnóstico. */
  ultimoTextoBruto: () => string | null;
  /**
   * Limpa o cache de carregamento — chamar logo depois que um download termina (D-56): sem isso,
   * uma `verificar()` chamada antes do download ficaria presa pra sempre no motivo antigo
   * ("ainda não foi baixado"), mesmo com o arquivo já no aparelho.
   */
  reiniciar: () => void;
}

export interface OpcoesTranscricao {
  /** Vocabulário do nível×tema da rodada, já formatado (`stt/prompt.ts`) — nunca a resposta sozinha. */
  prompt?: string;
}

export function criarMotorStt({ iniciarContexto }: DepsMotor): MotorStt {
  let ultimoBruto: string | null = null;
  let carregamento: Promise<{ contexto: ContextoWhisper } | { motivo: string }> | null = null;

  function carregar() {
    if (!carregamento) {
      carregamento = iniciarContexto().then(
        (contexto) => ({ contexto }),
        (erro: unknown) => ({
          motivo: erro instanceof ModeloNaoBaixadoError ? erro.message : MOTIVO_FALHA,
        }),
      );
    }
    return carregamento;
  }

  return {
    async verificar() {
      const carregado = await carregar();
      return 'contexto' in carregado
        ? { disponivel: true, motivo: null }
        : { disponivel: false, motivo: carregado.motivo };
    },

    ultimoTextoBruto: () => ultimoBruto,

    reiniciar() {
      carregamento = null;
    },

    async transcrever(audio, opcoesTranscricao) {
      const carregado = await carregar();
      if (!('contexto' in carregado)) {
        throw new Error(carregado.motivo);
      }
      if (audio.length === 0) return '';

      const dados = paraPcm16(audio).buffer as ArrayBuffer;
      const { promise } = carregado.contexto.transcribeData(dados, {
        language: 'pt',
        ...(opcoesTranscricao?.prompt ? { prompt: opcoesTranscricao.prompt } : {}),
        // Sem "temperature fallback": quando a decodificação parece ruim (silêncio, ruído) o Whisper
        // refaz várias vezes com mais aleatoriedade — é o que deixa lento e é quando ele inventa texto.
        temperature: 0,
        temperatureInc: 0,
      });
      const { result } = await promise;
      ultimoBruto = result.trim();
      return limparTranscricao(result);
    },
  };
}
