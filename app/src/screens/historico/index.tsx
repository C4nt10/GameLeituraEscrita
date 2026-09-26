import { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import type { RegistroHistorico } from '../../models/registro_historico';
import { estrelasParaIcones } from '../../theme/helpers';
import { cor, fonte, raio, tamanho } from '../../theme/tema';
import { Botao } from '../../ui/Botao';
import { BotaoDeSaida } from '../../ui/BotaoDeSaida';
import { Chip } from '../../ui/Chip';
import { Estrela } from '../../ui/icones';
import { TelaBase } from '../../ui/TelaBase';
import { ABAS, abaDaRodada, dataDaRodada, resumoDaAba, rodadasDaAba, type IdDaAba } from './logica';

/**
 * Tela "Minhas estrelas" (T053/T114, CU-06): uma aba por jeito de jogar, cada
 * uma na sua cor, com resumo e lista da aba — **sem cruzar modalidades**
 * (D-20). Lista da mais recente pra mais antiga. Voltar sempre visível, também
 * no estado vazio (D-48); nunca uma tela em branco sem contexto (Princípio I).
 * O contador de ajuda só aparece nas abas que têm (D-19, A-21: Conta e
 * Historinha não têm). "Apagar histórico" pede confirmação (FR-015) e nunca
 * fica em vermelho: o guia reserva a cor de erro pra nada (D-54).
 */
export interface TelaHistoricoProps {
  /** Já deve vir ordenada mais recente → mais antiga. */
  rodadas: RegistroHistorico[];
  onApagarTudo: () => void;
  /** D-48 — voltar sempre visível, também no estado vazio. */
  onVoltar: () => void;
}

function Estrelinhas({ valor }: { valor: number }) {
  return (
    <View
      style={estilos.estrelinhas}
      accessible
      accessibilityLabel={`${valor} de 5 estrelas`}
      importantForAccessibility="yes"
    >
      {estrelasParaIcones(valor).map((tipo, i) => (
        <Estrela key={i} tipo={tipo} tamanho={18} />
      ))}
    </View>
  );
}

export function TelaHistorico({ rodadas, onApagarTudo, onVoltar }: TelaHistoricoProps) {
  // abre na aba da rodada mais recente, pra criança ver logo a última que jogou
  const [abaId, setAbaId] = useState<IdDaAba>(
    rodadas.length > 0 ? abaDaRodada(rodadas[0]) : 'ditado',
  );
  const aba = ABAS.find((a) => a.id === abaId) ?? ABAS[0];
  const daAba = rodadasDaAba(rodadas, aba.id);
  const resumo = resumoDaAba(daAba);

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

  return (
    <TelaBase>
      <BotaoDeSaida tipo="voltar" onPress={onVoltar} />
      <Text allowFontScaling={false} style={estilos.titulo}>
        Minhas estrelas
      </Text>

      {rodadas.length === 0 ? (
        <View style={estilos.vazio}>
          <Text style={estilos.textoVazio}>
            Ainda não há nenhuma rodada registrada. Depois que a criança completar a primeira, ela
            aparece aqui.
          </Text>
        </View>
      ) : (
        <>
          <View style={estilos.abas}>
            {ABAS.map((a) => (
              <Chip
                key={a.id}
                rotulo={a.rotulo}
                selecionado={a.id === aba.id}
                onPress={() => setAbaId(a.id)}
                corSelecionada={a.cor.base}
                textoSelecionado={a.cor.texto}
                textoGrande
              />
            ))}
          </View>

          {daAba.length === 0 ? (
            <View style={estilos.vazio}>
              <Text style={estilos.textoVazio}>
                Ainda não há rodadas de &quot;{aba.rotulo}&quot;.
              </Text>
            </View>
          ) : (
            <>
              <View style={[estilos.resumo, { borderColor: aba.cor.base }]}>
                <Text style={estilos.resumoTexto}>
                  <Text style={estilos.resumoNumero}>{resumo.total}</Text>{' '}
                  {resumo.total === 1 ? 'rodada' : 'rodadas'} ·{' '}
                  <Text style={estilos.resumoNumero}>
                    {Math.round(resumo.precisaoMedia * 100)}%
                  </Text>{' '}
                  precisão média ·{' '}
                  <Text style={estilos.resumoNumero}>{resumo.estrelaMedia.toFixed(1)}</Text> ★ em
                  média
                </Text>
              </View>

              <FlatList
                style={estilos.lista}
                data={daAba}
                keyExtractor={(r) => r.id}
                renderItem={({ item }) => (
                  <View style={estilos.linha}>
                    <View style={estilos.data}>
                      <Text style={estilos.dataTexto}>{dataDaRodada(item.iniciadaEm)}</Text>
                    </View>
                    <Text style={estilos.nivel}>nível {item.nivel}</Text>
                    <Estrelinhas valor={item.estrelas} />
                    <Text style={estilos.precisao}>{Math.round(item.precisao * 100)}%</Text>
                    {aba.contadorDeAjuda !== null && item.contadorAjuda !== null && (
                      <Text style={estilos.ajuda}>
                        {aba.contadorDeAjuda} {item.contadorAjuda}
                      </Text>
                    )}
                  </View>
                )}
              />
            </>
          )}

          <Botao
            texto="Apagar histórico"
            variante="claro"
            onPress={confirmarExclusao}
            cheio
            acessibilidade="apagar histórico"
          />
        </>
      )}
    </TelaBase>
  );
}

const estilos = StyleSheet.create({
  titulo: { fontFamily: fonte.display, fontSize: tamanho.titulo, color: cor.tinta },
  abas: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  vazio: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  textoVazio: {
    fontFamily: fonte.texto,
    fontSize: tamanho.texto,
    color: cor.tinta,
    textAlign: 'center',
    maxWidth: 300,
  },
  resumo: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: raio.cartao,
    borderWidth: 2,
    backgroundColor: cor.papel,
  },
  resumoTexto: { fontFamily: fonte.texto, fontSize: tamanho.texto, color: cor.tinta },
  resumoNumero: { fontFamily: fonte.textoForte },
  lista: { flex: 1 },
  linha: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: cor.grade,
  },
  data: {
    minWidth: 58,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: cor.papel2,
    alignItems: 'center',
  },
  dataTexto: { fontFamily: fonte.textoForte, fontSize: tamanho.legenda, color: cor.tinta },
  nivel: { fontFamily: fonte.texto, fontSize: tamanho.legenda, color: cor.tinta },
  estrelinhas: { flexDirection: 'row', flex: 1, justifyContent: 'flex-end' },
  precisao: {
    minWidth: 40,
    textAlign: 'right',
    fontFamily: fonte.textoForte,
    fontSize: tamanho.legenda,
    color: cor.tinta,
  },
  ajuda: { fontFamily: fonte.texto, fontSize: tamanho.legenda, color: cor.tinta },
});
