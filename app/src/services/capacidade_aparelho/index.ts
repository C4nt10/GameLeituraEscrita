import * as Speech from 'expo-speech';
import { getRecordingPermissionsAsync } from 'expo-audio';
import { verificarMotorDeVoz } from '../stt';

/**
 * capacidade_aparelho — detecta se microfone e voz em português estão
 * disponíveis, com motivo legível quando não estão. Reutilizada por
 * qualquer tela que precise desabilitar uma opção em vez de escondê-la ou
 * falhar com erro genérico (Princípio I/III da constituição, FR-013).
 *
 * Só CHECA o estado atual (`getRecordingPermissionsAsync`, não
 * `requestRecordingPermissionsAsync`) — pedir a permissão de verdade é
 * responsabilidade da tela de Leitura·voz, no momento em que a criança
 * de fato tenta usar o microfone, não aqui.
 */

export interface RecursoCapacidade {
  disponivel: boolean;
  motivo: string | null;
}

export interface CapacidadesAparelho {
  microfone: RecursoCapacidade;
  vozPortugues: RecursoCapacidade;
  /** Motor de STT integrado no app e com modelo carregado (D-44) — não é do aparelho, é do app. */
  reconhecimentoDeVoz: RecursoCapacidade;
}

export async function verificarCapacidades(): Promise<CapacidadesAparelho> {
  const [microfone, vozPortugues, reconhecimentoDeVoz] = await Promise.all([
    verificarMicrofone(),
    verificarVozPortugues(),
    verificarMotorDeVoz(),
  ]);

  return { microfone, vozPortugues, reconhecimentoDeVoz };
}

/**
 * Leitura · voz só é jogável com microfone E motor de reconhecimento
 * (D-44, FR-013, FR-025). Sem motor, a permissão de microfone não
 * adianta, então o motivo do motor vem primeiro.
 */
export function leituraVozDisponivel(capacidades: CapacidadesAparelho): RecursoCapacidade {
  if (!capacidades.reconhecimentoDeVoz.disponivel) return capacidades.reconhecimentoDeVoz;
  if (!capacidades.microfone.disponivel) return capacidades.microfone;
  return { disponivel: true, motivo: null };
}

async function verificarMicrofone(): Promise<RecursoCapacidade> {
  const permissao = await getRecordingPermissionsAsync();

  if (permissao.status !== 'denied') {
    return { disponivel: true, motivo: null };
  }

  if (!permissao.canAskAgain) {
    return {
      disponivel: false,
      motivo: 'Permissão de microfone negada. Ative em Configurações do aparelho.',
    };
  }

  return { disponivel: false, motivo: 'Permissão de microfone não concedida.' };
}

async function verificarVozPortugues(): Promise<RecursoCapacidade> {
  const vozes = await Speech.getAvailableVoicesAsync();
  const temVozPortugues = vozes.some((voz) => voz.language?.toLowerCase().startsWith('pt'));

  if (!temVozPortugues) {
    return { disponivel: false, motivo: 'Nenhuma voz em português instalada neste aparelho.' };
  }

  return { disponivel: true, motivo: null };
}
