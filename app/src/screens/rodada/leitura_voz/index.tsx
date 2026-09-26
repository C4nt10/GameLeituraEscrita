import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { DesafioLeitura } from '../../../models/desafio_leitura';
import { avaliarLeitura } from '../../../services/avaliacao_leitura';
import { leituraVozDisponivel, verificarCapacidades } from '../../../services/capacidade_aparelho';
import { PermissaoMicrofoneNegadaError } from '../../../services/gravacao/nucleo';
import { caixaDaLetra, cor, corModalidade, fonte, raio, tamanho } from '../../../theme/tema';
import { BarraDoDesafio } from '../../../ui/BarraDoDesafio';
import { BotaoDeEstimulo } from '../../../ui/BotaoDeEstimulo';
import { Icone } from '../../../ui/icones';
import { TelaBase } from '../../../ui/TelaBase';
import { ZonasDoDesafio } from '../../../ui/ZonasDoDesafio';

/**
 * Tela de desafio — Ler em voz alta (Leitura·voz, T031/T112). A palavra fica
 * visível (é leitura, não ditado) e o **app fica calado** (D-11) — quem lê é a
 * criança. Grava por toque explícito de início/fim (nunca por VAD
 * agressivo/pausa curta — D-37, e nunca por gesto de segurar, que o
 * Princípio VI proíbe).
 *
 * `iniciarGravacao`/`pararGravacao`/`transcrever` são injetados: este
 * componente não conhece o motor de STT (`whisper.rn`), só a interface — grava,
 * transcreve, avalia com `avaliacao_leitura` (D-08/D-09/D-37).
 *
 * Microfone indisponível (T033, T017/FR-013): checa antes de oferecer o
 * botão — se não tiver permissão ou motor, mostra o motivo real no lugar do
 * microfone, nunca esconde a opção nem mostra erro genérico (Princípio I/III).
 *
 * Sem troca automática de modalidade (D-10 revogado, D-39): o botão Sair fica
 * sempre visível.
 *
 * Visual "Letra Viva": microfone redondo de 150 na cor turquesa com onda; o
 * que o app entendeu aparece num balão — verde se certo, **amarelo se outra
 * coisa, nunca vermelho** (D-54). Silêncio e falha do aparelho não contam
 * como erro (Princípio III).
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
  /** Tentativas da rodada inteira até agora (D-19) — vem do orquestrador. */
  ajudas?: number;
  /** Posição do desafio na rodada (trilha de progresso). */
  posicao?: { atual: number; total: number };
}

type Estado = 'parado' | 'gravando' | 'processando';

/** Depois de acertar, o balão verde fica um instante antes de seguir. */
const ESPERA_APOS_ACERTO_MS = 900;

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
  ajudas = 0,
  posicao = { atual: 0, total: 1 },
}: TelaLeituraVozProps) {
  const [estado, setEstado] = useState<Estado>('parado');
  const [entendido, setEntendido] = useState<{ texto: string; certo: boolean } | null>(null);
  // falha ao gravar/transcrever: mensagem legível, o botão continua pra tentar de novo (Princípio I/III)
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
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

  const acertou = entendido?.certo === true;
  useEffect(() => {
    if (!acertou) return;
    const espera = setTimeout(onAcerto, ESPERA_APOS_ACERTO_MS);
    return () => clearTimeout(espera);
  }, [acertou, onAcerto]);

  async function alternarGravacao() {
    if (estado === 'processando' || acertou || motivoMicrofoneIndisponivel !== null) return;

    setMensagemErro(null);

    if (estado === 'parado') {
      setEntendido(null);
      try {
        setEstado('gravando');
        await iniciarGravacao();
      } catch (erro) {
        setEstado('parado');
        setMensagemErro(
          erro instanceof PermissaoMicrofoneNegadaError
            ? erro.message
            : 'Não deu pra ligar o microfone agora. Toque de novo para tentar.',
        );
      }
      return;
    }

    // estado === 'gravando'
    setEstado('processando');
    let transcricaoBruta: string;
    try {
      const audioUri = await pararGravacao();
      transcricaoBruta = await transcrever(audioUri);
    } catch {
      setEstado('parado');
      setMensagemErro('Não consegui ouvir agora. Toque no microfone e tente de novo.');
      return;
    }

    // Silêncio não é tentativa: a criança não errou a palavra, o app não ouviu nada
    // (Princípio III — falha do aparelho não é culpa da criança; não conta como erro).
    if (transcricaoBruta.trim() === '') {
      setEstado('parado');
      setMensagemErro('Não ouvi nada. Toque no microfone e fale de novo.');
      return;
    }

    onAjuda?.();

    const aceito = avaliarLeitura(desafio.palavra, transcricaoBruta, vocabularioConhecido);
    setEstado('parado');
    setEntendido({ texto: transcricaoBruta, certo: aceito });
    if (!aceito) onErro();
  }

  const dica =
    estado === 'gravando'
      ? 'Toque de novo para parar'
      : estado === 'processando'
        ? 'Um instante…'
        : 'Toque e leia em voz alta';

  return (
    <TelaBase>
      <BarraDoDesafio
        aoSair={onSair}
        total={posicao.total}
        atual={posicao.atual}
        contador={{ rotulo: 'tentou', valor: ajudas }}
      />

      <ZonasDoDesafio
        estimulo={
          <View style={estilos.quadro}>
            <Text
              allowFontScaling={false}
              style={[estilos.palavra, acertou && { color: cor.verde.base }]}
            >
              {caixaDaLetra(desafio.palavra)}
            </Text>
          </View>
        }
        resposta={
          <>
            {motivoMicrofoneIndisponivel !== null ? (
              <View style={estilos.indisponivel} accessibilityLabel={motivoMicrofoneIndisponivel}>
                <View style={estilos.microfoneApagado}>
                  <Icone nome="mic" tamanho={64} cor={cor.tinta2} />
                </View>
                <Text style={estilos.motivo}>{motivoMicrofoneIndisponivel}</Text>
              </View>
            ) : (
              <>
                <BotaoDeEstimulo
                  cor={corModalidade.leituraVoz}
                  icone={estado === 'gravando' ? 'parar' : 'mic'}
                  redondo
                  chamando={estado !== 'processando' && !acertou}
                  onPress={alternarGravacao}
                  acessibilidade={
                    estado === 'gravando' ? 'parar gravação' : 'toque e leia em voz alta'
                  }
                />
                <Text allowFontScaling={false} style={estilos.dica}>
                  {dica}
                </Text>
              </>
            )}

            {mensagemErro !== null && (
              <View style={[estilos.balao, estilos.balaoAmarelo]}>
                <Text style={estilos.balaoTexto}>{mensagemErro}</Text>
              </View>
            )}

            {entendido !== null && mensagemErro === null && (
              <View
                style={[estilos.balao, entendido.certo ? estilos.balaoVerde : estilos.balaoAmarelo]}
              >
                <Text style={estilos.balaoTexto}>
                  Eu entendi:{' '}
                  <Text style={estilos.balaoPalavra}>{caixaDaLetra(entendido.texto)}</Text>
                  {entendido.certo ? '' : '. Vamos de novo?'}
                </Text>
              </View>
            )}
          </>
        }
      />
    </TelaBase>
  );
}

const estilos = StyleSheet.create({
  quadro: {
    width: '100%',
    maxWidth: 320,
    minHeight: 110,
    borderRadius: raio.blocoGrande,
    backgroundColor: cor.papel,
    borderWidth: 3,
    borderColor: corModalidade.leituraVoz.base,
    borderBottomWidth: 6,
    borderBottomColor: corModalidade.leituraVoz.degrau,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  palavra: {
    fontFamily: fonte.letra,
    fontSize: tamanho.palavra,
    letterSpacing: 4,
    color: cor.tinta,
  },
  dica: {
    fontFamily: fonte.displayMedio,
    fontSize: tamanho.subtitulo,
    color: cor.tinta2,
    textAlign: 'center',
  },
  indisponivel: { alignItems: 'center', gap: 12, maxWidth: 300 },
  microfoneApagado: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: cor.papel2,
    borderWidth: 3,
    borderColor: cor.grade,
    alignItems: 'center',
    justifyContent: 'center',
  },
  motivo: {
    fontFamily: fonte.textoForte,
    fontSize: tamanho.texto,
    color: cor.tinta2,
    textAlign: 'center',
  },
  balao: {
    maxWidth: 320,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: raio.cartao,
    borderWidth: 2,
  },
  balaoVerde: { backgroundColor: cor.verde.claro, borderColor: cor.verde.base },
  balaoAmarelo: { backgroundColor: cor.amarelo.claro, borderColor: cor.amarelo.base },
  balaoTexto: {
    fontFamily: fonte.textoForte,
    fontSize: tamanho.texto,
    color: cor.tinta,
    textAlign: 'center',
  },
  balaoPalavra: { fontFamily: fonte.letra },
});
