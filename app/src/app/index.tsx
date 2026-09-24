import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { TelaConfiguracao, type EscolhaRodada } from '../screens/configuracao';
import {
  buscarConfiguracao,
  salvarConfiguracao,
  type Configuracao,
} from '../services/configuracao';
import { verificarCapacidades } from '../services/capacidade_aparelho';
import { garantirPerfilPadrao } from '../services/perfis';
import { PERFIL_PADRAO_ID } from '../models/perfil';
import { cores } from '../theme';

/**
 * Tela inicial de verdade (T047 + Princípio VII — abre pronto pra
 * jogar, configurar é opcional): carrega a configuração persistida do
 * perfil (T046) ou os padrões válidos se nunca foi salva, checa
 * capacidade do microfone (T017/T033) e deixa "Começar" disponível sem
 * exigir nenhuma alteração.
 */
export default function Index() {
  const [configuracao, setConfiguracao] = useState<Configuracao | null>(null);
  const [microfoneDisponivel, setMicrofoneDisponivel] = useState(true);
  const [motivoMicrofoneIndisponivel, setMotivoMicrofoneIndisponivel] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let cancelado = false;
    void garantirPerfilPadrao();
    buscarConfiguracao(PERFIL_PADRAO_ID).then((c) => {
      if (!cancelado) setConfiguracao(c);
    });
    verificarCapacidades().then((capacidades) => {
      if (cancelado) return;
      setMicrofoneDisponivel(capacidades.microfone.disponivel);
      setMotivoMicrofoneIndisponivel(capacidades.microfone.motivo);
    });
    return () => {
      cancelado = true;
    };
  }, []);

  if (!configuracao) {
    return <View style={{ flex: 1, backgroundColor: cores.papel }} />;
  }

  function persistirEscolha(escolha: EscolhaRodada) {
    if (!configuracao) return;
    void salvarConfiguracao({
      ...configuracao,
      ultimoNivel: escolha.nivel,
      ultimasClassificacoes: escolha.classificacao ? [escolha.classificacao] : ['todas'],
      ultimoTamanho: escolha.tamanho,
      ultimaModalidade: escolha.modalidade,
      ultimaFormaMatematica: escolha.formaMatematica,
    });
  }

  return (
    <TelaConfiguracao
      configuracaoInicial={configuracao}
      microfoneDisponivel={microfoneDisponivel}
      motivoMicrofoneIndisponivel={motivoMicrofoneIndisponivel}
      onIniciar={(escolha) => {
        persistirEscolha(escolha);
        const classificacaoParam = escolha.classificacao
          ? `&classificacao=${escolha.classificacao}`
          : '';

        if (escolha.formato === 'dupla') {
          router.push(
            `/dupla?tipo=${escolha.tipo}&modalidade=${escolha.modalidade}&formaMatematica=${escolha.formaMatematica}&nivel=${escolha.nivel}&tamanho=${escolha.tamanho}&formatoDupla=${escolha.formatoDupla}${classificacaoParam}`,
          );
        } else if (escolha.tipo === 'matematica') {
          router.push(
            `/rodada-matematica?forma=${escolha.formaMatematica}&nivel=${escolha.nivel}&tamanho=${escolha.tamanho}${classificacaoParam}`,
          );
        } else {
          router.push(
            `/rodada?modalidade=${escolha.modalidade}&nivel=${escolha.nivel}&tamanho=${escolha.tamanho}${classificacaoParam}`,
          );
        }
      }}
      onAbrirEscolhaDeVoz={() => router.push('/escolha-de-voz')}
      onAbrirHistorico={() => router.push('/historico')}
      onAlterarNomeOuFonema={(valor) => {
        const atualizada = { ...configuracao, nomeOuFonema: valor };
        setConfiguracao(atualizada);
        void salvarConfiguracao(atualizada);
      }}
    />
  );
}
