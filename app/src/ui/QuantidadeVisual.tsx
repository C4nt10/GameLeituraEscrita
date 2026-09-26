import { StyleSheet, View } from 'react-native';
import type { RepresentacaoQuantidade } from '../services/representacao_quantidade';
import { cor, degrau, espaco } from '../theme/tema';
import type { CorDeBloco } from './Bloco';

/**
 * Desenha a quantidade que `representacao_quantidade` manda (D-42): bolinhas
 * em linhas de 5, barra de 10 + cubinhos (material dourado) ou N grupos de M
 * objetos. Só exibição — "o bloco é o único objeto tocável" (guia), então nada
 * aqui responde a toque. As bolinhas têm degrau, como os blocos do jogo; o
 * dourado usa `dourado`/`douradoBorda` do tema.
 */
export interface QuantidadeVisualProps {
  representacao: RepresentacaoQuantidade;
  /** Cor das bolinhas/objetos (roxo em Conta, verde em Historinha). */
  cor?: CorDeBloco;
}

function descricao(r: RepresentacaoQuantidade): string {
  if (r.tipo === 'bolinhas') return `${r.linhas.reduce((a, b) => a + b, 0)} bolinhas`;
  if (r.tipo === 'dourado')
    return `${r.dezenas * 10 + r.unidades} — ${r.dezenas} barras de dez e ${r.unidades} cubinhos`;
  return `${r.grupos} grupos de ${r.porGrupo}`;
}

function Bolinha({ cor: c, tamanho = TAMANHO_BOLINHA }: { cor: CorDeBloco; tamanho?: number }) {
  return (
    <View
      style={[
        degrau(c, 3),
        { width: tamanho, height: tamanho, borderRadius: tamanho / 2, shadowOpacity: 0 },
      ]}
    />
  );
}

export function QuantidadeVisual({
  representacao,
  cor: corDaBolinha = cor.roxo,
}: QuantidadeVisualProps) {
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
              <Bolinha key={i} cor={corDaBolinha} />
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
                <Bolinha key={i} cor={corDaBolinha} tamanho={TAMANHO_BOLINHA_PEQUENA} />
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const TAMANHO_BOLINHA = 22;
const TAMANHO_BOLINHA_PEQUENA = 14;

const estilos = StyleSheet.create({
  raiz: {
    alignItems: 'center',
    gap: espaco.xs,
  },
  linha: {
    flexDirection: 'row',
    gap: 6,
  },
  dourado: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: espaco.s,
  },
  barra: {
    gap: 1,
    padding: 2,
    borderRadius: 5,
    backgroundColor: cor.dourado,
    borderWidth: 1.5,
    borderColor: cor.douradoBorda,
  },
  celulaBarra: {
    width: 14,
    height: 8,
    borderRadius: 1,
    backgroundColor: cor.amarelo.claro,
  },
  cubinhos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 5 * 18,
    gap: 3,
  },
  cubinho: {
    width: 15,
    height: 15,
    borderRadius: 3,
    backgroundColor: cor.dourado,
    borderWidth: 1.5,
    borderColor: cor.douradoBorda,
  },
  grupos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: espaco.s,
    maxWidth: 290,
  },
  grupo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 64,
    gap: 3,
    padding: 5,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: cor.grade,
    backgroundColor: cor.papel2,
    justifyContent: 'center',
  },
});
