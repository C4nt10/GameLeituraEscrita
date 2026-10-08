import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ResultadoAvaliacao } from '../../services/avaliacao';
import { estrelasParaIcones } from '../../theme/helpers';
import { cor, corModalidade, fonte, raio, tamanho } from '../../theme/tema';
import { Botao } from '../../ui/Botao';
import { Estrela, Icone } from '../../ui/icones';
import { TelaBase } from '../../ui/TelaBase';

export interface ColunaDeResultadoMisto {
  resultado: ResultadoAvaliacao;
  acertos: number;
  erros: number;
  /** Só a metade de leitura tem contador de ajuda (D-19, A-21). */
  contadorAjuda?: number | null;
  /** D-40 — só quando essa metade teve 2+ erros e sugere um nível abaixo (D-43: independente). */
  proximoNivelSugerido?: number;
}

export interface TelaResultadoMistoProps {
  leitura: ColunaDeResultadoMisto;
  matematica: ColunaDeResultadoMisto;
  onJogarDeNovo: () => void;
  /** CU-06 — histórico acessível ao final de uma rodada, além da tela inicial. */
  onVerHistorico?: () => void;
}

function Cartao({
  titulo,
  cor: corDoTipo,
  icone,
  coluna,
}: {
  titulo: string;
  cor: { base: string; degrau: string; texto: string };
  icone: React.ReactNode;
  coluna: ColunaDeResultadoMisto;
}) {
  return (
    <View style={estilos.cartao}>
      <View style={[estilos.bolha, { backgroundColor: corDoTipo.base }]}>{icone}</View>
      <Text allowFontScaling={false} style={estilos.cartaoTitulo}>
        {titulo}
      </Text>
      <View
        style={estilos.estrelas}
        accessible
        accessibilityLabel={`${coluna.resultado.estrelas} de 5 estrelas`}
        importantForAccessibility="yes"
      >
        {estrelasParaIcones(coluna.resultado.estrelas).map((tipo, i) => (
          <Estrela key={i} tipo={tipo} tamanho={22} />
        ))}
      </View>
      <Text style={estilos.cartaoTexto}>{coluna.acertos} acertos</Text>
      <Text style={estilos.cartaoTexto}>{coluna.erros} erros</Text>
      <Text style={estilos.cartaoTexto}>
        {Math.round(coluna.resultado.precisao * 100)}% precisão
      </Text>
      {coluna.contadorAjuda !== null && coluna.contadorAjuda !== undefined && (
        <Text style={estilos.cartaoTexto}>ouviu {coluna.contadorAjuda}</Text>
      )}
      {coluna.proximoNivelSugerido !== undefined && (
        <Text style={estilos.sugestao}>Próxima começa no nível {coluna.proximoNivelSugerido}</Text>
      )}
    </View>
  );
}

/**
 * Resultado de uma rodada Misturada (T137, D-57, FR-033): duas colunas, uma
 * de leitura e uma de matemática — a mesma ideia visual da
 * `TelaResultadoCombinado` da Dupla, com os ícones/cores da modalidade no
 * lugar das bolhas de perfil. **Nunca uma nota combinando as duas** (D-20) —
 * cada coluna tem sua própria estrela/precisão/sugestão de nível (D-40,
 * D-43, independentes).
 */
export function TelaResultadoMisto({
  leitura,
  matematica,
  onJogarDeNovo,
  onVerHistorico,
}: TelaResultadoMistoProps) {
  return (
    <TelaBase>
      <ScrollView
        contentContainerStyle={estilos.conteudo}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Text allowFontScaling={false} style={estilos.titulo}>
          Letras e Contas, misturadas!
        </Text>

        <View style={estilos.colunas}>
          <Cartao
            titulo="Letras"
            cor={corModalidade.ditado}
            icone={<Icone nome="som" tamanho={26} />}
            coluna={leitura}
          />
          <Cartao
            titulo="Contas"
            cor={corModalidade.contaPura}
            icone={
              <Text allowFontScaling={false} style={estilos.glifoDeConta}>
                1+2
              </Text>
            }
            coluna={matematica}
          />
        </View>

        <View style={estilos.botoes}>
          <Botao
            texto="Jogar de novo"
            icone="play"
            onPress={onJogarDeNovo}
            cheio
            acessibilidade="jogar de novo"
          />
          {onVerHistorico && (
            <Botao
              texto="Ver histórico"
              variante="claro"
              onPress={onVerHistorico}
              cheio
              acessibilidade="ver histórico"
            />
          )}
        </View>
      </ScrollView>
    </TelaBase>
  );
}

const estilos = StyleSheet.create({
  conteudo: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    paddingVertical: 8,
  },
  titulo: {
    fontFamily: fonte.display,
    fontSize: tamanho.titulo,
    color: cor.tinta,
    textAlign: 'center',
  },
  colunas: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  cartao: {
    width: 150,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: raio.cartao,
    backgroundColor: cor.papel2,
    borderWidth: 3,
    borderColor: cor.papel2,
  },
  bolha: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  glifoDeConta: { fontFamily: fonte.display, fontSize: 17, color: '#FFFFFF' },
  cartaoTitulo: { fontFamily: fonte.displayMedio, fontSize: tamanho.subtitulo, color: cor.tinta },
  estrelas: { flexDirection: 'row' },
  cartaoTexto: { fontFamily: fonte.texto, fontSize: tamanho.legenda, color: cor.tinta },
  sugestao: {
    fontFamily: fonte.texto,
    fontSize: tamanho.legenda,
    color: cor.tinta2,
    textAlign: 'center',
    marginTop: 4,
  },
  botoes: { gap: 10, width: '100%', maxWidth: 320 },
});
