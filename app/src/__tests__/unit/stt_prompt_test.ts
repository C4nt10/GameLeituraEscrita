import { montarPromptDeVocabulario } from '../../services/stt/prompt';

describe('stt/prompt — vocabulário da rodada como dica de contexto pro Whisper (research.md rodada 13)', () => {
  it('junta as palavras separadas por vírgula', () => {
    expect(montarPromptDeVocabulario(['gato', 'cachorro', 'passarinho'])).toBe(
      'gato, cachorro, passarinho',
    );
  });

  it('lista vazia: sem prompt (undefined, não string vazia — o Whisper não recebe a opção)', () => {
    expect(montarPromptDeVocabulario([])).toBeUndefined();
  });

  it('não é dica de resposta: não aceita uma lista de 1 palavra só (viraria "a resposta é X")', () => {
    expect(montarPromptDeVocabulario(['gato'])).toBeUndefined();
  });
});
