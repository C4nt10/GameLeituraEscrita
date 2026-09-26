import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MontagemPalavra } from '../../../components/MontagemPalavra';
import type { DesafioLeitura } from '../../../models/desafio_leitura';
import { gerarAlternativasLetra } from '../../../services/alternativas_letra';
import { caixaDaLetra, cor, corModalidade, fonte, tamanho } from '../../../theme/tema';
import { BarraDoDesafio } from '../../../ui/BarraDoDesafio';
import { BotaoDeEstimulo } from '../../../ui/BotaoDeEstimulo';
import { Festa } from '../../../ui/Festa';
import { RespostaEmBloco } from '../../../ui/RespostaEmBloco';
import { TelaBase } from '../../../ui/TelaBase';
import { ZonasDoDesafio } from '../../../ui/ZonasDoDesafio';

/**
 * Tela de desafio — Ouvir e montar (Ditado, T029/T109). Nível 1: 4 alternativas
 * de letra em grade 2×2 (FR-006, A-25). Níveis 2+: montagem por letras
 * embaralhadas, sem palavra visível. **Em nenhum momento a palavra aparece
 * escrita antes de a criança montá-la** — só o áudio é a pista (princípio
 * supremo, US1 cenário 1); depois de montada, a comemoração a mostra.
 *
 * `falar` é injetado pelo chamador: nível 1 usa o clipe gravado da letra
 * (`tts.tocarClipe`, D-27); nível 2+ usa síntese (`tts.falar`). Este
 * componente não sabe qual dos dois é — só chama.
 *
 * Visual do padrão "Letra Viva": barra do desafio (Sair · trilha · "ouviu"),
 * alto-falante de 150 com onda, e comemoração por palavra.
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
  /** Ajudas da rodada inteira até agora (D-19) — vem do orquestrador, não zera a cada palavra. */
  ajudas?: number;
  /** Posição do desafio na rodada (trilha de progresso e "Ver estrelas" na última). */
  posicao?: { atual: number; total: number };
}

export function TelaDitado({
  desafio,
  candidatasLetra,
  falar,
  onAcerto,
  onErro,
  onSair,
  onAjuda,
  ajudas = 0,
  posicao = { atual: 0, total: 1 },
}: TelaDitadoProps) {
  const [festa, setFesta] = useState(false);

  useEffect(() => {
    void falar(); // toca sozinho ao entrar no desafio — não conta como repetição
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desafio.palavra]);

  function repetirAudio() {
    onAjuda?.();
    void falar();
  }

  const ehNivel1 = desafio.nivel === 1;
  const [alternativas] = useState(() =>
    ehNivel1 ? gerarAlternativasLetra(desafio.palavra, candidatasLetra ?? []) : null,
  );

  function seguir() {
    setFesta(false);
    onAcerto();
  }

  return (
    <TelaBase>
      <BarraDoDesafio
        aoSair={onSair}
        total={posicao.total}
        atual={posicao.atual}
        contador={{ rotulo: 'ouviu', valor: ajudas }}
      />

      <ZonasDoDesafio
        estimulo={
          <>
            <BotaoDeEstimulo
              cor={corModalidade.ditado}
              icone="som"
              onPress={repetirAudio}
              acessibilidade="ouvir de novo"
            />
            <Text allowFontScaling={false} style={estilos.instrucao}>
              Ouça e monte a palavra
            </Text>
          </>
        }
        resposta={
          ehNivel1 && alternativas ? (
            <View style={estilos.grade}>
              {alternativas.map((letra) => (
                <RespostaEmBloco
                  key={letra}
                  texto={caixaDaLetra(letra)}
                  familia="letra"
                  certa={letra === desafio.palavra}
                  aoAcertar={() => setFesta(true)}
                  aoErrar={onErro}
                />
              ))}
            </View>
          ) : (
            <MontagemPalavra
              palavra={desafio.palavra}
              indiceDoDesafio={posicao.atual}
              onErro={onErro}
              onCompleta={() => setFesta(true)}
            />
          )
        }
      />

      {festa ? (
        <Festa
          palavra={caixaDaLetra(desafio.palavra)}
          ultima={posicao.atual + 1 >= posicao.total}
          aoSeguir={seguir}
        />
      ) : null}
    </TelaBase>
  );
}

const estilos = StyleSheet.create({
  instrucao: {
    fontFamily: fonte.displayMedio,
    fontSize: tamanho.subtitulo,
    color: cor.tinta2,
    textAlign: 'center',
  },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    maxWidth: 320,
  },
});
