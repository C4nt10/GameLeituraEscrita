import { readFileSync } from 'fs';
import { resolve } from 'path';

function ler(caminho: string): string {
  return readFileSync(resolve(__dirname, caminho), 'utf8').replace(/\r\n/g, '\n');
}

describe('tema.ts — o arquivo do dono é a fonte; a cópia do app não pode envelhecer em silêncio (T097)', () => {
  it('app/src/theme/tema.ts é idêntico a design/tema.ts', () => {
    const doDono = ler('../../../../design/tema.ts');
    const doApp = ler('../../theme/tema.ts');
    expect(doApp).toBe(doDono);
  });
});
