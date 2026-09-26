import { caixaDaLetra, cicloDeBlocos, cor, movimento } from '../../theme/tema';
import {
  corDoBloco,
  duracaoDoMovimento,
  estrelasParaIcones,
  mensagemDoResultado,
  rotuloDoTema,
} from '../../theme/helpers';

describe('caixaDaLetra — toda letra do jogo em MAIÚSCULA (D-52)', () => {
  it('mantém acento e cedilha', () => {
    expect(caixaDaLetra('maçã')).toBe('MAÇÃ');
    expect(caixaDaLetra('avó')).toBe('AVÓ');
    expect(caixaDaLetra('pé')).toBe('PÉ');
    expect(caixaDaLetra('gato')).toBe('GATO');
  });

  it('não muda o que já é maiúsculo nem mexe em espaço', () => {
    expect(caixaDaLetra('LUA')).toBe('LUA');
    expect(caixaDaLetra('a bola')).toBe('A BOLA');
  });
});

describe('corDoBloco — ciclo vermelho → azul → amarelo → verde → roxo, deslocado pelo desafio', () => {
  it('repete a cada 5 letras', () => {
    expect(corDoBloco(0, 0)).toBe(cicloDeBlocos[0]);
    expect(corDoBloco(4, 0)).toBe(cicloDeBlocos[4]);
    expect(corDoBloco(5, 0)).toBe(cicloDeBlocos[0]);
  });

  it('o índice do desafio desloca o começo do ciclo', () => {
    expect(corDoBloco(0, 1)).toBe(cicloDeBlocos[1]);
    expect(corDoBloco(2, 3)).toBe(cicloDeBlocos[0]);
  });

  it('a ordem do ciclo é a do guia', () => {
    expect(cicloDeBlocos).toEqual([cor.vermelho, cor.azul, cor.amarelo, cor.verde, cor.roxo]);
  });
});

describe('rotuloDoTema — o identificador não vai pra tela (A-33)', () => {
  it('coloca a acentuação e a maiúscula', () => {
    expect(rotuloDoTema('acoes')).toBe('Ações');
    expect(rotuloDoTema('animais')).toBe('Animais');
    expect(rotuloDoTema('comida')).toBe('Comida');
    expect(rotuloDoTema('casa')).toBe('Casa');
    expect(rotuloDoTema('corpo')).toBe('Corpo');
    expect(rotuloDoTema('natureza')).toBe('Natureza');
  });

  it('tema desconhecido aparece com a primeira letra maiúscula, nunca quebra', () => {
    expect(rotuloDoTema('esportes')).toBe('Esportes');
  });
});

describe('estrelasParaIcones — 5 posições em meias estrelas (A-22: meia estrela fica, FR-007)', () => {
  it('estrelas inteiras', () => {
    expect(estrelasParaIcones(3)).toEqual(['cheia', 'cheia', 'cheia', 'vazia', 'vazia']);
    expect(estrelasParaIcones(5)).toEqual(['cheia', 'cheia', 'cheia', 'cheia', 'cheia']);
  });

  it('meia estrela aparece na posição certa', () => {
    expect(estrelasParaIcones(3.5)).toEqual(['cheia', 'cheia', 'cheia', 'meia', 'vazia']);
    expect(estrelasParaIcones(0.5)).toEqual(['meia', 'vazia', 'vazia', 'vazia', 'vazia']);
  });

  it('zero estrela é tudo vazio — não existe "mínimo de 1"', () => {
    expect(estrelasParaIcones(0)).toEqual(['vazia', 'vazia', 'vazia', 'vazia', 'vazia']);
  });

  it('sempre 5 ícones', () => {
    for (let v = 0; v <= 5; v += 0.5) expect(estrelasParaIcones(v)).toHaveLength(5);
  });
});

describe('mensagemDoResultado — sempre positiva, rodada sem erro ganha destaque (CU-05)', () => {
  it('sem nenhum erro tem a mensagem de destaque', () => {
    expect(mensagemDoResultado(5, 0)).toMatch(/perfeito|nenhum erro/i);
  });

  it('muitas estrelas: elogio', () => {
    expect(mensagemDoResultado(4, 1)).toBe('Mandou muito bem!');
  });

  it('meio do caminho: encorajamento', () => {
    expect(mensagemDoResultado(3, 3)).toBe('Boa! Cada rodada fica mais fácil.');
  });

  it('pior desempenho: nunca depreciativa', () => {
    const msg = mensagemDoResultado(1, 8);
    expect(msg).toBe('Você foi até o fim. Isso é o que conta!');
    expect(msg).not.toMatch(/perdeu|errou|fraco|ruim/i);
  });
});

describe('duracaoDoMovimento — "reduzir movimento" do sistema zera tudo (D-54)', () => {
  it('sem redução mantém a duração do guia', () => {
    expect(duracaoDoMovimento(movimento.encaixe, false)).toBe(250);
  });

  it('com redução a duração é 0', () => {
    expect(duracaoDoMovimento(movimento.treme, true)).toBe(0);
    expect(duracaoDoMovimento(movimento.pulo, true)).toBe(0);
  });
});
