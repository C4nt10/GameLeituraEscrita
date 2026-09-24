import { useEffect, useState } from 'react';
import * as Speech from 'expo-speech';
import { TelaEscolhaDeVoz, type VozDisponivel } from '../screens/escolha_de_voz';
import { buscarConfiguracao, salvarConfiguracao } from '../services/configuracao';
import { PERFIL_PADRAO_ID } from '../models/perfil';

/**
 * Rota real de escolha de voz (T048) — a escolha fica salva de verdade
 * em `configuracao.vozId` (T046), pra aparecer pré-selecionada da
 * próxima vez que a tela abrir (US3 cenário 5, T045).
 */
export default function RotaEscolhaDeVoz() {
  const [vozes, setVozes] = useState<VozDisponivel[]>([]);
  const [carregado, setCarregado] = useState(false);
  const [vozSelecionadaId, setVozSelecionadaId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([Speech.getAvailableVoicesAsync(), buscarConfiguracao(PERFIL_PADRAO_ID)]).then(
      ([todasAsVozes, configuracao]) => {
        const vozesPt: VozDisponivel[] = todasAsVozes
          .filter((v) => v.language?.toLowerCase().startsWith('pt'))
          .map((v) => ({
            identifier: v.identifier,
            name: v.name,
            language: v.language,
            quality: v.quality === Speech.VoiceQuality.Enhanced ? 'Enhanced' : 'Default',
          }));
        setVozes(vozesPt);
        setVozSelecionadaId(configuracao.vozId); // T045 — última voz escolhida, pré-selecionada
        setCarregado(true);
      },
    );
  }, []);

  async function selecionarVoz(vozId: string) {
    setVozSelecionadaId(vozId);
    const configuracao = await buscarConfiguracao(PERFIL_PADRAO_ID);
    await salvarConfiguracao({ ...configuracao, vozId });
  }

  if (!carregado) return null;

  return (
    <TelaEscolhaDeVoz
      vozes={vozes}
      vozSelecionadaId={vozSelecionadaId}
      motivoSemVoz={
        vozes.length === 0 ? 'Nenhuma voz em português instalada neste aparelho.' : null
      }
      onSelecionarVoz={selecionarVoz}
      onTestarVoz={(vozId) => Speech.speak('Essa é a minha voz', { voice: vozId })}
    />
  );
}
