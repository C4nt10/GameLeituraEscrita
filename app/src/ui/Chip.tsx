import { Pressable, StyleSheet, Text } from 'react-native';
import { alvo, cor, fonte, raio, tamanho } from '../theme/tema';

/**
 * Chip da folha do adulto. Alvo mínimo 56 × 56 em todo controle — o guia
 * declara 56 × 48 pro chip, mas a regra "nada menor que 56" vale (A-28, D-55).
 * Texto em `tinta` sobre `papel2` (tinta2 não passa de 4,5:1 ali — A-34).
 */
export function Chip({
  rotulo,
  selecionado,
  onPress,
  corSelecionada,
  textoSelecionado,
  textoGrande = false,
  desabilitado = false,
}: {
  rotulo: string;
  selecionado: boolean;
  onPress: () => void;
  corSelecionada?: string;
  /** Cor do texto quando selecionado — o amarelo precisa de marrom, não de papel (guia). */
  textoSelecionado?: string;
  /** 19 px em negrito: "texto grande" (AA com 3:1) — pra branco sobre vermelho, verde e turquesa (3,5–3,8:1). */
  textoGrande?: boolean;
  desabilitado?: boolean;
}) {
  const fundoSelecionado = corSelecionada ?? cor.tinta;
  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitado}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      accessibilityState={{ selected: selecionado, disabled: desabilitado }}
      style={[
        estilos.chip,
        selecionado && { backgroundColor: fundoSelecionado, borderColor: fundoSelecionado },
        desabilitado && estilos.desabilitado,
      ]}
    >
      <Text
        allowFontScaling={false}
        style={[
          estilos.texto,
          textoGrande && estilos.textoGrande,
          { color: selecionado ? (textoSelecionado ?? cor.papel) : cor.tinta },
        ]}
      >
        {rotulo}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  chip: {
    minWidth: alvo.minimo,
    minHeight: alvo.minimo,
    paddingHorizontal: 14,
    borderRadius: raio.chip,
    borderWidth: 2,
    borderColor: cor.grade,
    backgroundColor: cor.papel2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: { fontFamily: fonte.textoForte, fontSize: tamanho.texto },
  textoGrande: { fontFamily: fonte.rotulo, fontSize: 19 },
  desabilitado: { opacity: 0.45 },
});
