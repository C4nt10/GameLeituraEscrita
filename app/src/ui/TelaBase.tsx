import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';
import { cor, espaco } from '../theme/tema';

const PASSO_DA_GRADE = 22;

/** Papel de caderno quadriculado (grade de 22 px) — o fundo de toda tela. */
export function FundoCaderno() {
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Pattern
          id="grade"
          width={PASSO_DA_GRADE}
          height={PASSO_DA_GRADE}
          patternUnits="userSpaceOnUse"
        >
          <Path
            d={`M${PASSO_DA_GRADE} 0H0V${PASSO_DA_GRADE}`}
            stroke={cor.grade}
            strokeWidth={1}
            fill="none"
          />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#grade)" />
    </Svg>
  );
}

/**
 * Base de toda tela do app: papel quadriculado + safe area do sistema (topo
 * e base — botões nunca ficam sob a barra do Android, D-47) + margens de 16.
 * A tela inteira pode rolar quando o conteúdo passa da altura (a folha do
 * adulto, o histórico) — cada tela decide com `filhos`.
 */
export function TelaBase({ children }: { children: ReactNode }) {
  return (
    <View style={estilos.raiz}>
      <FundoCaderno />
      <SafeAreaView style={estilos.area} edges={['top', 'bottom']}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: cor.papel },
  area: {
    flex: 1,
    paddingHorizontal: espaco.l,
    paddingTop: espaco.l,
    paddingBottom: espaco.xl,
    gap: espaco.m + 2,
  },
});
