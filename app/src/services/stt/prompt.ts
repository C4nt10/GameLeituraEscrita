/**
 * Monta o `prompt` do Whisper a partir do vocabulário do nível×tema da rodada
 * (research.md rodada 13): passar a lista de palavras possíveis como dica de
 * contexto levou o `small` de 7% para 71% de acerto, quase igual ao `medium`
 * (76%), sem baixar nenhum modelo maior. **Não é colar a resposta**: o
 * Whisper continua decidindo pela evidência acústica — o prompt só inclina o
 * modelo de linguagem (rodada 8 testou isso a sério: o pior caso observado
 * foi continuar não reconhecendo, nunca creditar uma palavra errada da
 * lista).
 *
 * Por isso a lista precisa ter mais de uma palavra: com 1 só, o "vocabulário"
 * vira a resposta do desafio atual, o que é exatamente o que a checagem de
 * D-09 existe pra impedir em outro lugar (`avaliacao_leitura`) — aqui a
 * prevenção é não montar esse prompt de propósito.
 */
export function montarPromptDeVocabulario(vocabulario: string[]): string | undefined {
  if (vocabulario.length < 2) return undefined;
  return vocabulario.join(', ');
}
