import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { MontagemPalavra } from '../../../components/MontagemPalavra';
import type { DesafioLeitura } from '../../../models/desafio_leitura';
import { duracaoDoMovimento } from '../../../theme/helpers';
import { caixaDaLetra, cor, fonte, movimento, raio, tamanho } from '../../../theme/tema';
import { BarraDoDesafio } from '../../../ui/BarraDoDesafio';
import { Botao } from '../../../ui/Botao';
import { useReduzirMovimento } from '../../../ui/movimento';
import { TelaBase } from '../../../ui/TelaBase';
import { ZonasDoDesafio } from '../../../ui/ZonasDoDesafio';

const DURACAO_REVELACAO_PADRAO_MS = movimento.palavraVisivel;

/**
 * Tela de desafio — Ler e montar (Leitura · montar, T030/T110, D-18). A
 * palavra aparece e some **sozinha, sem áudio nenhum** (essa é a diferença
 * pro Ouvir e montar — lê, não ouve). "Ver de novo" revela de novo e conta como
 * espiada (D-05, D-19). As peças só liberam depois que a palavra some, senão
 * vira cópia. A montagem (`MontagemPalavra`) fica sempre montada, só travada
 * enquanto a palavra está visível — pra não perder o progresso quando a
 * criança pede pra ver de novo no meio da montagem.
 *
 * Visual do padrão "Letra Viva": quadro amarelo com a palavra em Andika
 * maiúscula e barra de tempo que esvazia em 3 s; quando some, "????" em
 * `tinta2` (A-34: em `grade` ele sumia, 1,2:1).
 */
export interface TelaLeituraMontarProps {
  desafio: DesafioLeitura;
  duracaoRevelacaoMs?: number;
  onAcerto: () => void;
  onErro: () => void;
  /** D-39 — botão de sair sempre visível, nunca esconde. */
  onSair: () => void;
  /** Notifica quem orquestra a rodada a cada espiada — contador é por rodada, não por desafio (D-19). */
  onAjuda?: () => void;
  /** Ajudas da rodada inteira até agora (D-19) — vem do orquestrador, não zera a cada palavra. */
  ajudas?: number;
  /** Posição do desafio na rodada (trilha de progresso). */
  posicao?: { atual: number; total: number };
}

export function TelaLeituraMontar({
  desafio,
  duracaoRevelacaoMs = DURACAO_REVELACAO_PADRAO_MS,
  onAcerto,
  onErro,
  onSair,
  onAjuda,
  ajudas = 0,
  posicao = { atual: 0, total: 1 },
}: TelaLeituraMontarProps) {
  const reduzir = useReduzirMovimento();
  const [revelando, setRevelando] = useState(false);
  const [acertou, setAcertou] = useState(false);
  const [tempo] = useState(() => new Animated.Value(1));

  useEffect(() => {
    revelar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desafio.palavra]);

  function revelar() {
    onAjuda?.();
    setRevelando(true);
    tempo.setValue(1);
    Animated.timing(tempo, {
      toValue: 0,
      duration: duracaoDoMovimento(duracaoRevelacaoMs, reduzir) || duracaoRevelacaoMs,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
    setTimeout(() => setRevelando(false), duracaoRevelacaoMs);
  }

  // depois de montar certo a palavra fica verde por um instante (não é erro nem prêmio extra), e segue
  useEffect(() => {
    if (!acertou) return;
    const espera = setTimeout(onAcerto, 800);
    return () => clearTimeout(espera);
  }, [acertou, onAcerto]);

  const palavra = caixaDaLetra(desafio.palavra);

  return (
    <TelaBase>
      <BarraDoDesafio
        aoSair={onSair}
        total={posicao.total}
        atual={posicao.atual}
        contador={{ rotulo: 'espiou', valor: ajudas }}
      />

      <ZonasDoDesafio
        estimulo={
          <>
            <View style={estilos.quadro}>
              {revelando || acertou ? (
                <>
                  <Text
                    allowFontScaling={false}
                    style={[estilos.palavra, acertou && { color: cor.verde.base }]}
                  >
                    {palavra}
                  </Text>
                  {!acertou ? (
                    <View style={estilos.tempo}>
                      <Animated.View
                        style={[
                          estilos.tempoPreenchido,
                          {
                            transform: [
                              { translateX: -110 },
                              { scaleX: tempo },
                              { translateX: 110 },
                            ],
                          },
                        ]}
                      />
                    </View>
                  ) : null}
                </>
              ) : (
                <Text allowFontScaling={false} style={estilos.oculta}>
                  {'?'.repeat(desafio.palavra.length)}
                </Text>
              )}
            </View>
            <Botao
              texto="Ver de novo"
              icone="olho"
              variante="claro"
              onPress={revelar}
              desabilitado={revelando || acertou}
            />
          </>
        }
        resposta={
          <>
            <Text allowFontScaling={false} style={estilos.instrucao}>
              {revelando ? 'Leia com atenção…' : 'Agora monte a palavra'}
            </Text>
            <MontagemPalavra
              palavra={desafio.palavra}
              indiceDoDesafio={posicao.atual + 2}
              onErro={onErro}
              onCompleta={() => setAcertou(true)}
              travada={revelando || acertou}
            />
          </>
        }
      />
    </TelaBase>
  );
}

const estilos = StyleSheet.create({
  quadro: {
    width: '100%',
    maxWidth: 320,
    minHeight: 120,
    borderRadius: raio.blocoGrande,
    backgroundColor: cor.papel,
    borderWidth: 3,
    borderColor: cor.amarelo.base,
    borderBottomWidth: 6,
    borderBottomColor: cor.amarelo.degrau,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
  },
  palavra: {
    fontFamily: fonte.letra,
    fontSize: tamanho.palavra,
    letterSpacing: 4,
    color: cor.tinta,
  },
  oculta: {
    fontFamily: fonte.letra,
    fontSize: tamanho.palavra,
    letterSpacing: 10,
    color: cor.tinta2,
  },
  tempo: {
    width: 220,
    height: 8,
    borderRadius: 4,
    backgroundColor: cor.amarelo.claro,
    overflow: 'hidden',
  },
  tempoPreenchido: { flex: 1, backgroundColor: cor.amarelo.base, borderRadius: 4 },
  instrucao: {
    fontFamily: fonte.displayMedio,
    fontSize: tamanho.subtitulo,
    color: cor.tinta2,
    textAlign: 'center',
  },
});
