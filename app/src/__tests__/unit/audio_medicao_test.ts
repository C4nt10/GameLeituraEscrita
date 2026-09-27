import {
  medirAudio,
  normalizarPico,
  PICO_MINIMO,
  SemSinalDeMicrofoneError,
} from '../../services/stt/audio';

describe('audio — medir o que o microfone entregou antes de gastar tempo com o Whisper', () => {
  it('mede duração (16 kHz) e pico', () => {
    const audio = new Float32Array(32000); // 2 s
    audio[100] = -0.5;
    audio[200] = 0.25;

    const medida = medirAudio(audio);

    expect(medida.segundos).toBeCloseTo(2);
    expect(medida.pico).toBeCloseTo(0.5);
  });

  it('áudio vazio: 0 s e pico 0', () => {
    expect(medirAudio(new Float32Array(0))).toEqual({ segundos: 0, pico: 0 });
  });

  it('silêncio digital (tudo zero) fica abaixo do pico mínimo', () => {
    expect(medirAudio(new Float32Array(16000)).pico).toBeLessThan(PICO_MINIMO);
  });

  it('voz baixa mas real fica acima do pico mínimo', () => {
    const audio = new Float32Array(16000).fill(0.02);
    expect(medirAudio(audio).pico).toBeGreaterThan(PICO_MINIMO);
  });
});

describe('audio — normalizar volume (microfones de celular costumam entregar voz baixa)', () => {
  it('áudio baixo é amplificado até o pico chegar perto de 0,8', () => {
    const baixo = Float32Array.from([0.02, -0.04, 0.01]);
    const normalizado = normalizarPico(baixo);
    expect(medirAudio(normalizado).pico).toBeCloseTo(0.8, 2);
    // mesma forma de onda, só mais alta
    expect(normalizado[0] / normalizado[1]).toBeCloseTo(baixo[0] / baixo[1]);
  });

  it('áudio que já está alto não é mexido', () => {
    const alto = Float32Array.from([0.9, -0.7]);
    expect(Array.from(normalizarPico(alto))).toEqual(Array.from(alto));
  });

  it('o ganho tem teto: ruído quase nulo não vira barulho gigante', () => {
    const quaseNada = Float32Array.from([0.006, -0.006]);
    expect(medirAudio(normalizarPico(quaseNada)).pico).toBeLessThan(0.8);
  });

  it('não altera o array original', () => {
    const original = Float32Array.from([0.02, -0.04]);
    normalizarPico(original);
    expect(Array.from(original)).toEqual([0.02, -0.04].map(Math.fround));
  });
});

describe('audio — erro de microfone sem sinal', () => {
  it('é um erro com nome próprio, pra tela dar a mensagem certa', () => {
    const erro = new SemSinalDeMicrofoneError();
    expect(erro.name).toBe('SemSinalDeMicrofoneError');
    expect(erro.message).toMatch(/microfone/i);
  });
});
