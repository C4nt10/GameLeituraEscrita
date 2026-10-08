import type { Classificacao, FormaMatematica, Modalidade } from '../../models/registro_historico';
import { rotuloDoTema } from '../../theme/helpers';
import type { EscolhaRodada, Formato, FormatoDupla, Tipo } from './tipos';

/**
 * Lógica pura da tela inicial "Letra Viva" (D-51, D-53, D-55): quais jeitos de
 * jogar existem, o que fica travado e por quê, quando dá pra começar e como a
 * escolha vira uma rodada. Sem React — decidido aqui e testado, porque o
 * projeto não tem teste de componente. **Nenhuma regra de jogo muda** (D-55):
 * isto só reorganiza o que a `TelaConfiguracao` já fazia.
 */

export type IdDoModo = 'ditado' | 'leitura_montar' | 'leitura_voz' | 'conta' | 'historinha';

export interface TipoDaCrianca {
  id: Tipo;
  rotulo: string;
  disponivel: boolean;
  selo?: 'chegando logo';
}

/** Os três tipos jogam de verdade (D-57 — "Misturado" deixou de ser "chegando logo", A-26). */
export const TIPOS_DA_CRIANCA: TipoDaCrianca[] = [
  { id: 'leitura', rotulo: 'Letras', disponivel: true },
  { id: 'matematica', rotulo: 'Contas', disponivel: true },
  { id: 'misto', rotulo: 'Misturado', disponivel: true },
];

export interface ModoDeJogo {
  id: IdDoModo;
  rotulo: string;
  descricao: string;
  disponivel: boolean;
  selo?: 'chegando logo' | 'só conta';
}

/** Multiplicação (nível 8) só existe como conta pura — não há "historinha" dela (D-41). */
export const NIVEL_MATEMATICA_SO_CONTA = 8;

export function modosDoTipo(tipo: Tipo, contexto: { nivelMatematica: number }): ModoDeJogo[] {
  if (tipo === 'leitura') {
    return [
      {
        id: 'ditado',
        rotulo: 'Ouvir e montar',
        descricao: 'escuta a palavra e monta',
        disponivel: true,
      },
      {
        id: 'leitura_montar',
        rotulo: 'Ler e montar',
        descricao: 'a palavra aparece e some',
        disponivel: true,
      },
      {
        id: 'leitura_voz',
        rotulo: 'Ler em voz alta',
        descricao: 'lê para o microfone',
        // D-56: sempre selecionável. "Não baixado" é o estado normal da
        // primeira vez, não uma trava — o convite pra baixar (com progresso
        // e erro) mora na tela do desafio (US1 cenário 12), não aqui. O
        // "chegando logo" antigo era pra quando o motor nem existia de
        // verdade no app (D-44); isso já não é mais o caso.
        disponivel: true,
      },
    ];
  }
  if (tipo === 'matematica') {
    const historinhaLiberada = contexto.nivelMatematica !== NIVEL_MATEMATICA_SO_CONTA;
    return [
      { id: 'conta', rotulo: 'Conta', descricao: '3 + 2, com bolinhas', disponivel: true },
      {
        id: 'historinha',
        rotulo: 'Historinha',
        descricao: '3 maçãs e mais 2 maçãs',
        disponivel: historinhaLiberada,
        ...(historinhaLiberada ? {} : { selo: 'só conta' as const }),
      },
    ];
  }
  return [];
}

/** Nunca abre numa modalidade que não funciona (Princípio I): voz indisponível → Ler e montar. */
export function modoInicial(
  tipo: Tipo,
  ultimaModalidade: Modalidade,
  vozDisponivel: boolean,
): IdDoModo {
  if (tipo === 'matematica') return 'conta';
  if (ultimaModalidade === 'leitura_voz' && !vozDisponivel) return 'leitura_montar';
  return ultimaModalidade;
}

export interface EstadoDoInicio {
  tipo: Tipo;
  modo: IdDoModo;
  nivelLeitura: number;
  nivelMatematica: number;
  classificacao: Classificacao | null;
  tamanho: 3 | 5 | 8;
  formato: Formato;
  formatoDupla: FormatoDupla | null;
}

export function podeIniciar(estado: EstadoDoInicio): boolean {
  // D-57/A-39: Misturado não tem "modo" pra escolher (é sempre Ouvir e montar + Conta pura) —
  // e A-40: não funciona em dupla no MVP.
  if (estado.tipo === 'misto') return estado.formato === 'sozinho';

  const modo = modosDoTipo(estado.tipo, { nivelMatematica: estado.nivelMatematica }).find(
    (m) => m.id === estado.modo,
  );
  if (!modo || !modo.disponivel) return false;
  // D-31: nenhum formato de dupla é padrão implícito
  if (estado.formato === 'dupla' && estado.formatoDupla === null) return false;
  return true;
}

/** Resumo só pra ler (A-19: não abre a folha do adulto). */
export function resumoDaEscolha(estado: EstadoDoInicio): string {
  if (estado.tipo === 'matematica') {
    return `Nível ${estado.nivelMatematica} · ${estado.tamanho} contas`;
  }
  if (estado.tipo === 'misto') {
    return `Nível ${estado.nivelLeitura} leitura · Nível ${estado.nivelMatematica} contas · ${estado.tamanho} desafios`;
  }
  const partes = [`Nível ${estado.nivelLeitura}`];
  if (estado.nivelLeitura >= 2) {
    partes.push(estado.classificacao ? rotuloDoTema(estado.classificacao) : 'todos os temas');
  }
  partes.push(`${estado.tamanho} palavras`);
  return partes.join(' · ');
}

const MODALIDADES_DE_LEITURA: Modalidade[] = ['ditado', 'leitura_montar', 'leitura_voz'];

/** A mesma `EscolhaRodada` que a `TelaConfiguracao` já entregava — nenhum comportamento novo. */
export function escolhaParaRodada(
  estado: EstadoDoInicio,
  modalidadeSalva: Modalidade,
): EscolhaRodada {
  // D-57/A-39: Misturado é sempre Ouvir e montar + Conta pura, sem seletor; A-40: sempre sozinho.
  if (estado.tipo === 'misto') {
    return {
      tipo: 'misto',
      modalidade: 'ditado',
      nivel: estado.nivelLeitura,
      nivelMatematica: estado.nivelMatematica,
      classificacao: estado.classificacao,
      formaMatematica: 'pura',
      tamanho: estado.tamanho,
      formato: 'sozinho',
      formatoDupla: null,
    };
  }

  const modalidade = MODALIDADES_DE_LEITURA.includes(estado.modo as Modalidade)
    ? (estado.modo as Modalidade)
    : modalidadeSalva;
  const formaMatematica: FormaMatematica =
    estado.modo === 'historinha' && estado.nivelMatematica !== NIVEL_MATEMATICA_SO_CONTA
      ? 'contextualizada'
      : 'pura';

  return {
    tipo: estado.tipo,
    modalidade,
    nivel: estado.tipo === 'matematica' ? estado.nivelMatematica : estado.nivelLeitura,
    classificacao: estado.classificacao,
    formaMatematica,
    tamanho: estado.tamanho,
    formato: estado.formato,
    formatoDupla: estado.formatoDupla,
  };
}
