/**
 * avaliacao_leitura — tolerância fonética sobre a saída do STT (D-08,
 * D-09, D-37; T028). Porta fiel da lógica validada em
 * `spike-stt/testar.py` (rodadas 6-15, research.md §T002) — não
 * reinventar: `classeFonemaInicial()` (trava por classe de fonema
 * aproximada, não letra crua) e o parâmetro `vocabularioConhecido`
 * (nunca aceita um candidato que seja, ele mesmo, outra palavra real e
 * diferente do banco) são os dois mecanismos que fecham D-09 de
 * verdade — sem os dois, a trava furava contra o próprio banco de
 * conteúdo (272 itens revarridos na época, zero colisão depois do fix).
 *
 * **Importante**: esta comparação é ORTOGRÁFICA (distância de edição
 * sobre as letras da transcrição normalizada), não fonética de verdade —
 * achado da rodada 12 do spike. `classeFonemaInicial` é só uma
 * aproximação pontual do "c"/"g" que muda de som conforme a vogal
 * seguinte; não está provado que sempre basta pra todo o banco.
 */

const REGEX_PONTUACAO_HESITACAO = /[.,!?;:]+/g;

/**
 * Normaliza uma transcrição/palavra esperada: minúsculo, sem acento,
 * `_` vira espaço (nasal escapado em nome de arquivo/etc.), pontuação de
 * hesitação (`.` `,` `!` `?` `;` `:`) vira espaço **em qualquer posição**
 * (não só nas bordas — é a marca de pausa que o motor de STT insere no
 * meio da transcrição, D-37), hífen (fragmentação silábica) vira espaço,
 * espaços colapsados.
 */
export function normalizar(texto: string): string {
  let s = texto.toLowerCase().trim();
  s = s.normalize('NFD').replace(/[̀-ͯ]/g, ''); // remove diacríticos
  s = s.replace(/_/g, ' ');
  s = s.replace(REGEX_PONTUACAO_HESITACAO, ' ');
  s = s.replace(/-/g, ' ');
  return s.split(/\s+/).filter(Boolean).join(' ');
}

export function distanciaLevenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  let anterior = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const atual = [i];
    for (let j = 1; j <= b.length; j++) {
      const custo = a[i - 1] === b[j - 1] ? 0 : 1;
      atual.push(Math.min(anterior[j] + 1, atual[j - 1] + 1, anterior[j - 1] + custo));
    }
    anterior = atual;
  }
  return anterior[b.length];
}

/**
 * Como `distanciaLevenshtein`, mas transposição de 2 letras adjacentes
 * ("perna"/"prena") conta como 1 edição, não 2 (rodada 15 do spike).
 */
export function distanciaDamerauLevenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const la = a.length;
  const lb = b.length;
  const d: number[][] = Array.from({ length: la + 1 }, () => new Array(lb + 1).fill(0));

  for (let i = 0; i <= la; i++) d[i][0] = i;
  for (let j = 0; j <= lb; j++) d[0][j] = j;

  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      const custo = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + custo);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + custo);
      }
    }
  }
  return d[la][lb];
}

const VOGAIS_FRONTAIS = new Set(['e', 'i']); // depois de c/g, som suave: ce/ci, ge/gi
const VOGAIS_POSTERIORES = new Set(['a', 'o', 'u']); // depois de c/g, som forte: ca/co/cu, ga/go/gu

/**
 * Aproxima o FONEMA inicial, não só a LETRA — cobre o caso do português
 * onde "c"/"g" mudam de som conforme a vogal seguinte ("gato" forte /g/,
 * "gelo" suave /ʒ/; mesma letra, fonema diferente). Achado real (rodada
 * 12): a trava anterior comparava só a letra, e isso deixava "galo"
 * passar como leitura aceita de "gelo".
 */
export function classeFonemaInicial(palavra: string): string {
  if (palavra.length < 2 || !'cg'.includes(palavra[0])) {
    return palavra[0] ?? '';
  }
  const seguinte = palavra[1];
  if (VOGAIS_FRONTAIS.has(seguinte)) return palavra[0] + '~suave'; // ce/ci, ge/gi
  if (VOGAIS_POSTERIORES.has(seguinte)) return palavra[0] + '~forte'; // ca/co/cu, ga/go/gu
  return palavra[0] + '~cluster'; // cr/cl/gr/gl etc — som forte também, classe própria
}

export interface OpcoesToleranciaFonetica {
  distanciaMax?: number;
  vocabularioConhecido?: Set<string>;
  usarDamerau?: boolean;
}

/**
 * Compara com tolerância a pequena variação de pronúncia (D-08), com
 * trava dura no primeiro fonema aproximado: nunca aceita troca do som
 * inicial (D-09). `vocabularioConhecido` (opcional: todas as palavras
 * válidas do banco, normalizadas) fecha a brecha de um candidato dentro
 * da distância que seja, ele mesmo, outra palavra real e diferente do
 * banco ("gato"/"galo", "cama"/"casa" — rodada 12).
 *
 * Frase (espaço em `esperado`): mantido como substring exato — a
 * tolerância fonética por palavra ainda não se estende à frase inteira.
 */
export function bateComToleranciaFonetica(
  esperado: string,
  transcrito: string,
  opcoes: OpcoesToleranciaFonetica = {},
): boolean {
  const { distanciaMax = 1, vocabularioConhecido, usarDamerau = false } = opcoes;

  if (esperado.includes(' ')) {
    return transcrito.includes(esperado);
  }
  if (!esperado) return false;

  const classeEsperado = classeFonemaInicial(esperado);
  const tokens = transcrito.split(' ').filter(Boolean);
  const candidatos = [...tokens, tokens.join('')];
  const calcularDistancia = usarDamerau ? distanciaDamerauLevenshtein : distanciaLevenshtein;

  for (const candidato of candidatos) {
    if (!candidato) continue;
    if (candidato === esperado) return true; // idêntico sempre passa
    if (classeFonemaInicial(candidato) !== classeEsperado) continue; // D-09
    if (vocabularioConhecido?.has(candidato)) continue; // palavra diferente e real do banco
    if (calcularDistancia(esperado, candidato) <= distanciaMax) return true;
  }
  return false;
}

/**
 * Ponto de entrada de alto nível: normaliza esperado/transcrição bruta
 * (remove pontuação de hesitação e fragmentação por hífen, D-37) e
 * aplica a tolerância fonética com Damerau-Levenshtein (ganho validado na
 * rodada 15, sem abrir colisão nova no banco).
 */
export function avaliarLeitura(
  esperado: string,
  transcricaoBruta: string,
  vocabularioConhecido?: Set<string>,
): boolean {
  const esperadoNormalizado = normalizar(esperado);
  const transcritoNormalizado = normalizar(transcricaoBruta);
  return bateComToleranciaFonetica(esperadoNormalizado, transcritoNormalizado, {
    distanciaMax: 1,
    vocabularioConhecido,
    usarDamerau: true,
  });
}

/**
 * Monta o texto de `initial_prompt`/hint pro motor de STT, a partir do
 * vocabulário da combinação nível×classificação da rodada — técnica de
 * viés de vocabulário (rodada 8 do spike), não "colar a resposta": ainda
 * precisa reconhecer a fala, só fica com um dicionário restrito. A
 * chamada de verdade ao motor (`whisper.rn`) fica na tela de
 * Leitura·voz (T031) — este serviço só monta o texto do prompt.
 */
export function construirPromptVocabulario(vocabulario: string[]): string {
  return vocabulario.join(', ');
}
