import {
  escolhaParaRodada,
  modoInicial,
  modosDoTipo,
  podeIniciar,
  resumoDaEscolha,
  TIPOS_DA_CRIANCA,
  type EstadoDoInicio,
} from '../../screens/inicio/logica';

function estado(sobrescrever: Partial<EstadoDoInicio> = {}): EstadoDoInicio {
  return {
    tipo: 'leitura',
    modo: 'ditado',
    nivelLeitura: 2,
    nivelMatematica: 1,
    classificacao: null,
    tamanho: 5,
    formato: 'sozinho',
    formatoDupla: null,
    ...sobrescrever,
  };
}

describe('tipos da criança — "Misturado" fica travado porque a rodada mista não existe (A-26)', () => {
  it('Letras e Contas jogáveis; Misturado travado com "chegando logo"', () => {
    expect(TIPOS_DA_CRIANCA).toEqual([
      { id: 'leitura', rotulo: 'Letras', disponivel: true },
      { id: 'matematica', rotulo: 'Contas', disponivel: true },
      { id: 'misto', rotulo: 'Misturado', disponivel: false, selo: 'chegando logo' },
    ]);
  });
});

describe('modosDoTipo — jeitos de jogar com os nomes da criança (D-51)', () => {
  it('Letras: Ouvir e montar, Ler e montar, Ler em voz alta', () => {
    const modos = modosDoTipo('leitura', { vozDisponivel: true, nivelMatematica: 1 });
    expect(modos.map((m) => m.rotulo)).toEqual([
      'Ouvir e montar',
      'Ler e montar',
      'Ler em voz alta',
    ]);
    expect(modos.map((m) => m.id)).toEqual(['ditado', 'leitura_montar', 'leitura_voz']);
  });

  it('Ler em voz alta travada com "chegando logo" enquanto o reconhecimento não está pronto (D-44)', () => {
    const voz = modosDoTipo('leitura', { vozDisponivel: false, nivelMatematica: 1 }).find(
      (m) => m.id === 'leitura_voz',
    );
    expect(voz).toMatchObject({ disponivel: false, selo: 'chegando logo' });
  });

  it('as outras duas de leitura nunca travam por causa da voz', () => {
    const modos = modosDoTipo('leitura', { vozDisponivel: false, nivelMatematica: 1 });
    expect(modos.filter((m) => m.disponivel).map((m) => m.id)).toEqual([
      'ditado',
      'leitura_montar',
    ]);
  });

  it('Contas: Conta e Historinha', () => {
    const modos = modosDoTipo('matematica', { vozDisponivel: false, nivelMatematica: 3 });
    expect(modos.map((m) => m.rotulo)).toEqual(['Conta', 'Historinha']);
    expect(modos.every((m) => m.disponivel)).toBe(true);
  });

  it('nível 8 (multiplicação) só tem conta: Historinha trava com "só conta" (D-41)', () => {
    const historinha = modosDoTipo('matematica', { vozDisponivel: false, nivelMatematica: 8 }).find(
      (m) => m.id === 'historinha',
    );
    expect(historinha).toMatchObject({ disponivel: false, selo: 'só conta' });
  });

  it('Misturado não tem modos (o tipo está travado)', () => {
    expect(modosDoTipo('misto', { vozDisponivel: true, nivelMatematica: 1 })).toEqual([]);
  });
});

describe('modoInicial — nunca abre numa modalidade que não funciona (Princípio I)', () => {
  it('lembra a última modalidade de leitura quando ela está disponível', () => {
    expect(modoInicial('leitura', 'leitura_montar', true)).toBe('leitura_montar');
    expect(modoInicial('leitura', 'ditado', false)).toBe('ditado');
  });

  it('última era Ler em voz alta mas ela não está disponível: cai em Ler e montar', () => {
    expect(modoInicial('leitura', 'leitura_voz', false)).toBe('leitura_montar');
  });

  it('Ler em voz alta disponível e era a última: mantém', () => {
    expect(modoInicial('leitura', 'leitura_voz', true)).toBe('leitura_voz');
  });

  it('Contas abre em Conta', () => {
    expect(modoInicial('matematica', 'ditado', true)).toBe('conta');
  });
});

describe('podeIniciar', () => {
  it('escolha padrão pode iniciar sem tocar em nada (Princípio VII)', () => {
    expect(podeIniciar(estado(), true)).toBe(true);
  });

  it('Misturado nunca inicia', () => {
    expect(podeIniciar(estado({ tipo: 'misto' }), true)).toBe(false);
  });

  it('modo travado não inicia (Ler em voz alta sem motor)', () => {
    expect(podeIniciar(estado({ modo: 'leitura_voz' }), false)).toBe(false);
  });

  it('dupla exige escolher Juntos ou Disputa — nenhum é padrão implícito (D-31)', () => {
    expect(podeIniciar(estado({ formato: 'dupla', formatoDupla: null }), true)).toBe(false);
    expect(podeIniciar(estado({ formato: 'dupla', formatoDupla: 'cooperativo' }), true)).toBe(true);
    expect(podeIniciar(estado({ formato: 'dupla', formatoDupla: 'adversarial' }), true)).toBe(true);
  });

  it('Historinha no nível 8 não inicia', () => {
    expect(
      podeIniciar(estado({ tipo: 'matematica', modo: 'historinha', nivelMatematica: 8 }), true),
    ).toBe(false);
  });
});

describe('resumoDaEscolha — texto do início, só pra ler (A-19)', () => {
  it('leitura com tema', () => {
    expect(resumoDaEscolha(estado({ nivelLeitura: 2, classificacao: 'animais', tamanho: 5 }))).toBe(
      'Nível 2 · Animais · 5 palavras',
    );
  });

  it('leitura sem tema escolhido diz "todos os temas" a partir do nível 2', () => {
    expect(resumoDaEscolha(estado({ nivelLeitura: 3, classificacao: null, tamanho: 8 }))).toBe(
      'Nível 3 · todos os temas · 8 palavras',
    );
  });

  it('nível 1 (letras) não tem tema (D-22)', () => {
    expect(resumoDaEscolha(estado({ nivelLeitura: 1, tamanho: 3 }))).toBe('Nível 1 · 3 palavras');
  });

  it('acento no tema "Ações" (A-33)', () => {
    expect(resumoDaEscolha(estado({ nivelLeitura: 2, classificacao: 'acoes' }))).toContain('Ações');
  });

  it('matemática usa o nível de matemática e "contas"', () => {
    expect(
      resumoDaEscolha(
        estado({ tipo: 'matematica', modo: 'conta', nivelMatematica: 4, tamanho: 5 }),
      ),
    ).toBe('Nível 4 · 5 contas');
  });
});

describe('escolhaParaRodada — o que o app já entende (nada de comportamento novo)', () => {
  it('leitura: nível de leitura, modalidade do modo, sem forma de matemática', () => {
    expect(
      escolhaParaRodada(
        estado({ modo: 'leitura_montar', nivelLeitura: 3, classificacao: 'casa' }),
        'ditado',
      ),
    ).toMatchObject({
      tipo: 'leitura',
      modalidade: 'leitura_montar',
      nivel: 3,
      classificacao: 'casa',
      formaMatematica: 'pura',
    });
  });

  it('matemática: nível de matemática (D-43) e a modalidade salva de leitura é preservada', () => {
    expect(
      escolhaParaRodada(
        estado({ tipo: 'matematica', modo: 'conta', nivelMatematica: 5 }),
        'leitura_montar',
      ),
    ).toMatchObject({
      tipo: 'matematica',
      nivel: 5,
      modalidade: 'leitura_montar',
      formaMatematica: 'pura',
    });
  });

  it('Historinha vira forma contextualizada; no nível 8 volta pra pura', () => {
    expect(
      escolhaParaRodada(
        estado({ tipo: 'matematica', modo: 'historinha', nivelMatematica: 3 }),
        'ditado',
      ).formaMatematica,
    ).toBe('contextualizada');
    expect(
      escolhaParaRodada(
        estado({ tipo: 'matematica', modo: 'historinha', nivelMatematica: 8 }),
        'ditado',
      ).formaMatematica,
    ).toBe('pura');
  });

  it('formato e tamanho passam do jeito que estão', () => {
    expect(
      escolhaParaRodada(
        estado({ formato: 'dupla', formatoDupla: 'adversarial', tamanho: 8 }),
        'ditado',
      ),
    ).toMatchObject({ formato: 'dupla', formatoDupla: 'adversarial', tamanho: 8 });
  });
});
