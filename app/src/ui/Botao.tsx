import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { alvo, cor, degrau, fonte, raio, tamanho } from '../theme/tema';
import type { CorDeBloco } from './Bloco';
import { Icone, type NomeDoIcone } from './icones';
import { useAfundar } from './movimento';

export type VarianteDoBotao = 'principal' | 'confirmar' | 'claro' | 'abertura';

export interface BotaoProps {
  texto: string;
  onPress: () => void;
  variante?: VarianteDoBotao;
  icone?: NomeDoIcone;
  /** Ocupa a largura toda do contêiner. */
  cheio?: boolean;
  desabilitado?: boolean;
  acessibilidade?: string;
}

const ALTURA: Record<VarianteDoBotao, number> = {
  principal: alvo.botaoPrincipal,
  confirmar: alvo.botao,
  abertura: alvo.botao,
  claro: alvo.minimo,
};

const COR: Record<Exclude<VarianteDoBotao, 'claro'>, CorDeBloco> = {
  principal: cor.verde,
  confirmar: cor.azul,
  abertura: cor.vermelho,
};

/**
 * Botão do padrão. Principal verde (72), confirmar azul (64), abertura
 * vermelho (64), claro de papel com borda (56 — o mínimo). O texto é sempre o
 * verbo da ação. Nada menor que 56 (guia, A-28).
 */
export function Botao({
  texto,
  onPress,
  variante = 'principal',
  icone,
  cheio = false,
  desabilitado = false,
  acessibilidade,
}: BotaoProps) {
  const afundar = useAfundar();
  const cores = variante === 'claro' ? null : COR[variante];

  return (
    <Pressable
      onPress={onPress}
      onPressIn={afundar.aoPressionar}
      onPressOut={afundar.aoSoltar}
      disabled={desabilitado}
      accessibilityRole="button"
      accessibilityLabel={acessibilidade ?? texto}
      accessibilityState={{ disabled: desabilitado }}
      style={cheio ? estilos.cheio : undefined}
    >
      <Animated.View
        style={[
          afundar.estilo,
          estilos.base,
          { minHeight: ALTURA[variante] },
          cores ? degrau(cores, 6) : estilos.claro,
          desabilitado && estilos.desabilitado,
        ]}
      >
        {icone ? (
          <View style={estilos.icone}>
            <Icone nome={icone} tamanho={24} cor={cores ? '#FFFFFF' : cor.tinta} />
          </View>
        ) : null}
        <Text
          allowFontScaling={false}
          style={[
            estilos.texto,
            {
              fontSize: cores ? tamanho.titulo : tamanho.subtitulo,
              color: cores ? cores.texto : cor.tinta,
            },
          ]}
        >
          {texto}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  cheio: { alignSelf: 'stretch' },
  base: {
    borderRadius: raio.botao,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  claro: {
    backgroundColor: cor.papel,
    borderWidth: 2,
    borderColor: cor.madeiraBorda,
    borderBottomWidth: 5,
  },
  texto: { fontFamily: fonte.display },
  icone: { alignItems: 'center', justifyContent: 'center' },
  desabilitado: { opacity: 0.55 },
});
