import { StyleSheet, Text, View } from 'react-native';
import { cores, espacamento, fontes, raio } from '../theme';

export interface PillContadorProps {
  /** Emoji do tipo de ajuda: 🔁 repetições, 👀 espiadas, 🔁 tentativas (D-19). */
  icone: string;
  rotulo: string;
  valor: number;
}

/** Contador de ajuda sempre visível, nunca escondido (Princípio IV — métrica honesta). */
export function PillContador({ icone, rotulo, valor }: PillContadorProps) {
  return (
    <View style={estilos.raiz} accessibilityLabel={`${rotulo}: ${valor}`}>
      <Text style={estilos.texto}>
        {icone} {rotulo}: {valor}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: {
    alignSelf: 'center',
    paddingVertical: espacamento.xs,
    paddingHorizontal: espacamento.md,
    borderRadius: raio.pill,
    backgroundColor: cores.papelAlt,
  },
  texto: {
    fontFamily: fontes.corpoBold,
    fontSize: 13,
    color: cores.tintaFraca,
  },
});
