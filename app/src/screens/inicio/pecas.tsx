import { useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Bloco, type CorDeBloco } from '../../ui/Bloco';
import { Icone } from '../../ui/icones';
import { alvo, cor, corModalidade, fonte, movimento, tamanho } from '../../theme/tema';
import type { IdDoModo, ModoDeJogo, TipoDaCrianca } from './logica';

/** Selo curto ("chegando logo", "só conta") — texto em `tinta` sobre `papel2` (A-34). */
function Selo({ texto }: { texto: string }) {
  return (
    <View style={estilos.selo}>
      <Text allowFontScaling={false} style={estilos.seloTexto}>
        {texto}
      </Text>
    </View>
  );
}

const BLOCO_DO_TIPO: Record<string, { cor: CorDeBloco; glifo: string }> = {
  leitura: { cor: cor.azul, glifo: 'ABC' },
  matematica: { cor: cor.roxo, glifo: '1+2' },
  misto: { cor: cor.vermelho, glifo: 'A3' },
};

/** Tile de tipo (Letras / Contas / Misturado): bloco grande + nome. Travado aparece apagado, com selo. */
export function TileDeTipo({
  tipo,
  selecionado,
  onPress,
}: {
  tipo: TipoDaCrianca;
  selecionado: boolean;
  onPress: () => void;
}) {
  const desenho = BLOCO_DO_TIPO[tipo.id];
  return (
    <View
      style={[
        estilos.tile,
        !selecionado && estilos.tileApagado,
        selecionado && estilos.tileSelecionado,
        !tipo.disponivel && estilos.tileTravado,
      ]}
    >
      <Bloco
        cor={desenho.cor}
        texto={desenho.glifo}
        largura={96}
        altura={96}
        tamanhoDaFonte={27}
        raioDoBloco={18}
        onPress={onPress}
        desabilitado={!tipo.disponivel}
        acessibilidade={tipo.rotulo}
      />
      <Text allowFontScaling={false} style={estilos.tileRotulo}>
        {tipo.rotulo}
      </Text>
      {tipo.selo ? <Selo texto={tipo.selo} /> : null}
    </View>
  );
}

const COR_DO_MODO: Record<IdDoModo, CorDeBloco> = {
  ditado: corModalidade.ditado,
  leitura_montar: corModalidade.leituraMontar,
  leitura_voz: corModalidade.leituraVoz,
  conta: corModalidade.contaPura,
  historinha: corModalidade.contextualizada,
};

function IconeDoModo({ id, cor: cores }: { id: IdDoModo; cor: CorDeBloco }) {
  if (id === 'ditado') return <Icone nome="som" />;
  if (id === 'leitura_montar') return <Icone nome="olho" cor={cores.texto} />;
  if (id === 'leitura_voz') return <Icone nome="mic" />;
  if (id === 'historinha') return <Icone nome="maca" tamanho={30} />;
  return (
    <Text allowFontScaling={false} style={estilos.glifoDaConta}>
      1+2
    </Text>
  );
}

/** Linha de jeito de jogar: ícone na cor da modalidade, nome pela ação, descrição curta (D-51). */
export function LinhaDeModo({
  modo,
  selecionado,
  onPress,
}: {
  modo: ModoDeJogo;
  selecionado: boolean;
  onPress: () => void;
}) {
  const cores = COR_DO_MODO[modo.id];
  return (
    <Pressable
      onPress={onPress}
      disabled={!modo.disponivel}
      accessibilityRole="button"
      accessibilityLabel={modo.rotulo}
      accessibilityState={{ selected: selecionado, disabled: !modo.disponivel }}
      style={[
        estilos.modo,
        selecionado && estilos.modoSelecionado,
        !modo.disponivel && estilos.modoTravado,
      ]}
    >
      <View style={[estilos.iconeDoModo, { backgroundColor: cores.base }]}>
        <IconeDoModo id={modo.id} cor={cores} />
      </View>
      <View style={estilos.textosDoModo}>
        <Text allowFontScaling={false} style={estilos.nomeDoModo}>
          {modo.rotulo}
        </Text>
        <Text allowFontScaling={false} style={estilos.descricaoDoModo}>
          {modo.descricao}
        </Text>
      </View>
      {modo.selo ? <Selo texto={modo.selo} /> : null}
    </Pressable>
  );
}

/**
 * Engrenagem do adulto: abre segurando por 1,2 s, com um anel azul enchendo
 * (D-53). Não é gesto da criança (A-19, D-55). Quem usa leitor de tela tem uma
 * ação de acessibilidade que abre sem segurar.
 */
export function BotaoDoAdulto({ aoAbrir }: { aoAbrir: () => void }) {
  const [progresso] = useState(() => new Animated.Value(0));
  const TAMANHO_DO_ANEL = alvo.minimo + 8;

  return (
    <View style={estilos.adulto}>
      <Text allowFontScaling={false} style={estilos.dicaDoAdulto}>
        {'adulto:\nsegure'}
      </Text>
      <Pressable
        onPressIn={() =>
          Animated.timing(progresso, {
            toValue: 1,
            duration: movimento.seguraAdulto,
            useNativeDriver: false,
          }).start()
        }
        onPressOut={() => {
          progresso.stopAnimation();
          progresso.setValue(0);
        }}
        onLongPress={aoAbrir}
        delayLongPress={movimento.seguraAdulto}
        accessibilityRole="button"
        accessibilityLabel="Opções do adulto. Segure para abrir."
        accessibilityActions={[{ name: 'activate', label: 'Abrir opções do adulto' }]}
        onAccessibilityAction={(evento) => {
          if (evento.nativeEvent.actionName === 'activate') aoAbrir();
        }}
      >
        <View style={estilos.engrenagem}>
          <Animated.View
            pointerEvents="none"
            style={[
              estilos.anel,
              {
                width: progresso.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, TAMANHO_DO_ANEL],
                }),
              },
            ]}
          >
            <View
              style={[estilos.anelInterno, { width: TAMANHO_DO_ANEL, height: TAMANHO_DO_ANEL }]}
            />
          </Animated.View>
          <Icone nome="engrenagem" tamanho={26} cor={cor.tinta2} />
        </View>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  selo: {
    backgroundColor: cor.papel2,
    borderRadius: 99,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  seloTexto: { fontFamily: fonte.rotulo, fontSize: tamanho.rotulo, color: cor.tinta },
  tile: { alignItems: 'center', gap: 6 },
  tileApagado: { opacity: 0.55, transform: [{ scale: 0.92 }] },
  tileSelecionado: { transform: [{ translateY: -3 }, { rotate: '-2deg' }] },
  tileTravado: { opacity: 0.45 },
  tileRotulo: { fontFamily: fonte.rotulo, fontSize: tamanho.texto, color: cor.tinta },
  modo: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 12,
    borderRadius: 18,
    backgroundColor: cor.papel,
    borderWidth: 3,
    borderColor: cor.papel2,
    borderBottomWidth: 6,
    borderBottomColor: cor.grade,
  },
  modoSelecionado: {
    borderColor: cor.azul.base,
    borderBottomColor: cor.azul.degrau,
    backgroundColor: cor.azul.claro,
  },
  modoTravado: { opacity: 0.6 },
  iconeDoModo: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glifoDaConta: { fontFamily: fonte.display, fontSize: 17, color: '#FFFFFF' },
  textosDoModo: { flex: 1 },
  nomeDoModo: { fontFamily: fonte.displayMedio, fontSize: tamanho.subtitulo, color: cor.tinta },
  descricaoDoModo: { fontFamily: fonte.texto, fontSize: tamanho.legenda, color: cor.tinta },
  adulto: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dicaDoAdulto: {
    fontFamily: fonte.textoForte,
    fontSize: tamanho.rotulo,
    color: cor.tinta2,
    textAlign: 'right',
    lineHeight: 15,
  },
  engrenagem: {
    width: alvo.minimo,
    height: alvo.minimo,
    borderRadius: 18,
    backgroundColor: cor.papel2,
    borderBottomWidth: 4,
    borderBottomColor: cor.madeiraBorda,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anel: {
    position: 'absolute',
    top: -4,
    left: -4,
    height: alvo.minimo + 8,
    overflow: 'hidden',
  },
  anelInterno: { borderRadius: 21, borderWidth: 4, borderColor: cor.azul.base },
});
