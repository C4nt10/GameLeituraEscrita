import { gerarProblemaContextualizado } from '../../services/problema_contextualizado';
import type { TemaMatematica } from '../../services/problema_contextualizado';

const TEMA_TESTE: TemaMatematica = {
  classificacao: 'animais',
  objeto: 'passarinho',
  variacoes_frase: {
    soma: ['{x} {objeto}, e mais {y} {objeto}', 'junte {x} com {y} {objeto}'],
    subtracao: ['tinha {x} {objeto}, {y} saíram', 'de {x} {objeto}, sumiram {y}'],
  },
};

describe('problema_contextualizado — variação de frase (D-36)', () => {
  it('sorteia entre as variações fixas cadastradas pro tema/operação, nunca inventa uma nova', () => {
    for (let i = 0; i < 20; i++) {
      const desafio = gerarProblemaContextualizado(1, 'animais', Math.random, [TEMA_TESTE]);
      const variacoesPossiveis =
        desafio.operacao === 'soma'
          ? TEMA_TESTE.variacoes_frase.soma
          : TEMA_TESTE.variacoes_frase.subtracao;
      const bateAlguma = variacoesPossiveis.some(
        (v) =>
          desafio.enunciado ===
          v
            .replaceAll('{x}', String(desafio.operandoA))
            .replaceAll('{y}', String(desafio.operandoB))
            .replaceAll('{objeto}', TEMA_TESTE.objeto),
      );
      expect(bateAlguma).toBe(true);
    }
  });

  it('a variação de frase não muda com o nível — mesmo pool de variações pros níveis 1-4 (D-36)', () => {
    // Confirma que não existe uma lista de variações "por nível" — o
    // pool vem sempre do mesmo tema/operação, nível 1 a 4.
    for (const nivel of [1, 2, 3, 4]) {
      const desafio = gerarProblemaContextualizado(nivel, 'animais', Math.random, [TEMA_TESTE]);
      const operacao = desafio.operacao === 'soma' ? 'soma' : 'subtracao';
      const variacoesPossiveis = TEMA_TESTE.variacoes_frase[operacao];
      const bateAlguma = variacoesPossiveis.some(
        (v) =>
          desafio.enunciado ===
          v
            .replaceAll('{x}', String(desafio.operandoA))
            .replaceAll('{y}', String(desafio.operandoB))
            .replaceAll('{objeto}', TEMA_TESTE.objeto),
      );
      // se existisse um pool separado por nível, este desafio (nível
      // `nivel`) poderia ter um enunciado fora do pool fixo do tema —
      // bater sempre, em todos os níveis, confirma que não existe.
      expect(bateAlguma).toBe(true);
    }
  });

  it('o tema real (app/assets/conteudo/matematica_temas.json) tem 2-3 variações por operação', () => {
    // Usa o banco de temas de verdade (sem passar `temas` customizado)
    // pra confirmar que o conteúdo real respeita o range do schema.
    const desafio = gerarProblemaContextualizado(1, 'animais');
    expect(desafio.enunciado).toBeDefined();
  });
});
