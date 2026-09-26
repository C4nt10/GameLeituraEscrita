import { StyleSheet, Text, View } from 'react-native';
import { cor, fonte, tamanho } from '../../theme/tema';
import { Botao } from '../../ui/Botao';
import { BolhaDePerfil } from '../../ui/BolhaDePerfil';
import { TelaBase } from '../../ui/TelaBase';

/**
 * "Agora é a vez de [Nome]!" — a tela de passar o aparelho (CU-08, A-27). A
 * bolha do perfil aparece grande, na cor dele, pra criança se reconhecer. O
 * botão é neutro: "Vamos lá!" (o desenho dizia "Estou pronta!", no feminino,
 * e perfil não tem gênero).
 */
export function TelaDeVez({
  nome,
  cor: corDoPerfil,
  subtitulo,
  aoContinuar,
}: {
  nome: string;
  cor: string | null;
  subtitulo: string;
  aoContinuar: () => void;
}) {
  return (
    <TelaBase>
      <View style={estilos.centro}>
        <BolhaDePerfil nome={nome} cor={corDoPerfil} tamanho={120} />
        <Text allowFontScaling={false} style={estilos.titulo}>
          Agora é a vez de {nome}!
        </Text>
        <Text style={estilos.subtitulo}>{subtitulo}</Text>
        <Botao
          texto="Vamos lá!"
          icone="play"
          variante="confirmar"
          onPress={aoContinuar}
          acessibilidade="continuar"
        />
      </View>
    </TelaBase>
  );
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 },
  titulo: {
    fontFamily: fonte.display,
    fontSize: tamanho.destaque,
    lineHeight: 42,
    color: cor.tinta,
    textAlign: 'center',
  },
  subtitulo: {
    fontFamily: fonte.texto,
    fontSize: tamanho.texto,
    color: cor.tinta,
    textAlign: 'center',
    maxWidth: 300,
  },
});
