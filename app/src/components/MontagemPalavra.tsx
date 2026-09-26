import { useEffect, useMemo, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { embaralhar } from '../lib/embaralhar';
import { tocarLetra } from '../services/montagem_palavra';
import { corDoBloco, duracaoDoMovimento } from '../theme/helpers';
import { caixaDaLetra, movimento } from '../theme/tema';
import { Bloco } from '../ui/Bloco';
import { useReduzirMovimento, useTremor } from '../ui/movimento';
import { Vaga } from '../ui/Vaga';

/**
 * Montagem de palavra por letras embaralhadas — mecânica compartilhada por
 * Ouvir e montar (níveis 2+) e Ler e montar. **Nunca renderiza a palavra como
 * texto** — só vagas (vazias ou preenchidas pelo que a criança montou) e peças
 * soltas (princípio supremo da constituição, US1 cenário 1/T023).
 *
 * Toque errado (D-06, US1 cenário 5, D-55): conta como erro (`onErro`), a peça
 * treme e volta (sem vermelho e sem som), e a montagem é limpa de volta pro
 * início — as peças continuam disponíveis pra nova tentativa (Princípio II).
 * Visual do padrão "Letra Viva" (D-50 a D-54).
 */
export interface MontagemPalavraProps {
  /** A palavra certa, minúscula, sem espaço (nível 1-4). */
  palavra: string;
  /** Índice do desafio na rodada — desloca o ciclo de cores das peças (guia). */
  indiceDoDesafio?: number;
  onErro: () => void;
  onCompleta: () => void;
  /** Peças travadas (Ler e montar: enquanto a palavra está visível, senão vira cópia). */
  travada?: boolean;
}

/**
 * Bug real encontrado em teste manual: o orquestrador da rodada reusa a mesma
 * instância deste componente entre desafios (só troca `palavra`) — sem o
 * `key={palavra}` abaixo o estado (inicializado só no 1º mount) ficava preso ao
 * desafio ANTERIOR. Solução idiomática do React: trocar de `key` força o
 * remount, em vez de um `useEffect` chamando `setState`.
 */
export function MontagemPalavra(props: MontagemPalavraProps) {
  return <MontagemPalavraPorPalavra key={props.palavra} {...props} />;
}

function Peca({
  letra,
  indice,
  indiceDoDesafio,
  usada,
  desabilitada,
  aoTocar,
}: {
  letra: string;
  indice: number;
  indiceDoDesafio: number;
  usada: boolean;
  desabilitada: boolean;
  /** Devolve se a peça era a certa; se não, ela treme. */
  aoTocar: () => boolean;
}) {
  const tremor = useTremor();
  return (
    <Animated.View
      style={[tremor.estilo, usada && estilos.usada]}
      pointerEvents={usada ? 'none' : 'auto'}
    >
      <Bloco
        cor={corDoBloco(indice, indiceDoDesafio)}
        texto={caixaDaLetra(letra)}
        onPress={() => {
          if (!aoTocar()) tremor.disparar();
        }}
        desabilitado={desabilitada}
        acessibilidade={`letra ${letra}`}
      />
    </Animated.View>
  );
}

function MontagemPalavraPorPalavra({
  palavra,
  indiceDoDesafio = 0,
  onErro,
  onCompleta,
  travada = false,
}: MontagemPalavraProps) {
  const reduzir = useReduzirMovimento();
  const letras = useMemo(() => palavra.split(''), [palavra]);
  const pecas = useMemo(() => embaralhar(letras), [letras]);
  const [preenchidas, setPreenchidas] = useState<string[]>([]);
  const [usadas, setUsadas] = useState<boolean[]>(() => letras.map(() => false));
  // depois de um erro a montagem só é limpa quando o tremor termina (senão a peça some antes de tremer)
  const [limpando, setLimpando] = useState(false);

  useEffect(() => {
    if (!limpando) return;
    const espera = setTimeout(
      () => {
        setPreenchidas([]);
        setUsadas(letras.map(() => false));
        setLimpando(false);
      },
      duracaoDoMovimento(movimento.treme, reduzir),
    );
    return () => clearTimeout(espera);
  }, [limpando, letras, reduzir]);

  function tocar(letra: string, indice: number): boolean {
    if (limpando || usadas[indice]) return true;

    const resultado = tocarLetra(letras, preenchidas, letra);
    if (resultado.tipo === 'errado') {
      onErro();
      setLimpando(true);
      return false;
    }

    setUsadas((atual) => atual.map((u, i) => (i === indice ? true : u)));
    setPreenchidas(resultado.preenchidas);
    if (resultado.completa) onCompleta();
    return true;
  }

  return (
    <View style={estilos.raiz}>
      <View style={estilos.vagas}>
        {letras.map((_, i) => (
          <Vaga key={i} letra={preenchidas[i] ? caixaDaLetra(preenchidas[i]) : undefined} />
        ))}
      </View>
      <View style={estilos.pecas}>
        {pecas.map((letra, i) => (
          <Peca
            key={i}
            letra={letra}
            indice={i}
            indiceDoDesafio={indiceDoDesafio}
            usada={usadas[i]}
            desabilitada={travada || limpando}
            aoTocar={() => tocar(letra, i)}
          />
        ))}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { alignItems: 'center', gap: 16 },
  vagas: { flexDirection: 'row', gap: 10, justifyContent: 'center', flexWrap: 'wrap' },
  pecas: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
    minHeight: 76,
  },
  usada: { opacity: 0 },
});
