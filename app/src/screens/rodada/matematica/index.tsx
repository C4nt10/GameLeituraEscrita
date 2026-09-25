import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BotaoSairRodada } from '../../../components/BotaoSairRodada';
import { PillContador } from '../../../components/PillContador';
import type { DesafioMatematica } from '../../../models/desafio_matematica';
import { ALVO_TOQUE_MINIMO, cores, espacamento, fontes, raio } from '../../../theme';

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
 * Tela de desafio de matemática (T040): conta falada (pura ou
 * contextualizada — D-23), botão de repetir, 4 alternativas numéricas
 * (FR-006, doc001 §4). A criança não precisa ler nada (D-24) — só ouve
 * e, na forma contextualizada, vê a quantidade concreta.
 *
 * Objeto visual da forma contextualizada: o tema (`matematica_temas.json`)
 * só guarda o NOME do objeto (ex. "passarinho"), a resolução pra um
 * ícone/imagem real ficou explicitamente pra implementação
 * (`tema-matematica.schema.json`) — ainda não existe um mapa nome→asset,
 * então esta tela usa um marcador visual genérico (●) repetido, não um
 * ícone por tema. Mesma honestidade de escopo do `tts`/T016 (clipes de
 * letra que também não existem ainda).
 */
export interface TelaMatematicaProps {
  desafio: DesafioMatematica;
  falar: (texto: string) => void | Promise<void>;
  onAcerto: () => void;
  onErro: () => void;
  onSair: () => void;
  onAjuda?: () => void;
}

export function TelaMatematica({
  desafio,
  falar,
  onAcerto,
  onErro,
  onSair,
  onAjuda,
}: TelaMatematicaProps) {
  const [repeticoes, setRepeticoes] = useState(0);

  const textoFalado = desafio.enunciado ?? enunciadoFaladoPura(desafio);

  useEffect(() => {
    void falar(textoFalado);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desafio]);

  function repetir() {
    setRepeticoes((r) => r + 1);
    onAjuda?.();
    void falar(textoFalado);
  }

  return (
    <SafeAreaView style={estilos.raiz} edges={['top', 'bottom']}>
      <BotaoSairRodada onSair={onSair} />
      <PillContador icone="🔁" rotulo="repetições" valor={repeticoes} />

      <TouchableOpacity
        style={estilos.enunciado}
        onPress={repetir}
        accessibilityRole="button"
        accessibilityLabel="ouvir de novo"
      >
        <Text style={estilos.enunciadoTexto}>🔊 {textoFalado}</Text>
      </TouchableOpacity>

      {desafio.forma === 'contextualizada' ? (
        <View style={estilos.objetosConta}>
          <Text style={estilos.objetos}>{'●'.repeat(desafio.operandoA)}</Text>
          <Text style={estilos.operador}>{SIMBOLO_OPERACAO[desafio.operacao]}</Text>
          <Text style={estilos.objetos}>{'●'.repeat(desafio.operandoB)}</Text>
        </View>
      ) : (
        <View style={estilos.objetosConta}>
          <Text style={estilos.numeroConta}>{desafio.operandoA}</Text>
          <Text style={estilos.operador}>{SIMBOLO_OPERACAO[desafio.operacao]}</Text>
          <Text style={estilos.numeroConta}>{desafio.operandoB}</Text>
        </View>
      )}

      <View style={estilos.alternativas}>
        {desafio.alternativas.map((valor, indice) => (
          <TouchableOpacity
            key={`${valor}-${indice}`}
            style={estilos.alternativa}
            onPress={() => (valor === desafio.resultado ? onAcerto() : onErro())}
            accessibilityRole="button"
            accessibilityLabel={`resposta ${valor}`}
          >
            <Text style={estilos.alternativaTexto}>{valor}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
  enunciado: {
    maxWidth: 320,
    paddingVertical: espacamento.sm,
    paddingHorizontal: espacamento.md,
    borderRadius: raio.lg,
    backgroundColor: cores.blocoAzulT,
  },
  enunciadoTexto: {
    fontFamily: fontes.corpoBold,
    fontSize: 16,
    color: cores.blocoAzul,
    textAlign: 'center',
  },
  objetosConta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamento.md,
  },
  objetos: {
    fontSize: 22,
    color: cores.categoriaAnimais,
    maxWidth: 160,
  },
  numeroConta: {
    fontFamily: fontes.tituloExtra,
    fontSize: 36,
    color: cores.tinta,
  },
  operador: {
    fontFamily: fontes.tituloExtra,
    fontSize: 28,
    color: cores.tintaFraca,
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
    backgroundColor: cores.blocoVerdeT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alternativaTexto: {
    fontFamily: fontes.tituloExtra,
    fontSize: 24,
    color: cores.blocoVerde,
  },
});
