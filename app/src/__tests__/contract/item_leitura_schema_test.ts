import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';

const SCHEMA_PATH = path.join(
  __dirname,
  '../../../../specs/001-mvp-desafios-leitura-matematica/contracts/item-leitura.schema.json',
);
const CONTEUDO_PATH = path.join(__dirname, '../../../assets/conteudo/leitura.json');

describe('contrato: leitura.json valida contra item-leitura.schema.json', () => {
  it('todo item do banco bate com o schema', () => {
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

  it('nenhum item de nivel >= 2 fica sem classificacoes (D-22)', () => {
    const conteudo = JSON.parse(fs.readFileSync(CONTEUDO_PATH, 'utf-8')) as {
      nivel: number;
      classificacoes?: string[];
    }[];

    const semClassificacao = conteudo.filter(
      (item) => item.nivel >= 2 && (!item.classificacoes || item.classificacoes.length === 0),
    );

    expect(semClassificacao).toEqual([]);
  });
});
