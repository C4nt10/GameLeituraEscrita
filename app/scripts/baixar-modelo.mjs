// Baixa o modelo de fala (whisper.cpp ggml, quantizado) pra assets/modelos/.
// Roda à mão (`npm run baixar-modelo` ou `MODELO_DE_VOZ=medium npm run baixar-modelo`)
// e sozinho no build do EAS (`eas-build-post-install`, variável `MODELO_DE_VOZ` do
// perfil em `eas.json`). Não fica no git: passa do limite de 100 MB do GitHub.
import { createWriteStream, existsSync, mkdirSync, statSync, renameSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

// `small` é o padrão em produção (190 MB). `medium` é maior e mais lento, só
// pra comparar acerto (A-17, doc002 §16) — nunca os dois no mesmo build.
const MODELOS = {
  small: { nome: 'ggml-small-q5_1.bin', tamanho: 190085487 },
  medium: { nome: 'ggml-medium-q5_0.bin', tamanho: 539212467 },
};

const escolha = process.env.MODELO_DE_VOZ ?? 'small';
const modelo = MODELOS[escolha];
if (!modelo) {
  console.error(`[modelo] MODELO_DE_VOZ="${escolha}" desconhecido. Use: ${Object.keys(MODELOS)}`);
  process.exit(1);
}
const { nome: NOME, tamanho: TAMANHO_ESPERADO } = modelo;
const URL = `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/${NOME}`;

const pasta = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'modelos');
const destino = join(pasta, NOME);

// Só um modelo por vez no app (Metro empacota qualquer asset presente): tira o outro,
// senão um APK de teste do `medium` acaba carregando o `small` residual de um build anterior.
for (const outro of Object.values(MODELOS)) {
  if (outro.nome !== NOME) rmSync(join(pasta, outro.nome), { force: true });
}

if (existsSync(destino) && statSync(destino).size === TAMANHO_ESPERADO) {
  console.log(`[modelo] ${NOME} já está em assets/modelos/ (${TAMANHO_ESPERADO} bytes).`);
  process.exit(0);
}

mkdirSync(pasta, { recursive: true });
console.log(`[modelo] baixando ${NOME} (MODELO_DE_VOZ=${escolha}) ...`);
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
