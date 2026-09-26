import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ALVO_TOQUE_MINIMO, cores, espacamento, fontes, raio } from '../theme';

/**
 * Voltar sempre visível em toda tela fora da rodada (D-48, FR-027,
 * Princípio I) — o app não tem cabeçalho de navegação, então sem isto só o
 * botão/gesto do sistema saía da tela.
 */
export interface BotaoVoltarProps {
  onVoltar: () => void;
}

export function BotaoVoltar({ onVoltar }: BotaoVoltarProps) {
  return (
    <TouchableOpacity
      style={estilos.raiz}
      onPress={onVoltar}
      accessibilityRole="button"
      accessibilityLabel="voltar"
    >
      <Text style={estilos.texto}>← voltar</Text>
    </TouchableOpacity>
  );
}

const estilos = StyleSheet.create({
  raiz: {
    alignSelf: 'flex-start',
    minWidth: ALVO_TOQUE_MINIMO,
    minHeight: ALVO_TOQUE_MINIMO,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espacamento.md,
    borderRadius: raio.pill,
    backgroundColor: cores.papelAlt,
    borderWidth: 2,
    borderColor: cores.linha,
  },
  texto: {
    fontFamily: fontes.corpoBold,
    color: cores.tinta,
    fontSize: 14,
  },
});
