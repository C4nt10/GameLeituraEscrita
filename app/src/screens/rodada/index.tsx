import { useMemo, useState } from 'react';
import { criarDesafioLeitura } from '../../models/desafio_leitura';
import type { Classificacao, Modalidade } from '../../models/registro_historico';
import { sortearDesafios } from '../../services/banco_de_conteudo';
import { calcularResultado } from '../../services/avaliacao';
import { sugerirProximoNivel } from '../../services/ajuste_dificuldade';
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
 * **Não persiste nada ainda** — `historico.registrarRodada` (T015) não
 * é chamado daqui. Falta decidir onde a `Rodada` (perfilId, tipo,
 * iniciada_em etc. — `data-model.md`) é montada antes de persistir;
 * isso depende de haver um perfil/configuração de verdade vindos de
 * fora (T046, Fase 5), então a persistência fica pra quando isso
 * existir. Por ora, o resultado só é mostrado na tela, não gravado.
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
  configuracao: ConfiguracaoRodadaLeitura;
  dependencias: DependenciasRodadaLeitura;
  /** D-39 — sai a qualquer momento, rodada não fica marcada como concluída. */
  onSairDaRodada: () => void;
  onJogarDeNovo: () => void;
  onSubirDeNivel: (novoNivel: number) => void;
}

type FaseRodada = 'jogando' | 'resultado';

export function RodadaLeitura({
  configuracao,
  dependencias,
  onSairDaRodada,
  onJogarDeNovo,
  onSubirDeNivel,
}: RodadaLeituraProps) {
  const desafiosSorteados = useMemo(
    () => sortearDesafios(configuracao.nivel, configuracao.classificacao, configuracao.tamanho),
    [configuracao.nivel, configuracao.classificacao, configuracao.tamanho],
  );

  const [indice, setIndice] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [contadorAjuda, setContadorAjuda] = useState(0);
  const [fase, setFase] = useState<FaseRodada>('jogando');

  const itemAtual = desafiosSorteados[indice];

  function avancarOuFinalizar() {
    if (indice + 1 >= desafiosSorteados.length) {
      setFase('resultado');
    } else {
      setIndice((i) => i + 1);
    }
  }

  function handleAcerto() {
    setAcertos((a) => a + 1);
    avancarOuFinalizar();
  }

  // D-06: toda tentativa errada conta, mesmo repetida no mesmo desafio —
  // não avança pro próximo (Princípio II, a criança tenta de novo).
  function handleErro() {
    setErros((e) => e + 1);
  }

  function handleAjuda() {
    setContadorAjuda((c) => c + 1);
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
      />
    );
  }

  const desafioAtual = criarDesafioLeitura(itemAtual, configuracao.modalidade);

  if (configuracao.modalidade === 'ditado') {
    return (
      <TelaDitado
        desafio={desafioAtual}
        candidatasLetra={dependencias.candidatasLetraNivel1}
        falar={() => dependencias.falar(desafioAtual.palavra)}
        onAcerto={handleAcerto}
        onErro={handleErro}
        onAjuda={handleAjuda}
        onSair={onSairDaRodada}
      />
    );
  }

  if (configuracao.modalidade === 'leitura_montar') {
    return (
      <TelaLeituraMontar
        desafio={desafioAtual}
        onAcerto={handleAcerto}
        onErro={handleErro}
        onAjuda={handleAjuda}
        onSair={onSairDaRodada}
      />
    );
  }

  return (
    <TelaLeituraVoz
      desafio={desafioAtual}
      vocabularioConhecido={dependencias.vocabularioConhecido}
      iniciarGravacao={dependencias.iniciarGravacao}
      pararGravacao={dependencias.pararGravacao}
      transcrever={dependencias.transcrever}
      onAcerto={handleAcerto}
      onErro={handleErro}
      onAjuda={handleAjuda}
      onSair={onSairDaRodada}
    />
  );
}
