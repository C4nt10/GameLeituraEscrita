import { useMemo, useState } from 'react';
import { calcularResultado } from '../../services/avaliacao';
import { sugerirProximoNivel } from '../../services/ajuste_dificuldade';
import { gerarDesafioMatematica } from '../../services/gerador_matematica';
import {
  classificacaoAleatoria,
  gerarProblemaContextualizado,
} from '../../services/problema_contextualizado';
import { registrarRodada } from '../../services/historico';
import { gerarId } from '../../lib/gerarId';
import type { DesafioMatematica, FormaMatematica } from '../../models/desafio_matematica';
import type { Classificacao, RegistroHistorico } from '../../models/registro_historico';
import { TelaMatematica } from '../rodada/matematica';
import { TelaResultado } from '../resultado';

/**
 * RodadaMatematica — orquestrador de US2, espelha `RodadaLeitura`
 * (T033b): gera os desafios da rodada, acumula acertos/erros, mostra
 * `TelaResultado` ao final com a sugestão de D-40 quando aplicável.
 *
 * Diferença de `RodadaLeitura`: os desafios são **gerados
 * proceduralmente** (`gerador_matematica`/`problema_contextualizado`),
 * não sorteados de um banco fixo — cada rodada é uma sequência nova.
 *
 * `contadorAjuda` sempre `null` — `data-model.md` não define um
 * contador de ajuda pra rodada de matemática (D-19: "Nulo se tipo =
 * matemática"), mesmo a criança podendo repetir o enunciado quantas
 * vezes quiser (doc001 §4) — a repetição é visível ao vivo em
 * `TelaMatematica`, só não entra no resumo da rodada. Decisão do
 * produto, não uma omissão desta implementação.
 *
 * **Persiste em `historico`** (T015, ligado em 2026-09-25, igual a
 * `RodadaLeitura`): `concluida: true` ao terminar todos os desafios,
 * `concluida: false` ao sair pelo botão de D-39.
 */

export interface ConfiguracaoRodadaMatematica {
  forma: FormaMatematica;
  nivel: number;
  /** Obrigatória quando `forma = 'contextualizada'` (D-23). */
  classificacao?: Classificacao;
  tamanho: 3 | 5 | 8;
}

export interface RodadaMatematicaProps {
  perfilId: string;
  configuracao: ConfiguracaoRodadaMatematica;
  falar: (texto: string) => void | Promise<void>;
  onSairDaRodada: () => void;
  onJogarDeNovo: () => void;
  onSubirDeNivel: (novoNivel: number) => void;
  onVerHistorico?: () => void;
  /** Chamado assim que a rodada é gravada (concluída ou não) — usado pelo fluxo de dupla (T062). */
  onRegistrada?: (registro: RegistroHistorico) => void;
}

type FaseRodada = 'jogando' | 'resultado';

/** Multiplicação (nível 8) só existe como conta pura (D-41) — não há problema contextualizado dela. */
const NIVEL_SO_CONTA_PURA = 8;

function gerarDesafio(configuracao: ConfiguracaoRodadaMatematica): DesafioMatematica {
  if (configuracao.forma === 'contextualizada' && configuracao.nivel !== NIVEL_SO_CONTA_PURA) {
    // "Problema" sem tema escolhido sorteia um tema — antes caía em conta pura em silêncio.
    const classificacao = configuracao.classificacao ?? classificacaoAleatoria();
    return gerarProblemaContextualizado(configuracao.nivel, classificacao);
  }
  return gerarDesafioMatematica(configuracao.nivel);
}

export function RodadaMatematica({
  perfilId,
  configuracao,
  falar,
  onSairDaRodada,
  onJogarDeNovo,
  onSubirDeNivel,
  onVerHistorico,
  onRegistrada,
}: RodadaMatematicaProps) {
  const desafios = useMemo(
    () => Array.from({ length: configuracao.tamanho }, () => gerarDesafio(configuracao)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [configuracao.forma, configuracao.nivel, configuracao.classificacao, configuracao.tamanho],
  );

  const [iniciadaEm] = useState(() => new Date().toISOString());
  const [indice, setIndice] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [fase, setFase] = useState<FaseRodada>('jogando');

  const desafioAtual = desafios[indice];

  function montarRegistro(
    concluida: boolean,
    acertosFinais: number,
    errosFinais: number,
  ): RegistroHistorico {
    const resultado = calcularResultado(acertosFinais, errosFinais);
    return {
      id: gerarId(),
      perfilId,
      tipo: 'matematica',
      modalidade: null,
      formaMatematica: configuracao.forma,
      nivel: configuracao.nivel,
      classificacoes: configuracao.classificacao ? [configuracao.classificacao] : null,
      tamanho: configuracao.tamanho,
      iniciadaEm,
      concluidaEm: concluida ? new Date().toISOString() : null,
      concluida,
      acertos: acertosFinais,
      erros: errosFinais,
      precisao: resultado.precisao,
      estrelas: resultado.estrelas,
      contadorAjuda: null, // D-19 — matemática não tem contador de ajuda no data-model.md
    };
  }

  function avancarOuFinalizar(acertosAtualizados: number) {
    if (indice + 1 >= desafios.length) {
      setFase('resultado');
      const registro = montarRegistro(true, acertosAtualizados, erros);
      void registrarRodada(registro);
      onRegistrada?.(registro);
    } else {
      setIndice((i) => i + 1);
    }
  }

  function handleAcerto() {
    const acertosAtualizados = acertos + 1;
    setAcertos(acertosAtualizados);
    avancarOuFinalizar(acertosAtualizados);
  }

  function handleErro() {
    setErros((e) => e + 1);
  }

  function handleSairDaRodada() {
    const registro = montarRegistro(false, acertos, erros);
    void registrarRodada(registro);
    onRegistrada?.(registro);
    onSairDaRodada();
  }

  if (fase === 'resultado' || !desafioAtual) {
    const resultado = calcularResultado(acertos, erros);
    const nivelSugerido = sugerirProximoNivel(configuracao.nivel, erros);
    const temSugestao = nivelSugerido !== configuracao.nivel;

    return (
      <TelaResultado
        resultado={resultado}
        acertos={acertos}
        erros={erros}
        modalidade={null}
        contadorAjuda={null}
        proximoNivelSugerido={temSugestao ? nivelSugerido : undefined}
        onJogarDeNovo={onJogarDeNovo}
        onSubirDeNivel={() => onSubirDeNivel(configuracao.nivel + 1)}
        onVerHistorico={onVerHistorico}
      />
    );
  }

  return (
    <TelaMatematica
      key={indice}
      desafio={desafioAtual}
      falar={falar}
      onAcerto={handleAcerto}
      onErro={handleErro}
      onSair={handleSairDaRodada}
      posicao={{ atual: indice, total: desafios.length }}
    />
  );
}
