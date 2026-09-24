import { router, useLocalSearchParams } from 'expo-router';
import { RodadaMatematica } from '../../screens/rodada_matematica';
import { PERFIL_PADRAO_ID } from '../../models/perfil';

export default function DevRodadaMatematica() {
  const { forma } = useLocalSearchParams<{ forma: 'pura' | 'contextualizada' }>();

  return (
    <RodadaMatematica
      perfilId={PERFIL_PADRAO_ID}
      configuracao={{
        forma: forma ?? 'pura',
        nivel: 2,
        classificacao: 'animais',
        tamanho: 3,
      }}
      falar={() => Promise.resolve()}
      onSairDaRodada={() => router.back()}
      onJogarDeNovo={() => router.back()}
      onSubirDeNivel={() => router.back()}
    />
  );
}
