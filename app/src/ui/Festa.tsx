import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { corDoBloco } from '../theme/helpers';
import { cicloDeBlocos, cor, fonte, tamanho } from '../theme/tema';
import { Bloco } from './Bloco';
import { Botao } from './Botao';
import { useReduzirMovimento, usePulo } from './movimento';

const QUANTIDADE_DE_CONFETES = 26;

function Confete() {
  const reduzir = useReduzirMovimento();
  const { height } = useWindowDimensions();
  const [pecas] = useState(() =>
    Array.from({ length: QUANTIDADE_DE_CONFETES }, (_, i) => ({
      esquerda: `${(i * 37) % 100}%` as `${number}%`,
      atraso: (i * 53) % 500,
      cor: cicloDeBlocos[i % cicloDeBlocos.length].base,
      progresso: new Animated.Value(0),
    })),
  );

  useEffect(() => {
    if (reduzir) return;
    const animacoes = pecas.map((p) =>
      Animated.timing(p.progresso, {
        toValue: 1,
        duration: 1600,
        delay: p.atraso,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    );
    animacoes.forEach((a) => a.start());
    return () => animacoes.forEach((a) => a.stop());
  }, [pecas, reduzir]);

  if (reduzir) return null;

  return (
    <>
      {pecas.map((p, i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={[
            estilos.confete,
            {
              left: p.esquerda,
              backgroundColor: p.cor,
              transform: [
                {
                  translateY: p.progresso.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, height + 40],
                  }),
                },
                {
                  rotate: p.progresso.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '540deg'],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </>
  );
}

function LetraQuePula({ letra, indice }: { letra: string; indice: number }) {
  const pulo = usePulo(indice * 80);
  return (
    <Animated.View style={pulo}>
      <Bloco
        cor={corDoBloco(indice, 0)}
        texto={letra}
        largura={54}
        altura={58}
        tamanhoDaFonte={32}
        raioDoBloco={12}
      />
    </Animated.View>
  );
}

/**
 * Comemoração ao completar uma palavra (D-54): "Isso!", confete e as letras
 * pulando, com o botão "Próxima" — ou "Ver estrelas" na última. A comemoração
 * é igual quer a criança tenha errado no caminho ou não: nenhum erro aparece
 * aqui (Princípio II). Sem "reduzir movimento": sem confete e sem pulo.
 */
export function Festa({
  palavra,
  ultima,
  aoSeguir,
}: {
  palavra: string;
  ultima: boolean;
  aoSeguir: () => void;
}) {
  return (
    <View style={estilos.festa}>
      <Confete />
      <Text allowFontScaling={false} style={estilos.titulo}>
        Isso!
      </Text>
      <View style={estilos.palavra}>
        {[...palavra].map((letra, i) => (
          <LetraQuePula key={i} letra={letra} indice={i} />
        ))}
      </View>
      <Botao texto={ultima ? 'Ver estrelas' : 'Próxima'} variante="principal" onPress={aoSeguir} />
    </View>
  );
}

const estilos = StyleSheet.create({
  festa: {
    ...StyleSheet.absoluteFill,
    zIndex: 4,
    backgroundColor: 'rgba(255,243,218,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    padding: 24,
    overflow: 'hidden',
  },
  titulo: { fontFamily: fonte.display, fontSize: tamanho.destaque, color: cor.tinta },
  palavra: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  confete: { position: 'absolute', top: -20, width: 10, height: 14, borderRadius: 2 },
});
