import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Perfil } from '../../models/perfil';
import { alvo, cor, corTema, fonte, raio, tamanho } from '../../theme/tema';
import { BolhaDePerfil } from '../../ui/BolhaDePerfil';
import { Botao } from '../../ui/Botao';
import { BotaoDeSaida } from '../../ui/BotaoDeSaida';
import { TelaBase } from '../../ui/TelaBase';

/** Cores que o adulto pode dar a um perfil novo: as seis de tema do guia (mesmas do desenho da dupla). */
const CORES_DISPONIVEIS = Object.values(corTema);

/**
 * Tela de seleção/criação de perfil (T061/T115, D-32): aparece ao entrar em
 * "dupla" — cadastro mínimo (nome + cor). `quantidadeAlvo` é 1 (seleção
 * normal) ou 2 (dupla, US5). **Não havia desenho pra esta tela** (registrado
 * no visual-v1): foi montada só com os componentes do padrão — bolha de
 * perfil, blocos de 56+ e botões — sem inventar elemento novo. Voltar sempre
 * visível (D-48).
 */
export interface TelaSelecaoPerfilProps {
  perfis: Perfil[];
  quantidadeAlvo: number;
  onConfirmar: (perfisEscolhidos: Perfil[]) => void;
  onCriarPerfil: (nome: string, cor: string) => Promise<Perfil>;
  onVoltar?: () => void;
}

function nomeDoPerfil(perfil: Perfil): string {
  return perfil.nome ?? 'Jogador';
}

export function TelaSelecaoPerfil({
  perfis,
  quantidadeAlvo,
  onConfirmar,
  onCriarPerfil,
  onVoltar,
}: TelaSelecaoPerfilProps) {
  const [todosOsPerfis, setTodosOsPerfis] = useState(perfis);
  const [selecionadosIds, setSelecionadosIds] = useState<string[]>([]);
  const [criando, setCriando] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novaCor, setNovaCor] = useState<string>(CORES_DISPONIVEIS[0]);

  function alternarSelecao(id: string) {
    setSelecionadosIds((atual) => {
      if (atual.includes(id)) return atual.filter((x) => x !== id);
      if (atual.length >= quantidadeAlvo) return atual; // já escolheu o suficiente
      return [...atual, id];
    });
  }

  async function confirmarNovoPerfil() {
    const nome = novoNome.trim();
    if (!nome) return;
    const perfil = await onCriarPerfil(nome, novaCor);
    setTodosOsPerfis((atual) => [...atual, perfil]);
    setSelecionadosIds((atual) => (atual.length < quantidadeAlvo ? [...atual, perfil.id] : atual));
    setNovoNome('');
    setCriando(false);
  }

  const faltam = quantidadeAlvo - selecionadosIds.length;
  const completo = faltam === 0;

  return (
    <TelaBase>
      {onVoltar ? <BotaoDeSaida tipo="voltar" onPress={onVoltar} /> : null}
      <ScrollView
        contentContainerStyle={estilos.conteudo}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text allowFontScaling={false} style={estilos.titulo}>
          {quantidadeAlvo === 1 ? 'Quem vai jogar?' : `Quem vai jogar? Escolha ${quantidadeAlvo}`}
        </Text>

        <View style={estilos.lista}>
          {todosOsPerfis.map((perfil) => {
            const selecionado = selecionadosIds.includes(perfil.id);
            return (
              <Pressable
                key={perfil.id}
                onPress={() => alternarSelecao(perfil.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: selecionado }}
                accessibilityLabel={`perfil ${nomeDoPerfil(perfil)}`}
                style={[estilos.cartaoPerfil, selecionado && estilos.cartaoPerfilAtivo]}
              >
                <BolhaDePerfil nome={nomeDoPerfil(perfil)} cor={perfil.cor} tamanho={48} />
                <Text allowFontScaling={false} style={estilos.nomePerfil}>
                  {nomeDoPerfil(perfil)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {criando ? (
          <View style={estilos.formNovo}>
            <TextInput
              style={estilos.input}
              placeholder="Nome"
              placeholderTextColor={cor.tinta2}
              value={novoNome}
              onChangeText={setNovoNome}
              accessibilityLabel="nome do novo perfil"
            />
            <View style={estilos.coresLinha}>
              {CORES_DISPONIVEIS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setNovaCor(c)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: novaCor === c }}
                  accessibilityLabel={`cor ${c}`}
                  style={[
                    estilos.corEscolha,
                    { backgroundColor: c },
                    novaCor === c && estilos.corEscolhaAtiva,
                  ]}
                />
              ))}
            </View>
            <Botao
              texto="Salvar"
              variante="confirmar"
              onPress={confirmarNovoPerfil}
              desabilitado={novoNome.trim() === ''}
              cheio
              acessibilidade="salvar novo perfil"
            />
          </View>
        ) : (
          <Botao
            texto="Novo perfil"
            variante="claro"
            onPress={() => setCriando(true)}
            acessibilidade="criar novo perfil"
          />
        )}

        <Botao
          texto={completo ? 'Continuar' : `Escolha mais ${faltam}`}
          icone={completo ? 'play' : undefined}
          desabilitado={!completo}
          onPress={() => onConfirmar(todosOsPerfis.filter((p) => selecionadosIds.includes(p.id)))}
          cheio
          acessibilidade="confirmar seleção"
        />
      </ScrollView>
    </TelaBase>
  );
}

const estilos = StyleSheet.create({
  conteudo: { gap: 16, paddingVertical: 8 },
  titulo: { fontFamily: fonte.display, fontSize: tamanho.titulo, color: cor.tinta },
  lista: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cartaoPerfil: {
    minHeight: alvo.botao,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: raio.cartao,
    borderWidth: 3,
    borderColor: cor.grade,
    backgroundColor: cor.papel2,
  },
  cartaoPerfilAtivo: { borderColor: cor.azul.base, backgroundColor: cor.azul.claro },
  nomePerfil: { fontFamily: fonte.displayMedio, fontSize: tamanho.subtitulo, color: cor.tinta },
  formNovo: { gap: 12 },
  input: {
    minHeight: alvo.minimo,
    borderWidth: 2,
    borderColor: cor.madeiraBorda,
    borderRadius: raio.chip,
    backgroundColor: cor.papel,
    paddingHorizontal: 14,
    fontFamily: fonte.textoForte,
    fontSize: tamanho.subtitulo,
    color: cor.tinta,
  },
  coresLinha: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  corEscolha: {
    width: alvo.minimo,
    height: alvo.minimo,
    borderRadius: alvo.minimo / 2,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  corEscolhaAtiva: { borderColor: cor.tinta },
});
