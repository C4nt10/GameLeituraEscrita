import { criarDependenciasDeVoz } from '../../services/voz_da_rodada';

function criar() {
  const audioGravado = new Float32Array([0.1, -0.2, 0.3]);
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
    expect(transcreverAudio).toHaveBeenCalledWith(audioGravado);
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
});
