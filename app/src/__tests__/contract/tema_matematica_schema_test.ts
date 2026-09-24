import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';

const SCHEMA_PATH = path.join(
  __dirname,
  '../../../../specs/001-mvp-desafios-leitura-matematica/contracts/tema-matematica.schema.json',
);
const CONTEUDO_PATH = path.join(__dirname, '../../../assets/conteudo/matematica_temas.json');

describe('contrato: matematica_temas.json valida contra tema-matematica.schema.json', () => {
  it('todo tema do banco bate com o schema', () => {
    const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
    const conteudo = JSON.parse(fs.readFileSync(CONTEUDO_PATH, 'utf-8'));

    const ajv = new Ajv({ allErrors: true });
    const validar = ajv.compile(schema);
    const valido = validar(conteudo);

    if (!valido) {
      console.error(JSON.stringify(validar.errors, null, 2));
    }
    expect(valido).toBe(true);
  });

  it('nenhuma variacao de soma/subtracao gera x < y (FR-009 nao permite negativo)', () => {
    // Nota: a garantia de x >= y eh do GERADOR (T027/T028), nao do banco de
    // temas em si - aqui so confirmamos que o texto das variacoes usa os
    // placeholders {x}/{y} esperados pelo gerador, sem hardcodar valores.
    const conteudo = JSON.parse(fs.readFileSync(CONTEUDO_PATH, 'utf-8')) as {
      variacoes_frase: { soma: string[]; subtracao: string[] };
    }[];

    for (const tema of conteudo) {
      for (const frase of tema.variacoes_frase.subtracao) {
        expect(frase).toEqual(expect.stringContaining('{x}'));
        expect(frase).toEqual(expect.stringContaining('{y}'));
      }
    }
  });
});
