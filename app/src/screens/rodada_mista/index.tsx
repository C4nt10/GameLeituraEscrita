import { useMemo, useState } from 'react';
import { gerarId } from '../../lib/gerarId';
import { criarDesafioLeitura } from '../../models/desafio_leitura';
import type { Classificacao, RegistroHistorico } from '../../models/registro_historico';
import { sugerirProximoNivel } from '../../services/ajuste_dificuldade';
import { calcularResultado } from '../../services/avaliacao';
import { sortearDesafios } from '../../services/banco_de_conteudo';
import { gerarDesafioMatematica } from '../../services/gerador_matematica';
import { registrarRodada } from '../../services/historico';
import { ordemIntercalada, type TipoDoItemMisto } from '../../services/rodada_mista/intercalar';
import { TelaDitado } from '../rodada/ditado';
import { TelaMatematica } from '../rodada/matematica';
import { TelaResultadoMisto } from '../resultado_misto';

/**
 * RodadaMista — orquestrador do tipo "Misturado" (D-57, FR-033): intercala
 * desafios de leitura e de matemática numa sequência só, sem transição
 * perceptível de "duas rodadas" pra criança. Por baixo, dois placares
 * independentes (acertos/erros/ajuda de leitura; acertos/erros de
 * matemática, sem ajuda — D-19) viram **dois `RegistroHistorico` normais**
 * ao final — nunca uma nota combinada (D-20) —, exatamente o mesmo formato
 * que `RodadaLeitura`/`RodadaMatematica` já produzem sozinhas. Nenhuma
 * mudança de schema: `tamanho` de cada registro é o da sua metade, não do
 * total (`RegistroHistorico.tamanho`, comentário em `models/`).
 *
 * MVP simplificado (A-39, A-40, doc002 §18): a metade de leitura é sempre
 * Ouvir e montar e a de matemática sempre Conta pura — sem seletor — e o
 * tipo não funciona em dupla.
 */

export interface ConfiguracaoRodadaMista {
  nivelLeitura: number;
  /** `null` só no nível 1 (D-22). */
  classificacao: Classificacao | null;
  nivelMatematica: number;
  /** Total de desafios da rodada — dividido o mais igual possível entre os dois tipos (D-57). */
  tamanho: 3 | 5 | 8;
}

export interface DependenciasRodadaMista {
  /** Fala a palavra do desafio de leitura atual (sempre Ouvir e montar, A-39). */
  falar: (texto: string) => void | Promise<void>;
  /** Pool de letras candidatas pras alternativas erradas do Ditado nível 1. */
  candidatasLetraNivel1: string[];
}

export interface RodadaMistaProps {
  perfilId: string;
  configuracao: ConfiguracaoRodadaMista;
  dependencias: DependenciasRodadaMista;
  /** D-39 — sai a qualquer momento, nenhum dos dois registros fica marcado como concluído. */
  onSairDaRodada: () => void;
  onJogarDeNovo: () => void;
  onVerHistorico?: () => void;
}

type FaseRodada = 'jogando' | 'resultado';

interface ItemDoFeed {
  tipo: TipoDoItemMisto;
  indiceNoTipo: number;
}

export function RodadaMista({
  perfilId,
  configuracao,
  dependencias,
  onSairDaRodada,
  onJogarDeNovo,
  onVerHistorico,
}: RodadaMistaProps) {
  // Leitura fica com a sobra quando o tamanho é ímpar (3 → 2+1, 5 → 3+2, 8 → 4+4 — D-57).
  const qtdLeitura = Math.ceil(configuracao.tamanho / 2);
  const qtdMatematica = configuracao.tamanho - qtdLeitura;

  const itensLeitura = useMemo(
    () => sortearDesafios(configuracao.nivelLeitura, configuracao.classificacao, qtdLeitura),
    [configuracao.nivelLeitura, configuracao.classificacao, qtdLeitura],
  );
  const itensMatematica = useMemo(
    () =>
      Array.from({ length: qtdMatematica }, () =>
        gerarDesafioMatematica(configuracao.nivelMatematica),
      ),
    [configuracao.nivelMatematica, qtdMatematica],
  );
  // Qual tipo começa é sorteado uma vez por rodada, pra não ficar sempre na mesma ordem (D-57).
  const [comecaLeitura] = useState(() => Math.random() < 0.5);
  const feed = useMemo<ItemDoFeed[]>(() => {
    const ordem = ordemIntercalada(itensLeitura.length, itensMatematica.length, comecaLeitura);
    let l = 0;
    let m = 0;
    return ordem.map((tipo) => {
      if (tipo === 'leitura') return { tipo, indiceNoTipo: l++ };
      return { tipo, indiceNoTipo: m++ };
    });
  }, [itensLeitura.length, itensMatematica.length, comecaLeitura]);

  const [iniciadaEm] = useState(() => new Date().toISOString());
  const [indice, setIndice] = useState(0);
  const [acertosLeitura, setAcertosLeitura] = useState(0);
  const [errosLeitura, setErrosLeitura] = useState(0);
  const [ajudaLeitura, setAjudaLeitura] = useState(0);
  const [acertosMatematica, setAcertosMatematica] = useState(0);
  const [errosMatematica, setErrosMatematica] = useState(0);
  const [fase, setFase] = useState<FaseRodada>('jogando');

  const itemAtual = feed[indice];

  // `acertosFinais` é explícito (não lido do state) na hora de fechar o registro: `setState` não
  // reflete no closure desta mesma função síncrona — mesmo cuidado de `RodadaLeitura`/`RodadaMatematica.
  function montarRegistroLeitura(
    concluida: boolean,
    acertosFinais = acertosLeitura,
  ): RegistroHistorico {
    const resultado = calcularResultado(acertosFinais, errosLeitura);
    return {
      id: gerarId(),
      perfilId,
      tipo: 'leitura',
      modalidade: 'ditado',
      formaMatematica: null,
      nivel: configuracao.nivelLeitura,
      classificacoes: configuracao.classificacao ? [configuracao.classificacao] : null,
      tamanho: qtdLeitura,
      iniciadaEm,
      concluidaEm: concluida ? new Date().toISOString() : null,
      concluida,
      acertos: acertosFinais,
      erros: errosLeitura,
      precisao: resultado.precisao,
      estrelas: resultado.estrelas,
      contadorAjuda: ajudaLeitura,
    };
  }

  function montarRegistroMatematica(
    concluida: boolean,
    acertosFinais = acertosMatematica,
  ): RegistroHistorico {
    const resultado = calcularResultado(acertosFinais, errosMatematica);
    return {
      id: gerarId(),
      perfilId,
      tipo: 'matematica',
      modalidade: null,
      formaMatematica: 'pura',
      nivel: configuracao.nivelMatematica,
      classificacoes: null,
      tamanho: qtdMatematica,
      iniciadaEm,
      concluidaEm: concluida ? new Date().toISOString() : null,
      concluida,
      acertos: acertosFinais,
      erros: errosMatematica,
      precisao: resultado.precisao,
      estrelas: resultado.estrelas,
      contadorAjuda: null, // D-19 — matemática não tem contador de ajuda
    };
  }

  function avancarOuFinalizar(acertosLeituraAtual: number, acertosMatematicaAtual: number) {
    if (indice + 1 >= feed.length) {
      setFase('resultado');
      void registrarRodada(montarRegistroLeitura(true, acertosLeituraAtual));
      void registrarRodada(montarRegistroMatematica(true, acertosMatematicaAtual));
    } else {
      setIndice((i) => i + 1);
    }
  }

  function handleAcertoLeitura() {
    const acertosAtualizados = acertosLeitura + 1;
    setAcertosLeitura(acertosAtualizados);
    avancarOuFinalizar(acertosAtualizados, acertosMatematica);
  }
  function handleAcertoMatematica() {
    const acertosAtualizados = acertosMatematica + 1;
    setAcertosMatematica(acertosAtualizados);
    avancarOuFinalizar(acertosLeitura, acertosAtualizados);
  }
  function handleErroLeitura() {
    setErrosLeitura((e) => e + 1);
  }
  function handleErroMatematica() {
    setErrosMatematica((e) => e + 1);
  }
  function handleAjudaLeitura() {
    setAjudaLeitura((a) => a + 1);
  }

  function handleSairDaRodada() {
    void registrarRodada(montarRegistroLeitura(false));
    void registrarRodada(montarRegistroMatematica(false));
    onSairDaRodada();
  }

  if (fase === 'resultado' || !itemAtual) {
    const resultadoLeitura = calcularResultado(acertosLeitura, errosLeitura);
    const resultadoMatematica = calcularResultado(acertosMatematica, errosMatematica);
    const nivelLeituraSugerido = sugerirProximoNivel(configuracao.nivelLeitura, errosLeitura);
    const nivelMatematicaSugerido = sugerirProximoNivel(
      configuracao.nivelMatematica,
      errosMatematica,
    );

    return (
      <TelaResultadoMisto
        leitura={{
          resultado: resultadoLeitura,
          acertos: acertosLeitura,
          erros: errosLeitura,
          contadorAjuda: ajudaLeitura,
          proximoNivelSugerido:
            nivelLeituraSugerido !== configuracao.nivelLeitura ? nivelLeituraSugerido : undefined,
        }}
        matematica={{
          resultado: resultadoMatematica,
          acertos: acertosMatematica,
          erros: errosMatematica,
          proximoNivelSugerido:
            nivelMatematicaSugerido !== configuracao.nivelMatematica
              ? nivelMatematicaSugerido
              : undefined,
        }}
        onJogarDeNovo={onJogarDeNovo}
        onVerHistorico={onVerHistorico}
      />
    );
  }

  if (itemAtual.tipo === 'leitura') {
    const item = itensLeitura[itemAtual.indiceNoTipo];
    const desafioAtual = criarDesafioLeitura(item, 'ditado');
    return (
      <TelaDitado
        key={indice}
        desafio={desafioAtual}
        candidatasLetra={dependencias.candidatasLetraNivel1}
        falar={() => dependencias.falar(desafioAtual.palavra)}
        onAcerto={handleAcertoLeitura}
        onErro={handleErroLeitura}
        onAjuda={handleAjudaLeitura}
        onSair={handleSairDaRodada}
        ajudas={ajudaLeitura}
        posicao={{ atual: indice, total: feed.length }}
      />
    );
  }

  const desafioMatematicaAtual = itensMatematica[itemAtual.indiceNoTipo];
  return (
    <TelaMatematica
      key={indice}
      desafio={desafioMatematicaAtual}
      falar={dependencias.falar}
      onAcerto={handleAcertoMatematica}
      onErro={handleErroMatematica}
      onSair={handleSairDaRodada}
      posicao={{ atual: indice, total: feed.length }}
    />
  );
}
