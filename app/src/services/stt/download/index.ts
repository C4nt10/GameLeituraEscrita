import { Directory, File, Paths } from 'expo-file-system';
import { criarBaixadorDeModelo, type SistemaDeArquivosDoModelo } from './nucleo';
import type { DefinicaoDeModelo } from '../modelos_remotos';

/**
 * Liga o núcleo do download (`nucleo.ts`, testado) ao `expo-file-system`
 * de verdade (D-56). Fica em `Paths.document` — persistente, diferente de
 * `Paths.cache` (que o sistema pode apagar sozinho quando falta espaço; um
 * modelo de 190-540 MB sumir sozinho seria pior que nunca ter sido baixado).
 */
const pastaDeModelos = new Directory(Paths.document, 'modelos');

const fs: SistemaDeArquivosDoModelo = {
  async tamanhoDoArquivo(caminho) {
    const arquivo = new File(caminho);
    return arquivo.exists ? arquivo.size : null;
  },

  async baixarParaArquivo(url, destino, aoProgresso) {
    if (!pastaDeModelos.exists) pastaDeModelos.create({ intermediates: true });
    const tarefa = File.createDownloadTask(url, new File(destino), {
      onProgress: ({ bytesWritten, totalBytes }) => aoProgresso(bytesWritten, totalBytes),
    });
    await tarefa.downloadAsync();
  },

  async mover(origem, destino) {
    await new File(origem).move(new File(destino));
  },

  async apagar(caminho) {
    const arquivo = new File(caminho);
    if (arquivo.exists) arquivo.delete();
  },
};

const baixador = criarBaixadorDeModelo(fs);

export function pastaDosModelos(): string {
  return pastaDeModelos.uri;
}

/** Caminho do modelo já baixado e íntegro, ou `null` se ainda não está no aparelho — sem baixar nada. */
export async function caminhoDoModeloSeBaixado(modelo: DefinicaoDeModelo): Promise<string | null> {
  const caminho = `${pastaDosModelos()}/${modelo.arquivo}`;
  const tamanho = await fs.tamanhoDoArquivo(caminho);
  return tamanho === modelo.bytes ? caminho : null;
}

/**
 * Baixa o modelo de verdade (D-56) — só deve ser chamado por um toque
 * explícito da criança/adulto, nunca sozinho (ver `stt/index.ts`).
 */
export async function baixarModelo(
  modelo: DefinicaoDeModelo,
  aoProgresso?: (fracao: number) => void,
): Promise<void> {
  await baixador.garantirModelo(modelo, pastaDosModelos(), aoProgresso);
}
