import { StyleSheet, Text, View } from 'react-native';
import { caixaDaLetra, cor, fonte } from '../theme/tema';

/** Cor da bolha quando o perfil não tem uma (perfil antigo ou sem cor escolhida). */
const COR_PADRAO = cor.azul.base;

/**
 * Bolha de perfil: círculo na cor do perfil com a inicial em Andika
 * maiúscula (guia: toda letra que a criança lê é Andika). É a "cara" do
 * jogador na seleção, na vez de jogar e no resultado da dupla.
 */
export function BolhaDePerfil({
  nome,
  cor: corDoPerfil,
  tamanho = 64,
}: {
  nome: string;
  cor: string | null;
  tamanho?: number;
}) {
  const inicial = caixaDaLetra(nome.trim().charAt(0) || '?');
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        estilos.bolha,
        {
          width: tamanho,
          height: tamanho,
          borderRadius: tamanho / 2,
          backgroundColor: corDoPerfil ?? COR_PADRAO,
        },
      ]}
    >
      <Text
        allowFontScaling={false}
        style={[estilos.inicial, { fontSize: Math.round(tamanho * 0.5) }]}
      >
        {inicial}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  bolha: { alignItems: 'center', justifyContent: 'center' },
  inicial: { fontFamily: fonte.letra, color: '#FFFFFF', includeFontPadding: false },
});
