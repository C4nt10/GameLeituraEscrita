import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ALVO_TOQUE_MINIMO, cores, espacamento, fontes, raio } from '../theme';

/**
 * Botão "sair da rodada" — D-39 (revoga D-10, doc/definições002.MD §14):
 * sempre visível em qualquer modalidade. A criança (ou o adulto) decide
 * quando sair — o app nunca troca de modalidade sozinho, o que
 * esconderia o ponto que precisa de treino (Princípio IV). Sair marca a
 * rodada como não concluída (mesmo tratamento de qualquer abandono,
 * `data-model.md`), sem penalidade (Princípio II).
 */
export interface BotaoSairRodadaProps {
  onSair: () => void;
}

export function BotaoSairRodada({ onSair }: BotaoSairRodadaProps) {
  return (
    <TouchableOpacity
      style={estilos.raiz}
      onPress={onSair}
      accessibilityRole="button"
      accessibilityLabel="sair da rodada"
    >
      <Text style={estilos.texto}>✕ sair</Text>
    </TouchableOpacity>
  );
}

const estilos = StyleSheet.create({
  raiz: {
    position: 'absolute',
    top: espacamento.md,
    left: espacamento.md,
    minWidth: ALVO_TOQUE_MINIMO,
    minHeight: ALVO_TOQUE_MINIMO,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espacamento.md,
    borderRadius: raio.pill,
    backgroundColor: cores.papelAlt,
    borderWidth: 2,
    borderColor: cores.linha,
    zIndex: 1,
  },
  texto: {
    fontFamily: fontes.corpoBold,
    color: cores.tinta,
    fontSize: 14,
  },
});
