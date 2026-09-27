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
    // O `whisper.rn` decodifica o ArrayBuffer como PCM de 16 bits (`decodePcm16` no código nativo),
    // NÃO como float32 — entregar float32 vira ruído e o Whisper "ouve" [Som de futebol].
    expect(Array.from(new Int16Array(dados))).toEqual([8192, -8192]);
    expect(dados.byteLength).toBe(4); // 2 amostras × 2 bytes
    expect(opcoes.language).toBe('pt');
    // sem novas tentativas de decodificação: em ruído elas atrasam muito e alucinam mais
    expect(opcoes).toMatchObject({ temperature: 0, temperatureInc: 0 });
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

describe('stt motor — o Whisper "descreve" silêncio e ruído; isso não é fala (Princípio III)', () => {
  async function transcreverComo(resultado: string) {
    const motor = criarMotorStt({ iniciarContexto: async () => contextoFalso(resultado) });
    return motor.transcrever(new Float32Array([0.01, -0.01]));
  }

  it.each([
    '[SOM DE FUTEBOL]',
    ' [MÚSICA] ',
    '(silêncio)',
    '(música de fundo)',
    '*aplausos*',
    '[BLANK_AUDIO]',
    '♪',
    '[SOM DE FUTEBOL] [RISOS]',
  ])(
    'marcação de ruído "%s" vira texto vazio (o app trata como "não ouvi nada")',
    async (bruto) => {
      expect(await transcreverComo(bruto)).toBe('');
    },
  );

  it('frases que o Whisper inventa em áudio mudo também viram vazio', async () => {
    expect(await transcreverComo('Legendas pela comunidade Amara.org')).toBe('');
  });

  it('fala de verdade junto com uma marcação: fica só a fala', async () => {
    expect(await transcreverComo('[MÚSICA] gato')).toBe('gato');
    expect(await transcreverComo('gato (risos)')).toBe('gato');
  });

  it('palavra comum não é apagada por engano', async () => {
    expect(await transcreverComo('Obrigado')).toBe('Obrigado');
    expect(await transcreverComo('ANDAR')).toBe('ANDAR');
  });
});

describe('stt motor — guarda o texto bruto do Whisper, antes da limpeza (pra diagnóstico)', () => {
  it('antes de qualquer transcrição não há texto bruto', async () => {
    const motor = criarMotorStt({ iniciarContexto: async () => contextoFalso() });
    expect(motor.ultimoTextoBruto()).toBeNull();
  });

  it('depois de transcrever, o bruto tem a marcação que a limpeza tirou', async () => {
    const motor = criarMotorStt({ iniciarContexto: async () => contextoFalso(' [MÚSICA] ') });

    const limpo = await motor.transcrever(new Float32Array([0.1, -0.1]));

    expect(limpo).toBe('');
    expect(motor.ultimoTextoBruto()).toBe('[MÚSICA]');
  });
});

describe('stt motor — conversão pro formato que o whisper.rn realmente lê (PCM 16 bits)', () => {
  async function enviadoPara(audio: number[]) {
    const contexto = contextoFalso();
    const motor = criarMotorStt({ iniciarContexto: async () => contexto });
    await motor.transcrever(Float32Array.from(audio));
    return Array.from(new Int16Array((contexto.chamadas[0] as [ArrayBuffer])[0]));
  }

  it('extremos: +1 vira 32767 e -1 vira -32767', async () => {
    expect(await enviadoPara([1, -1, 0])).toEqual([32767, -32767, 0]);
  });

  it('valores fora de [-1, 1] são cortados, não dão a volta (estouro viraria estalo)', async () => {
    expect(await enviadoPara([1.5, -3])).toEqual([32767, -32767]);
  });
});
