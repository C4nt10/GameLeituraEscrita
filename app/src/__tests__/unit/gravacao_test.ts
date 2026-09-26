import {
  criarServicoGravacao,
  PermissaoMicrofoneNegadaError,
  type GravadorPcm,
} from '../../services/gravacao/nucleo';

function chunk(amostras: number[]): string {
  const bytes = new Uint8Array(amostras.length * 2);
  const view = new DataView(bytes.buffer);
  amostras.forEach((a, i) => view.setInt16(i * 2, a, true));
  return Buffer.from(bytes).toString('base64');
}

function criarGravadorFalso() {
  let callback: ((base64: string) => void) | null = null;
  const gravador: GravadorPcm & { emitir: (b64: string) => void; iniciou: number; parou: number } =
    {
      iniciou: 0,
      parou: 0,
      iniciar: async (aoReceber) => {
        gravador.iniciou++;
        callback = aoReceber;
      },
      parar: async () => {
        gravador.parou++;
      },
      emitir: (b64) => callback?.(b64),
    };
  return gravador;
}

const CONCEDIDA = async () => ({ concedida: true, podePedirDeNovo: true });

describe('gravacao — permissão pedida na hora do uso, toque-inicia/toque-para (D-45, D-37, FR-025)', () => {
  it('pede a permissão de microfone ao iniciar e só então começa a gravar', async () => {
    const gravador = criarGravadorFalso();
    const pedirPermissao = jest.fn(CONCEDIDA);
    const servico = criarServicoGravacao({ pedirPermissao, gravador });

    await servico.iniciar();

    expect(pedirPermissao).toHaveBeenCalledTimes(1);
    expect(gravador.iniciou).toBe(1);
    expect(servico.gravando()).toBe(true);
  });

  it('permissão negada: NÃO grava e o erro traz um motivo legível (Princípio III)', async () => {
    const gravador = criarGravadorFalso();
    const servico = criarServicoGravacao({
      pedirPermissao: async () => ({ concedida: false, podePedirDeNovo: true }),
      gravador,
    });

    await expect(servico.iniciar()).rejects.toBeInstanceOf(PermissaoMicrofoneNegadaError);
    await expect(servico.iniciar()).rejects.toThrow('Permissão de microfone não concedida.');
    expect(gravador.iniciou).toBe(0);
    expect(servico.gravando()).toBe(false);
  });

  it('negada de vez (não dá pra pedir de novo): orienta a ir em Configurações', async () => {
    const servico = criarServicoGravacao({
      pedirPermissao: async () => ({ concedida: false, podePedirDeNovo: false }),
      gravador: criarGravadorFalso(),
    });
    await expect(servico.iniciar()).rejects.toThrow('Ative em Configurações do aparelho');
  });

  it('parar devolve o áudio gravado, convertido pra float32, na ordem', async () => {
    const gravador = criarGravadorFalso();
    const servico = criarServicoGravacao({ pedirPermissao: CONCEDIDA, gravador });

    await servico.iniciar();
    gravador.emitir(chunk([16384]));
    gravador.emitir(chunk([-16384, 0]));
    const audio = await servico.parar();

    expect(Array.from(audio)).toEqual([0.5, -0.5, 0]);
    expect(gravador.parou).toBe(1);
    expect(servico.gravando()).toBe(false);
  });

  it('NÃO corta a gravação por tempo: 5 minutos depois continua gravando (D-37)', async () => {
    jest.useFakeTimers();
    try {
      const gravador = criarGravadorFalso();
      const servico = criarServicoGravacao({ pedirPermissao: CONCEDIDA, gravador });

      await servico.iniciar();
      jest.advanceTimersByTime(5 * 60 * 1000);

      expect(gravador.parou).toBe(0);
      expect(servico.gravando()).toBe(true);
    } finally {
      jest.useRealTimers();
    }
  });

  it('parar sem ter iniciado é erro claro, não um áudio vazio silencioso', async () => {
    const servico = criarServicoGravacao({
      pedirPermissao: CONCEDIDA,
      gravador: criarGravadorFalso(),
    });
    await expect(servico.parar()).rejects.toThrow();
  });

  it('cada gravação começa do zero — áudio da anterior não vaza pra próxima', async () => {
    const gravador = criarGravadorFalso();
    const servico = criarServicoGravacao({ pedirPermissao: CONCEDIDA, gravador });

    await servico.iniciar();
    gravador.emitir(chunk([16384]));
    await servico.parar();

    await servico.iniciar();
    gravador.emitir(chunk([-16384]));
    const segundo = await servico.parar();

    expect(Array.from(segundo)).toEqual([-0.5]);
  });
});
