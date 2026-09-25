import { useMemo, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { embaralhar } from '../lib/embaralhar';
import { ALVO_TOQUE_MINIMO, cores, espacamento, fontes, raio, sombraBlk } from '../theme';

/**
 * Montagem de palavra por letras embaralhadas — mecânica compartilhada
 * por Ditado (níveis 2+) e Leitura·montar. **Nunca renderiza a palavra
 * como texto** — só vagas (preenchidas ou "?") e ladrilhos soltos
 * (princípio supremo da constituição, US1 cenário 1/T023).
 *
 * Toque errado: conta como erro (`onErro`) e limpa a montagem de volta
 * pro início, sem penalidade além disso — os ladrilhos continuam
 * disponíveis pra nova tentativa (Princípio II, T025/T033a).
 */

export interface MontagemPalavraProps {
  /** A palavra certa, minúscula, sem espaço (nível 1-4). */
  palavra: string;
  onErro: () => void;
  onCompleta: () => void;
}

/**
 * Bug real encontrado em teste manual: o orquestrador da rodada reusa a
 * mesma instância deste componente entre desafios (só troca `palavra`)
 * — sem o `key={palavra}` abaixo, em `MontagemPalavra`, o estado
 * `preenchidas`/`usados` (inicializado só no primeiro mount) ficava
 * travado mostrando a montagem do desafio ANTERIOR. Solução idiomática
 * do React pra "resetar estado quando uma prop muda": trocar de `key`
 * força o remount, em vez de um `useEffect` chamando `setState`.
 */
export function MontagemPalavra(props: MontagemPalavraProps) {
  return <MontagemPalavraPorPalavra key={props.palavra} {...props} />;
}

function MontagemPalavraPorPalavra({ palavra, onErro, onCompleta }: MontagemPalavraProps) {
  const letras = useMemo(() => palavra.split(''), [palavra]);
  const ladrilhos = useMemo(() => embaralhar(letras), [letras]);
  const [preenchidas, setPreenchidas] = useState<string[]>([]);
  const [usados, setUsados] = useState<boolean[]>(() => letras.map(() => false));
  // feedback lúdico (item 5 da análise de UX): pop de escala na vaga que
  // acabou de ser preenchida certo. Só o movimento — som de acerto fica
  // pra depois, precisa de um asset de áudio real que não existe ainda.
  // useState (não useRef) porque o valor é lido durante o render — ler
  // ref.current no corpo do render é o padrão que o eslint rejeita.
  const [escalasVagas] = useState(() => letras.map(() => new Animated.Value(1)));

  function animarAcertoNaVaga(indice: number) {
    escalasVagas[indice].setValue(1.3);
    Animated.spring(escalasVagas[indice], {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }

  function tocarLadrilho(letra: string, indiceLadrilho: number) {
    if (usados[indiceLadrilho]) return;

    const proximaEsperada = letras[preenchidas.length];
    if (letra !== proximaEsperada) {
      onErro();
      setPreenchidas([]);
      setUsados(letras.map(() => false));
      return;
    }

    const novosUsados = [...usados];
    novosUsados[indiceLadrilho] = true;
    setUsados(novosUsados);

    animarAcertoNaVaga(preenchidas.length);
    const novasPreenchidas = [...preenchidas, letra];
    setPreenchidas(novasPreenchidas);

    if (novasPreenchidas.length === letras.length) {
      onCompleta();
    }
  }

  return (
    <View style={estilos.raiz}>
      <View style={estilos.vagas}>
        {letras.map((_, indice) => (
          <Animated.View
            key={indice}
            style={[
              estilos.vaga,
              indice < preenchidas.length && estilos.vagaCheia,
              { transform: [{ scale: escalasVagas[indice] }] },
            ]}
          >
            <Text style={estilos.vagaTexto}>
              {indice < preenchidas.length ? preenchidas[indice].toUpperCase() : '?'}
            </Text>
          </Animated.View>
        ))}
      </View>
      <View style={estilos.ladrilhos}>
        {ladrilhos.map((letra, indice) =>
          usados[indice] ? null : (
            <TouchableOpacity
              key={indice}
              style={estilos.ladrilho}
              onPress={() => tocarLadrilho(letra, indice)}
              accessibilityRole="button"
              accessibilityLabel={`letra ${letra}`}
            >
              <Text style={estilos.ladrilhoTexto}>{letra.toUpperCase()}</Text>
            </TouchableOpacity>
          ),
        )}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: {
    alignItems: 'center',
    gap: espacamento.md,
  },
  vagas: {
    flexDirection: 'row',
    gap: espacamento.sm,
  },
  vaga: {
    width: ALVO_TOQUE_MINIMO,
    height: ALVO_TOQUE_MINIMO,
    borderRadius: raio.sm,
    borderWidth: 2.5,
    borderStyle: 'dashed',
    borderColor: cores.linha,
    backgroundColor: cores.papelAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vagaCheia: {
    borderStyle: 'solid',
    borderColor: cores.blocoVerde,
    backgroundColor: cores.blocoVerdeT,
  },
  vagaTexto: {
    fontFamily: fontes.tituloExtra,
    fontSize: 22,
    color: cores.tinta,
  },
  ladrilhos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacamento.sm,
    justifyContent: 'center',
  },
  ladrilho: {
    minWidth: ALVO_TOQUE_MINIMO,
    height: ALVO_TOQUE_MINIMO,
    paddingHorizontal: espacamento.md,
    borderRadius: raio.sm,
    backgroundColor: cores.blocoAmarelo,
    alignItems: 'center',
    justifyContent: 'center',
    ...sombraBlk,
  },
  ladrilhoTexto: {
    fontFamily: fontes.tituloExtra,
    fontSize: 22,
    color: cores.tinta,
  },
});
