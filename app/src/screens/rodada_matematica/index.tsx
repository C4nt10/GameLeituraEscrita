import { useMemo, useState } from 'react';
import { calcularResultado } from '../../services/avaliacao';
import { sugerirProximoNivel } from '../../services/ajuste_dificuldade';
import { gerarDesafioMatematica } from '../../services/gerador_matematica';
import { gerarProblemaContextualizado } from '../../services/problema_contextualizado';
import type { DesafioMatematica, FormaMatematica } from '../../models/desafio_matematica';
import type { Classificacao } from '../../models/registro_historico';
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
 * **Não persiste nada ainda** — mesma pendência documentada em
 * `RodadaLeitura`: falta perfil/configuração de verdade (T046) pra
 * montar a `Rodada` antes de gravar em `historico`.
 */

export interface ConfiguracaoRodadaMatematica {
  forma: FormaMatematica;
  nivel: number;
  /** Obrigatória quando `forma = 'contextualizada'` (D-23). */
  classificacao?: Classificacao;
  tamanho: 3 | 5 | 8;
}

export interface RodadaMatematicaProps {
  configuracao: ConfiguracaoRodadaMatematica;
  falar: (texto: string) => void | Promise<void>;
  onSairDaRodada: () => void;
  onJogarDeNovo: () => void;
  onSubirDeNivel: (novoNivel: number) => void;
}

type FaseRodada = 'jogando' | 'resultado';

function gerarDesafio(configuracao: ConfiguracaoRodadaMatematica): DesafioMatematica {
  if (configuracao.forma === 'contextualizada' && configuracao.classificacao) {
    return gerarProblemaContextualizado(configuracao.nivel, configuracao.classificacao);
  }
  return gerarDesafioMatematica(configuracao.nivel);
}

export function RodadaMatematica({
  configuracao,
  falar,
  onSairDaRodada,
  onJogarDeNovo,
  onSubirDeNivel,
}: RodadaMatematicaProps) {
  const desafios = useMemo(
    () => Array.from({ length: configuracao.tamanho }, () => gerarDesafio(configuracao)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [configuracao.forma, configuracao.nivel, configuracao.classificacao, configuracao.tamanho],
  );

  const [indice, setIndice] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [fase, setFase] = useState<FaseRodada>('jogando');

  const desafioAtual = desafios[indice];

  function avancarOuFinalizar() {
    if (indice + 1 >= desafios.length) {
      setFase('resultado');
    } else {
      setIndice((i) => i + 1);
    }
  }

  function handleAcerto() {
    setAcertos((a) => a + 1);
    avancarOuFinalizar();
  }

  function handleErro() {
    setErros((e) => e + 1);
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
      />
    );
  }

  return (
    <TelaMatematica
      desafio={desafioAtual}
      falar={falar}
      onAcerto={handleAcerto}
      onErro={handleErro}
      onSair={onSairDaRodada}
    />
  );
}
