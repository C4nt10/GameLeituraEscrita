import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { RodadaDupla } from '../screens/dupla';
import { listarPerfis, criarPerfil } from '../services/perfis';
import { itensDoBanco } from '../services/banco_de_conteudo';
import { falar as tocarVoz } from '../services/tts';
import { gravacao } from '../services/gravacao';
import { transcreverAudio } from '../services/stt';
import { criarDependenciasDeVoz } from '../services/voz_da_rodada';
import type { Perfil } from '../models/perfil';
import type { Classificacao, FormaMatematica, Modalidade } from '../models/registro_historico';
import { cores } from '../theme';

const VOZ = criarDependenciasDeVoz({ gravacao, transcreverAudio });

const CANDIDATAS_LETRA_NIVEL1 = itensDoBanco()
  .filter((item) => item.nivel === 1)
  .map((item) => item.palavra);

/** Rota real do fluxo de dupla (T062) — recebe a config escolhida em `/` via query string. */
export default function RotaDupla() {
  const params = useLocalSearchParams<{
    tipo: 'leitura' | 'matematica';
    modalidade: Modalidade;
    formaMatematica: FormaMatematica;
    nivel: string;
    classificacao?: Classificacao;
    tamanho: string;
    formatoDupla: 'cooperativo' | 'adversarial';
  }>();

  const [perfis, setPerfis] = useState<Perfil[] | null>(null);

  useEffect(() => {
    listarPerfis().then(setPerfis);
  }, []);

  if (!perfis) {
    return <View style={{ flex: 1, backgroundColor: cores.papel }} />;
  }

  return (
    <RodadaDupla
      formatoDupla={params.formatoDupla ?? 'cooperativo'}
      configuracaoRodada={{
        tipo: params.tipo ?? 'leitura',
        modalidade: params.modalidade ?? 'leitura_montar',
        formaMatematica: params.formaMatematica ?? 'pura',
        nivel: Number(params.nivel ?? 1),
        classificacao: params.classificacao ?? null,
        tamanho: (Number(params.tamanho ?? 5) as 3 | 5 | 8) ?? 5,
      }}
      perfisDisponiveis={perfis}
      onCriarPerfil={criarPerfil}
      dependenciasLeitura={{
        falar: (texto) => tocarVoz(texto),
        candidatasLetraNivel1: CANDIDATAS_LETRA_NIVEL1,
        iniciarGravacao: VOZ.iniciarGravacao,
        pararGravacao: VOZ.pararGravacao,
        transcrever: VOZ.transcrever,
      }}
      falarMatematica={(texto) => tocarVoz(texto)}
      onFinalizar={() => router.back()}
    />
  );
}
