import { bateComToleranciaFonetica } from '../../services/avaliacao_leitura';

/**
 * Porta fiel dos 19 casos adversariais de `spike-stt/testar_tolerancia.py`
 * (rodadas 7, 12 e 15 do spike, research.md §T002) — não reescrever a
 * lista, só traduzir. Valida a trava do D-09: tolerância de pronúncia
 * (D-08) nunca aceita troca do som inicial, mesmo com o vocabulário do
 * banco colidindo a distância 1 ("gato"/"galo", "cama"/"casa").
 */

// vocabulário simulando o banco real — inclui pares que colidem a
// distância 1 mesmo com o fonema inicial certo (rodada 12).
const VOCAB_SIMULADO = new Set(['gato', 'galo', 'cama', 'casa', 'gelo']);

interface Caso {
  esperado: string;
  transcrito: string;
  deveriaPassar: boolean;
  motivo: string;
}

const CASOS: Caso[] = [
  {
    esperado: 'gato',
    transcrito: 'pato',
    deveriaPassar: false,
    motivo: 'pato não pode passar como leitura de gato (D-09)',
  },
  {
    esperado: 'pato',
    transcrito: 'gato',
    deveriaPassar: false,
    motivo: 'gato não pode passar como leitura de pato (D-09)',
  },
  {
    esperado: 'gato',
    transcrito: 'pa to',
    deveriaPassar: false,
    motivo: 'mesmo fragmentado, pato != gato',
  },
  {
    esperado: 'mao',
    transcrito: 'pao',
    deveriaPassar: false,
    motivo: 'pao não pode passar como leitura de mao',
  },
  { esperado: 'gato', transcrito: 'gato', deveriaPassar: true, motivo: 'idêntico tem que passar' },
  {
    esperado: 'gato',
    transcrito: 'ga to',
    deveriaPassar: true,
    motivo: 'fragmentado mas mesmo som tem que passar (D-37)',
  },
  {
    esperado: 'casa',
    transcrito: 'caza',
    deveriaPassar: true,
    motivo: 'c/z são quase-homófonos em pt-br, tolerância esperada',
  },
  {
    esperado: 'bola',
    transcrito: 'pola',
    deveriaPassar: false,
    motivo: 'b/p são consoantes diferentes na abertura, não deveria passar',
  },
  {
    esperado: 'gelo',
    transcrito: 'galo',
    deveriaPassar: false,
    motivo: "letra 'g' igual, fonema inicial diferente (/ʒ/ suave vs /g/ forte)",
  },
  { esperado: 'galo', transcrito: 'gelo', deveriaPassar: false, motivo: 'o inverso também' },
  {
    esperado: 'gelo',
    transcrito: 'gelo',
    deveriaPassar: true,
    motivo: 'idêntico com c/g tem que continuar passando',
  },
  {
    esperado: 'gato',
    transcrito: 'gata',
    deveriaPassar: true,
    motivo: 'mesma classe de fonema (ga- forte), distância 1, sem colidir com vocabulário',
  },
  {
    esperado: 'gato',
    transcrito: 'galo',
    deveriaPassar: false,
    motivo: "mesmo fonema inicial e distância 1, mas 'galo' é outra palavra real do banco",
  },
  { esperado: 'galo', transcrito: 'gato', deveriaPassar: false, motivo: 'o inverso também' },
  {
    esperado: 'cama',
    transcrito: 'casa',
    deveriaPassar: false,
    motivo: "'casa' é outra palavra real do banco, não ruído de 'cama'",
  },
  { esperado: 'casa', transcrito: 'cama', deveriaPassar: false, motivo: 'o inverso também' },
];

const CASOS_DAMERAU: Caso[] = [
  {
    esperado: 'perna',
    transcrito: 'prena',
    deveriaPassar: true,
    motivo: 'transposição de 2 letras adjacentes conta como 1 edição',
  },
  {
    esperado: 'gato',
    transcrito: 'pato',
    deveriaPassar: false,
    motivo: 'trava do D-09 continua valendo com damerau também',
  },
  {
    esperado: 'gato',
    transcrito: 'galo',
    deveriaPassar: false,
    motivo: 'guard de vocabulário continua valendo com damerau também',
  },
];

describe('tolerancia_fonetica — trava D-08/D-09 (19 casos adversariais do spike)', () => {
  it.each(CASOS)(
    '$esperado vs $transcrito -> $deveriaPassar ($motivo)',
    ({ esperado, transcrito, deveriaPassar }) => {
      const resultado = bateComToleranciaFonetica(esperado, transcrito, {
        distanciaMax: 1,
        vocabularioConhecido: VOCAB_SIMULADO,
      });
      expect(resultado).toBe(deveriaPassar);
    },
  );

  it.each(CASOS_DAMERAU)(
    '(damerau) $esperado vs $transcrito -> $deveriaPassar ($motivo)',
    ({ esperado, transcrito, deveriaPassar }) => {
      const resultado = bateComToleranciaFonetica(esperado, transcrito, {
        distanciaMax: 1,
        vocabularioConhecido: VOCAB_SIMULADO,
        usarDamerau: true,
      });
      expect(resultado).toBe(deveriaPassar);
    },
  );
});
