import { MODELOS, type DefinicaoDeModelo } from '../modelos_remotos';

/**
 * Núcleo do download do modelo de voz (D-56, T125). Sem nenhum import
 * nativo, de propósito: `expo-file-system` entra por injeção
 * (`services/stt/download/index.ts` liga o real), e assim a lógica abaixo é
 * testável em Jest.
 *
 * Regras:
 * - arquivo já existe com o tamanho exato esperado → não baixa de novo
 *   (mesma checagem de integridade do antigo `scripts/baixar-modelo.mjs`);
 * - baixa pra um `.parcial` e só move pro nome final se o tamanho bater —
 *   nunca deixa um arquivo com nome "pronto" que na verdade está cortado;
 * - tamanho final errado → apaga o parcial e lança erro com motivo, nunca
 *   finge sucesso;
 * - antes de baixar, apaga o arquivo de qualquer OUTRO modelo conhecido —
 *   um aparelho de teste que trocou de build (`small`→`medium`) não fica
 *   acumulando centenas de MB de um modelo que o app não usa mais.
 */
export interface SistemaDeArquivosDoModelo {
  /** `null` se o arquivo não existe. */
  tamanhoDoArquivo: (caminho: string) => Promise<number | null>;
  baixarParaArquivo: (
    url: string,
    destino: string,
    aoProgresso: (bytesBaixados: number, bytesTotais: number) => void,
  ) => Promise<void>;
  mover: (origem: string, destino: string) => Promise<void>;
  apagar: (caminho: string) => Promise<void>;
}

export class DownloadIncompletoError extends Error {
  constructor(
    readonly tamanhoRecebido: number | null,
    readonly tamanhoEsperado: number,
  ) {
    super('O download do modelo de voz não terminou direito. Toque para tentar de novo.');
    this.name = 'DownloadIncompletoError';
  }
}

export interface BaixadorDeModelo {
  /** Garante o modelo em `pasta`, baixando se precisar; devolve o caminho do arquivo pronto. */
  garantirModelo: (
    modelo: DefinicaoDeModelo,
    pasta: string,
    aoProgresso?: (fracao: number) => void,
  ) => Promise<string>;
}

export function criarBaixadorDeModelo(fs: SistemaDeArquivosDoModelo): BaixadorDeModelo {
  return {
    async garantirModelo(modelo, pasta, aoProgresso) {
      const destino = `${pasta}/${modelo.arquivo}`;

      const tamanhoExistente = await fs.tamanhoDoArquivo(destino);
      if (tamanhoExistente === modelo.bytes) return destino;

      // Nenhum outro modelo conhecido pode sobrar no aparelho além do que este build usa.
      for (const outro of Object.values(MODELOS)) {
        if (outro.arquivo === modelo.arquivo) continue;
        await fs.apagar(`${pasta}/${outro.arquivo}`).catch(() => {});
      }

      const parcial = `${destino}.parcial`;
      await fs.apagar(parcial).catch(() => {});
      await fs.apagar(destino).catch(() => {}); // residual incompleto do mesmo modelo

      await fs.baixarParaArquivo(modelo.url, parcial, (bytesBaixados, bytesTotais) => {
        const total = bytesTotais > 0 ? bytesTotais : modelo.bytes;
        aoProgresso?.(total > 0 ? bytesBaixados / total : 0);
      });

      const tamanhoFinal = await fs.tamanhoDoArquivo(parcial);
      if (tamanhoFinal !== modelo.bytes) {
        await fs.apagar(parcial).catch(() => {});
        throw new DownloadIncompletoError(tamanhoFinal, modelo.bytes);
      }

      await fs.mover(parcial, destino);
      return destino;
    },
  };
}
