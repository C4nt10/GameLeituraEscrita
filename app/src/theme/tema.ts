/**
 * Letra Viva — tokens do padrão visual (v1, 2026-09-26)
 * Fonte da verdade: guia "Padrão visual Letra Viva". Mudou aqui, muda no guia.
 *
 * Fontes (Expo):
 *   npx expo install @expo-google-fonts/baloo-2 @expo-google-fonts/figtree @expo-google-fonts/andika expo-font
 *   useFonts({ Baloo2_700Bold, Baloo2_800ExtraBold, Figtree_500Medium, Figtree_700Bold, Figtree_800ExtraBold, Andika_700Bold })
 */

export const cor = {
  // superfícies
  papel: '#FFF8EA',      // fundo de toda tela
  papel2: '#F6EBD3',     // superfície secundária, chips, botões redondos
  grade: '#EFE2C6',      // linhas do caderno, bordas finas, vazio
  madeira: '#F3DDB6',    // bloco neutro (respostas de conta)
  madeiraBorda: '#D9B886',

  // texto
  tinta: '#2E2419',      // texto principal (contraste 14:1 sobre papel)
  tinta2: '#7A6A55',     // texto secundário, rótulos (4.9:1 sobre papel)

  // blocos: face (base) + degrau (borda inferior). Texto branco sobre vermelho, verde e turquesa
  // fica entre 3.5 e 3.8:1 — só em texto de 24px+ negrito (AA para texto grande).
  vermelho: { base: '#E4572E', degrau: '#B8401D', texto: '#FFFFFF' },
  azul:     { base: '#2F6FB2', degrau: '#22548A', texto: '#FFFFFF', claro: '#EAF2FB' },
  amarelo:  { base: '#F4B400', degrau: '#C28E00', texto: '#3A2A00', claro: '#FEF4D6' },
  verde:    { base: '#3E9B5B', degrau: '#2C7442', texto: '#FFFFFF', claro: '#E6F4EA' },
  roxo:     { base: '#7B5EA7', degrau: '#5D4583', texto: '#FFFFFF' },
  turquesa: { base: '#2A9187', degrau: '#1E6D65', texto: '#FFFFFF' },

  // material dourado (D-42)
  dourado: '#E0A93B',
  douradoBorda: '#B98320',

  // véu da folha do adulto
  veu: 'rgba(46,36,25,0.45)',
} as const;

/** Cor fixa por jeito de jogar. Usada no ícone do início, na aba do histórico e no botão principal do desafio. */
export const corModalidade = {
  ditado: cor.vermelho,        // "Ouvir e montar"
  leituraMontar: cor.amarelo,  // "Ler e montar"
  leituraVoz: cor.turquesa,    // "Ler em voz alta"
  contaPura: cor.roxo,         // "Conta"
  contextualizada: cor.verde,  // "Historinha"
} as const;

/** Cor por tema (classificação, D-34). Só aparece na folha do adulto e no histórico. */
export const corTema = {
  animais: '#3E9B5B',
  comida: '#D9822B',
  casa: '#2F6FB2',
  corpo: '#C95B86',
  natureza: '#2A9187',
  acoes: '#7B5EA7',
} as const;

/** Ordem de cores dos blocos de letra: repete a cada 5, deslocada pelo índice do desafio. */
export const cicloDeBlocos = [cor.vermelho, cor.azul, cor.amarelo, cor.verde, cor.roxo] as const;

export const fonte = {
  display: 'Baloo2_800ExtraBold', // títulos, botões, números grandes
  displayMedio: 'Baloo2_700Bold',
  texto: 'Figtree_500Medium',     // textos para o adulto
  textoForte: 'Figtree_700Bold',
  rotulo: 'Figtree_800ExtraBold', // rótulos em caixa alta
  letra: 'Andika_700Bold',        // TODA letra/palavra que a criança lê ou monta
} as const;

/** Escala de tipo (px). Não inventar tamanhos fora daqui. */
export const tamanho = {
  rotulo: 12,      // caixa alta, letterSpacing 1
  legenda: 13,
  texto: 15,
  subtitulo: 18,   // instruções ("Ouça e monte a palavra")
  titulo: 26,
  destaque: 34,    // "Isso!", "Agora é a vez da LUA!"
  peca: 36,        // letra na peça/vaga
  alternativa: 42, // número nas respostas de conta
  palavra: 52,     // palavra-alvo (Ler e montar, Ler em voz alta)
} as const;

/** Regra de caixa: todo conteúdo de leitura é maiúsculo (letra bastão). */
export const caixaDaLetra = (s: string) => s.toLocaleUpperCase('pt-BR');

export const espaco = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 } as const;

export const raio = { chip: 14, bloco: 12, peca: 14, cartao: 18, botao: 20, blocoGrande: 22, folha: 28 } as const;

/** Alvos de toque (D-47, Princípio VI). */
export const alvo = {
  minimo: 56,       // qualquer controle
  botao: 64,        // botão de ação
  botaoPrincipal: 72, // "Jogar!", "Estou pronta!"
  peca: { largura: 66, altura: 72 },
  estimulo: 150,    // alto-falante do ditado, microfone
} as const;

/**
 * "Degrau" do bloco: React Native não tem sombra interna.
 * Implementar como borda inferior mais escura + sombra externa leve.
 */
export const degrau = (c: { base: string; degrau: string }, altura = 5) => ({
  backgroundColor: c.base,
  borderBottomWidth: altura,
  borderBottomColor: c.degrau,
  shadowColor: '#2E2419',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.18,
  shadowRadius: 0,
  elevation: 3,
});

/** Movimento (ms). Com "reduzir movimento" do sistema ligado, usar 0 e pular loops. */
export const movimento = {
  toque: 120,       // afundar 3px ao pressionar
  encaixe: 250,     // peça entra na vaga (mola, escala 0.6 → 1)
  treme: 380,       // peça errada: ±7px, 2 ciclos, volta ao lugar
  queda: 550,       // blocos do logo caindo; intervalo de 100 entre letras
  pulo: 500,        // letras da palavra na comemoração; intervalo de 80
  convite: 1800,    // pulso do botão de começar (loop)
  onda: 2200,       // anel do alto-falante (loop)
  palavraVisivel: 3000, // Ler e montar: tempo até sumir (parâmetro da validação, D-18)
  seguraAdulto: 1200,   // segurar a engrenagem para abrir as opções do adulto
} as const;
