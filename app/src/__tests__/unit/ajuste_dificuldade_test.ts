import {
  LIMITE_ERROS_PARA_FACILITAR,
  sugerirProximoNivel,
} from '../../services/ajuste_dificuldade';

describe('ajuste_dificuldade — próxima rodada mais fácil após 2+ erros (D-40)', () => {
  it('LIMITE_ERROS_PARA_FACILITAR é 2', () => {
    expect(LIMITE_ERROS_PARA_FACILITAR).toBe(2);
  });

  it('com menos de 2 erros, sugere o mesmo nível (sem mudança)', () => {
    expect(sugerirProximoNivel(3, 0)).toBe(3);
    expect(sugerirProximoNivel(3, 1)).toBe(3);
  });

  it('com 2 ou mais erros, sugere 1 nível abaixo', () => {
    expect(sugerirProximoNivel(3, 2)).toBe(2);
    expect(sugerirProximoNivel(3, 5)).toBe(2); // mais erros não desce mais que 1 nível
  });

  it('nunca sugere abaixo do nível 1', () => {
    expect(sugerirProximoNivel(1, 2)).toBe(1);
  });

  it('não muda classificação nem tamanho — só calcula o nível, o resto é responsabilidade de quem chama', () => {
    // sugerirProximoNivel não recebe nem devolve classificação/tamanho —
    // a própria assinatura garante que não há como ela mexer nisso.
    expect(typeof sugerirProximoNivel(2, 3)).toBe('number');
  });
});
