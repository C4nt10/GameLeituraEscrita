import type * as SQLite from 'expo-sqlite';
import { obterBancoLocal } from '../../lib/bancoLocal';
import type {
  Classificacao,
  FormaMatematica,
  Modalidade,
  RegistroHistorico,
  TipoRodada,
} from '../../models/registro_historico';
import { aplicarRetencao } from './regras';

/**
 * historico — persistência local das rodadas (FR-015): até 50 rodadas
 * concluídas por perfil, retenção automática (`regras.ts`, testada em
 * `historico_retencao_test`), exclusão só quando a UI confirma.
 *
 * `expo-sqlite` é módulo nativo — não roda em Jest — por isso a REGRA de
 * retenção fica isolada e testável em `regras.ts`, e este arquivo só faz
 * o encanamento de SQL em cima dela.
 */

let dbComTabelaPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function obterBanco(): Promise<SQLite.SQLiteDatabase> {
  if (!dbComTabelaPromise) {
    dbComTabelaPromise = abrirEIniciar();
  }
  return dbComTabelaPromise;
}

async function abrirEIniciar(): Promise<SQLite.SQLiteDatabase> {
  const db = await obterBancoLocal();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS rodadas (
      id TEXT PRIMARY KEY NOT NULL,
      perfil_id TEXT NOT NULL,
      tipo TEXT NOT NULL,
      modalidade TEXT,
      forma_matematica TEXT,
      nivel INTEGER NOT NULL,
      classificacoes TEXT,
      tamanho INTEGER NOT NULL,
      iniciada_em TEXT NOT NULL,
      concluida_em TEXT,
      concluida INTEGER NOT NULL,
      acertos INTEGER NOT NULL,
      erros INTEGER NOT NULL,
      precisao REAL NOT NULL,
      estrelas REAL NOT NULL,
      contador_ajuda INTEGER
    );
  `);
  return db;
}

interface LinhaRodada {
  id: string;
  perfil_id: string;
  tipo: string;
  modalidade: string | null;
  forma_matematica: string | null;
  nivel: number;
  classificacoes: string | null;
  tamanho: number;
  iniciada_em: string;
  concluida_em: string | null;
  concluida: number;
  acertos: number;
  erros: number;
  precisao: number;
  estrelas: number;
  contador_ajuda: number | null;
}

function paraLinha(r: RegistroHistorico): LinhaRodada {
  return {
    id: r.id,
    perfil_id: r.perfilId,
    tipo: r.tipo,
    modalidade: r.modalidade,
    forma_matematica: r.formaMatematica,
    nivel: r.nivel,
    classificacoes: r.classificacoes ? JSON.stringify(r.classificacoes) : null,
    tamanho: r.tamanho,
    iniciada_em: r.iniciadaEm,
    concluida_em: r.concluidaEm,
    concluida: r.concluida ? 1 : 0,
    acertos: r.acertos,
    erros: r.erros,
    precisao: r.precisao,
    estrelas: r.estrelas,
    contador_ajuda: r.contadorAjuda,
  };
}

function daLinha(linha: LinhaRodada): RegistroHistorico {
  return {
    id: linha.id,
    perfilId: linha.perfil_id,
    tipo: linha.tipo as TipoRodada,
    modalidade: linha.modalidade as Modalidade | null,
    formaMatematica: linha.forma_matematica as FormaMatematica | null,
    nivel: linha.nivel,
    classificacoes: linha.classificacoes
      ? (JSON.parse(linha.classificacoes) as Classificacao[])
      : null,
    tamanho: linha.tamanho as 3 | 5 | 8,
    iniciadaEm: linha.iniciada_em,
    concluidaEm: linha.concluida_em,
    concluida: linha.concluida === 1,
    acertos: linha.acertos,
    erros: linha.erros,
    precisao: linha.precisao,
    estrelas: linha.estrelas,
    contadorAjuda: linha.contador_ajuda,
  };
}

export async function buscarRodadasDoPerfil(perfilId: string): Promise<RegistroHistorico[]> {
  const db = await obterBanco();
  const linhas = await db.getAllAsync<LinhaRodada>(
    'SELECT * FROM rodadas WHERE perfil_id = ? ORDER BY iniciada_em ASC',
    perfilId,
  );
  return linhas.map(daLinha);
}

/**
 * Registra uma rodada nova e aplica a retenção de 50 (FR-015). Se isso
 * estourar o limite do perfil, a concluída mais antiga é removida junto.
 */
export async function registrarRodada(
  novaRodada: RegistroHistorico,
): Promise<{ removida: RegistroHistorico | null }> {
  const db = await obterBanco();
  const existentes = await buscarRodadasDoPerfil(novaRodada.perfilId);
  const { removida } = aplicarRetencao(existentes, novaRodada);

  const linha = paraLinha(novaRodada);
  await db.runAsync(
    `INSERT INTO rodadas (
      id, perfil_id, tipo, modalidade, forma_matematica, nivel, classificacoes,
      tamanho, iniciada_em, concluida_em, concluida, acertos, erros, precisao,
      estrelas, contador_ajuda
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    linha.id,
    linha.perfil_id,
    linha.tipo,
    linha.modalidade,
    linha.forma_matematica,
    linha.nivel,
    linha.classificacoes,
    linha.tamanho,
    linha.iniciada_em,
    linha.concluida_em,
    linha.concluida,
    linha.acertos,
    linha.erros,
    linha.precisao,
    linha.estrelas,
    linha.contador_ajuda,
  );

  if (removida) {
    await db.runAsync('DELETE FROM rodadas WHERE id = ?', removida.id);
  }

  return { removida };
}

/**
 * Exclui uma rodada do histórico. A confirmação ("tem certeza?", CU-06) é
 * responsabilidade da tela — esta função só executa a exclusão já
 * confirmada.
 */
export async function excluirRodada(id: string): Promise<void> {
  const db = await obterBanco();
  await db.runAsync('DELETE FROM rodadas WHERE id = ?', id);
}
