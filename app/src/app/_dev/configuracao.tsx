import { router } from 'expo-router';
import { TelaConfiguracao, type EscolhaRodada } from '../../screens/configuracao';
import { configuracaoPadrao } from '../../services/configuracao';

export default function DevConfiguracao() {
  return (
    <TelaConfiguracao
      configuracaoInicial={configuracaoPadrao('padrao')}
      microfoneDisponivel={true}
      motivoMicrofoneIndisponivel={null}
      onIniciar={(escolha: EscolhaRodada) => {
        if (escolha.tipo === 'matematica') {
          router.push(`/_dev/rodada-matematica?forma=${escolha.formaMatematica}`);
        } else {
          router.push(`/_dev/rodada?modalidade=${escolha.modalidade}`);
        }
      }}
      onAbrirEscolhaDeVoz={() => router.push('/_dev/escolha-de-voz')}
      onAlterarNomeOuFonema={() => {}}
    />
  );
}
