/**
 * Modelo de fala empacotado no app (D-45). O arquivo NÃO fica no git (~190 MB,
 * passa do limite de 100 MB do GitHub): `npm run baixar-modelo` baixa pra
 * `assets/modelos/`, e o build do EAS roda isso sozinho (`eas-build-post-install`).
 *
 * `require` dentro de try/catch é dependência opcional pro Metro: sem o
 * arquivo (ex.: `expo export -p web` local) o bundle não quebra — o app
 * apenas reporta "modelo ausente" e Leitura · voz fica desabilitada com esse
 * motivo (D-44), em vez de falhar.
 */
export function obterModeloEmpacotado(): number | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('../../../assets/modelos/ggml-small-q5_1.bin') as number;
  } catch {
    return null;
  }
}
