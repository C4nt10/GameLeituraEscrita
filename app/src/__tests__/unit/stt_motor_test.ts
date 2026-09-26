import { criarMotorStt, ModeloAusenteError, type ContextoWhisper } from '../../services/stt/motor';

function contextoFalso(resultado = ' gato '): ContextoWhisper & { chamadas: unknown[][] } {
  const chamadas: unknown[][] = [];
  return {
    chamadas,
    transcribeData: (dados, opcoes) => {
      chamadas.push([dados, opcoes]);
      return { promise: Promise.resolve({ result: resultado }) };
    },
    release: async () => {},
  };
}

describe('stt motor — modelo carregado de verdade, offline (D-44, D-45, FR-025)', () => {
  it('modelo carrega: disponível, sem motivo', async () => {
    const motor = criarMotorStt({ iniciarContexto: async () => contextoFalso() });
    expect(await motor.verificar()).toEqual({ disponivel: true, motivo: null });
  });

  it('modelo ausente do app: indisponível, com motivo específico e legível', async () => {
    const motor = criarMotorStt({
      iniciarContexto: async () => {
        throw new ModeloAusenteError();
      },
    });
    const r = await motor.verificar();
    expect(r.disponivel).toBe(false);
    expect(r.motivo).toBe('O modelo de reconhecimento de voz não está incluído neste app.');
  });

  it('falha ao carregar (motor não roda neste aparelho): indisponível, sem estourar erro', async () => {
    const motor = criarMotorStt({
      iniciarContexto: async () => {
        throw new Error('JSI não instalado');
      },
    });
    const r = await motor.verificar();
    expect(r.disponivel).toBe(false);
    expect(r.motivo).toBe('Não foi possível iniciar o reconhecimento de voz neste aparelho.');
  });

  it('carrega o modelo uma vez só, mesmo com várias verificações e transcrições', async () => {
    const iniciarContexto = jest.fn(async () => contextoFalso());
    const motor = criarMotorStt({ iniciarContexto });

    await motor.verificar();
    await motor.verificar();
    await motor.transcrever(new Float32Array([0.1, 0.2]));

    expect(iniciarContexto).toHaveBeenCalledTimes(1);
  });

  it('transcreve em português, passando o áudio como ArrayBuffer, e devolve o texto sem espaço sobrando', async () => {
    const contexto = contextoFalso(' gato ');
    const motor = criarMotorStt({ iniciarContexto: async () => contexto });

    const texto = await motor.transcrever(new Float32Array([0.25, -0.25]));

    expect(texto).toBe('gato');
    const [dados, opcoes] = contexto.chamadas[0] as [ArrayBuffer, { language: string }];
    // `instanceof` falha entre contextos do Jest (ArrayBuffer de outro realm) — checa o tipo pela tag.
    expect(Object.prototype.toString.call(dados)).toBe('[object ArrayBuffer]');
    expect(Array.from(new Float32Array(dados))).toEqual([0.25, -0.25]);
    expect(opcoes.language).toBe('pt');
  });

  it('áudio vazio (a criança não falou nada): devolve texto vazio sem chamar o motor', async () => {
    const contexto = contextoFalso();
    const motor = criarMotorStt({ iniciarContexto: async () => contexto });

    expect(await motor.transcrever(new Float32Array(0))).toBe('');
    expect(contexto.chamadas).toHaveLength(0);
  });

  it('transcrever com o motor indisponível falha com o motivo legível, não com erro interno', async () => {
    const motor = criarMotorStt({
      iniciarContexto: async () => {
        throw new ModeloAusenteError();
      },
    });
    await expect(motor.transcrever(new Float32Array([0.1]))).rejects.toThrow(
      'O modelo de reconhecimento de voz não está incluído neste app.',
    );
  });
});
