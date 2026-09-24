import type * as SQLite from 'expo-sqlite';
import { obterBancoLocal } from '../../lib/bancoLocal';
import { gerarId } from '../../lib/gerarId';
import { PERFIL_PADRAO_ID, type Perfil } from '../../models/perfil';

/**
 * perfis — persistência local dos perfis (data-model.md, tabela
 * `perfis`). D-32: seletor de perfil só aparece quando há >1 cadastrado
 * ou ao entrar em "dupla" — no MVP de perfil único, o app nunca cria
 * outro perfil sozinho, só quando o adulto pedir (US5).
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
    CREATE TABLE IF NOT EXISTS perfis (
      id TEXT PRIMARY KEY NOT NULL,
      nome TEXT,
      cor TEXT,
      criado_em TEXT NOT NULL
    );
  `);
  return db;
}

interface LinhaPerfil {
  id: string;
  nome: string | null;
  cor: string | null;
  criado_em: string;
}

function daLinha(linha: LinhaPerfil): Perfil {
  return { id: linha.id, nome: linha.nome, cor: linha.cor, criadoEm: linha.criado_em };
}

export async function listarPerfis(): Promise<Perfil[]> {
  const db = await obterBanco();
  const linhas = await db.getAllAsync<LinhaPerfil>('SELECT * FROM perfis ORDER BY criado_em ASC');
  return linhas.map(daLinha);
}

export async function criarPerfil(nome: string, cor: string): Promise<Perfil> {
  const db = await obterBanco();
  const perfil: Perfil = { id: gerarId(), nome, cor, criadoEm: new Date().toISOString() };
  await db.runAsync(
    'INSERT INTO perfis (id, nome, cor, criado_em) VALUES (?, ?, ?, ?)',
    perfil.id,
    perfil.nome,
    perfil.cor,
    perfil.criadoEm,
  );
  return perfil;
}

/** Garante que o perfil `"padrao"` (D-25) existe na tabela — chamado uma vez, na abertura do app. */
export async function garantirPerfilPadrao(): Promise<void> {
  const db = await obterBanco();
  const existente = await db.getFirstAsync('SELECT id FROM perfis WHERE id = ?', PERFIL_PADRAO_ID);
  if (!existente) {
    await db.runAsync(
      'INSERT INTO perfis (id, nome, cor, criado_em) VALUES (?, NULL, NULL, ?)',
      PERFIL_PADRAO_ID,
      new Date().toISOString(),
    );
  }
}
