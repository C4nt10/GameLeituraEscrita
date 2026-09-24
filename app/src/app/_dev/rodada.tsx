import { router, useLocalSearchParams } from 'expo-router';
import { RodadaLeitura } from '../../screens/rodada';
import type { Modalidade } from '../../models/registro_historico';
import { itensDoBanco } from '../../services/banco_de_conteudo';

const CANDIDATAS_LETRA_NIVEL1 = itensDoBanco()
  .filter((item) => item.nivel === 1)
  .map((item) => item.palavra);

export default function DevRodada() {
  const { modalidade } = useLocalSearchParams<{ modalidade: Modalidade }>();

  return (
    <RodadaLeitura
      configuracao={{
        modalidade: modalidade ?? 'leitura_montar',
        nivel: 2,
        classificacao: 'animais',
        tamanho: 3,
      }}
      dependencias={{
        falar: () => Promise.resolve(),
        candidatasLetraNivel1: CANDIDATAS_LETRA_NIVEL1,
        iniciarGravacao: () => Promise.resolve(),
        pararGravacao: () => Promise.resolve('file://dev.wav'),
        transcrever: () => Promise.resolve('gato'),
      }}
      onSairDaRodada={() => router.back()}
      onJogarDeNovo={() => router.back()}
      onSubirDeNivel={() => router.back()}
    />
  );
}
