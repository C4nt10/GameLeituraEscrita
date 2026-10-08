import { router, useLocalSearchParams } from 'expo-router';
import { RodadaMista } from '../screens/rodada_mista';
import type { Classificacao } from '../models/registro_historico';
import { PERFIL_PADRAO_ID } from '../models/perfil';
import { itensDoBanco } from '../services/banco_de_conteudo';
import { falar as tocarVoz } from '../services/tts';

const CANDIDATAS_LETRA_NIVEL1 = itensDoBanco()
  .filter((item) => item.nivel === 1)
  .map((item) => item.palavra);

/**
 * Rota real do tipo "Misturado" (D-57) — recebe a configuração escolhida em
 * `/` via query string. A metade de leitura é sempre Ouvir e montar (A-39),
 * por isso não precisa da voz real (`services/voz_da_rodada`) — só `tts`.
 */
export default function RotaRodadaMista() {
  const params = useLocalSearchParams<{
    nivelLeitura: string;
    classificacao?: Classificacao;
    nivelMatematica: string;
    tamanho: string;
  }>();

  return (
    <RodadaMista
      perfilId={PERFIL_PADRAO_ID}
      configuracao={{
        nivelLeitura: Number(params.nivelLeitura ?? 1),
        classificacao: params.classificacao ?? null,
        nivelMatematica: Number(params.nivelMatematica ?? 1),
        tamanho: (Number(params.tamanho ?? 5) as 3 | 5 | 8) ?? 5,
      }}
      dependencias={{
        falar: (texto) => tocarVoz(texto),
        candidatasLetraNivel1: CANDIDATAS_LETRA_NIVEL1,
      }}
      onSairDaRodada={() => router.back()}
      onJogarDeNovo={() => router.back()}
      onVerHistorico={() => router.push('/historico')}
    />
  );
}
