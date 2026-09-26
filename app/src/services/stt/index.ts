import type { RecursoCapacidade } from '../capacidade_aparelho';

/**
 * stt — reconhecimento de fala offline pra Leitura · voz (D-45).
 *
 * **Ainda não existe motor integrado.** Até `whisper.rn` estar no app e o
 * modelo carregar de verdade (T087 spike → T090), este serviço diz a
 * verdade: indisponível, com motivo. É isso que mantém "Leitura · voz"
 * desabilitada na configuração em vez de parecer funcionar com um
 * microfone que não capta nada (D-44, achado do teste em aparelho real).
 */
export async function verificarMotorDeVoz(): Promise<RecursoCapacidade> {
  return {
    disponivel: false,
    motivo: 'O reconhecimento de voz ainda não está instalado neste app.',
  };
}
