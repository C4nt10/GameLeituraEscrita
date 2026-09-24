import { embaralhar } from '../../lib/embaralhar';
import type { DesafioMatematica, Operacao } from '../../models/desafio_matematica';

/**
 * gerador_matematica — conta pura, 5 níveis de operação (doc001 §4):
 * 1 soma pequena, 2 soma maior, 3 subtração (resultado sempre positivo),
 * 4 soma e subtração misturadas, 5 multiplicação básica.
 *
 * **Faixas numéricas calibradas aqui**, não vêm de um número exato do
 * doc — só da regra qualitativa ("pequenos"/"maiores"/"básica"). Marcar
 * pra revisão se o dono do projeto quiser ajustar depois da validação
 * com a criança (definições001 §10).
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

interface FaixaOperandos {
  min: number;
  max: number;
}

const FAIXA_SOMA_PEQUENA: FaixaOperandos = { min: 1, max: 5 }; // nível 1
const FAIXA_SOMA_MAIOR: FaixaOperandos = { min: 5, max: 20 }; // nível 2 e metade do 4
const FAIXA_SUBTRACAO: FaixaOperandos = { min: 5, max: 20 }; // nível 3 e metade do 4
const FAIXA_MULTIPLICACAO: FaixaOperandos = { min: 1, max: 10 }; // nível 5

function gerarSoma(faixa: FaixaOperandos, aleatorio: () => number) {
  const operandoA = inteiroEntre(faixa.min, faixa.max, aleatorio);
  const operandoB = inteiroEntre(faixa.min, faixa.max, aleatorio);
  return { operandoA, operandoB, resultado: operandoA + operandoB };
}

function gerarSubtracao(faixa: FaixaOperandos, aleatorio: () => number) {
  const operandoA = inteiroEntre(faixa.min + 1, faixa.max, aleatorio); // +1 garante ter pra onde subtrair
  const operandoB = inteiroEntre(1, operandoA - 1, aleatorio); // resultado sempre > 0
  return { operandoA, operandoB, resultado: operandoA - operandoB };
}

function gerarMultiplicacao(faixa: FaixaOperandos, aleatorio: () => number) {
  const operandoA = inteiroEntre(faixa.min, faixa.max, aleatorio);
  const operandoB = inteiroEntre(faixa.min, faixa.max, aleatorio);
  return { operandoA, operandoB, resultado: operandoA * operandoB };
}

export function gerarDesafioMatematica(
  nivel: number,
  aleatorio: () => number = Math.random,
): DesafioMatematica {
  let operacao: Operacao;
  let conta: { operandoA: number; operandoB: number; resultado: number };

  if (nivel === 1) {
    operacao = 'soma';
    conta = gerarSoma(FAIXA_SOMA_PEQUENA, aleatorio);
  } else if (nivel === 2) {
    operacao = 'soma';
    conta = gerarSoma(FAIXA_SOMA_MAIOR, aleatorio);
  } else if (nivel === 3) {
    operacao = 'subtracao';
    conta = gerarSubtracao(FAIXA_SUBTRACAO, aleatorio);
  } else if (nivel === 4) {
    operacao = aleatorio() < 0.5 ? 'soma' : 'subtracao';
    conta =
      operacao === 'soma'
        ? gerarSoma(FAIXA_SOMA_MAIOR, aleatorio)
        : gerarSubtracao(FAIXA_SUBTRACAO, aleatorio);
  } else {
    operacao = 'multiplicacao';
    conta = gerarMultiplicacao(FAIXA_MULTIPLICACAO, aleatorio);
  }

  return {
    operacao,
    ...conta,
    forma: 'pura',
    alternativas: gerarAlternativasNumericas(conta.resultado, aleatorio),
  };
}
