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

describe('gerador_matematica — geração de conta pura por nível (doc001 §4)', () => {
  it('nível 1-2: soma, resultado nunca negativo', () => {
    for (const nivel of [1, 2]) {
      const desafio = gerarDesafioMatematica(nivel);
      expect(desafio.operacao).toBe('soma');
      expect(desafio.resultado).toBe(desafio.operandoA + desafio.operandoB);
      expect(desafio.resultado).toBeGreaterThanOrEqual(0);
    }
  });

  it('nível 3: subtração, resultado sempre positivo (nunca zero ou negativo)', () => {
    for (let i = 0; i < 20; i++) {
      const desafio = gerarDesafioMatematica(3);
      expect(desafio.operacao).toBe('subtracao');
      expect(desafio.resultado).toBe(desafio.operandoA - desafio.operandoB);
      expect(desafio.resultado).toBeGreaterThan(0);
    }
  });

  it('nível 4: soma ou subtração misturadas, subtração nunca negativa', () => {
    const operacoesVistas = new Set<string>();
    for (let i = 0; i < 30; i++) {
      const desafio = gerarDesafioMatematica(4);
      expect(['soma', 'subtracao']).toContain(desafio.operacao);
      operacoesVistas.add(desafio.operacao);
      if (desafio.operacao === 'subtracao') {
        expect(desafio.resultado).toBeGreaterThan(0);
      }
    }
    // com 30 sorteios, as duas operações devem aparecer pelo menos uma vez
    expect(operacoesVistas.size).toBe(2);
  });

  it('nível 5: multiplicação básica', () => {
    const desafio = gerarDesafioMatematica(5);
    expect(desafio.operacao).toBe('multiplicacao');
    expect(desafio.resultado).toBe(desafio.operandoA * desafio.operandoB);
  });

  it('forma da conta pura é sempre "pura", sem classificação/enunciado', () => {
    const desafio = gerarDesafioMatematica(1);
    expect(desafio.forma).toBe('pura');
    expect(desafio.classificacao).toBeUndefined();
    expect(desafio.enunciado).toBeUndefined();
  });

  it('sempre 4 alternativas incluindo o resultado certo', () => {
    const desafio = gerarDesafioMatematica(2);
    expect(desafio.alternativas).toHaveLength(4);
    expect(desafio.alternativas).toContain(desafio.resultado);
  });
});
