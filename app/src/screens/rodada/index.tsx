import { useMemo, useState } from 'react';
import { criarDesafioLeitura } from '../../models/desafio_leitura';
import type { Classificacao, Modalidade, RegistroHistorico } from '../../models/registro_historico';
import { gerarId } from '../../lib/gerarId';
import { sortearDesafios } from '../../services/banco_de_conteudo';
import { calcularResultado } from '../../services/avaliacao';
import { sugerirProximoNivel } from '../../services/ajuste_dificuldade';
import { registrarRodada } from '../../services/historico';
import { TelaDitado } from './ditado';
import { TelaLeituraMontar } from './leitura_montar';
import { TelaLeituraVoz } from './leitura_voz';
import { TelaResultado } from '../resultado';

/**
 * RodadaLeitura — orquestrador que faltava pra Fase 3 ser "MVP jogável"
 * de verdade, não só telas isoladas (tasks.md, nota do checkpoint de
 * US1, 2026-09-25). Sorteia os desafios (T014/`sortearDesafios`),
 * escolhe a tela certa pra modalidade configurada (uma só por rodada —
 * rodadas mistas com vários tipos de desafio ficaram pra depois, pedido
 * do dono do projeto), acumula acertos/erros/ajuda da rodada inteira
 * (não por desafio — D-19), e mostra o resultado ao final
 * (`avaliacao.calcularResultado`, T018) com a sugestão de D-40 quando
 * aplicável.
 *
 * **Persiste em `historico`** (T015, ligado em 2026-09-25 — Fase 5
 * trouxe `perfilId` de verdade via T046/configuração): ao concluir
 * todos os desafios, grava `concluida: true`. Ao sair pelo botão de
 * D-39, grava `concluida: false` (mesmo tratamento de qualquer
 * abandono, `data-model.md`) — a rodada fica registrada mesmo
 * incompleta, só não conta pro limite de 50 nem aparece no histórico
 * exibido (regra já implementada em `historico/regras.ts`, T009).
 */

export interface ConfiguracaoRodadaLeitura {
  modalidade: Modalidade;
  nivel: number;
  /** `null` só no nível 1 (D-22). */
  classificacao: Classificacao | null;
  tamanho: 3 | 5 | 8;
}

export interface DependenciasRodadaLeitura {
  /** Fala a palavra/letra do desafio atual — nível 1 devia usar clipe gravado (D-27), ainda não existe (T016). */
  falar: (texto: string) => void | Promise<void>;
  /** Pool de letras candidatas pras alternativas erradas do Ditado nível 1. */
  candidatasLetraNivel1: string[];
  iniciarGravacao: () => Promise<void>;
  pararGravacao: () => Promise<string>;
  transcrever: (audioUri: string) => Promise<string>;
  vocabularioConhecido?: Set<string>;
}

export interface RodadaLeituraProps {
  perfilId: string;
  configuracao: ConfiguracaoRodadaLeitura;
  dependencias: DependenciasRodadaLeitura;
  /** D-39 — sai a qualquer momento, rodada não fica marcada como concluída. */
  onSairDaRodada: () => void;
  onJogarDeNovo: () => void;
  onSubirDeNivel: (novoNivel: number) => void;
  onVerHistorico?: () => void;
  /** Chamado assim que a rodada é gravada (concluída ou não) — usado pelo fluxo de dupla (T062) pra saber o id gravado. */
  onRegistrada?: (registro: RegistroHistorico) => void;
}

type FaseRodada = 'jogando' | 'resultado';

export function RodadaLeitura({
  perfilId,
  configuracao,
  dependencias,
  onSairDaRodada,
  onJogarDeNovo,
  onSubirDeNivel,
  onVerHistorico,
  onRegistrada,
}: RodadaLeituraProps) {
  const desafiosSorteados = useMemo(
    () => sortearDesafios(configuracao.nivel, configuracao.classificacao, configuracao.tamanho),
    [configuracao.nivel, configuracao.classificacao, configuracao.tamanho],
  );

  const [iniciadaEm] = useState(() => new Date().toISOString());
  const [indice, setIndice] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [contadorAjuda, setContadorAjuda] = useState(0);
  const [fase, setFase] = useState<FaseRodada>('jogando');

  const itemAtual = desafiosSorteados[indice];

  function montarRegistro(
    concluida: boolean,
    acertosFinais: number,
    errosFinais: number,
    ajudaFinal: number,
  ): RegistroHistorico {
    const resultado = calcularResultado(acertosFinais, errosFinais);
    return {
      id: gerarId(),
      perfilId,
      tipo: 'leitura',
      modalidade: configuracao.modalidade,
      formaMatematica: null,
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
      contadorAjuda: ajudaFinal,
    };
  }

  function avancarOuFinalizar(acertosAtualizados: number) {
    if (indice + 1 >= desafiosSorteados.length) {
      setFase('resultado');
      const registro = montarRegistro(true, acertosAtualizados, erros, contadorAjuda);
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

  // D-06: toda tentativa errada conta, mesmo repetida no mesmo desafio —
  // não avança pro próximo (Princípio II, a criança tenta de novo).
  function handleErro() {
    setErros((e) => e + 1);
  }

  function handleAjuda() {
    setContadorAjuda((c) => c + 1);
  }

  function handleSairDaRodada() {
    const registro = montarRegistro(false, acertos, erros, contadorAjuda);
    void registrarRodada(registro);
    onRegistrada?.(registro);
    onSairDaRodada();
  }

  if (fase === 'resultado' || !itemAtual) {
    const resultado = calcularResultado(acertos, erros);
    const nivelSugerido = sugerirProximoNivel(configuracao.nivel, erros);
    const temSugestao = nivelSugerido !== configuracao.nivel;

    return (
      <TelaResultado
        resultado={resultado}
        acertos={acertos}
        erros={erros}
        modalidade={configuracao.modalidade}
        contadorAjuda={contadorAjuda}
        proximoNivelSugerido={temSugestao ? nivelSugerido : undefined}
        onJogarDeNovo={onJogarDeNovo}
        onSubirDeNivel={() => onSubirDeNivel(configuracao.nivel + 1)}
        onVerHistorico={onVerHistorico}
      />
    );
  }

  const desafioAtual = criarDesafioLeitura(itemAtual, configuracao.modalidade);

  if (configuracao.modalidade === 'ditado') {
    return (
      <TelaDitado
        key={indice}
        desafio={desafioAtual}
        candidatasLetra={dependencias.candidatasLetraNivel1}
        falar={() => dependencias.falar(desafioAtual.palavra)}
        onAcerto={handleAcerto}
        onErro={handleErro}
        onAjuda={handleAjuda}
        onSair={handleSairDaRodada}
        ajudas={contadorAjuda}
        posicao={{ atual: indice, total: desafiosSorteados.length }}
      />
    );
  }

  if (configuracao.modalidade === 'leitura_montar') {
    return (
      <TelaLeituraMontar
        key={indice}
        desafio={desafioAtual}
        onAcerto={handleAcerto}
        onErro={handleErro}
        onAjuda={handleAjuda}
        onSair={handleSairDaRodada}
        ajudas={contadorAjuda}
        posicao={{ atual: indice, total: desafiosSorteados.length }}
      />
    );
  }

  return (
    <TelaLeituraVoz
      key={indice}
      desafio={desafioAtual}
      vocabularioConhecido={dependencias.vocabularioConhecido}
      iniciarGravacao={dependencias.iniciarGravacao}
      pararGravacao={dependencias.pararGravacao}
      transcrever={dependencias.transcrever}
      onAcerto={handleAcerto}
      onErro={handleErro}
      onAjuda={handleAjuda}
      onSair={handleSairDaRodada}
    />
  );
}
