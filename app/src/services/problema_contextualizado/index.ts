import temasAsset from '../../../assets/conteudo/matematica_temas.json';
import { embaralhar } from '../../lib/embaralhar';
import type { DesafioMatematica } from '../../models/desafio_matematica';
import type { Classificacao } from '../../models/registro_historico';
import { gerarDesafioMatematica } from '../gerador_matematica';

/**
 * problema_contextualizado — enunciado falado + quantidade visual (D-23,
 * D-24), reusando `gerador_matematica` pra conta/alternativas e só
 * adicionando o enunciado de texto (D-36: 2-3 variações fixas por
 * operação, sorteadas a cada desafio, sem variar por nível).
 *
 * **Escopo assumido**: só soma/subtração têm forma contextualizada — o
 * schema de tema (`contracts/tema-matematica.schema.json`) só define
 * variações pra essas duas operações, nenhuma pra multiplicação.
 * Nível 5 (multiplicação, doc001 §4) fica só como conta pura no MVP.
 */

export interface TemaMatematica {
  classificacao: Classificacao;
  objeto: string;
  variacoes_frase: {
    soma: string[];
    subtracao: string[];
  };
}

const temasReais = temasAsset as TemaMatematica[];

export function temaPorClassificacao(
  classificacao: Classificacao,
  temas: TemaMatematica[] = temasReais,
): TemaMatematica | undefined {
  return temas.find((t) => t.classificacao === classificacao);
}

function montarEnunciado(
  variacao: string,
  operandoA: number,
  operandoB: number,
  objeto: string,
): string {
  return variacao
    .replaceAll('{x}', String(operandoA))
    .replaceAll('{y}', String(operandoB))
    .replaceAll('{objeto}', objeto);
}

export function gerarProblemaContextualizado(
  nivel: number,
  classificacao: Classificacao,
  aleatorio: () => number = Math.random,
  temas: TemaMatematica[] = temasReais,
): DesafioMatematica {
  const base = gerarDesafioMatematica(nivel, aleatorio);

  if (base.operacao === 'multiplicacao') {
    throw new Error(
      'Problema contextualizado não existe pra multiplicação (nível 5) — só conta pura.',
    );
  }

  const tema = temaPorClassificacao(classificacao, temas);
  if (!tema) {
    throw new Error(`Tema não encontrado pra classificação "${classificacao}".`);
  }

  const variacoesPossiveis = tema.variacoes_frase[base.operacao];
  const variacaoSorteada = embaralhar(variacoesPossiveis, aleatorio)[0];
  const enunciado = montarEnunciado(variacaoSorteada, base.operandoA, base.operandoB, tema.objeto);

  return {
    ...base,
    forma: 'contextualizada',
    classificacao,
    enunciado,
  };
}
