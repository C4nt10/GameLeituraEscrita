import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BotaoSairRodada } from '../../../components/BotaoSairRodada';
import { PillContador } from '../../../components/PillContador';
import type { DesafioLeitura } from '../../../models/desafio_leitura';
import { avaliarLeitura } from '../../../services/avaliacao_leitura';
import { leituraVozDisponivel, verificarCapacidades } from '../../../services/capacidade_aparelho';
import { cores, espacamento, fontes, raio } from '../../../theme';

/**
 * Tela de desafio — Leitura·voz (T031). A palavra fica visível (é
 * leitura, não ditado) e o **app fica calado** (D-11) — quem lê é a
 * criança. Grava por toque explícito de início/fim (nunca por VAD
 * agressivo/pausa curta — D-37, e nunca por gesto de segurar, que o
 * Princípio VI proíbe).
 *
 * `iniciarGravacao`/`pararGravacao`/`transcrever` são injetados —
 * `whisper.rn` ainda não está instalado no app (T028 documentou isso:
 * exige `expo prebuild`, não roda no Expo Go). Este componente não
 * conhece o motor de STT, só a interface: grava, transcreve, avalia com
 * `avaliacao_leitura` (D-08/D-09/D-37, já testado em T020/T020a).
 *
 * Microfone indisponível (T033, T017/FR-013): checa antes de oferecer o
 * botão — se não tiver permissão, mostra o motivo real no lugar do
 * microfone, nunca esconde a opção nem mostra erro genérico (Princípio
 * I/III).
 *
 * Sem troca automática de modalidade (D-10 revogado, D-39 — isso
 * esconderia o ponto que a criança precisa treinar, contra o Princípio
 * IV). Em vez disso, o botão "sair da rodada" fica sempre visível
 * (`onSair`) — a criança/adulto decide, o app não decide sozinho.
 */
export interface TelaLeituraVozProps {
  desafio: DesafioLeitura;
  vocabularioConhecido?: Set<string>;
  iniciarGravacao: () => Promise<void>;
  pararGravacao: () => Promise<string>;
  transcrever: (audioUri: string) => Promise<string>;
  onAcerto: () => void;
  onErro: () => void;
  /** D-39 — botão de sair sempre visível, nunca esconde. */
  onSair: () => void;
  /** Notifica quem orquestra a rodada a cada tentativa — contador é por rodada, não por desafio (D-19). */
  onAjuda?: () => void;
}

type Estado = 'parado' | 'gravando' | 'processando';

export function TelaLeituraVoz({
  desafio,
  vocabularioConhecido,
  iniciarGravacao,
  pararGravacao,
  transcrever,
  onAcerto,
  onErro,
  onSair,
  onAjuda,
}: TelaLeituraVozProps) {
  const [estado, setEstado] = useState<Estado>('parado');
  const [tentativas, setTentativas] = useState(0);
  const [ultimaTranscricao, setUltimaTranscricao] = useState<string | null>(null);
  const [motivoMicrofoneIndisponivel, setMotivoMicrofoneIndisponivel] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let cancelado = false;
    verificarCapacidades().then((capacidades) => {
      const voz = leituraVozDisponivel(capacidades);
      if (!cancelado && !voz.disponivel) {
        setMotivoMicrofoneIndisponivel(voz.motivo);
      }
    });
    return () => {
      cancelado = true;
    };
  }, []);

  async function alternarGravacao() {
    if (estado === 'processando' || motivoMicrofoneIndisponivel !== null) return;

    if (estado === 'parado') {
      setEstado('gravando');
      await iniciarGravacao();
      return;
    }

    // estado === 'gravando'
    setEstado('processando');
    const audioUri = await pararGravacao();
    const transcricaoBruta = await transcrever(audioUri);
    setUltimaTranscricao(transcricaoBruta);
    setTentativas((t) => t + 1);
    onAjuda?.();

    const aceito = avaliarLeitura(desafio.palavra, transcricaoBruta, vocabularioConhecido);
    setEstado('parado');
    if (aceito) {
      onAcerto();
    } else {
      onErro();
    }
  }

  return (
    <SafeAreaView style={estilos.raiz} edges={['top', 'bottom']}>
      <BotaoSairRodada onSair={onSair} />
      <PillContador icone="🔁" rotulo="tentativas" valor={tentativas} />

      <Text style={estilos.palavraAlvo}>{desafio.palavra}</Text>

      {motivoMicrofoneIndisponivel !== null ? (
        <View style={estilos.avisoMicrofone} accessibilityLabel={motivoMicrofoneIndisponivel}>
          <Text style={estilos.iconeMicTexto}>🎤🚫</Text>
          <Text style={estilos.avisoMicrofoneTexto}>{motivoMicrofoneIndisponivel}</Text>
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={[estilos.iconeMic, estado === 'gravando' && estilos.iconeMicGravando]}
            onPress={alternarGravacao}
            disabled={estado === 'processando'}
            accessibilityRole="button"
            accessibilityLabel={
              estado === 'gravando' ? 'parar gravação' : 'toque e leia em voz alta'
            }
          >
            <Text style={estilos.iconeMicTexto}>🎤</Text>
          </TouchableOpacity>
          <Text style={estilos.dica}>
            {estado === 'gravando'
              ? 'toque de novo pra parar'
              : estado === 'processando'
                ? 'ouvindo...'
                : 'toque e leia em voz alta'}
          </Text>
        </>
      )}

      {ultimaTranscricao !== null && (
        <View style={estilos.balao}>
          <Text style={estilos.balaoTexto}>eu entendi: &quot;{ultimaTranscricao}&quot;</Text>
        </View>
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
  palavraAlvo: {
    fontFamily: fontes.tituloExtra,
    fontSize: 40,
    color: cores.tinta,
  },
  avisoMicrofone: {
    alignItems: 'center',
    gap: espacamento.sm,
    maxWidth: 280,
  },
  avisoMicrofoneTexto: {
    fontFamily: fontes.corpoBold,
    textAlign: 'center',
    color: cores.tintaFraca,
  },
  iconeMic: {
    width: 88,
    height: 88,
    borderRadius: raio.pill,
    backgroundColor: cores.categoriaNatureza,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconeMicGravando: {
    backgroundColor: cores.blocoVermelho,
  },
  iconeMicTexto: {
    fontSize: 36,
  },
  dica: {
    fontFamily: fontes.corpoBold,
    color: cores.tintaFraca,
    fontSize: 13,
    marginTop: -espacamento.sm,
  },
  balao: {
    marginTop: espacamento.md,
    paddingVertical: espacamento.sm,
    paddingHorizontal: espacamento.md,
    borderRadius: raio.md,
    backgroundColor: cores.blocoVerdeT,
  },
  balaoTexto: {
    fontFamily: fontes.corpoBold,
    color: cores.tinta,
  },
});
