/**
 * Perfil — data-model.md, tabela `perfis`.
 *
 * O MVP usa sempre uma linha única `"padrao"` (D-25, FR-014) com `nome` e
 * `cor` nulos — mas o modelo já é multi-perfil pra não exigir migração de
 * dado quando a seleção de perfil/modo dupla (US5) ligar de verdade.
 */
export interface Perfil {
  id: string;
  nome: string | null;
  cor: string | null;
  criadoEm: string; // ISO 8601
}

export const PERFIL_PADRAO_ID = 'padrao';

export function criarPerfilPadrao(criadoEm: string = new Date().toISOString()): Perfil {
  return {
    id: PERFIL_PADRAO_ID,
    nome: null,
    cor: null,
    criadoEm,
  };
}
