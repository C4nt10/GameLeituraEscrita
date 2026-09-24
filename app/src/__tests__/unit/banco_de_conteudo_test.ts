import {
  MINIMO_PALAVRAS_POR_COMBINACAO,
  combinacaoTemConteudoSuficiente,
  combinacoesDisponiveis,
  type ItemLeitura,
} from '../../services/banco_de_conteudo';

function gerarItens(
  nivel: number,
  classificacao: 'animais' | 'comida',
  quantidade: number,
): ItemLeitura[] {
  return Array.from({ length: quantidade }, (_, i) => ({
    palavra: `palavra_${nivel}_${classificacao}_${i}`,
    nivel,
    classificacoes: [classificacao],
  }));
}

describe('banco_de_conteudo — regra dos 12 (FR-011, D-35)', () => {
  it('MINIMO_PALAVRAS_POR_COMBINACAO é 12, não 8 (D-35 — folga acima do tamanho máximo de rodada)', () => {
    expect(MINIMO_PALAVRAS_POR_COMBINACAO).toBe(12);
  });

  it('oculta uma combinação nível×classificação com menos de 12 itens', () => {
    const itens = [...gerarItens(2, 'animais', 11), ...gerarItens(2, 'comida', 12)];

    const disponiveis = combinacoesDisponiveis(itens);

    expect(disponiveis).toContainEqual({ nivel: 2, classificacao: 'comida', quantidade: 12 });
    expect(disponiveis.find((c) => c.classificacao === 'animais')).toBeUndefined();
  });

  it('combinacaoTemConteudoSuficiente rejeita 11 e aceita 12', () => {
    const itens11 = gerarItens(3, 'animais', 11);
    const itens12 = gerarItens(3, 'animais', 12);

    expect(combinacaoTemConteudoSuficiente(itens11, 3, 'animais')).toBe(false);
    expect(combinacaoTemConteudoSuficiente(itens12, 3, 'animais')).toBe(true);
  });

  it('nível 1 (letra isolada) não exige classificação — conta pelo nível sozinho', () => {
    const itens: ItemLeitura[] = Array.from({ length: 12 }, (_, i) => ({
      palavra: String.fromCharCode(97 + i),
      nivel: 1,
    }));

    const disponiveis = combinacoesDisponiveis(itens);

    expect(disponiveis).toContainEqual({ nivel: 1, classificacao: null, quantidade: 12 });
  });

  it('o banco de conteúdo real (app/assets/conteudo/leitura.json) é usado por padrão quando nenhum item é passado', () => {
    const disponiveis = combinacoesDisponiveis();

    // Não afirma um número exato (o conteúdo é revisado à parte, A-06) — só
    // que a função de fato leu o asset real e achou pelo menos 1 combinação
    // válida, confirmando a integração com o arquivo de verdade.
    expect(disponiveis.length).toBeGreaterThan(0);
  });
});
