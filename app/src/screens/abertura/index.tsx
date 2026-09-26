import { Animated, StyleSheet, useWindowDimensions, View } from 'react-native';
import { corDoBloco } from '../../theme/helpers';
import { tamanho } from '../../theme/tema';
import { Bloco } from '../../ui/Bloco';
import { Botao } from '../../ui/Botao';
import { Mascote } from '../../ui/icones';
import { usePulso, useQueda } from '../../ui/movimento';
import { TelaBase } from '../../ui/TelaBase';

const LINHAS_DO_LOGO = ['LETRA', 'VIVA'];
/** Cada letra com o número dela na sequência inteira (cor do bloco e atraso da queda). */
const LETRAS_POR_LINHA = LINHAS_DO_LOGO.map((linha, l) => {
  const antes = LINHAS_DO_LOGO.slice(0, l).reduce((soma, anterior) => soma + anterior.length, 0);
  return [...linha].map((letra, i) => ({ letra, indice: antes + i }));
});
/** Intervalo entre uma letra e a próxima caindo (guia: 100 ms). */
const INTERVALO_MS = 100;

function LetraQueCai({ letra, indice, atraso }: { letra: string; indice: number; atraso: number }) {
  const queda = useQueda(atraso);
  return (
    <Animated.View style={queda}>
      <Bloco
        cor={corDoBloco(indice, 0)}
        texto={letra}
        largura={54}
        altura={62}
        tamanhoDaFonte={tamanho.peca}
        raioDoBloco={14}
      />
    </Animated.View>
  );
}

/**
 * Abertura (T116, A-30): o nome em blocos caindo, o mascote e "Tocar para
 * começar" pulsando. Aparece só na abertura a frio (`estado.ts`). O logo tem
 * um rótulo de acessibilidade único ("Letra Viva") — ler bloco por bloco não
 * ajuda ninguém. Com "reduzir movimento" os blocos já aparecem no lugar e o
 * botão não pulsa.
 */
export function TelaAbertura({ aoComecar }: { aoComecar: () => void }) {
  const pulso = usePulso();
  const { width, height } = useWindowDimensions();
  const deitado = width > height;

  const logo = (
    <View accessible accessibilityLabel="Letra Viva" style={estilos.logo}>
      {LETRAS_POR_LINHA.map((letras, l) => (
        <View key={l} style={estilos.linha}>
          {letras.map(({ letra, indice }) => (
            <LetraQueCai
              key={indice}
              letra={letra}
              indice={indice}
              atraso={indice * INTERVALO_MS}
            />
          ))}
        </View>
      ))}
    </View>
  );
  const botao = (
    <Animated.View style={pulso}>
      <Botao texto="Tocar para começar" variante="abertura" onPress={aoComecar} />
    </Animated.View>
  );

  // Deitado não sobra altura pra empilhar logo + mascote + botão: mascote de um lado, logo e botão do outro.
  return (
    <TelaBase>
      {deitado ? (
        <View style={estilos.deitado}>
          <Mascote tamanho={150} />
          <View style={estilos.colunaDireita}>
            {logo}
            {botao}
          </View>
        </View>
      ) : (
        <View style={estilos.centro}>
          {logo}
          <Mascote tamanho={140} />
          {botao}
        </View>
      )}
    </TelaBase>
  );
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
  deitado: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 48,
  },
  colunaDireita: { alignItems: 'center', gap: 24 },
  logo: { alignItems: 'center', gap: 10 },
  linha: { flexDirection: 'row', gap: 8 },
});
