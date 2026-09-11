# Data Model — Fase 1

Traduz as *Key Entities* do `spec.md` em modelo concreto, já sob a decisão
do T001 (Flutter + `sqflite` para dado dinâmico, JSON de asset para
conteúdo estático — ver `research.md`). Sem código de implementação, só
esquema e regras.

## Onde cada coisa vive

| Entidade | Guardada em | Por quê |
|---|---|---|
| Perfil | `sqflite` (tabela `perfis`) | Muda em tempo de uso (criar perfil, D-32) |
| Configuração | `sqflite` (tabela `configuracao`) | Preferência por perfil, muda em tempo de uso |
| Rodada (= Registro de histórico) | `sqflite` (tabela `rodadas`) | Dado transacional, cresce a cada partida |
| Rodada dupla | `sqflite` (tabela `rodadas_duplas`) | Liga duas linhas de `rodadas` |
| Item de leitura (banco de palavras) | asset JSON (`conteudo/leitura.json`) | Estático, versionado com o app, revisado sem formação técnica (A-06) — ver `contracts/item-leitura.schema.json` |
| Tema de matemática contextualizada | asset JSON (`conteudo/matematica_temas.json`) | Estático, mesmo motivo — ver `contracts/tema-matematica.schema.json` |
| Desafio de matemática (conta pura ou contextualizada) | **não persistido** | Gerado em memória a cada desafio (T027/T028); só o resultado agregado da rodada é guardado |

Nenhum "Desafio de leitura respondido" individual é persistido — CU-06 só
pede o resumo por rodada (acertos, erros, precisão, estrelas, contador de
ajuda), não o log de cada palavra. Guardar por desafio seria dado que
nenhum FR pede (YAGNI).

## Tabela `perfis`

| Campo | Tipo | Regra |
|---|---|---|
| `id` | TEXT (PK) | MVP: linha única `"padrao"` (D-25). Suporta N linhas sem migração quando US5/D-32 ligar o seletor. |
| `nome` | TEXT, nullable | Nulo no perfil `"padrao"` implícito |
| `cor` | TEXT, nullable | Cor/avatar mínimo (doc002 §4, §9 — "nome + cor") |
| `criado_em` | TEXT (ISO 8601) | |

## Tabela `configuracao`

Uma linha por perfil — preferências lembradas (CU-01 regra "a voz escolhida
fica lembrada", CU-07).

| Campo | Tipo | Regra |
|---|---|---|
| `perfil_id` | TEXT (PK, FK → `perfis.id`) | |
| `voz_id` | TEXT, nullable | Identificador de voz TTS do aparelho (`flutter_tts`); nulo até o 1º teste de voz (CU-07) |
| `nome_ou_fonema` | TEXT | `"nome"` \| `"fonema"` — padrão `"fonema"` (D-26) |
| `ultimo_nivel` | INTEGER | 1–5, padrão 1 |
| `ultimas_classificacoes` | TEXT (JSON array) | padrão `["todas"]` (doc002 §2) |
| `ultimo_tamanho` | INTEGER | 3 \| 5 \| 8, padrão 5 |
| `ultima_modalidade` | TEXT | `"ditado"` \| `"leitura_montar"` \| `"leitura_voz"`, padrão `"leitura_montar"` |
| `ultima_forma_matematica` | TEXT | `"pura"` \| `"contextualizada"`, padrão `"pura"` |

Todo campo tem padrão válido — nenhum é obrigatório pra iniciar (FR-012,
Princípio VII).

## Tabela `rodadas`

Uma linha por rodada individual — sozinha ou uma das duas metades de uma
dupla (ver `rodadas_duplas`). É, ao mesmo tempo, o "Registro de histórico"
do `spec.md`.

| Campo | Tipo | Regra |
|---|---|---|
| `id` | TEXT (PK) | |
| `perfil_id` | TEXT (FK → `perfis.id`) | FR-014 |
| `tipo` | TEXT | `"leitura"` \| `"matematica"` \| `"misto"` |
| `modalidade` | TEXT, nullable | obrigatório se `tipo` envolve leitura; nulo se só matemática |
| `forma_matematica` | TEXT, nullable | obrigatório se `tipo` envolve matemática |
| `nivel` | INTEGER | 1–5 |
| `classificacoes` | TEXT (JSON array), nullable | nulo quando `nivel = 1` (D-22) |
| `tamanho` | INTEGER | 3 \| 5 \| 8 |
| `iniciada_em` | TEXT (ISO 8601) | |
| `concluida_em` | TEXT, nullable | nulo enquanto em andamento |
| `concluida` | INTEGER (bool) | `0` até o último desafio ser respondido; rodada abandonada fica `0` para sempre (FR-018 generalizado no edge case do `spec.md`) |
| `acertos` | INTEGER | |
| `erros` | INTEGER | D-06 — toda tentativa errada conta |
| `precisao` | REAL | `acertos / (acertos + erros)`, calculado ao concluir (D-06) |
| `estrelas` | REAL | granularidade 0.5 (CU-05) |
| `contador_ajuda` | INTEGER | significado depende de `modalidade`: repetições (Ditado) / espiadas (Leitura·montar) / tentativas (Leitura·voz) — D-19. Nulo se `tipo = "matematica"` |

**Retenção (FR-015)**: ao inserir uma rodada `concluida = 1`, se o perfil
já tiver 50 rodadas concluídas, a mais antiga é apagada. Rodadas
`concluida = 0` (abandonadas) não contam para o limite nem aparecem no
histórico — só existem para o registro interno de tentativa.

## Tabela `rodadas_duplas`

| Campo | Tipo | Regra |
|---|---|---|
| `id` | TEXT (PK) | |
| `formato` | TEXT | `"cooperativo"` \| `"adversarial"` (D-31) |
| `rodada_1_id` | TEXT (FK → `rodadas.id`) | perfil que começou (CU-08 passo 6) |
| `rodada_2_id` | TEXT (FK → `rodadas.id`), nullable | nulo até a criança 2 começar |
| `completa` | INTEGER (bool) | `1` somente quando as duas rodadas ligadas têm `concluida = 1` (FR-018) |

O resultado combinado (CU-05 variante) é **calculado**, não guardado — soma
ou comparação lida direto das duas linhas de `rodadas` no momento de
exibir, para nunca divergir do dado fonte.

## Contratos de conteúdo (asset)

Ver `contracts/item-leitura.schema.json` e
`contracts/tema-matematica.schema.json` para o formato exato. Resumo:

- **Item de leitura**: `palavra`, `nivel` (1–5), `classificacoes` (lista,
  vazia/ausente só se `nivel = 1` — D-22), `marcador_fonetico` (opcional,
  documental — doc002 §6).
- **Tema de matemática**: `classificacao`, `objeto` (nome do asset visual —
  D-24), `variacoes_frase` por operação (2–3, sorteio aleatório — D-36).

## Regra de validação cruzada (FR-011, D-35)

Antes de expor uma combinação nível×classificação na tela de configuração
(US3), o app conta quantos itens de `conteudo/leitura.json` batem com
`nivel` E contém a classificação — só oferece a combinação se **≥ 12**.
Essa contagem é feita em memória a partir do asset carregado (T008), não
precisa de índice em banco.
