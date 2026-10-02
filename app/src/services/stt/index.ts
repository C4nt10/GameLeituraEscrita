import type { RecursoCapacidade } from '../capacidade_aparelho';
import { caminhoDoModeloSeBaixado, baixarModelo } from './download';
import { criarMotorStt, ModeloNaoBaixadoError, type ContextoWhisper } from './motor';
import { modeloConfigurado, type NomeDoModelo } from './modelos_remotos';

/**
 * stt — reconhecimento de fala offline pra Leitura · voz (D-45), ligando o
 * núcleo testável (`motor.ts`) ao `whisper.rn` real. O modelo não vem mais
 * embutido no app (D-56) — é baixado pro aparelho sob um toque explícito
 * (`baixarModeloDeVoz`, nunca sozinho); `verificarMotorDeVoz` só CHECA se já
 * está no aparelho, nunca baixa por conta própria.
 *
 * Qual modelo este build baixa é decisão de build
 * (`EXPO_PUBLIC_MODELO_DE_VOZ`, `eas.json`), lida aqui em runtime.
 */
const MODELO = modeloConfigurado(process.env.EXPO_PUBLIC_MODELO_DE_VOZ);

const motor = criarMotorStt({
  iniciarContexto: async (): Promise<ContextoWhisper> => {
    const caminho = await caminhoDoModeloSeBaixado(MODELO);
    if (caminho === null) throw new ModeloNaoBaixadoError();
    // require tardio: o módulo nativo só é tocado depois de confirmar que o modelo existe
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { initWhisper } = require('whisper.rn/index') as typeof import('whisper.rn/index');
    return initWhisper({ filePath: caminho });
  },
});

/** Nome do modelo que este build baixa (`small`/`medium`) — só pra diagnóstico em tela (A-17). */
export function nomeDoModeloAtivo(): NomeDoModelo {
  return MODELO.nome;
}

export async function verificarMotorDeVoz(): Promise<RecursoCapacidade> {
  const caminho = await caminhoDoModeloSeBaixado(MODELO);
  if (caminho === null) {
    const mb = Math.round(MODELO.bytes / 1_000_000);
    return {
      disponivel: false,
      motivo: `O reconhecimento de voz ainda não foi baixado neste aparelho (${mb} MB). Toque para baixar.`,
      acaoDeBaixar: { bytes: MODELO.bytes },
    };
  }
  return motor.verificar();
}

/**
 * Baixa o modelo de voz de verdade (D-56) — só a tela de Leitura · voz
 * chama isso, e só em resposta a um toque explícito da criança/adulto.
 * Depois de baixar, reinicia o motor: sem isso, uma `verificar()` chamada
 * antes do download ficaria presa pra sempre no motivo antigo.
 */
export async function baixarModeloDeVoz(aoProgresso?: (fracao: number) => void): Promise<void> {
  await baixarModelo(MODELO, aoProgresso);
  motor.reiniciar();
}

export function ultimoTextoBrutoDoMotor(): string | null {
  return motor.ultimoTextoBruto();
}

export function transcreverAudio(
  audio: Float32Array,
  opcoes?: Parameters<typeof motor.transcrever>[1],
): Promise<string> {
  return motor.transcrever(audio, opcoes);
}
