import {
  gerarAlternativasNumericas,
  gerarDesafioMatematica,
} from '../../services/gerador_matematica';

describe('gerador_matematica — alternativas (doc001 §4): 4, sem repetir, próximas, nunca negativas', () => {
  it('gera exatamente 4 alternativas, incluindo a correta', () => {
    const alternativas = gerarAlternativasNumericas(10);
    expect(alternativas).toHaveLength(4);
    expect(alternativas).toContain(10);
  });

  it('nunca repete uma alternativa', () => {
    const alternativas = gerarAlternativasNumericas(7);
    expect(new Set(alternativas).size).toBe(4);
  });

  it('nunca gera alternativa negativa, mesmo pra resultado pequeno', () => {
    const alternativas = gerarAlternativasNumericas(0);
    expect(alternativas.every((a) => a >= 0)).toBe(true);
    expect(alternativas).toContain(0);
  });

  it('alternativas erradas ficam próximas da correta (não descarte óbvio)', () => {
    const alternativas = gerarAlternativasNumericas(50);
    const erradas = alternativas.filter((a) => a !== 50);
    // "próximo" calibrado aqui como distância <= 5 — não vem de nenhum
    // número do doc001 §4, só a regra qualitativa "próximas".
    expect(erradas.every((a) => Math.abs(a - 50) <= 5)).toBe(true);
  });
});

/** PRNG determinístico (mulberry32) — varreduras com seed, sem teste flaky. */
function comSeed(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const AMOSTRAS = 300;

function amostrar(nivel: number) {
  const aleatorio = comSeed(nivel * 1000 + 7);
  return Array.from({ length: AMOSTRAS }, () => gerarDesafioMatematica(nivel, aleatorio));
}

describe('gerador_matematica — 8 níveis (D-41): nenhum passa do teto do nível', () => {
  it('nível 1: soma com resultado até 5', () => {
    for (const d of amostrar(1)) {
      expect(d.operacao).toBe('soma');
      expect(d.operandoA).toBeGreaterThanOrEqual(1);
      expect(d.operandoB).toBeGreaterThanOrEqual(1);
      expect(d.resultado).toBe(d.operandoA + d.operandoB);
      expect(d.resultado).toBeLessThanOrEqual(5);
    }
  });

  it('nível 2: soma com resultado até 10', () => {
    for (const d of amostrar(2)) {
      expect(d.operacao).toBe('soma');
      expect(d.operandoA).toBeGreaterThanOrEqual(1);
      expect(d.operandoB).toBeGreaterThanOrEqual(1);
      expect(d.resultado).toBeLessThanOrEqual(10);
    }
  });

  it('nível 3: subtração com números até 10, resultado sempre maior que zero', () => {
    for (const d of amostrar(3)) {
      expect(d.operacao).toBe('subtracao');
      expect(d.operandoA).toBeLessThanOrEqual(10);
      expect(d.resultado).toBe(d.operandoA - d.operandoB);
      expect(d.resultado).toBeGreaterThan(0);
    }
  });

  it('nível 4: soma e subtração misturadas até 10 — as duas aparecem, nunca negativo', () => {
    const vistas = new Set<string>();
    for (const d of amostrar(4)) {
      vistas.add(d.operacao);
      if (d.operacao === 'soma') expect(d.resultado).toBeLessThanOrEqual(10);
      else {
        expect(d.operandoA).toBeLessThanOrEqual(10);
        expect(d.resultado).toBeGreaterThan(0);
      }
    }
    expect([...vistas].sort()).toEqual(['soma', 'subtracao']);
  });

  it('nível 5: soma que passa da dezena, resultado de 11 a 20', () => {
    for (const d of amostrar(5)) {
      expect(d.operacao).toBe('soma');
      expect(d.resultado).toBeGreaterThanOrEqual(11);
      expect(d.resultado).toBeLessThanOrEqual(20);
    }
  });

  it('nível 6: subtração até 20, resultado sempre maior que zero', () => {
    for (const d of amostrar(6)) {
      expect(d.operacao).toBe('subtracao');
      expect(d.operandoA).toBeGreaterThanOrEqual(11);
      expect(d.operandoA).toBeLessThanOrEqual(20);
      expect(d.resultado).toBeGreaterThan(0);
    }
  });

  it('nível 7: soma e subtração misturadas até 20 — as duas aparecem, nunca negativo', () => {
    const vistas = new Set<string>();
    for (const d of amostrar(7)) {
      vistas.add(d.operacao);
      if (d.operacao === 'soma') expect(d.resultado).toBeLessThanOrEqual(20);
      else {
        expect(d.operandoA).toBeLessThanOrEqual(20);
        expect(d.resultado).toBeGreaterThan(0);
      }
    }
    expect([...vistas].sort()).toEqual(['soma', 'subtracao']);
  });

  it('nível 8: multiplicação básica, fatores de 1 a 5 (faixa a calibrar, A-14)', () => {
    for (const d of amostrar(8)) {
      expect(d.operacao).toBe('multiplicacao');
      expect(d.operandoA).toBeGreaterThanOrEqual(1);
      expect(d.operandoA).toBeLessThanOrEqual(5);
      expect(d.operandoB).toBeGreaterThanOrEqual(1);
      expect(d.operandoB).toBeLessThanOrEqual(5);
      expect(d.resultado).toBe(d.operandoA * d.operandoB);
    }
  });

  it('nível fora de 1-8 (ou não inteiro) lança erro, nunca vira multiplicação por engano', () => {
    for (const nivel of [0, 9, 10, -1, 1.5, NaN]) {
      expect(() => gerarDesafioMatematica(nivel)).toThrow();
    }
  });
});

describe('gerador_matematica — regras que valem em todos os níveis', () => {
  it('forma da conta pura é sempre "pura", sem classificação/enunciado', () => {
    const desafio = gerarDesafioMatematica(1);
    expect(desafio.forma).toBe('pura');
    expect(desafio.classificacao).toBeUndefined();
    expect(desafio.enunciado).toBeUndefined();
  });

  it('sempre 4 alternativas distintas, não negativas, próximas, incluindo o resultado certo', () => {
    for (let nivel = 1; nivel <= 8; nivel++) {
      for (const d of amostrar(nivel).slice(0, 60)) {
        expect(d.alternativas).toHaveLength(4);
        expect(new Set(d.alternativas).size).toBe(4);
        expect(d.alternativas).toContain(d.resultado);
        expect(d.alternativas.every((a) => a >= 0)).toBe(true);
        expect(d.alternativas.every((a) => Math.abs(a - d.resultado) <= 5)).toBe(true);
      }
    }
  });
});
