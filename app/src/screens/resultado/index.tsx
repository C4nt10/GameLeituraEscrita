import { StyleSheet, Text, View } from 'react-native';
import { Botao } from '../../components/Botao';
import type { Modalidade } from '../../models/registro_historico';
import type { ResultadoAvaliacao } from '../../services/avaliacao';
import { cores, espacamento, raio } from '../../theme';

const MAXIMO_ESTRELAS = 5;

const ROTULO_CONTADOR_AJUDA: Record<Modalidade, string> = {
  ditado: 'repetições',
  leitura_montar: 'espiadas',
  leitura_voz: 'tentativas',
};

const ICONE_CONTADOR_AJUDA: Record<Modalidade, string> = {
  ditado: '🔁',
  leitura_montar: '👀',
  leitura_voz: '🔁',
};

function mensagemResultado(precisao: number, erros: number): string {
  if (erros === 0) return 'Perfeito, sem nenhum erro! Quer jogar de novo?';
  if (precisao >= 0.7) return 'Muito bem! Quer jogar de novo?';
  return 'Foi um bom treino. Quer tentar de novo?';
}

function Estrelas({ valor }: { valor: number }) {
  const cheias = Math.floor(valor);
  const temMeia = valor - cheias >= 0.5;
  const vazias = MAXIMO_ESTRELAS - cheias - (temMeia ? 1 : 0);

  return (
    <View
      style={estilos.estrelasLinha}
      accessibilityLabel={`${valor} de ${MAXIMO_ESTRELAS} estrelas`}
    >
      {Array.from({ length: cheias }).map((_, i) => (
        <Text key={`cheia-${i}`} style={estilos.estrela}>
          ★
        </Text>
      ))}
      {temMeia && <Text style={[estilos.estrela, estilos.estrelaMeia]}>★</Text>}
      {Array.from({ length: vazias }).map((_, i) => (
        <Text key={`vazia-${i}`} style={[estilos.estrela, estilos.estrelaVazia]}>
          ★
        </Text>
      ))}
    </View>
  );
}

/**
 * Tela de resultado da rodada (T032, CU-05, FR-007, D-19/D-20). Reusa o
 * cálculo de `avaliacao` (T018) — não recalcula precisão/estrelas aqui.
 * Contador de ajuda sempre visível (Princípio IV) com rótulo certo pra
 * modalidade jogada (D-19); rodada sem erro ganha mensagem de destaque
 * (CU-05); mensagem nunca é depreciativa, mesmo no pior desempenho.
 */
export interface TelaResultadoProps {
  resultado: ResultadoAvaliacao;
  acertos: number;
  erros: number;
  modalidade: Modalidade;
  /** `null` só em rodada de matemática pura (D-19). */
  contadorAjuda: number | null;
  onJogarDeNovo: () => void;
  onSubirDeNivel: () => void;
}

export function TelaResultado({
  resultado,
  acertos,
  erros,
  modalidade,
  contadorAjuda,
  onJogarDeNovo,
  onSubirDeNivel,
}: TelaResultadoProps) {
  return (
    <View style={estilos.raiz}>
      <Estrelas valor={resultado.estrelas} />

      <View style={estilos.stats}>
        <View style={estilos.stat}>
          <Text style={estilos.statNumero}>{acertos}</Text>
          <Text style={estilos.statRotulo}>acertos</Text>
        </View>
        <View style={estilos.stat}>
          <Text style={estilos.statNumero}>{erros}</Text>
          <Text style={estilos.statRotulo}>erros</Text>
        </View>
        <View style={estilos.stat}>
          <Text style={estilos.statNumero}>{Math.round(resultado.precisao * 100)}%</Text>
          <Text style={estilos.statRotulo}>precisão</Text>
        </View>
      </View>

      {contadorAjuda !== null && (
        <View style={estilos.chipAjuda}>
          <Text style={estilos.chipAjudaTexto}>
            {ICONE_CONTADOR_AJUDA[modalidade]} {ROTULO_CONTADOR_AJUDA[modalidade]} nesta rodada:{' '}
            {contadorAjuda}
          </Text>
        </View>
      )}

      <Text style={estilos.mensagem}>{mensagemResultado(resultado.precisao, erros)}</Text>

      <View style={estilos.botoes}>
        <Botao onPress={onJogarDeNovo} acessibilidade="jogar de novo">
          🔁 Jogar de novo
        </Botao>
        <Botao onPress={onSubirDeNivel} variante="fantasma" acessibilidade="subir de nível">
          ⬆️ Subir de nível
        </Botao>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacamento.md,
    padding: espacamento.lg,
    backgroundColor: cores.papel,
  },
  estrelasLinha: {
    flexDirection: 'row',
    gap: espacamento.xs,
  },
  estrela: {
    fontSize: 32,
    color: cores.blocoAmarelo,
  },
  estrelaMeia: {
    opacity: 0.5,
  },
  estrelaVazia: {
    color: cores.linha,
  },
  stats: {
    flexDirection: 'row',
    gap: espacamento.lg,
  },
  stat: {
    alignItems: 'center',
  },
  statNumero: {
    fontSize: 24,
    fontWeight: '800',
    color: cores.tinta,
  },
  statRotulo: {
    fontSize: 12,
    color: cores.tintaFraca,
  },
  chipAjuda: {
    paddingVertical: espacamento.xs,
    paddingHorizontal: espacamento.md,
    borderRadius: raio.pill,
    backgroundColor: cores.papelAlt,
  },
  chipAjudaTexto: {
    fontSize: 13,
    fontWeight: '700',
    color: cores.tintaFraca,
  },
  mensagem: {
    fontSize: 17,
    fontWeight: '700',
    color: cores.tinta,
    textAlign: 'center',
  },
  botoes: {
    gap: espacamento.sm,
    marginTop: espacamento.sm,
    width: '100%',
    maxWidth: 280,
  },
});
