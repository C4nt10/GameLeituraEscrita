import { StyleSheet, Text, View } from 'react-native';
import { cor, degrau, espaco, fonte, tamanho } from '../theme/tema';
import { BotaoDeSaida } from './BotaoDeSaida';

/** Um quadradinho por desafio: feito (amarelo), agora (contorno azul), a fazer (papel). */
export function Trilha({ total, atual }: { total: number; atual: number }) {
  return (
    <View
      style={estilos.trilha}
      accessible
      accessibilityLabel={`desafio ${Math.min(atual + 1, total)} de ${total}`}
    >
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[estilos.quadrado, i < atual && estilos.feito, i === atual && estilos.agora]}
        />
      ))}
    </View>
  );
}

export interface ContadorDeAjuda {
  /** "ouviu", "espiou" ou "tentou" — o da modalidade (D-19). */
  rotulo: string;
  valor: number;
}

/**
 * Barra do desafio: Sair à esquerda (D-39), trilha de progresso no centro e o
 * contador de ajuda da modalidade à direita, sempre à vista (Princípio IV).
 * Em Contas **não há contador** (D-19 vale, D-55) — só passar `contador`
 * quando a modalidade tem.
 */
export function BarraDoDesafio({
  aoSair,
  total,
  atual,
  contador,
}: {
  aoSair: () => void;
  total: number;
  atual: number;
  contador?: ContadorDeAjuda;
}) {
  return (
    <View style={estilos.barra}>
      <BotaoDeSaida tipo="sair" onPress={aoSair} />
      <View style={estilos.centro}>
        <Trilha total={total} atual={atual} />
      </View>
      <View
        style={estilos.contador}
        accessible
        accessibilityLabel={contador ? `${contador.rotulo} ${contador.valor}` : undefined}
      >
        {contador ? (
          <>
            <Text allowFontScaling={false} style={estilos.rotulo}>
              {contador.rotulo}
            </Text>
            <Text allowFontScaling={false} style={estilos.valor}>
              {contador.valor}
            </Text>
          </>
        ) : null}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: { flexDirection: 'row', alignItems: 'center', gap: espaco.m - 2 },
  centro: { flex: 1, alignItems: 'center' },
  trilha: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  quadrado: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: cor.papel2,
    borderBottomWidth: 3,
    borderBottomColor: cor.grade,
  },
  feito: { ...degrau(cor.amarelo, 3), shadowOpacity: 0, elevation: 0 },
  agora: { borderWidth: 3, borderColor: cor.azul.base },
  contador: { width: 62, alignItems: 'center' },
  rotulo: { fontFamily: fonte.rotulo, fontSize: tamanho.rotulo, color: cor.tinta2 },
  valor: { fontFamily: fonte.display, fontSize: tamanho.subtitulo, color: cor.tinta },
});
