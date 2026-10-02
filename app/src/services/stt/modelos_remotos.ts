/**
 * Registro dos modelos de fala que o app sabe baixar (D-56, A-17). O modelo
 * não vai mais embutido no APK — `services/stt/download` baixa pro
 * armazenamento do aparelho na primeira vez que a criança/adulto usa
 * Leitura · voz. Só `small`/`medium` por enquanto: `medium` é o maior que
 * existe nessa quantização no repositório oficial que ainda compensa testar
 * (`large` seria um build à parte, pedido explícito).
 *
 * `bytes` é o tamanho exato do arquivo (conferido por HEAD request antes de
 * fixar aqui) — serve pra saber quando o download já terminou (D-45, mesma
 * checagem de integridade que o script antigo fazia) e pra calcular o
 * progresso em porcentagem antes do primeiro byte chegar.
 */
export type NomeDoModelo = 'small' | 'medium';

export interface DefinicaoDeModelo {
  nome: NomeDoModelo;
  arquivo: string;
  url: string;
  bytes: number;
}

const BASE_URL = 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main';

export const MODELOS: Record<NomeDoModelo, DefinicaoDeModelo> = {
  small: {
    nome: 'small',
    arquivo: 'ggml-small-q5_1.bin',
    url: `${BASE_URL}/ggml-small-q5_1.bin`,
    bytes: 190085487,
  },
  medium: {
    nome: 'medium',
    arquivo: 'ggml-medium-q5_0.bin',
    url: `${BASE_URL}/ggml-medium-q5_0.bin`,
    bytes: 539212467,
  },
};

/**
 * Qual modelo este build baixa — decisão de build (`EXPO_PUBLIC_MODELO_DE_VOZ`,
 * `eas.json`), lida em runtime porque o download agora também é runtime
 * (T130). Valor ausente ou desconhecido cai pro padrão (`small`) — nunca
 * quebra por variável de ambiente errada ou não propagada.
 */
export function modeloConfigurado(valor: string | undefined): DefinicaoDeModelo {
  if (valor === 'small' || valor === 'medium') return MODELOS[valor];
  return MODELOS.small;
}
