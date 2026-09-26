import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { alvo, degrau } from '../theme/tema';
import type { CorDeBloco } from './Bloco';
import { Icone, type NomeDoIcone } from './icones';
import { useAfundar, useOnda } from './movimento';

/**
 * O estímulo da criança: alto-falante do Ouvir e montar, microfone do Ler em
 * voz alta. Bloco grande (150), na cor da modalidade, com um anel que se
 * expande e some em loop chamando o toque (onda, 2,2 s). Com "reduzir
 * movimento" o anel não roda.
 */
export function BotaoDeEstimulo({
  cor,
  icone,
  onPress,
  acessibilidade,
  redondo = false,
  chamando = true,
}: {
  cor: CorDeBloco;
  icone: NomeDoIcone;
  onPress: () => void;
  acessibilidade: string;
  redondo?: boolean;
  /** Anel de onda ligado. */
  chamando?: boolean;
}) {
  const afundar = useAfundar();
  const onda = useOnda();
  const raio = redondo ? alvo.estimulo / 2 : 40;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={afundar.aoPressionar}
      onPressOut={afundar.aoSoltar}
      accessibilityRole="button"
      accessibilityLabel={acessibilidade}
    >
      <Animated.View style={afundar.estilo}>
        {chamando ? (
          <Animated.View
            pointerEvents="none"
            style={[estilos.anel, { borderColor: cor.base, borderRadius: raio + 8 }, onda]}
          />
        ) : null}
        <View
          style={[
            estilos.face,
            degrau(cor, 9),
            { width: alvo.estimulo, height: alvo.estimulo, borderRadius: raio },
          ]}
        >
          <Icone nome={icone} tamanho={72} />
        </View>
      </Animated.View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  face: { alignItems: 'center', justifyContent: 'center' },
  anel: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderWidth: 4,
  },
});
