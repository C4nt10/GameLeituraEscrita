import type { ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { espaco } from '../theme/tema';

/**
 * Em pé e deitado são o mesmo layout em duas zonas (D-38, guia): **estímulo**
 * (o que a criança ouve ou lê) e **resposta** (o que ela toca). Em pé, uma
 * sobre a outra; deitado, lado a lado, com a resposta à direita — perto do
 * polegar de quem é destro.
 */
export function ZonasDoDesafio({
  estimulo,
  resposta,
}: {
  estimulo: ReactNode;
  resposta: ReactNode;
}) {
  const { width, height } = useWindowDimensions();
  const deitado = width > height;

  return (
    <View style={[estilos.raiz, deitado ? estilos.deitado : estilos.emPe]}>
      <View style={estilos.zona}>{estimulo}</View>
      <View style={estilos.zona}>{resposta}</View>
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, minHeight: 0 },
  emPe: { flexDirection: 'column', gap: espaco.l },
  deitado: { flexDirection: 'row', gap: espaco.xl },
  zona: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaco.m + 2,
  },
});
