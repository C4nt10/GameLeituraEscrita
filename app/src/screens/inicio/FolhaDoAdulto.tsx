import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Classificacao } from '../../models/registro_historico';
import { rotuloDoTema } from '../../theme/helpers';
import { cor, corTema, espaco, fonte, raio, tamanho } from '../../theme/tema';
import { Botao } from '../../ui/Botao';
import { Chip } from '../../ui/Chip';
import type { EstadoDoInicio } from './logica';

const TAMANHOS: (3 | 5 | 8)[] = [3, 5, 8];
const NIVEIS_DE_MATEMATICA = [1, 2, 3, 4, 5, 6, 7, 8];

function Grupo({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <View style={estilos.grupo}>
      <Text allowFontScaling={false} style={estilos.rotulo}>
        {rotulo.toUpperCase()}
      </Text>
      <View style={estilos.chips}>{children}</View>
    </View>
  );
}

export interface FolhaDoAdultoProps {
  visivel: boolean;
  aoFechar: () => void;
  estado: EstadoDoInicio;
  alterar: (mudanca: Partial<EstadoDoInicio>) => void;
  niveisDeLeitura: number[];
  /** Temas com conteúdo suficiente no nível escolhido (FR-011, D-35) — só esses aparecem. */
  temasDoNivel: Classificacao[];
  /** Motivo pelo qual "Ler em voz alta" está travada; `null` se está disponível (D-44). */
  motivoDaVoz: string | null;
}

/**
 * Folha do adulto (D-53): abre segurando a engrenagem. Tudo o que é do adulto —
 * nível de leitura, nível de matemática 1–8, tema, tamanho, sozinho ou dupla e,
 * na dupla, Juntos ou Disputa (D-31: nenhum é padrão). Tudo já tem um valor
 * padrão (Princípio VII). Alvo 56 em todo chip (A-28).
 */
export function FolhaDoAdulto({
  visivel,
  aoFechar,
  estado,
  alterar,
  niveisDeLeitura,
  temasDoNivel,
  motivoDaVoz,
}: FolhaDoAdultoProps) {
  const insets = useSafeAreaInsets();
  const ehMatematica = estado.tipo === 'matematica';

  return (
    <Modal visible={visivel} transparent animationType="slide" onRequestClose={aoFechar}>
      <View style={estilos.veu}>
        <Pressable
          style={estilos.fora}
          onPress={aoFechar}
          accessibilityRole="button"
          accessibilityLabel="fechar as opções do adulto"
        />
        <View style={[estilos.folha, { paddingBottom: espaco.xl + insets.bottom }]}>
          <View style={estilos.puxador} />
          <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
            <Text allowFontScaling={false} style={estilos.titulo}>
              Para o adulto
            </Text>
            <Text allowFontScaling={false} style={estilos.aviso}>
              Tudo já tem um valor padrão.
            </Text>

            {!ehMatematica ? (
              <Grupo rotulo="Nível de leitura">
                {niveisDeLeitura.map((n) => (
                  <Chip
                    key={n}
                    rotulo={String(n)}
                    selecionado={estado.nivelLeitura === n}
                    onPress={() => alterar({ nivelLeitura: n, classificacao: null })}
                  />
                ))}
              </Grupo>
            ) : (
              <Grupo rotulo="Nível de matemática">
                {NIVEIS_DE_MATEMATICA.map((n) => (
                  <Chip
                    key={n}
                    rotulo={String(n)}
                    selecionado={estado.nivelMatematica === n}
                    onPress={() => alterar({ nivelMatematica: n })}
                  />
                ))}
              </Grupo>
            )}

            {!ehMatematica && temasDoNivel.length > 0 ? (
              <Grupo rotulo="Tema">
                <Chip
                  rotulo="Todas"
                  selecionado={estado.classificacao === null}
                  onPress={() => alterar({ classificacao: null })}
                />
                {temasDoNivel.map((tema) => (
                  <Chip
                    key={tema}
                    rotulo={rotuloDoTema(tema)}
                    selecionado={estado.classificacao === tema}
                    corSelecionada={corTema[tema]}
                    onPress={() => alterar({ classificacao: tema })}
                  />
                ))}
              </Grupo>
            ) : null}

            <Grupo rotulo={ehMatematica ? 'Contas por rodada' : 'Palavras por rodada'}>
              {TAMANHOS.map((t) => (
                <Chip
                  key={t}
                  rotulo={String(t)}
                  selecionado={estado.tamanho === t}
                  onPress={() => alterar({ tamanho: t })}
                />
              ))}
            </Grupo>

            <Grupo rotulo="Quem joga">
              <Chip
                rotulo="Sozinho"
                selecionado={estado.formato === 'sozinho'}
                onPress={() => alterar({ formato: 'sozinho', formatoDupla: null })}
              />
              <Chip
                rotulo="Em dupla"
                selecionado={estado.formato === 'dupla'}
                onPress={() => alterar({ formato: 'dupla' })}
              />
            </Grupo>

            {estado.formato === 'dupla' ? (
              <Grupo rotulo="Como jogam">
                <Chip
                  rotulo="Juntos"
                  selecionado={estado.formatoDupla === 'cooperativo'}
                  onPress={() => alterar({ formatoDupla: 'cooperativo' })}
                />
                <Chip
                  rotulo="Disputa"
                  selecionado={estado.formatoDupla === 'adversarial'}
                  onPress={() => alterar({ formatoDupla: 'adversarial' })}
                />
              </Grupo>
            ) : null}
            {estado.formato === 'dupla' && estado.formatoDupla === null ? (
              <Text allowFontScaling={false} style={estilos.pedido}>
                Escolha Juntos ou Disputa pra poder jogar.
              </Text>
            ) : null}

            {motivoDaVoz ? (
              <Text allowFontScaling={false} style={estilos.aviso}>
                Ler em voz alta: {motivoDaVoz}
              </Text>
            ) : null}

            <Botao texto="Pronto" variante="confirmar" onPress={aoFechar} cheio />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  veu: { flex: 1, backgroundColor: cor.veu, justifyContent: 'flex-end', alignItems: 'center' },
  fora: { ...StyleSheet.absoluteFill },
  folha: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '90%',
    backgroundColor: cor.papel,
    borderTopLeftRadius: raio.folha,
    borderTopRightRadius: raio.folha,
    paddingTop: 10,
    paddingHorizontal: 18,
  },
  puxador: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: cor.madeiraBorda,
    alignSelf: 'center',
    marginBottom: espaco.m,
  },
  conteudo: { gap: 14 },
  titulo: { fontFamily: fonte.display, fontSize: tamanho.titulo, color: cor.tinta },
  aviso: { fontFamily: fonte.texto, fontSize: tamanho.legenda, color: cor.tinta2 },
  pedido: { fontFamily: fonte.textoForte, fontSize: tamanho.texto, color: cor.tinta },
  grupo: { gap: 10 },
  rotulo: {
    fontFamily: fonte.rotulo,
    fontSize: tamanho.rotulo,
    letterSpacing: 1,
    color: cor.tinta2,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
