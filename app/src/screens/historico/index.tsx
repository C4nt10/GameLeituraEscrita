import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BotaoVoltar } from '../../components/BotaoVoltar';
import type { Modalidade, RegistroHistorico } from '../../models/registro_historico';
import { calcularResumoHistorico } from '../../services/resumo_historico';
import { cores, espacamento, fontes, raio } from '../../theme';

const ROTULO_MODALIDADE: Record<Modalidade, string> = {
  ditado: 'Ditado',
  leitura_montar: 'Leitura · montar',
  leitura_voz: 'Leitura · voz',
};

const ROTULO_CONTADOR_AJUDA: Record<Modalidade, string> = {
  ditado: 'repetições',
  leitura_montar: 'espiadas',
  leitura_voz: 'tentativas',
};

function formatarData(iso: string): string {
  const data = new Date(iso);
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);

  const mesmoDia = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (mesmoDia(data, hoje))
    return `Hoje, ${data.getHours()}:${String(data.getMinutes()).padStart(2, '0')}`;
  if (mesmoDia(data, ontem))
    return `Ontem, ${data.getHours()}:${String(data.getMinutes()).padStart(2, '0')}`;
  return data.toLocaleDateString('pt-BR');
}

function rotuloTipo(rodada: RegistroHistorico): string {
  if (rodada.tipo === 'matematica') {
    return `Matemática (${rodada.formaMatematica === 'contextualizada' ? 'problema' : 'conta pura'})`;
  }
  return rodada.modalidade ? ROTULO_MODALIDADE[rodada.modalidade] : 'Leitura';
}

/**
 * Tela de histórico (T053, CU-06): resumo geral (D-20 — sem cruzar
 * modalidades, `resumo_historico`), lista mais recente→mais antiga,
 * mensagem explicando quando ainda está vazio (US4 cenário 1) —
 * nunca uma tela em branco sem contexto (Princípio I).
 */
export interface TelaHistoricoProps {
  /** Já deve vir ordenada mais recente → mais antiga. */
  rodadas: RegistroHistorico[];
  onApagarTudo: () => void;
  /** D-48 — voltar sempre visível, também no estado vazio. */
  onVoltar: () => void;
}

export function TelaHistorico({ rodadas, onApagarTudo, onVoltar }: TelaHistoricoProps) {
  const resumo = calcularResumoHistorico(rodadas);

  function confirmarExclusao() {
    Alert.alert(
      'Apagar histórico?',
      'Todas as rodadas registradas serão apagadas. Essa ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: onApagarTudo },
      ],
    );
  }

  if (rodadas.length === 0) {
    return (
      <SafeAreaView style={estilos.raizVazia} edges={['top', 'bottom']}>
        <BotaoVoltar onVoltar={onVoltar} />
        <View style={estilos.mensagemVazia}>
          <Text style={estilos.tituloVazio}>Histórico</Text>
          <Text style={estilos.textoVazio}>
            Ainda não há nenhuma rodada registrada. Depois que a criança completar a primeira, ela
            aparece aqui.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={estilos.raiz} edges={['top', 'bottom']}>
      <BotaoVoltar onVoltar={onVoltar} />
      <Text style={estilos.titulo}>Histórico</Text>

      <View style={estilos.resumo}>
        {resumo.map((grupo) => (
          <View key={`${grupo.tipo}-${grupo.modalidade}`} style={estilos.cardResumo}>
            <Text style={estilos.cardResumoTitulo}>
              {grupo.tipo === 'matematica'
                ? 'Matemática'
                : grupo.modalidade
                  ? ROTULO_MODALIDADE[grupo.modalidade]
                  : ''}
            </Text>
            <Text style={estilos.cardResumoTexto}>{grupo.total} rodadas</Text>
            <Text style={estilos.cardResumoTexto}>
              {Math.round(grupo.precisaoMedia * 100)}% precisão média
            </Text>
            <Text style={estilos.cardResumoTexto}>{grupo.estrelaMedia.toFixed(1)} ★ em média</Text>
          </View>
        ))}
      </View>

      <FlatList
        data={rodadas}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => (
          <View style={estilos.linha}>
            <View style={estilos.linhaTopo}>
              <Text style={estilos.linhaTipo}>{rotuloTipo(item)}</Text>
              <Text style={estilos.linhaData}>{formatarData(item.iniciadaEm)}</Text>
            </View>
            <Text style={estilos.linhaDetalhe}>
              nível {item.nivel} · {item.acertos} acertos · {item.erros} erros ·{' '}
              {Math.round(item.precisao * 100)}% · {item.estrelas.toFixed(1)} ★
            </Text>
            {item.contadorAjuda !== null && item.modalidade !== null && (
              <Text style={estilos.linhaAjuda}>
                {ROTULO_CONTADOR_AJUDA[item.modalidade]}: {item.contadorAjuda}
              </Text>
            )}
          </View>
        )}
      />

      <TouchableOpacity
        onPress={confirmarExclusao}
        accessibilityRole="button"
        accessibilityLabel="apagar histórico"
      >
        <Text style={estilos.apagar}>🗑️ apagar histórico</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  raiz: {
    flex: 1,
    padding: espacamento.lg,
    gap: espacamento.md,
    backgroundColor: cores.papel,
  },
  raizVazia: {
    flex: 1,
    padding: espacamento.lg,
    gap: espacamento.sm,
    backgroundColor: cores.papel,
  },
  mensagemVazia: {
    flex: 1,
    gap: espacamento.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontFamily: fontes.titulo,
    fontSize: 22,
    color: cores.tinta,
  },
  tituloVazio: {
    fontFamily: fontes.titulo,
    fontSize: 20,
    color: cores.tinta,
  },
  textoVazio: {
    fontFamily: fontes.corpo,
    fontSize: 14,
    color: cores.tintaFraca,
    textAlign: 'center',
    maxWidth: 280,
  },
  resumo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacamento.sm,
  },
  cardResumo: {
    padding: espacamento.sm,
    borderRadius: raio.md,
    backgroundColor: cores.papelAlt,
    minWidth: 130,
  },
  cardResumoTitulo: {
    fontFamily: fontes.corpoBold,
    fontSize: 13,
    color: cores.tinta,
  },
  cardResumoTexto: {
    fontFamily: fontes.corpo,
    fontSize: 12,
    color: cores.tintaFraca,
  },
  linha: {
    paddingVertical: espacamento.sm,
    borderBottomWidth: 1,
    borderBottomColor: cores.linha,
  },
  linhaTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  linhaTipo: {
    fontFamily: fontes.corpoBold,
    fontSize: 14,
    color: cores.tinta,
  },
  linhaData: {
    fontFamily: fontes.corpo,
    fontSize: 12,
    color: cores.tintaFraca,
  },
  linhaDetalhe: {
    fontFamily: fontes.corpo,
    fontSize: 13,
    color: cores.tintaFraca,
  },
  linhaAjuda: {
    fontFamily: fontes.corpo,
    fontSize: 12,
    color: cores.blocoVermelho,
  },
  apagar: {
    fontFamily: fontes.corpoBold,
    textAlign: 'center',
    fontSize: 14,
    color: cores.blocoVermelho,
    paddingVertical: espacamento.sm,
  },
});
