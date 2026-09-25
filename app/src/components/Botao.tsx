import type { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ALVO_TOQUE_MINIMO, cores, espacamento, fontes, raio, sombraBlk } from '../theme';

export interface BotaoProps {
  onPress: () => void;
  children: ReactNode;
  variante?: 'primario' | 'fantasma';
  acessibilidade: string;
}

/** Botão de alvo grande, um toque (Princípio VI). */
export function Botao({ onPress, children, variante = 'primario', acessibilidade }: BotaoProps) {
  const primario = variante === 'primario';
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[estilos.base, primario ? estilos.primario : estilos.fantasma]}
      accessibilityRole="button"
      accessibilityLabel={acessibilidade}
    >
      <Text style={[estilos.texto, primario ? estilos.textoPrimario : estilos.textoFantasma]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: ALVO_TOQUE_MINIMO,
    paddingHorizontal: espacamento.lg,
    borderRadius: raio.botao,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primario: {
    backgroundColor: cores.blocoAzul,
    ...sombraBlk,
  },
  fantasma: {
    backgroundColor: cores.papelAlt,
    borderWidth: 2,
    borderColor: cores.linha,
  },
  texto: {
    fontFamily: fontes.titulo,
    fontSize: 17,
  },
  textoPrimario: {
    color: cores.papel,
  },
  textoFantasma: {
    color: cores.tinta,
  },
});
