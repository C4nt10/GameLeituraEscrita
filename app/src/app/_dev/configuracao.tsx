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
        if (escolha.formato === 'dupla') {
          router.push(
            `/dupla?tipo=${escolha.tipo}&modalidade=${escolha.modalidade}&formaMatematica=${escolha.formaMatematica}&nivel=${escolha.nivel}&tamanho=${escolha.tamanho}&formatoDupla=${escolha.formatoDupla}`,
          );
        } else if (escolha.tipo === 'matematica') {
          router.push(`/_dev/rodada-matematica?forma=${escolha.formaMatematica}`);
        } else {
          router.push(`/_dev/rodada?modalidade=${escolha.modalidade}`);
        }
      }}
      onAbrirHistorico={() => router.push('/historico')}
    />
  );
}
