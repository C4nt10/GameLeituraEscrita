import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import type { EscolhaRodada } from '../screens/inicio/tipos';
import { TelaAbertura } from '../screens/abertura';
import { aberturaPendente, marcarAberturaMostrada } from '../screens/abertura/estado';
import { TelaInicio } from '../screens/inicio';
import {
  buscarConfiguracao,
  salvarConfiguracao,
  type Configuracao,
} from '../services/configuracao';
import { leituraVozDisponivel, verificarCapacidades } from '../services/capacidade_aparelho';
import { garantirPerfilPadrao } from '../services/perfis';
import { PERFIL_PADRAO_ID } from '../models/perfil';
import { cor } from '../theme/tema';

/**
 * Tela inicial de verdade (T047 + Princípio VII — abre pronto pra
 * jogar, configurar é opcional): carrega a configuração persistida do
 * perfil (T046) ou os padrões válidos se nunca foi salva, checa
 * capacidade do microfone (T017/T033) e deixa "Começar" disponível sem
 * exigir nenhuma alteração.
 */
export default function Index() {
  const [abertura, setAbertura] = useState(aberturaPendente);
  const [configuracao, setConfiguracao] = useState<Configuracao | null>(null);
  // começa indisponível e só habilita depois de `verificarCapacidades` confirmar — nunca oferece
  // Leitura · voz por otimismo (D-44).
  const [vozDisponivel, setVozDisponivel] = useState(false);
  const [motivoVozIndisponivel, setMotivoVozIndisponivel] = useState<string | null>(
    'Verificando o reconhecimento de voz...',
  );

  useEffect(() => {
    let cancelado = false;
    void garantirPerfilPadrao();
    buscarConfiguracao(PERFIL_PADRAO_ID).then((c) => {
      if (!cancelado) setConfiguracao(c);
    });
    verificarCapacidades().then((capacidades) => {
      if (cancelado) return;
      const voz = leituraVozDisponivel(capacidades);
      setVozDisponivel(voz.disponivel);
      setMotivoVozIndisponivel(voz.motivo);
    });
    return () => {
      cancelado = true;
    };
  }, []);

  // A abertura aparece só na abertura a frio (A-30); enquanto a criança não toca, a configuração carrega por trás.
  if (abertura) {
    return (
      <TelaAbertura
        aoComecar={() => {
          marcarAberturaMostrada();
          setAbertura(false);
        }}
      />
    );
  }

  if (!configuracao) {
    return <View style={{ flex: 1, backgroundColor: cor.papel }} />;
  }

  function persistirEscolha(escolha: EscolhaRodada) {
    if (!configuracao) return;
    void salvarConfiguracao({
      ...configuracao,
      // nível de leitura e de matemática são independentes (D-43) — salva o(s) do tipo jogado;
      // misto joga os dois, então salva os dois (D-57).
      ...(escolha.tipo === 'matematica'
        ? { ultimoNivelMatematica: escolha.nivel }
        : escolha.tipo === 'misto'
          ? {
              ultimoNivel: escolha.nivel,
              ultimoNivelMatematica: escolha.nivelMatematica ?? configuracao.ultimoNivelMatematica,
            }
          : { ultimoNivel: escolha.nivel }),
      ultimasClassificacoes: escolha.classificacao ? [escolha.classificacao] : ['todas'],
      ultimoTamanho: escolha.tamanho,
      ultimaModalidade: escolha.modalidade,
      ultimaFormaMatematica: escolha.formaMatematica,
    });
  }

  return (
    <TelaInicio
      configuracaoInicial={configuracao}
      leituraVozDisponivel={vozDisponivel}
      motivoLeituraVozIndisponivel={motivoVozIndisponivel}
      onIniciar={(escolha) => {
        persistirEscolha(escolha);
        const classificacaoParam = escolha.classificacao
          ? `&classificacao=${escolha.classificacao}`
          : '';

        if (escolha.tipo === 'misto') {
          // D-57/A-40: Misturado não joga em dupla — nenhuma checagem de formato aqui.
          // `nivelMatematica` é opcional no tipo (só os outros tipos não o usam) — `escolhaParaRodada`
          // sempre preenche pra tipo misto; o `?? 1` é só pra não injetar "undefined" na URL.
          const nivelMatematica = escolha.nivelMatematica ?? 1;
          router.push(
            `/misto?nivelLeitura=${escolha.nivel}&nivelMatematica=${nivelMatematica}&tamanho=${escolha.tamanho}${classificacaoParam}`,
          );
        } else if (escolha.formato === 'dupla') {
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
      onAbrirHistorico={() => router.push('/historico')}
    />
  );
}
