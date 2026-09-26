import type * as SQLite from 'expo-sqlite';
import { obterBancoLocal } from '../../lib/bancoLocal';
import { migrarConfiguracao } from './migracao';
import type { Classificacao, FormaMatematica, Modalidade } from '../../models/registro_historico';

/**
 * configuracao — preferências persistidas por perfil (data-model.md,
 * tabela `configuracao`): última voz, nome/fonema (D-26), últimos
 * nível/classificações/tamanho/modalidade/forma de matemática. Todo
 * campo tem padrão válido — nenhum é obrigatório pra iniciar (FR-012,
 * Princípio VII).
 *
 * `expo-sqlite` é módulo nativo — não roda em Jest — por isso, igual a
 * `historico`, este arquivo não tem teste unitário próprio; é
 * encanamento de SQL direto, sem regra de negócio pra isolar.
 */

export interface Configuracao {
  perfilId: string;
  /** `null` até o primeiro teste de voz (CU-07). */
  vozId: string | null;
  nomeOuFonema: 'nome' | 'fonema';
  /** Nível de **leitura** (1–5). */
  ultimoNivel: number;
  /** Nível de **matemática** (1–8), independente do de leitura (D-43). */
  ultimoNivelMatematica: number;
  /** `['todas']` é o padrão — sem filtro de classificação. */
  ultimasClassificacoes: (Classificacao | 'todas')[];
  ultimoTamanho: 3 | 5 | 8;
  ultimaModalidade: Modalidade;
  ultimaFormaMatematica: FormaMatematica;
}

export function configuracaoPadrao(perfilId: string): Configuracao {
  return {
    perfilId,
    vozId: null,
    nomeOuFonema: 'fonema', // D-26
    ultimoNivel: 1,
    ultimoNivelMatematica: 1,
    ultimasClassificacoes: ['todas'],
    ultimoTamanho: 5,
    ultimaModalidade: 'leitura_montar',
    ultimaFormaMatematica: 'pura',
  };
}

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
    CREATE TABLE IF NOT EXISTS configuracao (
      perfil_id TEXT PRIMARY KEY NOT NULL,
      voz_id TEXT,
      nome_ou_fonema TEXT NOT NULL,
      ultimo_nivel INTEGER NOT NULL,
      ultimas_classificacoes TEXT NOT NULL,
      ultimo_tamanho INTEGER NOT NULL,
      ultima_modalidade TEXT NOT NULL,
      ultima_forma_matematica TEXT NOT NULL
    );
  `);
  await migrarConfiguracao(db);
  return db;
}

interface LinhaConfiguracao {
  perfil_id: string;
  voz_id: string | null;
  nome_ou_fonema: string;
  ultimo_nivel: number;
  ultimo_nivel_matematica: number;
  ultimas_classificacoes: string;
  ultimo_tamanho: number;
  ultima_modalidade: string;
  ultima_forma_matematica: string;
}

function daLinha(linha: LinhaConfiguracao): Configuracao {
  return {
    perfilId: linha.perfil_id,
    vozId: linha.voz_id,
    nomeOuFonema: linha.nome_ou_fonema as Configuracao['nomeOuFonema'],
    ultimoNivel: linha.ultimo_nivel,
    ultimoNivelMatematica: linha.ultimo_nivel_matematica,
    ultimasClassificacoes: JSON.parse(
      linha.ultimas_classificacoes,
    ) as Configuracao['ultimasClassificacoes'],
    ultimoTamanho: linha.ultimo_tamanho as Configuracao['ultimoTamanho'],
    ultimaModalidade: linha.ultima_modalidade as Modalidade,
    ultimaFormaMatematica: linha.ultima_forma_matematica as FormaMatematica,
  };
}

/** Devolve a configuração salva do perfil, ou os padrões (FR-012) se nunca foi salva. */
export async function buscarConfiguracao(perfilId: string): Promise<Configuracao> {
  const db = await obterBanco();
  const linha = await db.getFirstAsync<LinhaConfiguracao>(
    'SELECT * FROM configuracao WHERE perfil_id = ?',
    perfilId,
  );
  return linha ? daLinha(linha) : configuracaoPadrao(perfilId);
}

/** Salva (cria ou substitui) a configuração do perfil. */
export async function salvarConfiguracao(config: Configuracao): Promise<void> {
  const db = await obterBanco();
  await db.runAsync(
    `INSERT INTO configuracao (
      perfil_id, voz_id, nome_ou_fonema, ultimo_nivel, ultimo_nivel_matematica,
      ultimas_classificacoes, ultimo_tamanho, ultima_modalidade, ultima_forma_matematica
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(perfil_id) DO UPDATE SET
      voz_id = excluded.voz_id,
      nome_ou_fonema = excluded.nome_ou_fonema,
      ultimo_nivel = excluded.ultimo_nivel,
      ultimo_nivel_matematica = excluded.ultimo_nivel_matematica,
      ultimas_classificacoes = excluded.ultimas_classificacoes,
      ultimo_tamanho = excluded.ultimo_tamanho,
      ultima_modalidade = excluded.ultima_modalidade,
      ultima_forma_matematica = excluded.ultima_forma_matematica`,
    config.perfilId,
    config.vozId,
    config.nomeOuFonema,
    config.ultimoNivel,
    config.ultimoNivelMatematica,
    JSON.stringify(config.ultimasClassificacoes),
    config.ultimoTamanho,
    config.ultimaModalidade,
    config.ultimaFormaMatematica,
  );
}
