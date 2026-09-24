import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Botao } from '../../components/Botao';
import type { Perfil } from '../../models/perfil';
import { cores, espacamento, raio } from '../../theme';

const CORES_DISPONIVEIS = [
  cores.blocoVermelho,
  cores.blocoAzul,
  cores.blocoAmarelo,
  cores.blocoVerde,
  cores.blocoCoral,
  cores.categoriaNatureza,
];

/**
 * Tela de seleção/criação de perfil (T061, D-32): aparece quando há >1
 * perfil cadastrado ou ao entrar em "dupla" — cadastro mínimo (nome +
 * cor). `quantidadeAlvo` é 1 (seleção normal) ou 2 (dupla, US5).
 */
export interface TelaSelecaoPerfilProps {
  perfis: Perfil[];
  quantidadeAlvo: number;
  onConfirmar: (perfisEscolhidos: Perfil[]) => void;
  onCriarPerfil: (nome: string, cor: string) => Promise<Perfil>;
}

export function TelaSelecaoPerfil({
  perfis,
  quantidadeAlvo,
  onConfirmar,
  onCriarPerfil,
}: TelaSelecaoPerfilProps) {
  const [todosOsPerfis, setTodosOsPerfis] = useState(perfis);
  const [selecionadosIds, setSelecionadosIds] = useState<string[]>([]);
  const [criando, setCriando] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novaCor, setNovaCor] = useState(CORES_DISPONIVEIS[0]);

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

  const completo = selecionadosIds.length === quantidadeAlvo;

  return (
    <ScrollView contentContainerStyle={estilos.raiz}>
      <Text style={estilos.titulo}>
        {quantidadeAlvo === 1 ? 'Quem vai jogar?' : 'Quem vai jogar? (escolha 2)'}
      </Text>

      <View style={estilos.lista}>
        {todosOsPerfis.map((perfil) => {
          const selecionado = selecionadosIds.includes(perfil.id);
          return (
            <TouchableOpacity
              key={perfil.id}
              style={[
                estilos.cartaoPerfil,
                { borderColor: perfil.cor ?? cores.linha },
                selecionado && estilos.cartaoPerfilAtivo,
              ]}
              onPress={() => alternarSelecao(perfil.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: selecionado }}
              accessibilityLabel={`perfil ${perfil.nome ?? perfil.id}`}
            >
              <View style={[estilos.bolinhaCor, { backgroundColor: perfil.cor ?? cores.linha }]} />
              <Text style={estilos.nomePerfil}>{perfil.nome ?? 'Sem nome'}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {criando ? (
        <View style={estilos.formNovo}>
          <TextInput
            style={estilos.input}
            placeholder="Nome"
            value={novoNome}
            onChangeText={setNovoNome}
            accessibilityLabel="nome do novo perfil"
          />
          <View style={estilos.coresLinha}>
            {CORES_DISPONIVEIS.map((cor) => (
              <TouchableOpacity
                key={cor}
                style={[
                  estilos.bolinhaCorEscolha,
                  { backgroundColor: cor },
                  novaCor === cor && estilos.bolinhaCorEscolhaAtiva,
                ]}
                onPress={() => setNovaCor(cor)}
                accessibilityRole="button"
                accessibilityLabel={`cor ${cor}`}
              />
            ))}
          </View>
          <Botao onPress={confirmarNovoPerfil} acessibilidade="salvar novo perfil">
            Salvar
          </Botao>
        </View>
      ) : (
        <TouchableOpacity onPress={() => setCriando(true)} accessibilityRole="button">
          <Text style={estilos.linkNovo}>➕ criar novo perfil</Text>
        </TouchableOpacity>
      )}

      <Botao
        onPress={() => onConfirmar(todosOsPerfis.filter((p) => selecionadosIds.includes(p.id)))}
        acessibilidade="confirmar seleção"
      >
        {completo ? '▶️ Continuar' : `Escolha ${quantidadeAlvo - selecionadosIds.length} a mais`}
      </Botao>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  raiz: {
    padding: espacamento.lg,
    gap: espacamento.md,
    backgroundColor: cores.papel,
  },
  titulo: {
    fontSize: 20,
    fontWeight: '800',
    color: cores.tinta,
  },
  lista: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacamento.sm,
  },
  cartaoPerfil: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamento.xs,
    padding: espacamento.sm,
    borderRadius: raio.md,
    borderWidth: 2,
    backgroundColor: cores.papelAlt,
  },
  cartaoPerfilAtivo: {
    backgroundColor: cores.blocoAzulT,
  },
  bolinhaCor: {
    width: 20,
    height: 20,
    borderRadius: raio.pill,
  },
  nomePerfil: {
    fontSize: 15,
    fontWeight: '700',
    color: cores.tinta,
  },
  formNovo: {
    gap: espacamento.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: cores.linha,
    borderRadius: raio.sm,
    padding: espacamento.sm,
    fontSize: 15,
    color: cores.tinta,
  },
  coresLinha: {
    flexDirection: 'row',
    gap: espacamento.sm,
  },
  bolinhaCorEscolha: {
    width: 32,
    height: 32,
    borderRadius: raio.pill,
  },
  bolinhaCorEscolhaAtiva: {
    borderWidth: 3,
    borderColor: cores.tinta,
  },
  linkNovo: {
    fontSize: 15,
    fontWeight: '700',
    color: cores.blocoAzul,
  },
});
