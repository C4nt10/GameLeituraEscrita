/**
 * Migração aditiva da tabela `configuracao` (D-43, data-model.md):
 * `ultimo_nivel_matematica` é coluna nova — bancos criados antes de
 * 2026-09-26 não têm. Só ADICIONA (`ALTER TABLE ... ADD COLUMN ... DEFAULT
 * 1`), nunca recria nem apaga a tabela: quem já tinha configuração salva
 * mantém tudo e o nível de matemática nasce em 1.
 *
 * Recebe só o que precisa do banco (interface mínima) pra ser testada com
 * um banco falso — `expo-sqlite` é nativo e não roda em Jest.
 */

export interface BancoParaMigracao {
  getAllAsync: (sql: string) => Promise<{ name: string }[]>;
  execAsync: (sql: string) => Promise<void>;
}

export async function migrarConfiguracao(db: BancoParaMigracao): Promise<void> {
  const colunas = await db.getAllAsync('PRAGMA table_info(configuracao)');
  const jaTem = colunas.some((coluna) => coluna.name === 'ultimo_nivel_matematica');
  if (jaTem) return;

  await db.execAsync(
    'ALTER TABLE configuracao ADD COLUMN ultimo_nivel_matematica INTEGER NOT NULL DEFAULT 1',
  );
}
