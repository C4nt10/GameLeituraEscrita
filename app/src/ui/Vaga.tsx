import { useEffect } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { cor, raio, tamanho } from '../theme/tema';
import { Bloco } from './Bloco';
import { useEncaixe } from './movimento';

const LARGURA = 62;
const ALTURA = 68;

/**
 * Vaga da palavra: tracejada até receber a letra certa; ao receber, a peça
 * entra com mola (encaixe, 250 ms) e vira um bloco verde.
 */
export function Vaga({ letra }: { letra?: string }) {
  const encaixe = useEncaixe();
  const { disparar } = encaixe;

  useEffect(() => {
    if (letra) disparar();
  }, [letra, disparar]);

  return (
    <View style={estilos.vaga}>
      {letra ? (
        <Animated.View style={encaixe.estilo}>
          <Bloco
            cor={cor.verde}
            texto={letra}
            largura={LARGURA}
            altura={ALTURA}
            tamanhoDaFonte={tamanho.peca}
            raioDoBloco={raio.peca}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  vaga: {
    width: LARGURA,
    height: ALTURA,
    borderRadius: raio.peca,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: cor.madeiraBorda,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
