/**
 * Modelo de fala empacotado no app (D-45). O arquivo NÃO fica no git (190-540 MB,
 * passa do limite de 100 MB do GitHub): `npm run baixar-modelo` baixa pra
 * `assets/modelos/`, e o build do EAS roda isso sozinho (`eas-build-post-install`).
 * Qual modelo (`MODELO_DE_VOZ=small|medium`, `scripts/baixar-modelo.mjs`) é decisão
 * de build, não de runtime — cada APK carrega só um (A-17, doc002 §16: comparar
 * `small` com prompt de vocabulário contra `medium`, sem baixar os dois de uma vez).
 *
 * `require` dentro de try/catch é dependência opcional pro Metro: sem o
 * arquivo (ex.: `expo export -p web` local) o bundle não quebra — o app
 * apenas reporta "modelo ausente" e Leitura · voz fica desabilitada com esse
 * motivo (D-44), em vez de falhar. Os dois `require`s são literais de
 * propósito (Metro só resolve string literal, não variável) — qual dos dois
 * tem arquivo de verdade é o que decide qual modelo o app usa.
 */
function requireSmall(): number | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('../../../assets/modelos/ggml-small-q5_1.bin') as number;
  } catch {
    return null;
  }
}

function requireMedium(): number | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('../../../assets/modelos/ggml-medium-q5_0.bin') as number;
  } catch {
    return null;
  }
}

export type NomeDoModelo = 'small' | 'medium';

let nomeCarregado: NomeDoModelo | null = null;

/** Nome do modelo que este build de fato carregou (`stt/motor`) — só pra diagnóstico em tela. */
export function nomeDoModeloEmpacotado(): NomeDoModelo | null {
  return nomeCarregado;
}

export function obterModeloEmpacotado(): number | null {
  const medium = requireMedium();
  if (medium !== null) {
    nomeCarregado = 'medium';
    return medium;
  }
  const small = requireSmall();
  if (small !== null) {
    nomeCarregado = 'small';
    return small;
  }
  return null;
}
