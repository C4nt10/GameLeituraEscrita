---
description: "Task list for MVP — Desafios de leitura e matemática"
---

# Tasks: MVP — Desafios de leitura e matemática

**Input**: Design documents from `specs/001-mvp-desafios-leitura-matematica/`
(`plan.md`, `spec.md`; `research.md`/`data-model.md` a gerar na Fase 0/1
antes de iniciar a implementação — ver T004/T005 abaixo)

**Tests**: incluídas — a spec exige comportamento verificável (tolerância
fonética, honestidade da métrica) que só é confiável com testes automatizados.

**Organization**: tarefas agrupadas por user story (US1–US5 do spec.md),
para entrega e teste independentes.

## Format: `[ID] [P?] [Story] Descrição`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência)
- **[Story]**: a qual user story a tarefa pertence

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Decidir e registrar o framework — **Flutter (Dart)**, ver
      [`research.md`](./research.md); `plan.md` atualizado, sem mais
      NEEDS CLARIFICATION em Language/Version
- [ ] T002 Rodar o spike de STT (`spike-stt/testar.py`) com os 14 áudios
      gravados e registrar o resultado (Vosk vs. faster-whisper: acurácia e
      tamanho de modelo) em `research.md` — decide o motor de
      reconhecimento de fala de Leitura · voz
- [ ] T003 Criar a estrutura de projeto conforme `plan.md` §Project
      Structure (`app/lib/`, `app/conteudo/`, `app/test/`)
- [ ] T004 [P] Configurar lint/format do framework escolhido
- [ ] T005 [P] Configurar runner de testes (unit/integration/contract) do
      framework escolhido

**Checkpoint**: projeto roda vazio, lint e testes configurados.

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: nenhuma user story começa antes desta fase.

- [ ] T006 Modelar `Perfil` (id, nome, cor/avatar) em
      `app/lib/modelos/perfil` — sempre multi-perfil no modelo, mesmo com
      valor único `"padrao"` usado no MVP (D-25, FR-014)
- [ ] T007 Modelar `RegistroHistorico` (data/hora, tipo, nível,
      classificação, modalidade, acertos, erros, precisão, estrelas,
      contador de ajuda, perfil(is), concluída?) em
      `app/lib/modelos/registro_historico`
- [ ] T008 [P] Implementar `banco_de_conteudo`: carregar a grade
      nível×classificação de `app/conteudo/`, com validação de que toda
      combinação exposta tem palavras suficientes para não repetir
      (FR-010, FR-011)
- [ ] T009 [P] Implementar `historico` (serviço de persistência local: até
      50 rodadas por perfil, exclusão com confirmação) em
      `app/lib/servicos/historico` (FR-015)
- [ ] T010 [P] Implementar `tts` (serviço de fala: síntese do aparelho para
      palavra/frase/enunciado; reprodução dos ~52 clipes gravados para
      letra/fonema) em `app/lib/servicos/tts` (D-27, FR-020)
- [ ] T011 Implementar detecção de capacidade do aparelho (microfone
      disponível/permitido, vozes pt instaladas) com motivo legível,
      reutilizada por qualquer tela que precise desabilitar uma opção
      (Princípio I/III da constituição, FR-013)
- [ ] T012 Implementar cálculo de precisão/estrelas
      (`acertos ÷ tentativas totais`, meia estrela de granularidade,
      nunca cruzando modalidades) em `app/lib/servicos/avaliacao` (D-06,
      D-20, FR-007) — **com testes unitários first** (T012a)
  - [ ] T012a [P] Teste unitário de cálculo de precisão/estrelas em
        `app/test/unit/avaliacao_test`

**Checkpoint**: fundação pronta — user stories podem começar.

---

## Phase 3: User Story 1 - Resolver rodada de leitura nas 3 modalidades (P1) 🎯 MVP

**Goal**: criança completa uma rodada de leitura em Ditado, Leitura ·
montar ou Leitura · voz, com resultado honesto ao final.

**Independent Test**: iniciar sem configurar, jogar uma rodada em cada
modalidade, chegar à tela de estrelas.

### Tests for User Story 1 ⚠️

- [ ] T013 [P] [US1] Teste unitário: geração de 4 alternativas de letra sem
      repetição em `app/test/unit/alternativas_letra_test`
- [ ] T014 [P] [US1] Teste unitário: tolerância fonética aceita variação de
      pronúncia e rejeita troca do som inicial (D-09) em
      `app/test/unit/tolerancia_fonetica_test`
- [ ] T015 [P] [US1] Teste de integração: troca automática para Leitura ·
      montar após 2 falhas em Leitura · voz (D-10) em
      `app/test/integration/troca_modalidade_test`
- [ ] T016 [P] [US1] Teste de integração: contador de ajuda correto por
      modalidade (repetições/espiadas/tentativas) aparece no resultado
      (D-19) em `app/test/integration/contador_ajuda_test`

### Implementation for User Story 1

- [ ] T017 [P] [US1] Modelar `DesafioLeitura` (palavra/letra, nível,
      classificação(ões), marcador fonético opcional) em
      `app/lib/modelos/desafio_leitura`
- [ ] T018 [US1] Implementar `avaliacao_leitura`: tolerância fonética sobre
      a saída do STT (depende de T002 — motor de STT escolhido) em
      `app/lib/servicos/avaliacao_leitura` (D-08, D-09)
- [ ] T019 [US1] Implementar tela de desafio — Ditado (áudio automático +
      repetição, escolha entre 4 letras nível 1 / montagem sem palavra
      visível níveis 2+) em `app/lib/telas/rodada/ditado`
- [ ] T020 [US1] Implementar tela de desafio — Leitura · montar (palavra
      aparece e some sozinha — D-18, sem som, montagem com letras
      embaralhadas) em `app/lib/telas/rodada/leitura_montar`
- [ ] T021 [US1] Implementar tela de desafio — Leitura · voz (palavra
      visível, app calado, captura de microfone, mostra o que entendeu) em
      `app/lib/telas/rodada/leitura_voz`
- [ ] T022 [US1] Implementar tela de resultado da rodada (estrelas,
      acertos/erros/precisão, contador de ajuda da modalidade) em
      `app/lib/telas/resultado`, reusando T012
- [ ] T023 [US1] Ligar detecção de microfone indisponível (T011) à tela de
      Leitura · voz com mensagem de motivo real (FR-013, US1 cenário 7)

**Checkpoint**: US1 funcional e testável sozinha — MVP jogável em leitura.

---

## Phase 4: User Story 2 - Resolver rodada de matemática (P2)

**Goal**: criança resolve desafios de matemática (conta pura ou problema
contextualizado).

**Independent Test**: configurar tipo "matemática", jogar uma rodada em
cada forma.

### Tests for User Story 2 ⚠️

- [ ] T024 [P] [US2] Teste unitário: gerador de alternativas nunca produz
      negativo nem repetição, mantém proximidade (doc001 §4) em
      `app/test/unit/gerador_matematica_test`
- [ ] T025 [P] [US2] Teste unitário: problema contextualizado de subtração
      nunca gera resultado negativo (FR-009) em
      `app/test/unit/problema_contextualizado_test`

### Implementation for User Story 2

- [ ] T026 [P] [US2] Modelar `DesafioMatematica` (operação, operandos,
      resultado, forma, tema quando contextualizada, alternativas) em
      `app/lib/modelos/desafio_matematica`
- [ ] T027 [US2] Implementar `gerador_matematica` (conta pura, 5 níveis de
      operação) em `app/lib/servicos/gerador_matematica` (depende de T026)
- [ ] T028 [US2] Implementar `problema_contextualizado` (enunciado por
      tema/classificação, objetos visuais, fala automática, 2-3 variações
      fixas por operação sorteadas aleatoriamente, sem variar por nível —
      D-36) em `app/lib/servicos/problema_contextualizado` (D-23, D-24;
      depende de T008 para o tema)
- [ ] T029 [US2] Implementar tela de desafio de matemática (conta falada,
      botão de repetir, 4 alternativas) em `app/lib/telas/rodada/matematica`,
      reusando T022 para o resultado

**Checkpoint**: US1 + US2 funcionam juntas e independentemente.

---

## Phase 5: User Story 3 - Configurar a rodada (P3)

**Goal**: adulto escolhe tipo, modalidade, nível, classificação, forma de
matemática, tamanho, formato (sozinho/dupla) e voz antes de começar.

**Independent Test**: alterar configuração, iniciar, confirmar que a rodada
seguinte respeita as escolhas.

### Tests for User Story 3 ⚠️

- [ ] T030 [P] [US3] Teste de integração: combinação nível×classificação
      sem conteúdo suficiente não aparece selecionável (FR-011) em
      `app/test/integration/configuracao_conteudo_test`
- [ ] T031 [P] [US3] Teste de integração: iniciar sem alterar nada usa
      valores padrão válidos (FR-012) em
      `app/test/integration/configuracao_padrao_test`

### Implementation for User Story 3

- [ ] T032 [P] [US3] Implementar `configuracao` (preferências persistidas:
      última voz, nome/fonema, últimos nível/classificação/tamanho/
      modalidade) em `app/lib/servicos/configuracao`
- [ ] T033 [US3] Implementar tela de configuração da rodada (tipo,
      modalidade, nível, classificação, forma de matemática, tamanho,
      sozinho/dupla) em `app/lib/telas/configuracao`, ligada a T008/T032
- [ ] T034 [US3] Implementar tela de escolha e teste de voz (lista de vozes
      pt do aparelho, destaque de melhor qualidade, teste com toque) em
      `app/lib/telas/escolha_de_voz`, ligada a T010/T011 (CU-07)
- [ ] T035 [US3] Implementar seleção de "nome da letra" vs. "som da letra"
      (padrão fonema) em `app/lib/telas/configuracao` (D-26, FR-021)

**Checkpoint**: US1+US2+US3 funcionam juntas — rodada totalmente
configurável, com defaults ainda válidos.

---

## Phase 6: User Story 4 - Consultar o histórico (P4)

**Goal**: adulto vê resumo e lista das últimas 50 rodadas por perfil.

**Independent Test**: jogar 3 rodadas variadas, abrir histórico, conferir
os campos e o cálculo por perfil.

### Tests for User Story 4 ⚠️

- [ ] T036 [P] [US4] Teste unitário: resumo geral (total, precisão média,
      média de estrelas) calculado por perfil, sem cruzar modalidades
      (US4 cenário 4) em `app/test/unit/resumo_historico_test`

### Implementation for User Story 4

- [ ] T037 [US4] Implementar tela de histórico (lista mais recente→mais
      antiga, resumo geral, mensagem de vazio antes da 1ª rodada) em
      `app/lib/telas/historico`, ligada a T009
- [ ] T038 [US4] Implementar exclusão do histórico com confirmação em
      `app/lib/telas/historico` (CU-06)

**Checkpoint**: histórico completo e correto para uso sozinho e futuro modo
dupla.

---

## Phase 7: User Story 5 - Jogar em dupla (P5)

**Goal**: duas crianças jogam rodadas individuais sequenciais com config
idêntica; resultado combinado cooperativo ou adversarial.

**Independent Test**: selecionar dupla, 2 perfis, jogar as duas rodadas,
ver os dois formatos de resultado combinado.

### Tests for User Story 5 ⚠️

- [ ] T039 [P] [US5] Teste de integração: rodada dupla incompleta (uma
      criança sai no meio) não entra no histórico comparativo (FR-018) em
      `app/test/integration/dupla_incompleta_test`
- [ ] T040 [P] [US5] Teste de integração: config idêntica é aplicada às
      duas rodadas da dupla (D-33) em
      `app/test/integration/dupla_config_identica_test`

### Implementation for User Story 5

- [ ] T041 [P] [US5] Implementar seleção/criação de perfil (nome + cor,
      cadastro mínimo) em `app/lib/telas/selecao_perfil`, ligada a T006
      (D-32 — seletor aparece com >1 perfil ou ao entrar em "dupla")
- [ ] T042 [US5] Implementar fluxo de dupla: escolha de formato
      (cooperativo/adversarial), 2 perfis, rodada 1 → tela "passa o
      aparelho" → rodada 2, reusando as telas de US1/US2 sem alteração
      (D-30) em `app/lib/telas/dupla`
- [ ] T043 [US5] Implementar tela de resultado combinado — cooperativo
      (soma + individual lado a lado) e adversarial (lado a lado com
      destaque, mensagem nunca depreciativa) em
      `app/lib/telas/resultado_dupla`, reusando T022
- [ ] T044 [US5] Persistir rodada dupla no histórico com os dois perfis
      vinculados e a flag de completude por perfil (FR-018), ligada a T009

**Checkpoint**: todas as 5 user stories funcionam, cada uma isoladamente
testável.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T045 [P] Revisar todas as telas contra o Princípio VI da constituição
      (um toque, instrução no símbolo — 👁️🙈🔊🎤) antes do primeiro teste
      com criança real
- [ ] T046 [P] Gravar e integrar os ~52 clipes de letras/fonemas (nome +
      som) em `app/lib/audio/` (D-27)
- [ ] T047 Carregar e validar o banco de palavras inicial em
      `app/conteudo/` contra as 6 classificações confirmadas (D-34 —
      animais, comida, casa, corpo, natureza, ações), com **mínimo de 12
      palavras** por combinação nível×classificação exposta (D-35, FR-011)
- [ ] T048 Sessão de observação com criança real seguindo `doc/
      definições001.MD` §10 + `doc/definições002.MD` §10 (perguntas 1-10),
      medindo SC-001 a SC-006 de `spec.md`
- [ ] T049 Registrar resultado da sessão de observação e decidir A-06/A-09/
      A-10 remanescentes em `doc/definições003.MD` (consolidação prevista
      em `doc/definições002.MD`)

---

## Dependencies & Execution Order

- **Setup (Fase 1)** → **Foundational (Fase 2)** bloqueia todas as user
  stories.
- **US1 (P1)** é o MVP mínimo demonstrável; **US2–US5** podem seguir em
  paralelo depois da Fase 2, mas a ordem de prioridade recomendada é
  P1 → P2 → P3 → P4 → P5, pois cada uma reaproveita a anterior (US3
  configura o que US1/US2 já jogam com default; US5 reaproveita US1/US2
  inteiras).
- **US5** depende do modelo de `Perfil` multi-perfil (T006) e das telas de
  US1/US2 já existirem, mas não depende de US3 nem US4 em código — apenas
  reaproveita a mesma tela de resultado (T022).

## Notes

- [P] = arquivos diferentes, sem dependência
- Testes marcados ⚠️ devem ser escritos e falhar antes da implementação
  correspondente
- Cada checkpoint de user story é um ponto válido para parar, demonstrar e
  validar com o dono do produto antes de seguir
