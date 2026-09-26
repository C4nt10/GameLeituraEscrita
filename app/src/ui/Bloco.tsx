import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { alvo, degrau as degrauDoBloco, fonte, raio, tamanho } from '../theme/tema';
import { useAfundar } from './movimento';

/** Cor de um bloco: face, degrau (borda inferior) e cor do texto (guia: só o amarelo usa marrom). */
export interface CorDeBloco {
  readonly base: string;
  readonly degrau: string;
  readonly texto: string;
}

export interface BlocoProps {
  cor: CorDeBloco;
  texto: string;
  largura?: number;
  altura?: number;
  tamanhoDaFonte?: number;
  raioDoBloco?: number;
  /** Família do texto: `letra` (Andika, tudo que a criança lê/monta) ou `display` (Baloo, números). */
  familia?: 'letra' | 'display';
  /** Sem `onPress` o bloco é só desenho — "o bloco é o único objeto tocável" (guia). */
  onPress?: () => void;
  desabilitado?: boolean;
  acessibilidade?: string;
}

/**
 * O objeto-assinatura do padrão: bloco de brinquedo com face, degrau embaixo
 * e moldura clara por dentro. Tocável, afunda 3 px em 120 ms.
 */
export function Bloco({
  cor,
  texto,
  largura = alvo.peca.largura,
  altura = alvo.peca.altura,
  tamanhoDaFonte = tamanho.peca,
  raioDoBloco = raio.peca,
  familia = 'letra',
  onPress,
  desabilitado = false,
  acessibilidade,
}: BlocoProps) {
  const afundar = useAfundar();

  const corpo = (
    <View
      style={[
        estilos.face,
        degrauDoBloco(cor, 5),
        { width: largura, height: altura, borderRadius: raioDoBloco },
      ]}
    >
      <View pointerEvents="none" style={estilos.moldura} />
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: familia === 'letra' ? fonte.letra : fonte.display,
          fontSize: tamanhoDaFonte,
          color: cor.texto,
          includeFontPadding: false,
        }}
      >
        {texto}
      </Text>
    </View>
  );

  if (!onPress) return corpo;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={afundar.aoPressionar}
      onPressOut={afundar.aoSoltar}
      disabled={desabilitado}
      accessibilityRole="button"
      accessibilityLabel={acessibilidade ?? texto}
      accessibilityState={{ disabled: desabilitado }}
    >
      <Animated.View style={[afundar.estilo, desabilitado && estilos.desabilitado]}>
        {corpo}
      </Animated.View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  face: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  moldura: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: 5,
    bottom: 5,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 8,
  },
  desabilitado: {
    opacity: 0.6,
  },
});
