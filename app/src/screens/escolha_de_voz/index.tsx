import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cores, espacamento, fontes, raio } from '../../theme';

export interface VozDisponivel {
  identifier: string;
  name: string;
  language: string;
  quality: 'Default' | 'Enhanced';
}

/**
 * Tela de escolha e teste de voz (T048, CU-07): lista vozes em
 * português do aparelho, destaca as de melhor qualidade, testa com um
 * toque, escolha fica salva (D-27, `configuracao.vozId`). Sem voz pt
 * instalada: informa e orienta a instalar, nunca falha em silêncio
 * (Princípio III) — reusa o motivo de `capacidade_aparelho` (T017).
 */
export interface TelaEscolhaDeVozProps {
  vozes: VozDisponivel[];
  vozSelecionadaId: string | null;
  /** Presente quando não há nenhuma voz pt — `capacidade_aparelho.vozPortugues.motivo`. */
  motivoSemVoz: string | null;
  onSelecionarVoz: (vozId: string) => void;
  onTestarVoz: (vozId: string) => void;
}

export function TelaEscolhaDeVoz({
  vozes,
  vozSelecionadaId,
  motivoSemVoz,
  onSelecionarVoz,
  onTestarVoz,
}: TelaEscolhaDeVozProps) {
  if (motivoSemVoz !== null) {
    return (
      <SafeAreaView style={estilos.raizVazia} edges={['top', 'bottom']}>
        <Text style={estilos.avisoTitulo}>Nenhuma voz em português encontrada</Text>
        <Text style={estilos.avisoTexto}>{motivoSemVoz}</Text>
        <Text style={estilos.avisoTexto}>
          Instale uma voz em português nas configurações de acessibilidade/fala do aparelho, e volte
          aqui.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={estilos.raiz} edges={['top', 'bottom']}>
      <Text style={estilos.titulo}>Escolher a voz</Text>
      <Text style={estilos.legenda}>
        A qualidade do som depende da voz do aparelho, não deste app — vozes marcadas como
        &quot;melhor qualidade&quot; costumam soar mais natural.
      </Text>

      {vozes.map((voz) => {
        const selecionada = voz.identifier === vozSelecionadaId;
        return (
          <View key={voz.identifier} style={[estilos.linha, selecionada && estilos.linhaAtiva]}>
            <TouchableOpacity
              style={estilos.info}
              onPress={() => onSelecionarVoz(voz.identifier)}
              accessibilityRole="button"
              accessibilityState={{ selected: selecionada }}
              accessibilityLabel={`usar voz ${voz.name}`}
            >
              <Text style={estilos.nomeVoz}>{voz.name}</Text>
              {voz.quality === 'Enhanced' && <Text style={estilos.selo}>melhor qualidade</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={estilos.botaoTestar}
              onPress={() => onTestarVoz(voz.identifier)}
              accessibilityRole="button"
              accessibilityLabel={`testar voz ${voz.name}`}
            >
              <Text style={estilos.botaoTestarTexto}>🔊 testar</Text>
            </TouchableOpacity>
          </View>
        );
      })}
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.papel,
  },
  titulo: {
    fontFamily: fontes.titulo,
    fontSize: 20,
    color: cores.tinta,
  },
  legenda: {
    fontFamily: fontes.corpo,
    fontSize: 13,
    color: cores.tintaFraca,
  },
  avisoTitulo: {
    fontFamily: fontes.titulo,
    fontSize: 17,
    color: cores.tinta,
    textAlign: 'center',
  },
  avisoTexto: {
    fontFamily: fontes.corpo,
    fontSize: 14,
    color: cores.tintaFraca,
    textAlign: 'center',
    maxWidth: 300,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espacamento.sm,
    padding: espacamento.sm,
    borderRadius: raio.md,
    backgroundColor: cores.papelAlt,
  },
  linhaAtiva: {
    borderWidth: 2,
    borderColor: cores.blocoAzul,
  },
  info: {
    flex: 1,
  },
  nomeVoz: {
    fontFamily: fontes.corpoBold,
    fontSize: 15,
    color: cores.tinta,
  },
  selo: {
    fontFamily: fontes.corpoBold,
    fontSize: 11,
    color: cores.blocoVerde,
  },
  botaoTestar: {
    paddingVertical: espacamento.xs,
    paddingHorizontal: espacamento.sm,
    borderRadius: raio.pill,
    backgroundColor: cores.blocoAzulT,
  },
  botaoTestarTexto: {
    fontFamily: fontes.corpoBold,
    fontSize: 13,
    color: cores.blocoAzul,
  },
});
