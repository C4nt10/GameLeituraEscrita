import { router, useLocalSearchParams } from 'expo-router';
import { RodadaLeitura } from '../screens/rodada';
import type { Classificacao, Modalidade } from '../models/registro_historico';
import { PERFIL_PADRAO_ID } from '../models/perfil';
import { itensDoBanco } from '../services/banco_de_conteudo';
import { falar as tocarVoz } from '../services/tts';

const CANDIDATAS_LETRA_NIVEL1 = itensDoBanco()
  .filter((item) => item.nivel === 1)
  .map((item) => item.palavra);

/**
 * Rota real de rodada de leitura — recebe a configuração escolhida em
 * `/` (T047) via query string. `iniciarGravacao`/`pararGravacao`/
 * `transcrever` continuam como stubs: `whisper.rn` não está instalado
 * (T028/T031 documentam isso — exige `expo prebuild`).
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
        iniciarGravacao: () => Promise.resolve(),
        pararGravacao: () => Promise.resolve(''),
        transcrever: () => Promise.resolve(''),
      }}
      onSairDaRodada={() => router.back()}
      onJogarDeNovo={() => router.back()}
      onSubirDeNivel={() => router.back()}
      onVerHistorico={() => router.push('/historico')}
    />
  );
}
