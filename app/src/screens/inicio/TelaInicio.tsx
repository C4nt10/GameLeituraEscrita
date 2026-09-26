import { useMemo, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { Classificacao } from '../../models/registro_historico';
import { combinacoesDisponiveis } from '../../services/banco_de_conteudo';
import type { Configuracao } from '../../services/configuracao';
import { cor, fonte, tamanho } from '../../theme/tema';
import { Botao } from '../../ui/Botao';
import { Estrela, Mascote } from '../../ui/icones';
import { Redondo } from '../../ui/Redondo';
import { TelaBase } from '../../ui/TelaBase';
import { ZonasDoDesafio } from '../../ui/ZonasDoDesafio';
import type { EscolhaRodada, Tipo } from './tipos';
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
  const { width, height } = useWindowDimensions();
  const deitado = width > height;

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

  const saudacao = (
    <View style={estilos.ola}>
      <Mascote tamanho={deitado ? 40 : 58} />
      <Text allowFontScaling={false} style={[estilos.titulo, deitado && estilos.tituloDeitado]}>
        Oi! Do que vamos brincar?
      </Text>
    </View>
  );
  const tipos = (
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
  );
  const modosDeJogo = (
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
  );
  const pe = (
    <View style={estilos.pe}>
      <Text allowFontScaling={false} style={estilos.resumo}>
        {resumoDaEscolha(estado)}
      </Text>
      <Botao texto="Jogar!" icone="play" onPress={jogar} desabilitado={!pronto} cheio />
    </View>
  );

  // Deitado só há ~275 dp de altura pra tudo: a saudação sobe pra linha do topo e "Jogar!" fica
  // embaixo dos tipos, pra não sair da tela — a coluna da direita fica só com os jeitos de jogar.
  return (
    <TelaBase>
      <View style={estilos.topo}>
        <Redondo acessibilidade="Minhas estrelas" onPress={onAbrirHistorico}>
          <Estrela tipo="cheia" tamanho={30} />
        </Redondo>
        {deitado ? saudacao : null}
        <BotaoDoAdulto aoAbrir={() => setFolhaAberta(true)} />
      </View>

      <ZonasDoDesafio
        estimulo={
          deitado ? (
            <>
              {tipos}
              {pe}
            </>
          ) : (
            <>
              {saudacao}
              {tipos}
            </>
          )
        }
        resposta={
          deitado ? (
            modosDeJogo
          ) : (
            <>
              {modosDeJogo}
              {pe}
            </>
          )
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
  ola: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 },
  titulo: {
    flex: 1,
    fontFamily: fonte.display,
    fontSize: tamanho.titulo,
    lineHeight: 30,
    color: cor.tinta,
  },
  tituloDeitado: { flex: 0, fontSize: 22, lineHeight: 26 },
  tipos: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    flexWrap: 'wrap',
    paddingTop: 8,
  },
  modos: { alignSelf: 'stretch', gap: 8, maxWidth: 520 },
  pe: { alignSelf: 'stretch', gap: 6, maxWidth: 520 },
  resumo: {
    alignSelf: 'center',
    fontFamily: fonte.textoForte,
    fontSize: tamanho.legenda,
    color: cor.tinta2,
  },
});
