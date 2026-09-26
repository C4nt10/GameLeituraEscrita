import { StyleSheet, View } from 'react-native';
import type { RepresentacaoQuantidade } from '../services/representacao_quantidade';
import { cores, espacamento } from '../theme';

/**
 * Desenha a quantidade que `representacao_quantidade` manda (D-42): bolinhas
 * em linhas de 5, barra de 10 + cubinhos (estilo material dourado) ou N
 * grupos de M objetos. Só exibição — nada aqui é tocável, e a criança
 * conta o que vê sem precisar de material físico.
 */
export interface QuantidadeVisualProps {
  representacao: RepresentacaoQuantidade;
  /** Cor das bolinhas/objetos; o "dourado" usa sempre o amarelo do tema. */
  cor?: string;
}

function descricao(r: RepresentacaoQuantidade): string {
  if (r.tipo === 'bolinhas') return `${r.linhas.reduce((a, b) => a + b, 0)} bolinhas`;
  if (r.tipo === 'dourado')
    return `${r.dezenas * 10 + r.unidades} — ${r.dezenas} barras de dez e ${r.unidades} cubinhos`;
  return `${r.grupos} grupos de ${r.porGrupo}`;
}

function Bolinha({ cor }: { cor: string }) {
  return <View style={[estilos.bolinha, { backgroundColor: cor }]} />;
}

export function QuantidadeVisual({ representacao, cor = cores.blocoAzul }: QuantidadeVisualProps) {
  return (
    <View
      style={estilos.raiz}
      accessible
      accessibilityLabel={descricao(representacao)}
      importantForAccessibility="yes"
    >
      {representacao.tipo === 'bolinhas' &&
        representacao.linhas.map((quantidade, linha) => (
          <View key={linha} style={estilos.linha}>
            {Array.from({ length: quantidade }, (_, i) => (
              <Bolinha key={i} cor={cor} />
            ))}
          </View>
        ))}

      {representacao.tipo === 'dourado' && (
        <View style={estilos.dourado}>
          {Array.from({ length: representacao.dezenas }, (_, i) => (
            <View key={`barra-${i}`} style={estilos.barra}>
              {Array.from({ length: 10 }, (_, celula) => (
                <View key={celula} style={estilos.celulaBarra} />
              ))}
            </View>
          ))}
          <View style={estilos.cubinhos}>
            {Array.from({ length: representacao.unidades }, (_, i) => (
              <View key={`cubo-${i}`} style={estilos.cubinho} />
            ))}
          </View>
        </View>
      )}

      {representacao.tipo === 'grupos' && (
        <View style={estilos.grupos}>
          {Array.from({ length: representacao.grupos }, (_, grupo) => (
            <View key={grupo} style={estilos.grupo}>
              {Array.from({ length: representacao.porGrupo }, (_, i) => (
                <View key={i} style={[estilos.bolinhaPequena, { backgroundColor: cor }]} />
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const TAMANHO_BOLINHA = 20;

const estilos = StyleSheet.create({
  raiz: {
    alignItems: 'center',
    gap: espacamento.xs,
  },
  linha: {
    flexDirection: 'row',
    gap: 5,
  },
  bolinha: {
    width: TAMANHO_BOLINHA,
    height: TAMANHO_BOLINHA,
    borderRadius: TAMANHO_BOLINHA / 2,
  },
  dourado: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: espacamento.sm,
  },
  barra: {
    gap: 1,
    padding: 2,
    borderRadius: 4,
    backgroundColor: cores.blocoAmarelo,
    borderWidth: 1,
    borderColor: cores.tintaFraca,
  },
  celulaBarra: {
    width: 14,
    height: 8,
    borderRadius: 1,
    backgroundColor: cores.blocoAmareloT,
  },
  cubinhos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 5 * 16,
    gap: 2,
  },
  cubinho: {
    width: 14,
    height: 14,
    borderRadius: 2,
    backgroundColor: cores.blocoAmarelo,
    borderWidth: 1,
    borderColor: cores.tintaFraca,
  },
  grupos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: espacamento.xs,
    maxWidth: 200,
  },
  grupo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 56,
    gap: 3,
    padding: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: cores.linha,
    backgroundColor: cores.papelAlt,
    justifyContent: 'center',
  },
  bolinhaPequena: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
