import { SemSinalDeMicrofoneError } from '../../services/stt/audio';
import { criarDependenciasDeVoz } from '../../services/voz_da_rodada';

function criar() {
  const audioGravado = new Float32Array([0.5, -0.6, 0.7]); // alto o bastante pra não ser normalizado
  const gravacao = {
    iniciar: jest.fn(async () => {}),
    parar: jest.fn(async () => audioGravado),
    gravando: () => false,
  };
  const transcreverAudio = jest.fn(async () => 'gato');
  const voz = criarDependenciasDeVoz({ gravacao, transcreverAudio });
  return { voz, gravacao, transcreverAudio, audioGravado };
}

describe('voz_da_rodada — liga gravação + STT à interface que a tela de Leitura·voz já usa', () => {
  it('iniciarGravacao delega ao serviço de gravação', async () => {
    const { voz, gravacao } = criar();
    await voz.iniciarGravacao();
    expect(gravacao.iniciar).toHaveBeenCalledTimes(1);
  });

  it('pararGravacao devolve uma referência e transcrever usa exatamente o áudio dessa gravação', async () => {
    const { voz, transcreverAudio, audioGravado } = criar();

    const referencia = await voz.pararGravacao();
    const texto = await voz.transcrever(referencia);

    expect(texto).toBe('gato');
    // o áudio da gravação chega intacto no meio, com silêncio nas pontas
    const enviado = (transcreverAudio.mock.calls[0] as unknown as [Float32Array])[0];
    const margem = (enviado.length - audioGravado.length) / 2;
    expect(margem).toBeGreaterThan(0);
    expect(Array.from(enviado.subarray(margem, margem + audioGravado.length))).toEqual(
      Array.from(audioGravado),
    );
  });

  it('referência desconhecida não transcreve nada (texto vazio, sem chamar o motor)', async () => {
    const { voz, transcreverAudio } = criar();
    expect(await voz.transcrever('nao-existe')).toBe('');
    expect(transcreverAudio).not.toHaveBeenCalled();
  });

  it('o áudio é descartado depois de transcrito — não fica guardado na memória', async () => {
    const { voz, transcreverAudio } = criar();

    const referencia = await voz.pararGravacao();
    await voz.transcrever(referencia);
    transcreverAudio.mockClear();

    expect(await voz.transcrever(referencia)).toBe('');
    expect(transcreverAudio).not.toHaveBeenCalled();
  });

  it('microfone sem sinal (tudo zero): erro próprio, e o motor de fala nem é chamado', async () => {
    const { voz, transcreverAudio, gravacao } = criar();
    gravacao.parar.mockResolvedValueOnce(new Float32Array(16000));

    const referencia = await voz.pararGravacao();

    await expect(voz.transcrever(referencia)).rejects.toBeInstanceOf(SemSinalDeMicrofoneError);
    expect(transcreverAudio).not.toHaveBeenCalled();
  });

  it('áudio baixo é normalizado antes de ir pro motor', async () => {
    const { voz, transcreverAudio, gravacao } = criar();
    gravacao.parar.mockResolvedValueOnce(Float32Array.from([0.02, -0.04]));

    await voz.transcrever(await voz.pararGravacao());

    const enviado = (transcreverAudio.mock.calls[0] as unknown as [Float32Array])[0];
    expect(Math.max(...Array.from(enviado).map(Math.abs))).toBeCloseTo(0.8, 2);
  });

  it('guarda o diagnóstico da última tentativa: duração, volume do original e tempo de reconhecimento', async () => {
    const { voz } = criar();
    expect(voz.diagnostico()).toBeNull();

    await voz.transcrever(await voz.pararGravacao());

    const d = voz.diagnostico();
    expect(d).toMatch(/áudio/);
    expect(d).toMatch(/volume/);
    expect(d).toMatch(/reconheceu em/);
  });

  it('diagnóstico também aparece quando o microfone não deu sinal (é justamente aí que ajuda)', async () => {
    const { voz, gravacao } = criar();
    gravacao.parar.mockResolvedValueOnce(new Float32Array(16000));

    await voz.transcrever(await voz.pararGravacao()).catch(() => {});

    expect(voz.diagnostico()).toMatch(/volume 0%/);
  });

  it('sem sinal: avisa quem liga (pra trocar a fonte de áudio na próxima tentativa)', async () => {
    const aoFicarSemSinal = jest.fn();
    const gravacao = {
      iniciar: async () => {},
      parar: async () => new Float32Array(16000),
      gravando: () => false,
    };
    const voz = criarDependenciasDeVoz({
      gravacao,
      transcreverAudio: async () => 'x',
      aoFicarSemSinal,
    });

    await voz.transcrever(await voz.pararGravacao()).catch(() => {});

    expect(aoFicarSemSinal).toHaveBeenCalledTimes(1);
  });

  it('com sinal, não troca nada', async () => {
    const aoFicarSemSinal = jest.fn();
    const { gravacao } = criar();
    const voz = criarDependenciasDeVoz({
      gravacao,
      transcreverAudio: async () => 'gato',
      aoFicarSemSinal,
    });

    await voz.transcrever(await voz.pararGravacao());

    expect(aoFicarSemSinal).not.toHaveBeenCalled();
  });

  it('o diagnóstico diz qual fonte de áudio estava em uso naquela tentativa', async () => {
    const { gravacao } = criar();
    const voz = criarDependenciasDeVoz({
      gravacao,
      transcreverAudio: async () => 'gato',
      fonteDoAudio: () => 6,
    });

    await voz.transcrever(await voz.pararGravacao());

    expect(voz.diagnostico()).toMatch(/fonte 6/);
  });
});

describe('voz_da_rodada — o diagnóstico mostra o que o Whisper de fato respondeu', () => {
  it('inclui o texto bruto quando quem liga informa', async () => {
    const gravacao = {
      iniciar: async () => {},
      parar: async () => new Float32Array([0.5, -0.5]),
      gravando: () => false,
    };
    const voz = criarDependenciasDeVoz({
      gravacao,
      transcreverAudio: async () => '',
      textoBrutoDoMotor: () => '[MÚSICA]',
    });

    await voz.transcrever(await voz.pararGravacao());

    expect(voz.diagnostico()).toMatch(/whisper: "\[MÚSICA\]"/);
  });

  it('resposta vazia aparece como (nada), não como buraco', async () => {
    const gravacao = {
      iniciar: async () => {},
      parar: async () => new Float32Array([0.5, -0.5]),
      gravando: () => false,
    };
    const voz = criarDependenciasDeVoz({
      gravacao,
      transcreverAudio: async () => '',
      textoBrutoDoMotor: () => '',
    });

    await voz.transcrever(await voz.pararGravacao());

    expect(voz.diagnostico()).toMatch(/whisper: \(nada\)/);
  });

  it('o áudio vai pro motor com silêncio nas pontas', async () => {
    const gravacao = {
      iniciar: async () => {},
      parar: async () => new Float32Array([0.5, -0.5]),
      gravando: () => false,
    };
    const transcreverAudio = jest.fn(async () => 'x');
    const voz = criarDependenciasDeVoz({ gravacao, transcreverAudio });

    await voz.transcrever(await voz.pararGravacao());

    const enviado = (transcreverAudio.mock.calls[0] as unknown as [Float32Array])[0];
    expect(enviado.length).toBeGreaterThan(2 + 10000);
  });
});
