import { useMemo, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Botao } from '../../components/Botao';
import type { Configuracao } from '../../services/configuracao';
import { combinacoesDisponiveis } from '../../services/banco_de_conteudo';
import type { Classificacao, FormaMatematica, Modalidade } from '../../models/registro_historico';
import { ALVO_TOQUE_MINIMO, cores, espacamento, fontes, raio } from '../../theme';

export type Tipo = 'leitura' | 'matematica' | 'misto';
export type Formato = 'sozinho' | 'dupla';
export type FormatoDupla = 'cooperativo' | 'adversarial';

export interface EscolhaRodada {
  tipo: Tipo;
  modalidade: Modalidade;
  /**
   * Nível **do tipo escolhido**: de matemática (1–8) quando `tipo =
   * 'matematica'`, de leitura (1–5) nos demais — os dois são independentes
   * e persistidos separado (D-43).
   */
  nivel: number;
  /** `null` = "todas" (padrão) ou nível 1 (sem classificação, D-22). */
  classificacao: Classificacao | null;
  formaMatematica: FormaMatematica;
  tamanho: 3 | 5 | 8;
  formato: Formato;
  /** Obrigatório quando `formato = 'dupla'` — nenhum formato é padrão implícito (D-31/T057). */
  formatoDupla: FormatoDupla | null;
}

const TAMANHOS: (3 | 5 | 8)[] = [3, 5, 8];
const NIVEIS_MATEMATICA = [1, 2, 3, 4, 5, 6, 7, 8];
/** Multiplicação só existe como conta pura (D-41) — "Problema" não vale nesse nível. */
const NIVEL_MATEMATICA_SO_CONTA = 8;
const MODALIDADES: { valor: Modalidade; rotulo: string }[] = [
  { valor: 'ditado', rotulo: 'Ditado' },
  { valor: 'leitura_montar', rotulo: 'Leitura · montar' },
  { valor: 'leitura_voz', rotulo: 'Leitura · voz' },
];

/**
 * Tela de configuração da rodada (T047, CU-01): tipo, modalidade, nível,
 * classificação, forma de matemática, tamanho, sozinho/dupla. Toda
 * configuração tem padrão válido — "iniciar" funciona sem tocar em nada
 * (FR-012, Princípio VII). Combinação nível×classificação sem conteúdo
 * suficiente não aparece selecionável (FR-011, D-35).
 *
 * **Escopo assumido, não confirmado**: `tipo: "misto"` é selecionável
 * (CU-01 lista as 3 opções), mas não existe orquestrador de rodada
 * mista ainda — só `RodadaLeitura` e `RodadaMatematica`, separados
 * (T033b/T040a). "Iniciar" fica desabilitado com o motivo visível
 * quando `misto` está selecionado, em vez de silenciosamente iniciar
 * uma rodada errada (Princípio III).
 *
 * **"Dupla" (formato, T062)**: exige escolher cooperativo/adversarial
 * explicitamente (D-31/T057 — nenhum formato é padrão implícito);
 * "Começar" leva pra seleção de 2 perfis (T061) e depois pro fluxo de
 * dupla completo (`RodadaDupla`), com a mesma configuração pros dois
 * perfis (D-33).
 */
export interface TelaConfiguracaoProps {
  configuracaoInicial: Configuracao;
  /** Microfone E reconhecimento de fala reais (D-44) — `leituraVozDisponivel`. */
  leituraVozDisponivel: boolean;
  motivoLeituraVozIndisponivel: string | null;
  onIniciar: (escolha: EscolhaRodada) => void;
  /** CU-06 — histórico acessível pela tela inicial. */
  onAbrirHistorico: () => void;
}

export function TelaConfiguracao({
  configuracaoInicial,
  leituraVozDisponivel,
  motivoLeituraVozIndisponivel,
  onIniciar,
  onAbrirHistorico,
}: TelaConfiguracaoProps) {
  const [tipo, setTipo] = useState<Tipo>('leitura');
  // nunca abre numa modalidade que não funciona (Princípio I): última era Leitura · voz e ela
  // não está disponível → cai em Leitura · montar, que não depende de áudio nem de STT.
  const [modalidade, setModalidade] = useState<Modalidade>(
    configuracaoInicial.ultimaModalidade === 'leitura_voz' && !leituraVozDisponivel
      ? 'leitura_montar'
      : configuracaoInicial.ultimaModalidade,
  );
  const [nivel, setNivel] = useState(configuracaoInicial.ultimoNivel);
  const [nivelMatematica, setNivelMatematica] = useState(configuracaoInicial.ultimoNivelMatematica);
  const [classificacao, setClassificacao] = useState<Classificacao | null>(null);
  const [formaMatematica, setFormaMatematica] = useState<FormaMatematica>(
    configuracaoInicial.ultimaFormaMatematica,
  );
  const [tamanho, setTamanho] = useState<3 | 5 | 8>(configuracaoInicial.ultimoTamanho);
  const [formato, setFormato] = useState<Formato>('sozinho');
  const [formatoDupla, setFormatoDupla] = useState<FormatoDupla | null>(null);
  const [maisOpcoes, setMaisOpcoes] = useState(false);

  const combinacoes = useMemo(() => combinacoesDisponiveis(), []);
  const niveisDisponiveis = useMemo(
    () => [...new Set(combinacoes.map((c) => c.nivel))].sort((a, b) => a - b),
    [combinacoes],
  );
  const classificacoesDoNivel = useMemo(
    () =>
      combinacoes
        .filter((c) => c.nivel === nivel && c.classificacao !== null)
        .map((c) => c.classificacao as Classificacao),
    [combinacoes, nivel],
  );

  const modalidadeIndisponivel = modalidade === 'leitura_voz' && !leituraVozDisponivel;
  const tipoIndisponivel = tipo === 'misto';
  const formatoIndisponivel = formato === 'dupla' && formatoDupla === null;
  const podeIniciar = !modalidadeIndisponivel && !tipoIndisponivel && !formatoIndisponivel;

  function iniciar() {
    if (!podeIniciar) return;
    onIniciar({
      tipo,
      modalidade,
      nivel: tipo === 'matematica' ? nivelMatematica : nivel,
      classificacao,
      formaMatematica: nivelMatematica === NIVEL_MATEMATICA_SO_CONTA ? 'pura' : formaMatematica,
      tamanho,
      formato,
      formatoDupla,
    });
  }

  return (
    <SafeAreaView style={estilos.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={estilos.raiz}>
        <Text style={estilos.titulo}>Vamos jogar!</Text>
        <Text style={estilos.legenda}>
          Tudo já vem com um valor padrão — dá pra tocar em &quot;começar&quot; sem mudar nada.
        </Text>

        <Secao rotulo="Tipo">
          <Segmentado
            opcoes={[
              { valor: 'leitura', rotulo: 'Leitura' },
              { valor: 'matematica', rotulo: 'Matemática' },
              { valor: 'misto', rotulo: 'Misto' },
            ]}
            selecionado={tipo}
            onSelecionar={setTipo}
          />
          {tipoIndisponivel && (
            <Text style={estilos.aviso}>
              Misto ainda não está pronto — escolhe Leitura ou Matemática por enquanto 🙂
            </Text>
          )}
        </Secao>

        {tipo !== 'matematica' && (
          <Secao rotulo="Modalidade">
            <Segmentado
              opcoes={MODALIDADES.map((m) => ({
                valor: m.valor,
                rotulo: m.rotulo,
                desabilitada: m.valor === 'leitura_voz' && !leituraVozDisponivel,
              }))}
              selecionado={modalidade}
              onSelecionar={setModalidade}
            />
            {!leituraVozDisponivel && (
              <Text style={estilos.aviso}>🎤 Leitura · voz: {motivoLeituraVozIndisponivel}</Text>
            )}
          </Secao>
        )}

        <TouchableOpacity
          onPress={() => setMaisOpcoes((v) => !v)}
          accessibilityRole="button"
          accessibilityState={{ expanded: maisOpcoes }}
        >
          <Text style={estilos.linkVoz}>{maisOpcoes ? '▲ menos opções' : '⚙️ mais opções'}</Text>
        </TouchableOpacity>

        {maisOpcoes && (
          <>
            {tipo !== 'leitura' && (
              <Secao rotulo={tipo === 'misto' ? 'Nível de matemática' : 'Nível'}>
                <Segmentado
                  opcoes={NIVEIS_MATEMATICA.map((n) => ({ valor: n, rotulo: String(n) }))}
                  selecionado={nivelMatematica}
                  onSelecionar={setNivelMatematica}
                />
              </Secao>
            )}

            {tipo !== 'matematica' && (
              <Secao rotulo={tipo === 'misto' ? 'Nível de leitura' : 'Nível'}>
                <Segmentado
                  opcoes={niveisDisponiveis.map((n) => ({ valor: n, rotulo: String(n) }))}
                  selecionado={nivel}
                  onSelecionar={(n) => {
                    setNivel(n);
                    setClassificacao(null);
                  }}
                />
              </Secao>
            )}

            {tipo !== 'matematica' && classificacoesDoNivel.length > 0 && (
              <Secao rotulo="Classificação">
                <Segmentado
                  opcoes={[
                    { valor: null, rotulo: 'Todas' },
                    ...classificacoesDoNivel.map((c) => ({ valor: c, rotulo: c })),
                  ]}
                  selecionado={classificacao}
                  onSelecionar={setClassificacao}
                />
              </Secao>
            )}

            {tipo !== 'leitura' && (
              <Secao rotulo="Forma da matemática">
                <Segmentado
                  opcoes={[
                    { valor: 'pura', rotulo: 'Conta pura' },
                    { valor: 'contextualizada', rotulo: 'Problema' },
                  ]}
                  selecionado={formaMatematica}
                  onSelecionar={setFormaMatematica}
                />
                {nivelMatematica === NIVEL_MATEMATICA_SO_CONTA && (
                  <Text style={estilos.aviso}>No nível 8 só tem conta, sem problema 🙂</Text>
                )}
              </Secao>
            )}

            <Secao rotulo="Tamanho da rodada">
              <Segmentado
                opcoes={TAMANHOS.map((t) => ({ valor: t, rotulo: String(t) }))}
                selecionado={tamanho}
                onSelecionar={setTamanho}
              />
            </Secao>

            <Secao rotulo="Sozinho ou dupla">
              <Segmentado
                opcoes={[
                  { valor: 'sozinho' as const, rotulo: 'Sozinho' },
                  { valor: 'dupla' as const, rotulo: 'Dupla' },
                ]}
                selecionado={formato}
                onSelecionar={(valor) => {
                  setFormato(valor);
                  if (valor === 'sozinho') setFormatoDupla(null);
                }}
              />
            </Secao>

            {formato === 'dupla' && (
              <Secao rotulo="Cooperativo ou adversarial">
                <Segmentado
                  opcoes={[
                    { valor: 'cooperativo' as const, rotulo: 'Cooperativo' },
                    { valor: 'adversarial' as const, rotulo: 'Adversarial' },
                  ]}
                  selecionado={formatoDupla}
                  onSelecionar={setFormatoDupla}
                />
                {formatoIndisponivel && (
                  <Text style={estilos.aviso}>Escolhe um dos dois pra continuar 🙂</Text>
                )}
              </Secao>
            )}
          </>
        )}

        <TouchableOpacity onPress={onAbrirHistorico} accessibilityRole="button">
          <Text style={estilos.linkVoz}>📜 ver histórico</Text>
        </TouchableOpacity>

        <Botao onPress={iniciar} acessibilidade="começar">
          {podeIniciar ? '▶️ Começar' : '▶️ Toque numa opção diferente acima'}
        </Botao>
      </ScrollView>
    </SafeAreaView>
  );
}

function Secao({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <View style={estilos.secao}>
      <Text style={estilos.secaoRotulo}>{rotulo}</Text>
      {children}
    </View>
  );
}

function Segmentado<T>({
  opcoes,
  selecionado,
  onSelecionar,
}: {
  opcoes: { valor: T; rotulo: string; desabilitada?: boolean }[];
  selecionado: T;
  onSelecionar: (valor: T) => void;
}) {
  return (
    <View style={estilos.segmentado}>
      {opcoes.map((opcao) => {
        const ativo = opcao.valor === selecionado;
        const desabilitada = opcao.desabilitada ?? false;
        return (
          <TouchableOpacity
            key={String(opcao.valor)}
            style={[
              estilos.chip,
              ativo && estilos.chipAtivo,
              desabilitada && estilos.chipDesabilitado,
            ]}
            onPress={() => onSelecionar(opcao.valor)}
            disabled={desabilitada}
            accessibilityRole="button"
            accessibilityState={{ selected: ativo, disabled: desabilitada }}
            accessibilityLabel={opcao.rotulo}
          >
            <Text style={[estilos.chipTexto, ativo && estilos.chipTextoAtivo]}>{opcao.rotulo}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: cores.papel,
  },
  raiz: {
    padding: espacamento.lg,
    gap: espacamento.md,
    backgroundColor: cores.papel,
  },
  titulo: {
    fontFamily: fontes.titulo,
    fontSize: 22,
    color: cores.tinta,
  },
  legenda: {
    fontFamily: fontes.corpo,
    fontSize: 13,
    color: cores.tintaFraca,
  },
  secao: {
    gap: espacamento.xs,
  },
  secaoRotulo: {
    fontFamily: fontes.corpoBold,
    fontSize: 13,
    color: cores.tintaFraca,
  },
  segmentado: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacamento.xs,
  },
  chip: {
    paddingVertical: espacamento.xs,
    paddingHorizontal: espacamento.sm,
    borderRadius: raio.pill,
    backgroundColor: cores.papelAlt,
    minHeight: ALVO_TOQUE_MINIMO,
    justifyContent: 'center',
  },
  chipAtivo: {
    backgroundColor: cores.blocoAzul,
  },
  chipDesabilitado: {
    opacity: 0.45,
  },
  chipTexto: {
    fontFamily: fontes.corpoSemiBold,
    fontSize: 14,
    color: cores.tinta,
  },
  chipTextoAtivo: {
    color: cores.papel,
  },
  aviso: {
    fontFamily: fontes.corpo,
    fontSize: 12,
    color: cores.blocoVermelho,
  },
  linkVoz: {
    fontFamily: fontes.corpoBold,
    fontSize: 15,
    color: cores.blocoAzul,
    textAlign: 'center',
  },
});
