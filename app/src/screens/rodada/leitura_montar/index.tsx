import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BotaoSairRodada } from '../../../components/BotaoSairRodada';
import { MontagemPalavra } from '../../../components/MontagemPalavra';
import { PillContador } from '../../../components/PillContador';
import type { DesafioLeitura } from '../../../models/desafio_leitura';
import { cores, espacamento, raio } from '../../../theme';

const DURACAO_REVELACAO_PADRAO_MS = 3000;

/**
 * Tela de desafio — Leitura·montar (T030, D-18). A palavra aparece e
 * some **sozinha, sem áudio nenhum** (essa é a diferença pro Ditado — lê,
 * não ouve). "ver de novo" revela de novo e conta como espiada (D-05,
 * D-19). A montagem em si (`MontagemPalavra`) fica sempre montada — só
 * escondida enquanto a palavra está revelada — pra não perder o
 * progresso já feito quando a criança pede pra ver de novo no meio da
 * montagem.
 */
export interface TelaLeituraMontarProps {
  desafio: DesafioLeitura;
  duracaoRevelacaoMs?: number;
  onAcerto: () => void;
  onErro: () => void;
  /** D-39 — botão de sair sempre visível, nunca esconde. */
  onSair: () => void;
}

export function TelaLeituraMontar({
  desafio,
  duracaoRevelacaoMs = DURACAO_REVELACAO_PADRAO_MS,
  onAcerto,
  onErro,
  onSair,
}: TelaLeituraMontarProps) {
  const [espiadas, setEspiadas] = useState(0);
  const [revelando, setRevelando] = useState(false);

  useEffect(() => {
    revelar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desafio.palavra]);

  function revelar() {
    setEspiadas((e) => e + 1);
    setRevelando(true);
    setTimeout(() => setRevelando(false), duracaoRevelacaoMs);
  }

  return (
    <View style={estilos.raiz}>
      <BotaoSairRodada onSair={onSair} />
      <PillContador icone="👀" rotulo="espiadas" valor={espiadas} />

      {revelando ? (
        <View style={estilos.palavraOcultaBox}>
          <Text style={estilos.palavraOcultaTexto}>{desafio.palavra.toUpperCase()}</Text>
        </View>
      ) : (
        <TouchableOpacity
          onPress={revelar}
          accessibilityRole="button"
          accessibilityLabel="ver de novo"
        >
          <Text style={estilos.verDeNovo}>👁️ ver de novo</Text>
        </TouchableOpacity>
      )}

      <View
        style={revelando ? estilos.montagemEscondida : undefined}
        pointerEvents={revelando ? 'none' : 'auto'}
      >
        <MontagemPalavra palavra={desafio.palavra} onErro={onErro} onCompleta={onAcerto} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacamento.md,
    padding: espacamento.lg,
    backgroundColor: cores.papel,
  },
  palavraOcultaBox: {
    paddingVertical: espacamento.md,
    paddingHorizontal: espacamento.lg,
    borderRadius: raio.lg,
    backgroundColor: cores.blocoAmareloT,
  },
  palavraOcultaTexto: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 2,
    color: cores.tinta,
  },
  verDeNovo: {
    fontWeight: '700',
    color: cores.blocoAzul,
    fontSize: 15,
  },
  montagemEscondida: {
    opacity: 0,
  },
});
