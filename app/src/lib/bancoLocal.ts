import * as SQLite from 'expo-sqlite';

/**
 * Conexão SQLite compartilhada — `historico` e `configuracao` guardam
 * tabelas diferentes no mesmo arquivo. Cada serviço ainda cria a
 * própria tabela (`CREATE TABLE IF NOT EXISTS`, idempotente) na
 * primeira vez que usa a conexão — este módulo só evita abrir o
 * arquivo mais de uma vez.
 */

const NOME_BANCO = 'gameleituraescrita.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function obterBancoLocal(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(NOME_BANCO);
  }
  return dbPromise;
}
