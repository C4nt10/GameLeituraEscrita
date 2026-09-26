import { embaralhar } from '../../lib/embaralhar';
import type { DesafioMatematica, Operacao } from '../../models/desafio_matematica';

/**
 * gerador_matematica — conta pura, 8 níveis (doc002 §15, D-41, que
 * substitui a grade de 5 níveis do doc001 §4 — difícil demais pra
 * criança, exigia material dourado):
 * 1 soma até 5 · 2 soma até 10 · 3 subtração até 10 · 4 soma e subtração
 * até 10 · 5 soma de 11 a 20 · 6 subtração até 20 · 7 soma e subtração
 * até 20 · 8 multiplicação (fatores de 1 a 5).
 * Nunca negativo; em subtração o resultado é sempre maior que zero.
 *
 * **Faixas numéricas são proposta**, não um número dado pelo dono do
 * projeto (A-14) — validar com criança (SC-007). Nível fora de 1–8 é
 * erro explícito, não multiplicação por engano.
 */

const QUANTIDADE_ALTERNATIVAS = 4;
const DISTANCIA_MAXIMA_ALTERNATIVA = 5;

function inteiroEntre(min: number, max: number, aleatorio: () => number): number {
  return Math.floor(aleatorio() * (max - min + 1)) + min;
}

/**
 * 4 alternativas (doc001 §4): sempre inclui a certa, nunca repete,
 * nunca negativa, e as erradas ficam próximas (busca por distância
 * crescente, até `DISTANCIA_MAXIMA_ALTERNATIVA`) — pra não dar pra
 * acertar por descarte óbvio.
 */
export function gerarAlternativasNumericas(
  correta: number,
  aleatorio: () => number = Math.random,
): number[] {
  const candidatos = new Set<number>();

  for (
    let distancia = 1;
    distancia <= DISTANCIA_MAXIMA_ALTERNATIVA && candidatos.size < QUANTIDADE_ALTERNATIVAS - 1;
    distancia++
  ) {
    for (const delta of [distancia, -distancia]) {
      if (candidatos.size >= QUANTIDADE_ALTERNATIVAS - 1) break;
      const candidato = correta + delta;
      if (candidato < 0 || candidato === correta) continue;
      candidatos.add(candidato);
    }
  }

  const erradas = embaralhar([...candidatos], aleatorio).slice(0, QUANTIDADE_ALTERNATIVAS - 1);
  return embaralhar([correta, ...erradas], aleatorio);
}

const NIVEL_MINIMO = 1;
const NIVEL_MAXIMO = 8;

interface Conta {
  operandoA: number;
  operandoB: number;
  resultado: number;
}

/** Soma com os dois operandos >= 1 e resultado entre `minResultado` e `maxResultado`. */
function gerarSoma(minResultado: number, maxResultado: number, aleatorio: () => number): Conta {
  const operandoA = inteiroEntre(1, maxResultado - 1, aleatorio);
  const menorB = Math.max(1, minResultado - operandoA);
  const operandoB = inteiroEntre(menorB, maxResultado - operandoA, aleatorio);
  return { operandoA, operandoB, resultado: operandoA + operandoB };
}

/** Subtração com minuendo entre `minMinuendo` e `maxMinuendo` e resultado sempre > 0. */
function gerarSubtracao(minMinuendo: number, maxMinuendo: number, aleatorio: () => number): Conta {
  const operandoA = inteiroEntre(Math.max(2, minMinuendo), maxMinuendo, aleatorio);
  const operandoB = inteiroEntre(1, operandoA - 1, aleatorio);
  return { operandoA, operandoB, resultado: operandoA - operandoB };
}

function gerarMultiplicacao(aleatorio: () => number): Conta {
  const operandoA = inteiroEntre(1, 5, aleatorio);
  const operandoB = inteiroEntre(1, 5, aleatorio);
  return { operandoA, operandoB, resultado: operandoA * operandoB };
}

export function gerarDesafioMatematica(
  nivel: number,
  aleatorio: () => number = Math.random,
): DesafioMatematica {
  if (!Number.isInteger(nivel) || nivel < NIVEL_MINIMO || nivel > NIVEL_MAXIMO) {
    throw new Error(`Nível de matemática inválido: ${nivel} (esperado inteiro de 1 a 8).`);
  }

  let operacao: Operacao;
  let conta: Conta;

  switch (nivel) {
    case 1:
      operacao = 'soma';
      conta = gerarSoma(2, 5, aleatorio);
      break;
    case 2:
      operacao = 'soma';
      conta = gerarSoma(2, 10, aleatorio);
      break;
    case 3:
      operacao = 'subtracao';
      conta = gerarSubtracao(2, 10, aleatorio);
      break;
    case 4:
      operacao = aleatorio() < 0.5 ? 'soma' : 'subtracao';
      conta = operacao === 'soma' ? gerarSoma(2, 10, aleatorio) : gerarSubtracao(2, 10, aleatorio);
      break;
    case 5:
      operacao = 'soma';
      conta = gerarSoma(11, 20, aleatorio);
      break;
    case 6:
      operacao = 'subtracao';
      conta = gerarSubtracao(11, 20, aleatorio);
      break;
    case 7:
      operacao = aleatorio() < 0.5 ? 'soma' : 'subtracao';
      conta =
        operacao === 'soma' ? gerarSoma(11, 20, aleatorio) : gerarSubtracao(11, 20, aleatorio);
      break;
    default:
      operacao = 'multiplicacao';
      conta = gerarMultiplicacao(aleatorio);
  }

  return {
    operacao,
    ...conta,
    forma: 'pura',
    alternativas: gerarAlternativasNumericas(conta.resultado, aleatorio),
  };
}
