import { base64ParaBytes, pcm16ParaFloat32 } from '../../services/stt/pcm';

/** Monta um chunk base64 de PCM 16 bits little-endian, como a lib de áudio entrega. */
function chunkPcm16(amostras: number[]): string {
  const bytes = new Uint8Array(amostras.length * 2);
  const view = new DataView(bytes.buffer);
  amostras.forEach((a, i) => view.setInt16(i * 2, a, true));
  return Buffer.from(bytes).toString('base64');
}

describe('pcm — o motor (whisper.rn transcribeData) espera float32; o microfone entrega PCM de 16 bits', () => {
  it('converte 16 bits pra float32 entre -1 e 1', () => {
    const audio = pcm16ParaFloat32([chunkPcm16([0, 16384, -16384, 32767, -32768])]);
    expect(Array.from(audio)).toEqual([0, 0.5, -0.5, 32767 / 32768, -1]);
  });

  it('junta vários chunks na ordem em que chegaram', () => {
    const audio = pcm16ParaFloat32([chunkPcm16([16384]), chunkPcm16([-16384, 0])]);
    expect(Array.from(audio)).toEqual([0.5, -0.5, 0]);
  });

  it('uma amostra partida no meio entre dois chunks não corrompe o áudio', () => {
    // 1 amostra (2 bytes) dividida em 1 byte + 1 byte, em chunks diferentes
    const bytes = Buffer.alloc(4);
    bytes.writeInt16LE(16384, 0);
    bytes.writeInt16LE(-16384, 2);
    const chunkA = bytes.subarray(0, 3).toString('base64'); // 1 amostra + metade da 2ª
    const chunkB = bytes.subarray(3, 4).toString('base64'); // resto da 2ª
    expect(Array.from(pcm16ParaFloat32([chunkA, chunkB]))).toEqual([0.5, -0.5]);
  });

  it('sem nenhum chunk devolve áudio vazio', () => {
    expect(pcm16ParaFloat32([]).length).toBe(0);
  });

  it('byte solto no final (número ímpar de bytes) é descartado, não vira ruído', () => {
    const chunk = Buffer.from([0x00, 0x40, 0x7f]).toString('base64'); // 0x4000 = 16384 + 1 byte sobrando
    expect(Array.from(pcm16ParaFloat32([chunk]))).toEqual([0.5]);
  });
});

describe('base64ParaBytes — decodificador próprio (não depende de atob/Buffer no aparelho)', () => {
  it('bate com o Buffer do Node pra tamanhos com e sem padding "="', () => {
    for (const tamanho of [1, 2, 3, 4, 5, 10, 255]) {
      const original = Uint8Array.from({ length: tamanho }, (_, i) => (i * 37 + 11) % 256);
      const base64 = Buffer.from(original).toString('base64');
      expect(Array.from(base64ParaBytes(base64))).toEqual(Array.from(original));
    }
  });

  it('string vazia vira zero bytes', () => {
    expect(base64ParaBytes('').length).toBe(0);
  });
});
