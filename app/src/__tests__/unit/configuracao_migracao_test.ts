import { migrarConfiguracao } from '../../services/configuracao/migracao';

interface DbFalso {
  colunas: string[];
  executados: string[];
  getAllAsync: (sql: string) => Promise<{ name: string }[]>;
  execAsync: (sql: string) => Promise<void>;
}

function criarDbFalso(colunasExistentes: string[]): DbFalso {
  const db: DbFalso = {
    colunas: [...colunasExistentes],
    executados: [],
    getAllAsync: async () => db.colunas.map((name) => ({ name })),
    execAsync: async (sql) => {
      db.executados.push(sql);
      if (/ADD COLUMN\s+ultimo_nivel_matematica/i.test(sql)) {
        db.colunas.push('ultimo_nivel_matematica');
      }
    },
  };
  return db;
}

const COLUNAS_ANTIGAS = ['perfil_id', 'voz_id', 'nome_ou_fonema', 'ultimo_nivel'];

describe('configuracao — migração aditiva do nível de matemática (D-43)', () => {
  it('banco antigo, sem a coluna: adiciona com DEFAULT 1, sem apagar nem recriar a tabela', async () => {
    const db = criarDbFalso(COLUNAS_ANTIGAS);
    await migrarConfiguracao(db);

    const alteracoes = db.executados.filter((sql) => /ultimo_nivel_matematica/i.test(sql));
    expect(alteracoes).toHaveLength(1);
    expect(alteracoes[0]).toMatch(/ALTER TABLE configuracao ADD COLUMN/i);
    expect(alteracoes[0]).toMatch(/DEFAULT 1/i);
    expect(db.executados.some((sql) => /DROP|DELETE/i.test(sql))).toBe(false);
  });

  it('banco que já tem a coluna: não faz nada (idempotente)', async () => {
    const db = criarDbFalso([...COLUNAS_ANTIGAS, 'ultimo_nivel_matematica']);
    await migrarConfiguracao(db);
    expect(db.executados).toHaveLength(0);
  });

  it('rodar duas vezes seguidas só altera uma vez', async () => {
    const db = criarDbFalso(COLUNAS_ANTIGAS);
    await migrarConfiguracao(db);
    await migrarConfiguracao(db);
    expect(db.executados.filter((s) => /ADD COLUMN/i.test(s))).toHaveLength(1);
  });
});
