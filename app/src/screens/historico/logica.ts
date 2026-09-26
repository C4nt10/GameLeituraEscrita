import type { RegistroHistorico } from '../../models/registro_historico';
import { corModalidade } from '../../theme/tema';

/**
 * Lógica pura do histórico "Minhas estrelas" (T114) — separada da tela pelo
 * mesmo motivo do resto do padrão visual: o projeto não tem teste de
 * componente, então o que dá pra decidir sem renderizar mora aqui.
 *
 * Uma aba por jeito de jogar, **sem cruzar modalidades** (D-20: estrelas e
 * precisão de modalidades diferentes medem habilidades diferentes). Conta e
 * Historinha ficam em abas separadas, como na tela inicial — o resumo
 * anterior (`resumo_historico`) agrupava as duas em "matemática".
 */
export type IdDaAba = 'ditado' | 'leitura_montar' | 'leitura_voz' | 'conta' | 'historinha';

export interface Aba {
  id: IdDaAba;
  rotulo: string;
  cor: { base: string; degrau: string; texto: string };
  /** Rótulo do contador de ajuda da modalidade (D-19); `null` em Contas e Historinha (A-21). */
  contadorDeAjuda: string | null;
}

export const ABAS: readonly Aba[] = [
  { id: 'ditado', rotulo: 'Ouvir e montar', cor: corModalidade.ditado, contadorDeAjuda: 'ouviu' },
  {
    id: 'leitura_montar',
    rotulo: 'Ler e montar',
    cor: corModalidade.leituraMontar,
    contadorDeAjuda: 'espiou',
  },
  {
    id: 'leitura_voz',
    rotulo: 'Ler em voz alta',
    cor: corModalidade.leituraVoz,
    contadorDeAjuda: 'tentou',
  },
  { id: 'conta', rotulo: 'Conta', cor: corModalidade.contaPura, contadorDeAjuda: null },
  {
    id: 'historinha',
    rotulo: 'Historinha',
    cor: corModalidade.contextualizada,
    contadorDeAjuda: null,
  },
];

export function abaDaRodada(rodada: RegistroHistorico): IdDaAba {
  if (rodada.tipo === 'matematica') {
    return rodada.formaMatematica === 'contextualizada' ? 'historinha' : 'conta';
  }
  return rodada.modalidade ?? 'ditado';
}

/** Rodadas concluídas da aba, na ordem recebida (abandonadas não aparecem — data-model). */
export function rodadasDaAba(rodadas: RegistroHistorico[], aba: IdDaAba): RegistroHistorico[] {
  return rodadas.filter((r) => r.concluida && abaDaRodada(r) === aba);
}

export interface ResumoDaAba {
  total: number;
  precisaoMedia: number;
  estrelaMedia: number;
}

export function resumoDaAba(rodadas: RegistroHistorico[]): ResumoDaAba {
  if (rodadas.length === 0) return { total: 0, precisaoMedia: 0, estrelaMedia: 0 };
  const soma = (campo: 'precisao' | 'estrelas') => rodadas.reduce((s, r) => s + r[campo], 0);
  return {
    total: rodadas.length,
    precisaoMedia: soma('precisao') / rodadas.length,
    estrelaMedia: soma('estrelas') / rodadas.length,
  };
}

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/**
 * "hoje", "ontem" ou "3 set". Os meses são fixos em português: `toLocaleDateString`
 * no Hermes depende do dispositivo ter os dados de locale, e a criança/adulto
 * não pode ver a data em inglês por causa disso.
 */
export function dataDaRodada(iso: string, agora: Date = new Date()): string {
  const data = new Date(iso);
  const ontem = new Date(agora);
  ontem.setDate(agora.getDate() - 1);

  const mesmoDia = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (mesmoDia(data, agora)) return 'hoje';
  if (mesmoDia(data, ontem)) return 'ontem';
  return `${data.getDate()} ${MESES[data.getMonth()]}`;
}
