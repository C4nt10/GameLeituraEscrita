import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ALVO_TOQUE_MINIMO, cores, espacamento, raio } from '../theme';

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

function embaralhar<T>(itens: T[]): T[] {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export interface MontagemPalavraProps {
  /** A palavra certa, minúscula, sem espaço (nível 1-4). */
  palavra: string;
  onErro: () => void;
  onCompleta: () => void;
}

export function MontagemPalavra({ palavra, onErro, onCompleta }: MontagemPalavraProps) {
  const letras = useMemo(() => palavra.split(''), [palavra]);
  const ladrilhos = useMemo(() => embaralhar(letras), [letras]);
  const [preenchidas, setPreenchidas] = useState<string[]>([]);
  const [usados, setUsados] = useState<boolean[]>(() => letras.map(() => false));

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
          <View
            key={indice}
            style={[estilos.vaga, indice < preenchidas.length && estilos.vagaCheia]}
          >
            <Text style={estilos.vagaTexto}>
              {indice < preenchidas.length ? preenchidas[indice].toUpperCase() : '?'}
            </Text>
          </View>
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
    borderWidth: 2,
    borderColor: cores.linha,
    backgroundColor: cores.papelAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vagaCheia: {
    borderColor: cores.blocoVerde,
    backgroundColor: cores.blocoVerdeT,
  },
  vagaTexto: {
    fontSize: 22,
    fontWeight: '700',
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
  },
  ladrilhoTexto: {
    fontSize: 22,
    fontWeight: '700',
    color: cores.tinta,
  },
});
