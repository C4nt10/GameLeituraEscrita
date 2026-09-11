# Contracts

Não há backend nesta feature (app 100% local — Princípio V), então não há
contrato de API/HTTP aqui. O que existe são os **contratos de dado** que
todo o app depende de respeitar:

- [`item-leitura.schema.json`](./item-leitura.schema.json) — formato de
  cada entrada de `conteudo/leitura.json` (o banco de palavras). Quem
  edita esse arquivo — inclusive alguém sem formação técnica revisando
  conteúdo pedagógico (A-06) — precisa seguir este schema.
- [`tema-matematica.schema.json`](./tema-matematica.schema.json) —
  formato de `conteudo/matematica_temas.json`, o vocabulário visual e as
  variações de frase (D-36) usadas pelo problema contextualizado.

O esquema das tabelas `sqflite` (dado dinâmico: perfis, configuração,
rodadas) está em [`../data-model.md`](../data-model.md), não aqui — não é
um "contrato" no sentido de fronteira entre sistemas, é o modelo interno
do próprio app.

Testes de contrato (`app/test/contract/`, ver `tasks.md`) devem validar
que `conteudo/*.json` bate com estes schemas antes de qualquer outro teste
rodar — conteúdo malformado quebra silenciosamente a experiência da
criança se não for pego cedo.
