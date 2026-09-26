import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Perfil } from '../../models/perfil';
import type { RegistroHistorico } from '../../models/registro_historico';
import { estrelasParaIcones } from '../../theme/helpers';
import { cor, fonte, raio, tamanho } from '../../theme/tema';
import { BolhaDePerfil } from '../../ui/BolhaDePerfil';
import { Botao } from '../../ui/Botao';
import { Estrela } from '../../ui/icones';
import { TelaBase } from '../../ui/TelaBase';

/**
 * Tela de resultado combinado (T063/T115, CU-05 variante "resultado
 * combinado"): cooperativo (Juntos) mostra o total somado **e** o individual
 * lado a lado; adversarial (Disputa) mostra os dois lado a lado com destaque
 * pra quem teve mais — e a mensagem de quem teve menos nunca é depreciativa
 * (mesma regra do CU-05 base). Rola se não couber (paisagem).
 */
export interface TelaResultadoCombinadoProps {
  formato: 'cooperativo' | 'adversarial';
  perfil1: Perfil;
  perfil2: Perfil;
  registro1: RegistroHistorico;
  registro2: RegistroHistorico;
  onJogarDeNovo: () => void;
}

function nomeOu(perfil: Perfil, indice: number): string {
  return perfil.nome ?? `Jogador ${indice}`;
}

function CartaoIndividual({
  nome,
  corDoPerfil,
  registro,
  destaque,
}: {
  nome: string;
  corDoPerfil: string | null;
  registro: RegistroHistorico;
  destaque?: boolean;
}) {
  return (
    <View style={[estilos.cartao, destaque && estilos.cartaoDestaque]}>
      <BolhaDePerfil nome={nome} cor={corDoPerfil} tamanho={56} />
      <Text allowFontScaling={false} style={estilos.cartaoNome}>
        {nome}
      </Text>
      <View
        style={estilos.estrelas}
        accessible
        accessibilityLabel={`${registro.estrelas} de 5 estrelas`}
        importantForAccessibility="yes"
      >
        {estrelasParaIcones(registro.estrelas).map((tipo, i) => (
          <Estrela key={i} tipo={tipo} tamanho={22} />
        ))}
      </View>
      <Text style={estilos.cartaoTexto}>{registro.acertos} acertos</Text>
      <Text style={estilos.cartaoTexto}>{Math.round(registro.precisao * 100)}% precisão</Text>
    </View>
  );
}

export function TelaResultadoCombinado({
  formato,
  perfil1,
  perfil2,
  registro1,
  registro2,
  onJogarDeNovo,
}: TelaResultadoCombinadoProps) {
  const nome1 = nomeOu(perfil1, 1);
  const nome2 = nomeOu(perfil2, 2);

  const cooperativo = formato === 'cooperativo';
  const quemTeveMais =
    registro1.estrelas === registro2.estrelas
      ? null
      : registro1.estrelas > registro2.estrelas
        ? nome1
        : nome2;
  const nomeQuemTeveMenos = quemTeveMais === nome1 ? nome2 : nome1;

  const titulo = cooperativo
    ? 'Juntos vocês foram muito bem!'
    : quemTeveMais
      ? `${quemTeveMais} tirou mais hoje!`
      : 'Empate — os dois foram muito bem!';

  const estrelasTotal = registro1.estrelas + registro2.estrelas;
  const acertosTotal = registro1.acertos + registro2.acertos;

  return (
    <TelaBase>
      <ScrollView
        contentContainerStyle={estilos.conteudo}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Text allowFontScaling={false} style={estilos.titulo}>
          {titulo}
        </Text>

        <View style={estilos.colunas}>
          <CartaoIndividual
            nome={nome1}
            corDoPerfil={perfil1.cor}
            registro={registro1}
            destaque={!cooperativo && quemTeveMais === nome1}
          />
          <CartaoIndividual
            nome={nome2}
            corDoPerfil={perfil2.cor}
            registro={registro2}
            destaque={!cooperativo && quemTeveMais === nome2}
          />
        </View>

        {cooperativo ? (
          <View style={[estilos.faixa, estilos.faixaVerde]}>
            <Text style={estilos.faixaTexto}>
              {estrelasTotal.toFixed(1)} estrelas e {acertosTotal} acertos juntos!
            </Text>
          </View>
        ) : (
          quemTeveMais && (
            <View style={[estilos.faixa, estilos.faixaAmarela]}>
              <Text style={estilos.faixaTexto}>
                {quemTeveMais} acertou mais hoje — {nomeQuemTeveMenos}, bora tentar de novo?
              </Text>
            </View>
          )
        )}

        <View style={estilos.botao}>
          <Botao
            texto="Jogar de novo"
            icone="play"
            onPress={onJogarDeNovo}
            cheio
            acessibilidade="jogar de novo"
          />
        </View>
      </ScrollView>
    </TelaBase>
  );
}

const estilos = StyleSheet.create({
  conteudo: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    paddingVertical: 8,
  },
  titulo: {
    fontFamily: fonte.display,
    fontSize: tamanho.titulo,
    lineHeight: 34,
    color: cor.tinta,
    textAlign: 'center',
  },
  colunas: { flexDirection: 'row', gap: 12 },
  cartao: {
    width: 150,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: raio.cartao,
    backgroundColor: cor.papel2,
    borderWidth: 3,
    borderColor: cor.papel2,
  },
  cartaoDestaque: { backgroundColor: cor.amarelo.claro, borderColor: cor.amarelo.base },
  cartaoNome: { fontFamily: fonte.displayMedio, fontSize: tamanho.subtitulo, color: cor.tinta },
  estrelas: { flexDirection: 'row' },
  cartaoTexto: { fontFamily: fonte.texto, fontSize: tamanho.legenda, color: cor.tinta },
  faixa: {
    maxWidth: 320,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: raio.cartao,
    borderWidth: 2,
  },
  faixaVerde: { backgroundColor: cor.verde.claro, borderColor: cor.verde.base },
  faixaAmarela: { backgroundColor: cor.amarelo.claro, borderColor: cor.amarelo.base },
  faixaTexto: {
    fontFamily: fonte.textoForte,
    fontSize: tamanho.texto,
    color: cor.tinta,
    textAlign: 'center',
  },
  botao: { width: '100%', maxWidth: 320 },
});
