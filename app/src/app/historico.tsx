import { useCallback, useEffect, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { View } from 'react-native';
import { TelaHistorico } from '../screens/historico';
import { buscarRodadasDoPerfil, limparHistoricoDoPerfil } from '../services/historico';
import { PERFIL_PADRAO_ID } from '../models/perfil';
import type { RegistroHistorico } from '../models/registro_historico';
import { cores } from '../theme';

/** Rota real de histórico (T053/T054, CU-06). */
export default function RotaHistorico() {
  const [rodadas, setRodadas] = useState<RegistroHistorico[] | null>(null);

  const recarregar = useCallback(() => {
    buscarRodadasDoPerfil(PERFIL_PADRAO_ID).then((r) => {
      setRodadas([...r].reverse()); // mais recente → mais antiga (CU-06)
    });
  }, []);

  useEffect(recarregar, [recarregar]);
  // recarrega toda vez que a tela ganha foco — pega rodadas jogadas desde a última visita
  useFocusEffect(recarregar);

  if (rodadas === null) {
    return <View style={{ flex: 1, backgroundColor: cores.papel }} />;
  }

  return (
    <TelaHistorico
      rodadas={rodadas}
      onApagarTudo={async () => {
        await limparHistoricoDoPerfil(PERFIL_PADRAO_ID);
        recarregar();
      }}
      onVoltar={() => (router.canGoBack() ? router.back() : router.replace('/'))}
    />
  );
}
