import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TelaSelecaoPerfil } from '../selecao_perfil';
import { TelaResultadoCombinado } from '../resultado_dupla';
import { RodadaLeitura, type DependenciasRodadaLeitura } from '../rodada';
import { RodadaMatematica } from '../rodada_matematica';
import { registrarRodadaDupla } from '../../services/historico';
import { gerarId } from '../../lib/gerarId';
import type { Perfil } from '../../models/perfil';
import type {
  Classificacao,
  FormaMatematica,
  Modalidade,
  RegistroHistorico,
} from '../../models/registro_historico';
import { cores, espacamento, fontes, raio, sombraBlk } from '../../theme';

/**
 * RodadaDupla — fluxo completo de US5 (T062, CU-08, D-30): seleção de 2
 * perfis (T061) → "vez de [Nome 1]" → rodada 1 → "passa o aparelho" →
 * rodada 2 → resultado combinado (T063). **Reaproveita
 * `RodadaLeitura`/`RodadaMatematica` sem alteração** (D-30 — duas
 * rodadas sequenciais, não turno-a-turno dentro do desafio), com **a
 * mesma configuração pros dois perfis** (D-33 — comparação com regras
 * diferentes não seria honesta).
 *
 * Se uma criança sair no meio (D-39) — `registro.concluida === false` —
 * a dupla é persistida como incompleta (`completa: false`, T064/FR-018)
 * e o fluxo termina ali, sem mostrar resultado combinado (comparar uma
 * rodada incompleta com uma completa não seria uma comparação honesta).
 */

export interface ConfiguracaoRodadaParaDupla {
  tipo: 'leitura' | 'matematica';
  modalidade: Modalidade;
  formaMatematica: FormaMatematica;
  nivel: number;
  classificacao: Classificacao | null;
  tamanho: 3 | 5 | 8;
}

export interface RodadaDuplaProps {
  formatoDupla: 'cooperativo' | 'adversarial';
  configuracaoRodada: ConfiguracaoRodadaParaDupla;
  perfisDisponiveis: Perfil[];
  onCriarPerfil: (nome: string, cor: string) => Promise<Perfil>;
  dependenciasLeitura: DependenciasRodadaLeitura;
  falarMatematica: (texto: string) => void | Promise<void>;
  onFinalizar: () => void;
}

type Fase = 'selecionar_perfis' | 'vez_1' | 'jogando_1' | 'transicao' | 'jogando_2' | 'resultado';

function TelaTransicao({
  titulo,
  subtitulo,
  onContinuar,
  cor,
}: {
  titulo: string;
  subtitulo: string;
  onContinuar: () => void;
  cor: string | null;
}) {
  return (
    <SafeAreaView style={estilos.raizTransicao} edges={['top', 'bottom']}>
      <Text style={estilos.transicaoTitulo}>{titulo}</Text>
      <Text style={estilos.transicaoSubtitulo}>{subtitulo}</Text>
      <TouchableOpacity
        style={[estilos.botaoGrande, { backgroundColor: cor ?? cores.blocoAzul }]}
        onPress={onContinuar}
        accessibilityRole="button"
        accessibilityLabel="continuar"
      >
        <Text style={estilos.botaoGrandeTexto}>▶️ Toque pra continuar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export function RodadaDupla({
  formatoDupla,
  configuracaoRodada,
  perfisDisponiveis,
  onCriarPerfil,
  dependenciasLeitura,
  falarMatematica,
  onFinalizar,
}: RodadaDuplaProps) {
  const [fase, setFase] = useState<Fase>('selecionar_perfis');
  const [perfis, setPerfis] = useState<[Perfil, Perfil] | null>(null);
  const [registro1, setRegistro1] = useState<RegistroHistorico | null>(null);
  const [registro2, setRegistro2] = useState<RegistroHistorico | null>(null);

  async function persistirDupla(reg1: RegistroHistorico, reg2: RegistroHistorico | null) {
    await registrarRodadaDupla({
      id: gerarId(),
      formato: formatoDupla,
      rodada1Id: reg1.id,
      rodada2Id: reg2?.id ?? null,
      completa: reg1.concluida && (reg2?.concluida ?? false),
    });
  }

  function renderRodada(perfilId: string, aoRegistrar: (registro: RegistroHistorico) => void) {
    if (configuracaoRodada.tipo === 'matematica') {
      return (
        <RodadaMatematica
          perfilId={perfilId}
          configuracao={{
            forma: configuracaoRodada.formaMatematica,
            nivel: configuracaoRodada.nivel,
            classificacao: configuracaoRodada.classificacao ?? undefined,
            tamanho: configuracaoRodada.tamanho,
          }}
          falar={falarMatematica}
          onRegistrada={aoRegistrar}
          onSairDaRodada={() => {}}
          onJogarDeNovo={() => {}}
          onSubirDeNivel={() => {}}
        />
      );
    }
    return (
      <RodadaLeitura
        perfilId={perfilId}
        configuracao={{
          modalidade: configuracaoRodada.modalidade,
          nivel: configuracaoRodada.nivel,
          classificacao: configuracaoRodada.classificacao,
          tamanho: configuracaoRodada.tamanho,
        }}
        dependencias={dependenciasLeitura}
        onRegistrada={aoRegistrar}
        onSairDaRodada={() => {}}
        onJogarDeNovo={() => {}}
        onSubirDeNivel={() => {}}
      />
    );
  }

  if (fase === 'selecionar_perfis') {
    return (
      <TelaSelecaoPerfil
        perfis={perfisDisponiveis}
        quantidadeAlvo={2}
        onConfirmar={(escolhidos) => {
          if (escolhidos.length !== 2) return;
          setPerfis([escolhidos[0], escolhidos[1]]);
          setFase('vez_1');
        }}
        onCriarPerfil={onCriarPerfil}
      />
    );
  }

  if (!perfis) return null; // nunca deveria acontecer fora de 'selecionar_perfis'

  if (fase === 'vez_1') {
    return (
      <TelaTransicao
        titulo={`Vez de ${perfis[0].nome ?? 'Jogador 1'}!`}
        subtitulo="A mesma configuração vale pros dois, pra comparação ser justa."
        cor={perfis[0].cor}
        onContinuar={() => setFase('jogando_1')}
      />
    );
  }

  if (fase === 'jogando_1') {
    return renderRodada(perfis[0].id, (registro) => {
      setRegistro1(registro);
      if (!registro.concluida) {
        // D-39: saiu no meio — dupla incompleta, sem resultado combinado (FR-018)
        void persistirDupla(registro, null).then(onFinalizar);
        return;
      }
      setFase('transicao');
    });
  }

  if (fase === 'transicao') {
    return (
      <TelaTransicao
        titulo={`Passa o aparelho pra ${perfis[1].nome ?? 'Jogador 2'}!`}
        subtitulo={`${perfis[0].nome ?? 'Jogador 1'} já terminou — agora é a vez de ${perfis[1].nome ?? 'Jogador 2'}.`}
        cor={perfis[1].cor}
        onContinuar={() => setFase('jogando_2')}
      />
    );
  }

  if (fase === 'jogando_2') {
    return renderRodada(perfis[1].id, (registro) => {
      if (!registro1) return;
      void persistirDupla(registro1, registro);
      if (!registro.concluida) {
        onFinalizar();
        return;
      }
      setRegistro2(registro);
      setFase('resultado');
    });
  }

  if (fase === 'resultado' && registro1 && registro2) {
    return (
      <TelaResultadoCombinado
        formato={formatoDupla}
        perfil1={perfis[0]}
        perfil2={perfis[1]}
        registro1={registro1}
        registro2={registro2}
        onJogarDeNovo={onFinalizar}
      />
    );
  }

  return null;
}

const estilos = StyleSheet.create({
  raizTransicao: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacamento.lg,
    padding: espacamento.lg,
    backgroundColor: cores.papel,
  },
  transicaoTitulo: {
    fontFamily: fontes.titulo,
    fontSize: 24,
    color: cores.tinta,
    textAlign: 'center',
  },
  transicaoSubtitulo: {
    fontFamily: fontes.corpo,
    fontSize: 14,
    color: cores.tintaFraca,
    textAlign: 'center',
    maxWidth: 280,
  },
  botaoGrande: {
    paddingVertical: espacamento.lg,
    paddingHorizontal: espacamento.lg,
    borderRadius: raio.botao,
    minWidth: 220,
    alignItems: 'center',
    ...sombraBlk,
  },
  botaoGrandeTexto: {
    fontFamily: fontes.titulo,
    fontSize: 18,
    color: cores.papel,
  },
});
