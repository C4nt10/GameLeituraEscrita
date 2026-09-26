import { router, useLocalSearchParams } from 'expo-router';
import { RodadaLeitura } from '../screens/rodada';
import type { Classificacao, Modalidade } from '../models/registro_historico';
import { PERFIL_PADRAO_ID } from '../models/perfil';
import { itensDoBanco } from '../services/banco_de_conteudo';
import { falar as tocarVoz } from '../services/tts';
import { gravacao } from '../services/gravacao';
import { transcreverAudio } from '../services/stt';
import { criarDependenciasDeVoz } from '../services/voz_da_rodada';

/** Gravação real + reconhecimento offline (D-45) no lugar dos stubs antigos. */
const VOZ = criarDependenciasDeVoz({ gravacao, transcreverAudio });

const CANDIDATAS_LETRA_NIVEL1 = itensDoBanco()
  .filter((item) => item.nivel === 1)
  .map((item) => item.palavra);

/**
 * Rota real de rodada de leitura — recebe a configuração escolhida em
 * `/` (T047) via query string. Gravação e transcrição são as reais (D-45):
 * microfone por PCM em tempo real + `whisper.rn` offline. Se o motor não
 * sobe, a configuração já deixa Leitura · voz desabilitada (D-44).
 */
export default function RotaRodadaLeitura() {
  const params = useLocalSearchParams<{
    modalidade: Modalidade;
    nivel: string;
    classificacao?: Classificacao;
    tamanho: string;
  }>();

  return (
    <RodadaLeitura
      perfilId={PERFIL_PADRAO_ID}
      configuracao={{
        modalidade: params.modalidade ?? 'leitura_montar',
        nivel: Number(params.nivel ?? 1),
        classificacao: params.classificacao ?? null,
        tamanho: (Number(params.tamanho ?? 5) as 3 | 5 | 8) ?? 5,
      }}
      dependencias={{
        falar: (texto) => tocarVoz(texto),
        candidatasLetraNivel1: CANDIDATAS_LETRA_NIVEL1,
        iniciarGravacao: VOZ.iniciarGravacao,
        pararGravacao: VOZ.pararGravacao,
        transcrever: VOZ.transcrever,
      }}
      onSairDaRodada={() => router.back()}
      onJogarDeNovo={() => router.back()}
      onSubirDeNivel={() => router.back()}
      onVerHistorico={() => router.push('/historico')}
    />
  );
}
