# Conteúdo — RASCUNHO v0, não validado

**Este conteúdo foi escrito pelo Claude como ponto de partida, não é
decisão de produto.** Doc002 §6 é explícito: o dono do conteúdo é o dono
do projeto, até haver validação pedagógica externa (A-06, ainda aberta).
Revise, corrija e substitua à vontade — nada aqui está "fechado" como as
decisões numeradas (D-01 a D-36) do `doc/`.

Local temporário: estes arquivos vivem em `conteudo/` na raiz do repo
porque `app/` ainda não existe (T003 pendente — ver
`specs/001-mvp-desafios-leitura-matematica/quickstart.md`, agora
executável já que Node.js está instalado, só falta rodar o scaffold).
Quando o projeto for criado, movem para `app/assets/conteudo/` (`plan.md`
§Project Structure, React Native + Expo desde 2026-09-13).

## O que tem

- `leitura.json` — 272 entradas: alfabeto completo (nível 1, 26 letras),
  e 6 classificações (animais, comida, casa, corpo, natureza, ações) nos
  níveis 2 a 5, seguindo os critérios de nível do `doc/definições002.MD`
  §6 (nível 2 = dissílabas simples, nível 3 = CVC/trissílaba regular,
  nível 4 = dígrafo/encontro consonantal/palavra longa, nível 5 = frases
  de 3-5 palavras). Ganhou 7 entradas em 2026-09-21 (`bola`, `casa`, `mão`,
  `pão` nível 2; `porta`, `cavalo`, `sapato` nível 3) — eram
  exemplos históricos do `doc001`/`doc002` que nunca tinham virado
  conteúdo de verdade, achado ao investigar o spike de STT
  (`specs/001-mvp-desafios-leitura-matematica/research.md` §T002, rodada
  10). Valida contra
  [`../specs/001-mvp-desafios-leitura-matematica/contracts/item-leitura.schema.json`](../specs/001-mvp-desafios-leitura-matematica/contracts/item-leitura.schema.json)
  (ainda não rodei o teste de contrato T006 contra este arquivo — projeto
  `app/` não criado ainda; conferi a estrutura manualmente com Python).
- `matematica_temas.json` — 5 temas com objeto visual e 3 variações de
  frase por operação (D-36), seguindo
  [`tema-matematica.schema.json`](../specs/001-mvp-desafios-leitura-matematica/contracts/tema-matematica.schema.json).

## Cobertura por nível×classificação (D-35 exige mínimo 12)

| Classificação | Nível 2 | Nível 3 | Nível 4 | Nível 5 (frases) |
|---|---|---|---|---|
| animais | 13 ✅ | 13 ✅ | 12 ✅ | 6 ⚠️ |
| comida | 13 ✅ | 12 ✅ | 12 ✅ | 4 ⚠️ |
| casa | 14 ✅ | 13 ✅ | 12 ✅ | 4 ⚠️ |
| corpo | **9 ⚠️** | 13 ✅ | 12 ✅ | 4 ⚠️ |
| natureza | 12 ✅ | 12 ✅ | 12 ✅ | 4 ⚠️ |
| ações | 12 ✅ | 12 ✅ | 12 ✅ | 4 ⚠️ |

**Lacunas conhecidas, deliberadamente não forçadas com palavra ruim só
pra bater 12:**

1. **`corpo` nível 2 tem só 9 palavras** (era 8, ganhou `mão` em
   2026-09-21). Nomes de partes do corpo em português tendem a ter
   encontro consonantal (braço, perna, ombro) ou dígrafo (orelha, unha) —
   sobra pouco vocabulário dissílabo simples de verdade. Por FR-011/D-35,
   **essa combinação não deve aparecer como opção selecionável em US3 até
   alguém encontrar mais 3 palavras legítimas** (ou a regra permanece e a
   combinação fica oculta — o que já é o comportamento correto do
   `banco_de_conteudo`, T008/T014).
2. **Todo nível 5 (frases) está abaixo de 12** em todas as classificações
   (4 a 6 frases cada). É suficiente para rodadas de tamanho 3, mas não
   para 5 ou 8 sem repetir — mesma regra do FR-011 se aplica. Escrever
   frases de qualidade em volume é o item mais trabalhoso deste rascunho;
   deixei poucas de propósito em vez de inflar com frases ruins.
3. **A classificação `ações` não tem entrada em `matematica_temas.json`.**
   Ações (verbos) não têm um "objeto contável" natural pro problema
   contextualizado ("3 correr e mais 2 correr" não faz sentido) — ela
   continua válida pra leitura, mas fica de fora da matemática
   contextualizada por enquanto. Se isso importar, é uma decisão sua:
   inventar um objeto proxy (ex. "3 vezes que ele pulou") ou aceitar que
   nem toda classificação de leitura precisa ter equivalente em
   matemática.

## Antes de rodar T067 (validar contra o conteúdo real)

1. Alguém revisar as 265 palavras/frases quanto a adequação pedagógica
   (A-06) — nível atribuído, regionalismo, palavra que uma criança da
   idade-alvo realmente reconhece.
2. Decidir se `bumbum`/`sovaco` (informais, mas comuns na fala infantil
   brasileira) ficam ou saem de `corpo`.
3. Completar `corpo` nível 2 e os níveis 5 de todas as classificações
   antes de expor essas combinações na configuração (US3).
