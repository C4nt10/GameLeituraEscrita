import { avaliarLeitura, normalizar } from '../../services/avaliacao_leitura';

/**
 * US1 cenário 8 / D-37: leitura soletrada/pausada dentro da palavra
 * ("ga... to") tem que ser aceita como acerto do mesmo jeito que uma
 * leitura fluida — nem a captura de áudio corta por pausa curta (fora do
 * escopo deste teste, é UI), nem a comparação usa duração/pausa como
 * critério. A pausa vira pontuação/hífen na transcrição do motor de STT
 * (achado da rodada 6/8 do spike) — a comparação ignora isso, só
 * concatena e compara o conteúdo fonético.
 */

describe('tolerancia_pausa — fragmentação por pausa nunca reprova uma leitura correta (D-37)', () => {
  it('normalizar remove pontuação de hesitação em qualquer posição, não só nas bordas', () => {
    expect(normalizar('ca, sa')).toBe('ca sa');
    expect(normalizar('ta? ta')).toBe('ta ta');
    expect(normalizar('fa, va, lo')).toBe('fa va lo');
    expect(normalizar('ga... to')).toBe('ga to');
  });

  it('normalizar separa sílabas fragmentadas por hífen (fragmentação do Whisper)', () => {
    expect(normalizar('ca-ca')).toBe('ca ca');
    expect(normalizar('ga-bo-ca-ca-ze-co-he')).toBe('ga bo ca ca ze co he');
  });

  it('transcrição fragmentada com vírgula/hífen no meio da palavra é aceita como acerto', () => {
    expect(avaliarLeitura('gato', 'ga, to')).toBe(true);
    expect(avaliarLeitura('gato', 'ga-to')).toBe(true);
    expect(avaliarLeitura('gato', 'ga... to')).toBe(true);
  });

  it('mesmo fragmentada, uma palavra diferente continua reprovando (D-09 não afrouxa por causa da pausa)', () => {
    expect(avaliarLeitura('gato', 'pa, to')).toBe(false);
  });

  it('uma frase (nível 5) fragmentada por pausa também concatena antes de comparar', () => {
    expect(avaliarLeitura('o gato corre', 'o, gato, corre')).toBe(true);
  });
});
