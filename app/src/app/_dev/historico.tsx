import { router } from 'expo-router';
import type { RegistroHistorico } from '../../models/registro_historico';
import { TelaHistorico } from '../../screens/historico';

const base: RegistroHistorico = {
  id: 'x',
  perfilId: 'padrao',
  tipo: 'leitura',
  modalidade: 'ditado',
  formaMatematica: null,
  nivel: 2,
  classificacoes: ['animais'],
  tamanho: 5,
  iniciadaEm: new Date().toISOString(),
  concluidaEm: new Date().toISOString(),
  concluida: true,
  acertos: 4,
  erros: 1,
  precisao: 0.8,
  estrelas: 4,
  contadorAjuda: 2,
};

const diasAtras = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

/** Rota de desenvolvimento: histórico com dados de mentira, pra conferir o visual. */
export default function DevHistorico() {
  const rodadas: RegistroHistorico[] = [
    { ...base, id: '1', modalidade: 'leitura_montar', nivel: 3, estrelas: 4.5, precisao: 0.88 },
    {
      ...base,
      id: '2',
      tipo: 'matematica',
      modalidade: null,
      formaMatematica: 'pura',
      contadorAjuda: null,
      estrelas: 5,
      precisao: 1,
      iniciadaEm: diasAtras(1),
    },
    {
      ...base,
      id: '3',
      modalidade: 'ditado',
      nivel: 1,
      estrelas: 5,
      precisao: 0.95,
      iniciadaEm: diasAtras(1),
    },
    {
      ...base,
      id: '4',
      modalidade: 'ditado',
      nivel: 2,
      estrelas: 2.5,
      precisao: 0.51,
      contadorAjuda: 9,
      iniciadaEm: diasAtras(24),
    },
  ];
  return (
    <TelaHistorico
      rodadas={rodadas}
      onApagarTudo={() => {}}
      onVoltar={() => (router.canGoBack() ? router.back() : router.replace('/'))}
    />
  );
}
