import type { RecursoCapacidade } from '../capacidade_aparelho';
import { criarMotorStt, ModeloAusenteError, type ContextoWhisper } from './motor';
import { obterModeloEmpacotado } from './modelo';

/**
 * stt — reconhecimento de fala offline pra Leitura · voz (D-45), ligando o
 * núcleo testável (`motor.ts`) ao `whisper.rn` real. **Ainda não medido em
 * aparelho** (T087/T092): compatibilidade, latência e acerto do modelo
 * `small` quantizado só se sabem rodando num Android real.
 *
 * Se qualquer coisa falhar (modelo ausente, módulo nativo que não sobe), o
 * motor reporta indisponível COM motivo — Leitura · voz fica desabilitada
 * na configuração (D-44) em vez de parecer funcionar.
 */
const motor = criarMotorStt({
  iniciarContexto: async (): Promise<ContextoWhisper> => {
    const modelo = obterModeloEmpacotado();
    if (modelo === null) throw new ModeloAusenteError();
    // require tardio: o módulo nativo só é tocado se o modelo existe
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { initWhisper } = require('whisper.rn/index') as typeof import('whisper.rn/index');
    return initWhisper({ filePath: modelo });
  },
});

export function verificarMotorDeVoz(): Promise<RecursoCapacidade> {
  return motor.verificar();
}

export function transcreverAudio(audio: Float32Array): Promise<string> {
  return motor.transcrever(audio);
}
