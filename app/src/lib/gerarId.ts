/**
 * Gera um id local o bastante pra não colidir dentro do mesmo aparelho —
 * não há sync entre aparelhos nem conta (restrições de produto,
 * constitution.md), então não precisa de UUID de verdade.
 */
export function gerarId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
