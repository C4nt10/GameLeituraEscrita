import { router, useLocalSearchParams } from 'expo-router';
import { RodadaMatematica } from '../screens/rodada_matematica';
import type { Classificacao } from '../models/registro_historico';
import type { FormaMatematica } from '../models/desafio_matematica';
import { PERFIL_PADRAO_ID } from '../models/perfil';
import { falar as tocarVoz } from '../services/tts';

/** Rota real de rodada de matemática — recebe a configuração de `/` (T047) via query string. */
export default function RotaRodadaMatematica() {
  const params = useLocalSearchParams<{
    forma: FormaMatematica;
    nivel: string;
    classificacao?: Classificacao;
    tamanho: string;
  }>();

  return (
    <RodadaMatematica
      perfilId={PERFIL_PADRAO_ID}
      configuracao={{
        forma: params.forma ?? 'pura',
        nivel: Number(params.nivel ?? 1),
        classificacao: params.classificacao,
        tamanho: (Number(params.tamanho ?? 5) as 3 | 5 | 8) ?? 5,
      }}
      falar={(texto) => tocarVoz(texto)}
      onSairDaRodada={() => router.back()}
      onJogarDeNovo={() => router.back()}
      onSubirDeNivel={() => router.back()}
      onVerHistorico={() => router.push('/historico')}
    />
  );
}
