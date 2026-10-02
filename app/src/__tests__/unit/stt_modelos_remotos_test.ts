import { MODELOS, modeloConfigurado } from '../../services/stt/modelos_remotos';

describe('modelos_remotos — registro dos tamanhos que o app pode baixar (D-56, A-17)', () => {
  it('small e medium têm arquivo, URL e tamanho em bytes', () => {
    expect(MODELOS.small).toEqual({
      nome: 'small',
      arquivo: 'ggml-small-q5_1.bin',
      url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small-q5_1.bin',
      bytes: 190085487,
    });
    expect(MODELOS.medium).toEqual({
      nome: 'medium',
      arquivo: 'ggml-medium-q5_0.bin',
      url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium-q5_0.bin',
      bytes: 539212467,
    });
  });

  it('modeloConfigurado lê a variável de build; sem ela, o padrão é small', () => {
    expect(modeloConfigurado(undefined)).toBe(MODELOS.small);
    expect(modeloConfigurado('small')).toBe(MODELOS.small);
    expect(modeloConfigurado('medium')).toBe(MODELOS.medium);
  });

  it('valor desconhecido também cai pro padrão (small) — nunca quebra por variável de build errada', () => {
    expect(modeloConfigurado('large')).toBe(MODELOS.small);
    expect(modeloConfigurado('')).toBe(MODELOS.small);
  });
});
