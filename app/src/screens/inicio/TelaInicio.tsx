import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Classificacao } from '../../models/registro_historico';
import { combinacoesDisponiveis } from '../../services/banco_de_conteudo';
import type { Configuracao } from '../../services/configuracao';
import { cor, fonte, tamanho } from '../../theme/tema';
import { Botao } from '../../ui/Botao';
import { Estrela, Mascote } from '../../ui/icones';
import { Redondo } from '../../ui/Redondo';
import { TelaBase } from '../../ui/TelaBase';
import { ZonasDoDesafio } from '../../ui/ZonasDoDesafio';
import type { EscolhaRodada, Tipo } from '../configuracao/TelaConfiguracao';
import { FolhaDoAdulto } from './FolhaDoAdulto';
import {
  escolhaParaRodada,
  modoInicial,
  modosDoTipo,
  NIVEL_MATEMATICA_SO_CONTA,
  podeIniciar,
  resumoDaEscolha,
  TIPOS_DA_CRIANCA,
  type EstadoDoInicio,
  type IdDoModo,
} from './logica';
import { BotaoDoAdulto, LinhaDeModo, TileDeTipo } from './pecas';

export interface TelaInicioProps {
  configuracaoInicial: Configuracao;
  /** Microfone E reconhecimento de fala reais (D-44) — `leituraVozDisponivel`. */
  leituraVozDisponivel: boolean;
  motivoLeituraVozIndisponivel: string | null;
  onIniciar: (escolha: EscolhaRodada) => void;
  /** CU-06 — histórico ("Minhas estrelas") a um toque. */
  onAbrirHistorico: () => void;
}

/**
 * Início da criança (D-50 a D-55): escolhe o tipo e o jeito de jogar e toca em
 * "Jogar!". Tudo o que é do adulto vive na folha (engrenagem, segurar 1,2 s).
 * Substitui a `TelaConfiguracao` **sem mudar nenhuma regra**: a mesma
 * `EscolhaRodada` sai daqui, com padrão válido pra tudo (Princípio VII).
 */
export function TelaInicio({
  configuracaoInicial,
  leituraVozDisponivel,
  motivoLeituraVozIndisponivel,
  onIniciar,
  onAbrirHistorico,
}: TelaInicioProps) {
  const [estado, setEstado] = useState<EstadoDoInicio>(() => ({
    tipo: 'leitura',
    modo: modoInicial('leitura', configuracaoInicial.ultimaModalidade, leituraVozDisponivel),
    nivelLeitura: configuracaoInicial.ultimoNivel,
    nivelMatematica: configuracaoInicial.ultimoNivelMatematica,
    classificacao: null,
    tamanho: configuracaoInicial.ultimoTamanho,
    formato: 'sozinho',
    formatoDupla: null,
  }));
  const [folhaAberta, setFolhaAberta] = useState(false);

  const combinacoes = useMemo(() => combinacoesDisponiveis(), []);
  const niveisDeLeitura = useMemo(
    () => [...new Set(combinacoes.map((c) => c.nivel))].sort((a, b) => a - b),
    [combinacoes],
  );
  const temasDoNivel = useMemo(
    () =>
      combinacoes
        .filter((c) => c.nivel === estado.nivelLeitura && c.classificacao !== null)
        .map((c) => c.classificacao as Classificacao),
    [combinacoes, estado.nivelLeitura],
  );

  const modos = modosDoTipo(estado.tipo, {
    vozDisponivel: leituraVozDisponivel,
    nivelMatematica: estado.nivelMatematica,
  });
  const pronto = podeIniciar(estado, leituraVozDisponivel);

  function escolherTipo(tipo: Tipo) {
    setEstado((e) => ({
      ...e,
      tipo,
      modo: modoInicial(tipo, configuracaoInicial.ultimaModalidade, leituraVozDisponivel),
    }));
  }

  function alterar(mudanca: Partial<EstadoDoInicio>) {
    setEstado((e) => {
      const proximo = { ...e, ...mudanca };
      // Historinha não existe no nível 8 (multiplicação): volta pra Conta em vez de travar.
      if (proximo.modo === 'historinha' && proximo.nivelMatematica === NIVEL_MATEMATICA_SO_CONTA) {
        proximo.modo = 'conta';
      }
      return proximo;
    });
  }

  function jogar() {
    if (!pronto) return;
    onIniciar(escolhaParaRodada(estado, configuracaoInicial.ultimaModalidade));
  }

  return (
    <TelaBase>
      <View style={estilos.topo}>
        <Redondo acessibilidade="Minhas estrelas" onPress={onAbrirHistorico}>
          <Estrela tipo="cheia" tamanho={30} />
        </Redondo>
        <BotaoDoAdulto aoAbrir={() => setFolhaAberta(true)} />
      </View>

      <ZonasDoDesafio
        estimulo={
          <>
            <View style={estilos.ola}>
              <Mascote tamanho={58} />
              <Text allowFontScaling={false} style={estilos.titulo}>
                Oi! Do que vamos brincar?
              </Text>
            </View>
            <View style={estilos.tipos}>
              {TIPOS_DA_CRIANCA.map((tipo) => (
                <TileDeTipo
                  key={tipo.id}
                  tipo={tipo}
                  selecionado={estado.tipo === tipo.id}
                  onPress={() => escolherTipo(tipo.id)}
                />
              ))}
            </View>
          </>
        }
        resposta={
          <>
            <View style={estilos.modos}>
              {modos.map((modo) => (
                <LinhaDeModo
                  key={modo.id}
                  modo={modo}
                  selecionado={estado.modo === modo.id}
                  onPress={() => alterar({ modo: modo.id as IdDoModo })}
                />
              ))}
            </View>
            <View style={estilos.pe}>
              <Text allowFontScaling={false} style={estilos.resumo}>
                {resumoDaEscolha(estado)}
              </Text>
              <Botao texto="Jogar!" icone="play" onPress={jogar} desabilitado={!pronto} cheio />
            </View>
          </>
        }
      />

      <FolhaDoAdulto
        visivel={folhaAberta}
        aoFechar={() => setFolhaAberta(false)}
        estado={estado}
        alterar={alterar}
        niveisDeLeitura={niveisDeLeitura}
        temasDoNivel={temasDoNivel}
        motivoDaVoz={leituraVozDisponivel ? null : motivoLeituraVozIndisponivel}
      />
    </TelaBase>
  );
}

const estilos = StyleSheet.create({
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ola: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  titulo: {
    flex: 1,
    fontFamily: fonte.display,
    fontSize: tamanho.titulo,
    lineHeight: 30,
    color: cor.tinta,
  },
  tipos: { flexDirection: 'row', justifyContent: 'center', gap: 10, flexWrap: 'wrap' },
  modos: { alignSelf: 'stretch', gap: 8, maxWidth: 520 },
  pe: { alignSelf: 'stretch', gap: 6, maxWidth: 520 },
  resumo: {
    alignSelf: 'center',
    fontFamily: fonte.textoForte,
    fontSize: tamanho.legenda,
    color: cor.tinta2,
  },
});
