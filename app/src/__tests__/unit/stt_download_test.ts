import { criarBaixadorDeModelo, DownloadIncompletoError } from '../../services/stt/download/nucleo';
import { MODELOS } from '../../services/stt/modelos_remotos';

function criarFsFalso(tamanhosIniciais: Record<string, number> = {}) {
  const tamanhos = new Map(Object.entries(tamanhosIniciais));
  const apagados: string[] = [];
  const chamadas: { url: string; destino: string }[] = [];
  let aoBaixarEscreve = (destino: string): void => {
    tamanhos.set(destino, MODELOS.small.bytes);
  };

  const fs = {
    tamanhoDoArquivo: async (caminho: string) => tamanhos.get(caminho) ?? null,
    baixarParaArquivo: async (
      url: string,
      destino: string,
      aoProgresso: (bytesBaixados: number, bytesTotais: number) => void,
    ) => {
      chamadas.push({ url, destino });
      aoProgresso(0, MODELOS.small.bytes);
      aoBaixarEscreve(destino);
      aoProgresso(MODELOS.small.bytes, MODELOS.small.bytes);
    },
    mover: async (origem: string, destino: string) => {
      const t = tamanhos.get(origem);
      tamanhos.delete(origem);
      if (t !== undefined) tamanhos.set(destino, t);
    },
    apagar: async (caminho: string) => {
      apagados.push(caminho);
      tamanhos.delete(caminho);
    },
  };
  return {
    fs,
    tamanhos,
    apagados,
    chamadas,
    setEscrita: (f: (d: string) => void) => (aoBaixarEscreve = f),
  };
}

describe('download/nucleo — baixa o modelo pro aparelho (D-56), injetado com fs falso', () => {
  it('se o arquivo já existe com o tamanho certo, não baixa de novo', async () => {
    const { fs, chamadas } = criarFsFalso({ '/pasta/ggml-small-q5_1.bin': MODELOS.small.bytes });
    const baixador = criarBaixadorDeModelo(fs);

    const caminho = await baixador.garantirModelo(MODELOS.small, '/pasta');

    expect(caminho).toBe('/pasta/ggml-small-q5_1.bin');
    expect(chamadas).toHaveLength(0);
  });

  it('baixa quando não existe, reportando progresso de 0 a 1', async () => {
    const { fs } = criarFsFalso();
    const baixador = criarBaixadorDeModelo(fs);
    const progresso: number[] = [];

    const caminho = await baixador.garantirModelo(MODELOS.small, '/pasta', (f) =>
      progresso.push(f),
    );

    expect(caminho).toBe('/pasta/ggml-small-q5_1.bin');
    expect(progresso[0]).toBe(0);
    expect(progresso[progresso.length - 1]).toBe(1);
  });

  it('tamanho final diferente do esperado: apaga o parcial e lança erro com motivo', async () => {
    const { fs, tamanhos } = criarFsFalso();
    fs.baixarParaArquivo = async (_url, destino, aoProgresso) => {
      aoProgresso(0, MODELOS.small.bytes);
      tamanhos.set(destino, 123); // download cortado no meio
    };
    const baixador = criarBaixadorDeModelo(fs);

    await expect(baixador.garantirModelo(MODELOS.small, '/pasta')).rejects.toBeInstanceOf(
      DownloadIncompletoError,
    );
    expect(tamanhos.has('/pasta/ggml-small-q5_1.bin.parcial')).toBe(false);
    expect(tamanhos.has('/pasta/ggml-small-q5_1.bin')).toBe(false);
  });

  it('limpa o arquivo de um modelo diferente do configurado (tester trocou de build)', async () => {
    const { fs, apagados } = criarFsFalso({
      '/pasta/ggml-medium-q5_0.bin': MODELOS.medium.bytes,
    });
    const baixador = criarBaixadorDeModelo(fs);

    await baixador.garantirModelo(MODELOS.small, '/pasta');

    expect(apagados).toContain('/pasta/ggml-medium-q5_0.bin');
  });

  it('erro de rede no meio do download: propaga, sem fingir sucesso', async () => {
    const { fs } = criarFsFalso();
    fs.baixarParaArquivo = async () => {
      throw new Error('network request failed');
    };
    const baixador = criarBaixadorDeModelo(fs);

    await expect(baixador.garantirModelo(MODELOS.small, '/pasta')).rejects.toThrow(
      'network request failed',
    );
  });
});
