import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BotaoSairRodada } from '../../../components/BotaoSairRodada';
import { MontagemPalavra } from '../../../components/MontagemPalavra';
import { PillContador } from '../../../components/PillContador';
import type { DesafioLeitura } from '../../../models/desafio_leitura';
import { gerarAlternativasLetra } from '../../../services/alternativas_letra';
import { ALVO_TOQUE_MINIMO, cores, espacamento, fontes, raio } from '../../../theme';

/**
 * Tela de desafio — Ditado (T029). Nível 1: 4 alternativas de letra
 * (FR-006). Níveis 2+: montagem por letras embaralhadas, sem palavra
 * visível. **Em nenhum nível a letra/palavra aparece escrita** — só o
 * áudio é a pista (princípio supremo da constituição, US1 cenário 1).
 *
 * `falar` é injetado pelo chamador: nível 1 usa o clipe gravado da letra
 * (`tts.tocarClipe`, D-27 — síntese pronuncia fonema isolado mal); nível
 * 2+ usa síntese (`tts.falar`) pra palavra inteira. Este componente não
 * sabe qual dos dois é — só chama.
 */
export interface TelaDitadoProps {
  desafio: DesafioLeitura;
  /** Pool de letras candidatas pras alternativas erradas (nível 1 só). */
  candidatasLetra?: string[];
  falar: () => void | Promise<void>;
  onAcerto: () => void;
  onErro: () => void;
  /** D-39 — botão de sair sempre visível, nunca esconde. */
  onSair: () => void;
  /** Notifica quem orquestra a rodada a cada repetição — contador é por rodada, não por desafio (D-19). */
  onAjuda?: () => void;
}

export function TelaDitado({
  desafio,
  candidatasLetra,
  falar,
  onAcerto,
  onErro,
  onSair,
  onAjuda,
}: TelaDitadoProps) {
  const [repeticoes, setRepeticoes] = useState(0);

  useEffect(() => {
    void falar(); // toca sozinho ao entrar no desafio — não conta como repetição
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desafio.palavra]);

  function repetirAudio() {
    setRepeticoes((r) => r + 1);
    onAjuda?.();
    void falar();
  }

  const ehNivel1 = desafio.nivel === 1;
  const alternativas = ehNivel1
    ? gerarAlternativasLetra(desafio.palavra, candidatasLetra ?? [])
    : null;

  return (
    <SafeAreaView style={estilos.raiz} edges={['top', 'bottom']}>
      <BotaoSairRodada onSair={onSair} />
      <PillContador icone="🔁" rotulo="repetições" valor={repeticoes} />

      <TouchableOpacity
        style={estilos.iconeAudio}
        onPress={repetirAudio}
        accessibilityRole="button"
        accessibilityLabel="ouvir de novo"
      >
        <Text style={estilos.iconeAudioTexto}>🔊</Text>
      </TouchableOpacity>
      <Text style={estilos.dica}>toque pra ouvir de novo</Text>

      {ehNivel1 && alternativas ? (
        <View style={estilos.alternativas}>
          {alternativas.map((letra) => (
            <TouchableOpacity
              key={letra}
              style={estilos.alternativa}
              onPress={() => (letra === desafio.palavra ? onAcerto() : onErro())}
              accessibilityRole="button"
              accessibilityLabel={`letra ${letra}`}
            >
              <Text style={estilos.alternativaTexto}>{letra.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <MontagemPalavra palavra={desafio.palavra} onErro={onErro} onCompleta={onAcerto} />
      )}
    </SafeAreaView>
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
  iconeAudio: {
    width: 88,
    height: 88,
    borderRadius: raio.pill,
    backgroundColor: cores.blocoVermelho,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconeAudioTexto: {
    fontSize: 36,
  },
  dica: {
    fontFamily: fontes.corpoBold,
    color: cores.tintaFraca,
    fontSize: 13,
    marginTop: -espacamento.sm,
  },
  alternativas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacamento.sm,
    justifyContent: 'center',
    marginTop: espacamento.md,
  },
  alternativa: {
    width: ALVO_TOQUE_MINIMO + 8,
    height: ALVO_TOQUE_MINIMO + 8,
    borderRadius: raio.md,
    backgroundColor: cores.blocoAzulT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alternativaTexto: {
    fontFamily: fontes.tituloExtra,
    fontSize: 26,
    color: cores.blocoAzul,
  },
});
