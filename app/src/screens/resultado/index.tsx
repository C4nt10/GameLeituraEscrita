import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Modalidade } from '../../models/registro_historico';
import type { ResultadoAvaliacao } from '../../services/avaliacao';
import { estrelasParaIcones, mensagemDoResultado } from '../../theme/helpers';
import { cor, fonte, raio, tamanho } from '../../theme/tema';
import { Botao } from '../../ui/Botao';
import { Estrela } from '../../ui/icones';
import { TelaBase } from '../../ui/TelaBase';

const ROTULO_CONTADOR_AJUDA: Record<Modalidade, string> = {
  ditado: 'Repetições',
  leitura_montar: 'Espiadas',
  leitura_voz: 'Tentativas',
};

function Estrelas({ valor }: { valor: number }) {
  return (
    <View
      style={estilos.estrelasLinha}
      accessible
      accessibilityLabel={`${valor} de 5 estrelas`}
      importantForAccessibility="yes"
    >
      {estrelasParaIcones(valor).map((tipo, i) => (
        <Estrela key={i} tipo={tipo} tamanho={52} />
      ))}
    </View>
  );
}

function Numero({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <View style={estilos.stat}>
      <Text allowFontScaling={false} style={estilos.statNumero}>
        {valor}
      </Text>
      <Text allowFontScaling={false} style={estilos.statRotulo}>
        {rotulo}
      </Text>
    </View>
  );
}

/**
 * Tela de resultado da rodada (T032/T113, CU-05, FR-007, D-19/D-20). Reusa o
 * cálculo de `avaliacao` (T018) — não recalcula precisão/estrelas aqui.
 * Contador de ajuda sempre visível (Princípio IV) com rótulo certo pra
 * modalidade jogada (D-19); em Contas não há contador (A-21). Estrelas em
 * meias, sem mínimo de 1 (D-20); a mensagem é sempre positiva, mesmo no pior
 * desempenho, e rodada sem erro ganha destaque (CU-05). "Subir de nível" e
 * "Ver histórico" ficam aqui (D-55: as ações existentes se mantêm). Rola se
 * não couber (paisagem).
 */
export interface TelaResultadoProps {
  resultado: ResultadoAvaliacao;
  acertos: number;
  erros: number;
  /** `null` em rodada de matemática — data-model.md não define contador de ajuda pra esse tipo (D-19). */
  modalidade: Modalidade | null;
  /** `null` sempre que `modalidade` é `null` (matemática, D-19). */
  contadorAjuda: number | null;
  /**
   * D-40: presente só quando a rodada teve 2+ erros e o nível sugerido
   * pra próxima é diferente do atual — quem chama decide se mostra
   * (`ajuste_dificuldade.sugerirProximoNivel`), esta tela só exibe,
   * nunca esconde a razão (Princípio IV).
   */
  proximoNivelSugerido?: number;
  onJogarDeNovo: () => void;
  onSubirDeNivel: () => void;
  /** CU-06 — histórico acessível ao final de uma rodada, além da tela inicial. */
  onVerHistorico?: () => void;
}

export function TelaResultado({
  resultado,
  acertos,
  erros,
  modalidade,
  contadorAjuda,
  proximoNivelSugerido,
  onJogarDeNovo,
  onSubirDeNivel,
  onVerHistorico,
}: TelaResultadoProps) {
  return (
    <TelaBase>
      <ScrollView
        contentContainerStyle={estilos.conteudo}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Estrelas valor={resultado.estrelas} />

        <View style={estilos.stats}>
          <Numero valor={String(acertos)} rotulo="acertos" />
          <Numero valor={String(erros)} rotulo="erros" />
          <Numero valor={`${Math.round(resultado.precisao * 100)}%`} rotulo="precisão" />
        </View>

        {contadorAjuda !== null && modalidade !== null && (
          <View style={estilos.chipAjuda}>
            <Text style={estilos.chipAjudaTexto}>
              {ROTULO_CONTADOR_AJUDA[modalidade]} nesta rodada: {contadorAjuda}
            </Text>
          </View>
        )}

        <Text style={estilos.mensagem}>{mensagemDoResultado(resultado.estrelas, erros)}</Text>

        {proximoNivelSugerido !== undefined && (
          <Text style={estilos.avisoProximoNivel}>
            A próxima rodada começa no nível {proximoNivelSugerido}, para treinar com mais calma.
          </Text>
        )}

        <View style={estilos.botoes}>
          <Botao
            texto="Jogar de novo"
            icone="play"
            onPress={onJogarDeNovo}
            cheio
            acessibilidade="jogar de novo"
          />
          <Botao
            texto="Subir de nível"
            variante="claro"
            onPress={onSubirDeNivel}
            cheio
            acessibilidade="subir de nível"
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
    gap: 16,
    paddingVertical: 8,
  },
  estrelasLinha: { flexDirection: 'row', gap: 4 },
  stats: { flexDirection: 'row', gap: 12 },
  stat: {
    minWidth: 88,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: raio.cartao,
    backgroundColor: cor.papel2,
  },
  statNumero: { fontFamily: fonte.display, fontSize: tamanho.titulo, color: cor.tinta },
  statRotulo: { fontFamily: fonte.textoForte, fontSize: tamanho.legenda, color: cor.tinta },
  chipAjuda: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: cor.papel2,
  },
  chipAjudaTexto: { fontFamily: fonte.textoForte, fontSize: tamanho.legenda, color: cor.tinta },
  mensagem: {
    fontFamily: fonte.displayMedio,
    fontSize: tamanho.subtitulo + 2,
    color: cor.tinta,
    textAlign: 'center',
  },
  avisoProximoNivel: {
    fontFamily: fonte.texto,
    fontSize: tamanho.legenda,
    color: cor.tinta,
    textAlign: 'center',
    maxWidth: 280,
  },
  botoes: { gap: 10, width: '100%', maxWidth: 320, marginTop: 4 },
});
