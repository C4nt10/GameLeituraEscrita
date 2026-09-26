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
 * Nível 8 (multiplicação, D-41) fica só como conta pura no MVP.
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

/**
 * Tema sorteado quando o adulto pede "Problema" mas não escolheu tema
 * (na configuração, "todas" é o padrão). Antes disso o app caía em conta
 * pura em silêncio — "Problema" não fazia nada (achado ao executar a
 * Fase 9b, 2026-09-26).
 */
export function classificacaoAleatoria(
  aleatorio: () => number = Math.random,
  temas: TemaMatematica[] = temasReais,
): Classificacao {
  if (temas.length === 0) {
    throw new Error('Nenhum tema de matemática disponível pra sortear.');
  }
  const indice = Math.min(temas.length - 1, Math.floor(aleatorio() * temas.length));
  return temas[indice].classificacao;
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
      'Problema contextualizado não existe pra multiplicação (nível 8) — só conta pura.',
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
