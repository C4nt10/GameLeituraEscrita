import { StyleSheet, Text, View } from 'react-native';
import { Botao } from '../../components/Botao';
import type { Perfil } from '../../models/perfil';
import type { RegistroHistorico } from '../../models/registro_historico';
import { cores, espacamento, fontes, raio } from '../../theme';

/**
 * Tela de resultado combinado (T063, CU-05 variante "resultado
 * combinado"): cooperativo mostra o total somado **e** o individual
 * lado a lado; adversarial mostra os dois lado a lado com destaque pra
 * quem teve mais, mensagem de quem teve menos nunca depreciativa (mesma
 * regra do CU-05 base, T025).
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

  if (formato === 'cooperativo') {
    const estrelasTotal = registro1.estrelas + registro2.estrelas;
    const acertosTotal = registro1.acertos + registro2.acertos;

    return (
      <View style={estilos.raiz}>
        <Text style={estilos.titulo}>🎉 Juntos vocês fizeram muito bem!</Text>
        <Text style={estilos.totalEstrelas}>{estrelasTotal.toFixed(1)} ★ no total</Text>
        <Text style={estilos.totalTexto}>{acertosTotal} acertos somados</Text>

        <View style={estilos.linhaIndividual}>
          <CartaoIndividual nome={nome1} cor={perfil1.cor} registro={registro1} />
          <CartaoIndividual nome={nome2} cor={perfil2.cor} registro={registro2} />
        </View>

        <Botao onPress={onJogarDeNovo} acessibilidade="jogar de novo">
          🔁 Jogar de novo
        </Botao>
      </View>
    );
  }

  // adversarial
  const quemTeveMais =
    registro1.estrelas === registro2.estrelas
      ? null
      : registro1.estrelas > registro2.estrelas
        ? nome1
        : nome2;
  const quemTeveMenosRegistro = registro1.estrelas <= registro2.estrelas ? registro1 : registro2;
  const nomeQuemTeveMenos = registro1.estrelas <= registro2.estrelas ? nome1 : nome2;
  const nomeQuemTeveMais = registro1.estrelas <= registro2.estrelas ? nome2 : nome1;

  return (
    <View style={estilos.raiz}>
      <Text style={estilos.titulo}>
        {quemTeveMais ? `${quemTeveMais} tirou mais hoje!` : 'Empate — os dois foram muito bem!'}
      </Text>

      <View style={estilos.linhaIndividual}>
        <CartaoIndividual
          nome={nome1}
          cor={perfil1.cor}
          registro={registro1}
          destaque={quemTeveMais === nome1}
        />
        <CartaoIndividual
          nome={nome2}
          cor={perfil2.cor}
          registro={registro2}
          destaque={quemTeveMais === nome2}
        />
      </View>

      {quemTeveMais && (
        <Text style={estilos.mensagemNaoDepreciativa}>
          Você acertou {quemTeveMenosRegistro.acertos} de{' '}
          {quemTeveMenosRegistro.acertos + quemTeveMenosRegistro.erros} — {nomeQuemTeveMais} tirou
          mais hoje, bora tentar de novo, {nomeQuemTeveMenos}?
        </Text>
      )}

      <Botao onPress={onJogarDeNovo} acessibilidade="jogar de novo">
        🔁 Jogar de novo
      </Botao>
    </View>
  );
}

function CartaoIndividual({
  nome,
  cor,
  registro,
  destaque,
}: {
  nome: string;
  cor: string | null;
  registro: RegistroHistorico;
  destaque?: boolean;
}) {
  return (
    <View
      style={[
        estilos.cartao,
        destaque && estilos.cartaoDestaque,
        { borderColor: cor ?? cores.linha },
      ]}
    >
      <Text style={estilos.cartaoNome}>{nome}</Text>
      <Text style={estilos.cartaoEstrelas}>{registro.estrelas.toFixed(1)} ★</Text>
      <Text style={estilos.cartaoTexto}>
        {registro.acertos} acertos · {registro.erros} erros
      </Text>
      <Text style={estilos.cartaoTexto}>{Math.round(registro.precisao * 100)}% precisão</Text>
    </View>
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
  titulo: {
    fontFamily: fontes.titulo,
    fontSize: 19,
    color: cores.tinta,
    textAlign: 'center',
  },
  totalEstrelas: {
    fontFamily: fontes.titulo,
    fontSize: 30,
    color: cores.blocoAmarelo,
  },
  totalTexto: {
    fontFamily: fontes.corpo,
    fontSize: 14,
    color: cores.tintaFraca,
  },
  linhaIndividual: {
    flexDirection: 'row',
    gap: espacamento.sm,
  },
  cartao: {
    padding: espacamento.sm,
    borderRadius: raio.md,
    borderWidth: 2,
    backgroundColor: cores.papelAlt,
    minWidth: 130,
    alignItems: 'center',
  },
  cartaoDestaque: {
    backgroundColor: cores.blocoAmareloT,
  },
  cartaoNome: {
    fontFamily: fontes.titulo,
    fontSize: 14,
    color: cores.tinta,
  },
  cartaoEstrelas: {
    fontFamily: fontes.titulo,
    fontSize: 18,
    color: cores.blocoAmarelo,
  },
  cartaoTexto: {
    fontFamily: fontes.corpo,
    fontSize: 12,
    color: cores.tintaFraca,
  },
  mensagemNaoDepreciativa: {
    fontFamily: fontes.corpo,
    fontSize: 13,
    color: cores.tintaFraca,
    textAlign: 'center',
    maxWidth: 300,
  },
});
