// Baixa o modelo de fala (whisper.cpp ggml small quantizado) pra assets/modelos/.
// Roda à mão (`npm run baixar-modelo`) e sozinho no build do EAS
// (`eas-build-post-install`). Não fica no git: ~190 MB > limite de 100 MB do GitHub.
import { createWriteStream, existsSync, mkdirSync, statSync, renameSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const NOME = 'ggml-small-q5_1.bin';
const URL = `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/${NOME}`;
const TAMANHO_ESPERADO = 190085487; // bytes, conferido em 2026-09-26 pelo content-length

const pasta = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'modelos');
const destino = join(pasta, NOME);

if (existsSync(destino) && statSync(destino).size === TAMANHO_ESPERADO) {
  console.log(`[modelo] ${NOME} já está em assets/modelos/ (${TAMANHO_ESPERADO} bytes).`);
  process.exit(0);
}

mkdirSync(pasta, { recursive: true });
console.log(`[modelo] baixando ${NOME} ...`);
const resposta = await fetch(URL, { redirect: 'follow' });
if (!resposta.ok || !resposta.body) {
  console.error(`[modelo] falha no download: HTTP ${resposta.status}`);
  process.exit(1);
}

const temporario = `${destino}.parcial`;
await pipeline(Readable.fromWeb(resposta.body), createWriteStream(temporario));
const tamanho = statSync(temporario).size;
if (tamanho !== TAMANHO_ESPERADO) {
  rmSync(temporario, { force: true });
  console.error(
    `[modelo] tamanho inesperado: ${tamanho} (esperado ${TAMANHO_ESPERADO}). Download descartado.`,
  );
  process.exit(1);
}
renameSync(temporario, destino);
console.log(`[modelo] pronto: ${destino}`);
