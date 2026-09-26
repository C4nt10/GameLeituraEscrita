import type { ReactNode } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { alvo, cor } from '../theme/tema';
import { useAfundar } from './movimento';

/** Botão redondo de ícone solto (estrelas, engrenagem, som do enunciado): 56 × 56. */
export function Redondo({
  children,
  onPress,
  onLongPress,
  tempoDeSegurar,
  acessibilidade,
  fundo,
}: {
  children: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  tempoDeSegurar?: number;
  acessibilidade: string;
  fundo?: { base: string; degrau: string };
}) {
  const afundar = useAfundar();
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={tempoDeSegurar}
      onPressIn={afundar.aoPressionar}
      onPressOut={afundar.aoSoltar}
      accessibilityRole="button"
      accessibilityLabel={acessibilidade}
    >
      <Animated.View
        style={[
          afundar.estilo,
          estilos.base,
          fundo && { backgroundColor: fundo.base, borderBottomColor: fundo.degrau },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    width: alvo.minimo,
    height: alvo.minimo,
    borderRadius: 18,
    backgroundColor: cor.papel2,
    borderBottomWidth: 4,
    borderBottomColor: cor.madeiraBorda,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
