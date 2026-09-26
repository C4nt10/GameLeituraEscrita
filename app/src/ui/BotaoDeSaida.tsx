import { Pressable, StyleSheet, Text } from 'react-native';
import { alvo, cor, fonte, tamanho } from '../theme/tema';
import { Icone } from './icones';

/**
 * "Sair" (desafio, D-39) e "Voltar" (demais telas, D-48): canto superior
 * esquerdo, com cara de botão, alvo 56. Sempre visível (Princípio I).
 */
export function BotaoDeSaida({ tipo, onPress }: { tipo: 'sair' | 'voltar'; onPress: () => void }) {
  const rotulo = tipo === 'sair' ? 'Sair' : 'Voltar';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={tipo === 'sair' ? 'sair da rodada' : 'voltar'}
      style={estilos.botao}
    >
      <Icone nome={tipo === 'sair' ? 'x' : 'volta'} tamanho={18} cor={cor.tinta} />
      <Text allowFontScaling={false} style={estilos.texto}>
        {rotulo}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  botao: {
    minHeight: alvo.minimo,
    minWidth: alvo.minimo,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: cor.madeiraBorda,
    backgroundColor: cor.papel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  texto: { fontFamily: fonte.rotulo, fontSize: tamanho.texto, color: cor.tinta },
});
