import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import type { DesafioMatematica } from '../../../models/desafio_matematica';
import {
  representarGrupos,
  representarQuantidade,
} from '../../../services/representacao_quantidade';
import { cor, corModalidade, fonte, raio, tamanho } from '../../../theme/tema';
import { BarraDoDesafio } from '../../../ui/BarraDoDesafio';
import { Icone } from '../../../ui/icones';
import { useAfundar } from '../../../ui/movimento';
import { QuantidadeVisual } from '../../../ui/QuantidadeVisual';
import { RespostaEmBloco } from '../../../ui/RespostaEmBloco';
import { TelaBase } from '../../../ui/TelaBase';
import { ZonasDoDesafio } from '../../../ui/ZonasDoDesafio';

const SIMBOLO_OPERACAO: Record<DesafioMatematica['operacao'], string> = {
  soma: '+',
  subtracao: '−',
  multiplicacao: '×',
};

/**
 * Frase falada da conta pura — os docs de produto confirmam que a conta
 * (pura ou contextualizada) é sempre falada e pode ser repetida (doc001
 * §4: "diferente da leitura, aqui falar o enunciado é permitido"), mas
 * não fixam o texto exato pra forma pura. Fraseado escolhido aqui,
 * marcado pra revisão — igual às faixas numéricas do
 * `gerador_matematica`.
 */
function enunciadoFaladoPura(desafio: DesafioMatematica): string {
  const verbo =
    desafio.operacao === 'soma' ? 'mais' : desafio.operacao === 'subtracao' ? 'menos' : 'vezes';
  return `Quanto é ${desafio.operandoA} ${verbo} ${desafio.operandoB}?`;
}

/**
 * Tela de desafio — Conta / Historinha (T040/T111): conta falada (pura ou
 * contextualizada — D-23), faixa de enunciado que repete o áudio, quantidade
 * desenhada (D-42) e 4 respostas em blocos de madeira, grade 2×2. A criança
 * não precisa ler nada (D-24). **Sem contador de ajuda** (D-19, A-21) — repetir
 * o áudio não é registrado; a barra mostra só a trilha.
 *
 * Objeto da Historinha: o tema (`matematica_temas.json`) só guarda o NOME do
 * objeto (ex. "passarinho"); não existe mapa nome→asset, então o desenho é o
 * marcador genérico (bolinha, verde na Historinha) — mesma honestidade de
 * escopo dos clipes de letra (T016).
 */
export interface TelaMatematicaProps {
  desafio: DesafioMatematica;
  falar: (texto: string) => void | Promise<void>;
  onAcerto: () => void;
  onErro: () => void;
  onSair: () => void;
  /** Posição do desafio na rodada (trilha de progresso). */
  posicao?: { atual: number; total: number };
}

/**
 * Conta com a quantidade de cada operando desenhada (D-42, FR-023) —
 * sempre visível, nas duas formas. Na forma pura o número aparece junto
 * do desenho; na contextualizada só o desenho (o enunciado falado já diz
 * os números, D-24). Multiplicação (nível 8): N grupos de M.
 */
function ContaVisual({ desafio }: { desafio: DesafioMatematica }) {
  const corDoObjeto = desafio.forma === 'contextualizada' ? cor.verde : cor.roxo;
  const mostrarNumero = desafio.forma === 'pura';
  const operador = SIMBOLO_OPERACAO[desafio.operacao];

  if (desafio.operacao === 'multiplicacao') {
    return (
      <View style={estilos.contaColuna}>
        <View style={estilos.linhaDaConta}>
          <Text allowFontScaling={false} style={estilos.numero}>
            {desafio.operandoA}
          </Text>
          <Text allowFontScaling={false} style={estilos.operador}>
            {operador}
          </Text>
          <Text allowFontScaling={false} style={estilos.numero}>
            {desafio.operandoB}
          </Text>
        </View>
        <QuantidadeVisual
          representacao={representarGrupos(desafio.operandoA, desafio.operandoB)}
          cor={corDoObjeto}
        />
      </View>
    );
  }

  return (
    <View style={estilos.linhaDaConta}>
      <View style={estilos.operando}>
        {mostrarNumero && (
          <Text allowFontScaling={false} style={estilos.numero}>
            {desafio.operandoA}
          </Text>
        )}
        <QuantidadeVisual
          representacao={representarQuantidade(desafio.operandoA)}
          cor={corDoObjeto}
        />
      </View>
      <Text allowFontScaling={false} style={estilos.operador}>
        {operador}
      </Text>
      <View style={estilos.operando}>
        {mostrarNumero && (
          <Text allowFontScaling={false} style={estilos.numero}>
            {desafio.operandoB}
          </Text>
        )}
        <QuantidadeVisual
          representacao={representarQuantidade(desafio.operandoB)}
          cor={corDoObjeto}
        />
      </View>
    </View>
  );
}

/** Faixa do enunciado: toca o áudio de novo. Azul-claro com o alto-falante na cor da modalidade. */
function FaixaDoEnunciado({ texto, aoTocar }: { texto: string; aoTocar: () => void }) {
  const afundar = useAfundar();
  return (
    <Pressable
      onPress={aoTocar}
      onPressIn={afundar.aoPressionar}
      onPressOut={afundar.aoSoltar}
      accessibilityRole="button"
      accessibilityLabel="ouvir de novo"
    >
      <Animated.View style={[estilos.faixa, afundar.estilo]}>
        <View style={estilos.somDaFaixa}>
          <Icone nome="som" tamanho={26} />
        </View>
        <Text allowFontScaling={false} style={estilos.textoDaFaixa}>
          {texto}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function TelaMatematica({
  desafio,
  falar,
  onAcerto,
  onErro,
  onSair,
  posicao = { atual: 0, total: 1 },
}: TelaMatematicaProps) {
  const [travada, setTravada] = useState(false);

  const textoFalado = desafio.enunciado ?? enunciadoFaladoPura(desafio);

  useEffect(() => {
    void falar(textoFalado);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desafio]);

  return (
    <TelaBase>
      <BarraDoDesafio aoSair={onSair} total={posicao.total} atual={posicao.atual} />

      <ZonasDoDesafio
        estimulo={
          <>
            <FaixaDoEnunciado texto={textoFalado} aoTocar={() => void falar(textoFalado)} />
            <ContaVisual desafio={desafio} />
          </>
        }
        resposta={
          <View style={estilos.grade}>
            {desafio.alternativas.map((valor, indice) => (
              <RespostaEmBloco
                key={`${valor}-${indice}`}
                texto={String(valor)}
                certa={valor === desafio.resultado}
                aoAcertar={onAcerto}
                aoComecarAcerto={() => setTravada(true)}
                aoErrar={onErro}
                travada={travada}
              />
            ))}
          </View>
        }
      />
    </TelaBase>
  );
}

const estilos = StyleSheet.create({
  faixa: {
    minHeight: 64,
    maxWidth: 340,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: raio.cartao,
    backgroundColor: cor.azul.claro,
    borderWidth: 2,
    borderColor: cor.azul.base,
  },
  somDaFaixa: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: corModalidade.contaPura.base,
  },
  textoDaFaixa: {
    flexShrink: 1,
    fontFamily: fonte.displayMedio,
    fontSize: tamanho.subtitulo,
    color: cor.tinta,
  },
  linhaDaConta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },
  contaColuna: { alignItems: 'center', gap: 8 },
  operando: { alignItems: 'center', gap: 6 },
  numero: { fontFamily: fonte.display, fontSize: 38, color: cor.tinta },
  operador: { fontFamily: fonte.display, fontSize: 32, color: cor.tinta2 },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    maxWidth: 290,
  },
});
