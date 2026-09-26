import { pcm16ParaFloat32 } from '../stt/pcm';

/**
 * Núcleo do serviço de gravação (D-45, FR-025). Sem nenhum import nativo, de
 * propósito: o gravador de microfone e o pedido de permissão entram por
 * injeção (`services/gravacao/index.ts` liga os reais), e assim as regras
 * abaixo são testáveis em Jest.
 *
 * Regras:
 * - a permissão de microfone é pedida **aqui, na hora do uso** (não na
 *   abertura do app);
 * - permissão negada → não grava, e o erro carrega um motivo legível
 *   (Princípio III — nunca "erro genérico");
 * - toque inicia, toque para — **nenhum timeout, nenhum corte por
 *   silêncio** (D-37: a criança controla quando termina);
 * - cada gravação começa do zero.
 */

export interface GravadorPcm {
  /** Começa a capturar; chama `aoReceberDados` com cada chunk PCM 16 bits em base64. */
  iniciar: (aoReceberDados: (chunkBase64: string) => void) => void | Promise<void>;
  parar: () => Promise<void>;
}

export interface ResultadoPermissao {
  concedida: boolean;
  podePedirDeNovo: boolean;
}

export interface DepsGravacao {
  pedirPermissao: () => Promise<ResultadoPermissao>;
  gravador: GravadorPcm;
}

export class PermissaoMicrofoneNegadaError extends Error {
  constructor(podePedirDeNovo: boolean) {
    super(
      podePedirDeNovo
        ? 'Permissão de microfone não concedida.'
        : 'Permissão de microfone negada. Ative em Configurações do aparelho.',
    );
    this.name = 'PermissaoMicrofoneNegadaError';
  }
}

export interface ServicoGravacao {
  iniciar: () => Promise<void>;
  /** Encerra e devolve o áudio (float32, mono) do que foi gravado desde `iniciar`. */
  parar: () => Promise<Float32Array>;
  gravando: () => boolean;
}

export function criarServicoGravacao({ pedirPermissao, gravador }: DepsGravacao): ServicoGravacao {
  let chunks: string[] = [];
  let ativo = false;

  return {
    async iniciar() {
      const permissao = await pedirPermissao();
      if (!permissao.concedida) {
        throw new PermissaoMicrofoneNegadaError(permissao.podePedirDeNovo);
      }
      chunks = [];
      await gravador.iniciar((chunk) => {
        chunks.push(chunk);
      });
      ativo = true;
    },

    async parar() {
      if (!ativo) {
        throw new Error('Não há gravação em andamento pra parar.');
      }
      ativo = false;
      await gravador.parar();
      return pcm16ParaFloat32(chunks);
    },

    gravando: () => ativo,
  };
}
