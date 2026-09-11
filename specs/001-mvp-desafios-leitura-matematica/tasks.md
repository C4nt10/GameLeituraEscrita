---
description: "Task list for MVP — Desafios de leitura e matemática"
---

# Tasks: MVP — Desafios de leitura e matemática

**Input**: Design documents de `specs/001-mvp-desafios-leitura-matematica/`
(`plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/` — todos
já gerados; este arquivo é o Phase 2 output)

**Tests**: incluídas, e com **cobertura auditada 1:1 contra os
*Acceptance Scenarios* do `spec.md`** — toda decisão de comportamento
(tolerância fonética, honestidade da métrica, princípio supremo de nunca
entregar a resposta) só é confiável com teste automatizado, não com
revisão manual.

**Organization**: tarefas agrupadas por user story (US1–US5 do `spec.md`),
para entrega e teste independentes. A Fase 2 (Foundational) também ganhou
sua própria seção de testes nesta revisão — antes só a Fase 3 em diante
tinha essa disciplina.

## Format: `[ID] [P?] [Story] Descrição`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência)
- **[Story]**: a qual user story a tarefa pertence

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Decidir e registrar o framework — **Flutter (Dart)**, ver
      [`research.md`](./research.md); `plan.md` atualizado, sem mais
      NEEDS CLARIFICATION em Language/Version
- [ ] T002 Rodar o spike de STT (`spike-stt/testar.py`) com os 14 áudios
      gravados e registrar o resultado em `research.md`. **Critério de
      aceite**: Vosk é mantido como motor (research.md, T001) se acertar
      **≥ 80% das 14 palavras (12/14)**; abaixo disso, avaliar o custo
      extra de whisper.cpp (ver "Consequência arquitetural" em
      research.md) antes de prosseguir para T028
- [ ] T003 Criar a estrutura de projeto conforme `plan.md` §Project
      Structure (`app/lib/`, `app/conteudo/`, `app/test/`)
- [ ] T004 [P] Configurar lint/format do framework escolhido
- [ ] T005 [P] Configurar runner de testes (unit/integration/contract) do
      framework escolhido

**Checkpoint**: projeto roda vazio, lint e testes configurados.

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: nenhuma user story começa antes desta fase.

### Tests for Foundational ⚠️

> **NOTE**: escrever e ver falhar antes de implementar. Esta seção não
> existia na primeira versão do `tasks.md` — a fundação (modelos e
> serviços de base) estava sem teste próprio, cobrindo `T008`
> (validação de conteúdo) só de forma indireta, três fases depois.

- [ ] T006 [P] Teste de contrato: `conteudo/leitura.json` valida contra
      `contracts/item-leitura.schema.json` em
      `app/test/contract/item_leitura_schema_test`
- [ ] T007 [P] Teste de contrato: `conteudo/matematica_temas.json` valida
      contra `contracts/tema-matematica.schema.json` em
      `app/test/contract/tema_matematica_schema_test`
- [ ] T008 [P] Teste unitário: `banco_de_conteudo` rejeita/oculta uma
      combinação nível×classificação com **menos de 12** itens (FR-011,
      D-35) em `app/test/unit/banco_de_conteudo_test`
- [ ] T009 [P] Teste unitário: `historico` aplica a retenção de 50
      rodadas por perfil — ao inserir a 51ª rodada **concluída**, a mais
      antiga é removida (FR-015) em
      `app/test/unit/historico_retencao_test`
- [ ] T010 [P] Teste unitário: detecção de capacidade do aparelho retorna
      "desabilitado com motivo" quando microfone/voz pt está indisponível
      (mock de plataforma) (Princípio I/III da constituição, FR-013) em
      `app/test/unit/capacidade_aparelho_test`
- [ ] T011 [P] Teste unitário: cálculo de precisão/estrelas
      (`acertos ÷ tentativas totais`, meia estrela de granularidade,
      nunca cruzando modalidades) (D-06, D-20, FR-007) em
      `app/test/unit/avaliacao_test`

### Implementation for Foundational

- [ ] T012 Modelar `Perfil` (id, nome, cor/avatar) em
      `app/lib/modelos/perfil` — sempre multi-perfil no modelo, mesmo com
      valor único `"padrao"` usado no MVP (D-25, FR-014)
- [ ] T013 Modelar `RegistroHistorico` (data/hora, tipo, nível,
      classificação, modalidade, acertos, erros, precisão, estrelas,
      contador de ajuda, perfil(is), concluída?) em
      `app/lib/modelos/registro_historico`
- [ ] T014 [P] Implementar `banco_de_conteudo`: carregar a grade
      nível×classificação de `app/conteudo/`, com validação de que toda
      combinação exposta tem ≥ 12 palavras (FR-010, FR-011) — faz T006,
      T007 e T008 passarem — em `app/lib/servicos/banco_de_conteudo`
- [ ] T015 [P] Implementar `historico` (serviço de persistência local: até
      50 rodadas por perfil, retenção, exclusão com confirmação) — faz
      T009 passar — em `app/lib/servicos/historico` (FR-015)
- [ ] T016 [P] Implementar `tts` (serviço de fala: síntese do aparelho para
      palavra/frase/enunciado; reprodução dos ~52 clipes gravados para
      letra/fonema) em `app/lib/servicos/tts` (D-27, FR-020)
- [ ] T017 Implementar detecção de capacidade do aparelho (microfone
      disponível/permitido, vozes pt instaladas) com motivo legível,
      reutilizada por qualquer tela que precise desabilitar uma opção —
      faz T010 passar — (Princípio I/III da constituição, FR-013)
- [ ] T018 Implementar cálculo de precisão/estrelas — faz T011 passar —
      em `app/lib/servicos/avaliacao` (D-06, D-20, FR-007)

**Checkpoint**: fundação pronta, com teste próprio passando — user
stories podem começar.

---

## Phase 3: User Story 1 - Resolver rodada de leitura nas 3 modalidades (P1) 🎯 MVP

**Goal**: criança completa uma rodada de leitura em Ditado, Leitura ·
montar ou Leitura · voz, com resultado honesto ao final.

**Independent Test**: iniciar sem configurar, jogar uma rodada em cada
modalidade, chegar à tela de estrelas.

### Tests for User Story 1 ⚠️

- [ ] T019 [P] [US1] Teste unitário: geração de 4 alternativas de letra sem
      repetição em `app/test/unit/alternativas_letra_test`
- [ ] T020 [P] [US1] Teste unitário: tolerância fonética aceita variação de
      pronúncia e rejeita troca do som inicial (D-09) em
      `app/test/unit/tolerancia_fonetica_test`
- [ ] T021 [P] [US1] Teste de integração: troca automática para Leitura ·
      montar após 2 falhas em Leitura · voz (D-10) em
      `app/test/integration/troca_modalidade_test`
- [ ] T022 [P] [US1] Teste de integração: contador de ajuda correto por
      modalidade (repetições/espiadas/tentativas) aparece no resultado
      (D-19) em `app/test/integration/contador_ajuda_test`
- [ ] T023 [P] [US1] Teste de integração: Ditado **nunca** exibe a
      letra/palavra escrita na tela, em nenhum nível — só fala (US1
      cenário 1, princípio supremo da constituição) em
      `app/test/integration/ditado_nunca_mostra_test`
- [ ] T024 [P] [US1] Teste de integração: em Leitura · montar a palavra
      aparece e **some sozinha**, sem áudio algum, e a espiada é contada a
      cada revelação (US1 cenário 2, D-18) em
      `app/test/integration/leitura_montar_some_test`
- [ ] T025 [P] [US1] Teste de integração: uma resposta errada, em
      qualquer modalidade, limpa a resposta, conta como erro e libera
      nova tentativa sem vidas/penalidade visível (US1 cenário 5, D-06,
      Princípio II da constituição) em
      `app/test/integration/erro_nao_pune_test`
- [ ] T026 [P] [US1] Teste de integração: microfone sem permissão em
      Leitura · voz mostra o motivo real, nunca um erro genérico (US1
      cenário 7, FR-013) em
      `app/test/integration/microfone_indisponivel_test`

### Implementation for User Story 1

- [ ] T027 [P] [US1] Modelar `DesafioLeitura` (palavra/letra, nível,
      classificação(ões), marcador fonético opcional) em
      `app/lib/modelos/desafio_leitura`
- [ ] T028 [US1] Implementar `avaliacao_leitura`: tolerância fonética sobre
      a saída do STT (depende de T002 — motor de STT escolhido) — faz
      T020 passar — em `app/lib/servicos/avaliacao_leitura` (D-08, D-09)
- [ ] T029 [US1] Implementar tela de desafio — Ditado (áudio automático +
      repetição, escolha entre 4 letras nível 1 / montagem sem palavra
      visível níveis 2+) — faz T023 passar — em
      `app/lib/telas/rodada/ditado`
- [ ] T030 [US1] Implementar tela de desafio — Leitura · montar (palavra
      aparece e some sozinha — D-18, sem som, montagem com letras
      embaralhadas) — faz T024 passar — em
      `app/lib/telas/rodada/leitura_montar`
- [ ] T031 [US1] Implementar tela de desafio — Leitura · voz (palavra
      visível, app calado, captura de microfone, mostra o que entendeu) em
      `app/lib/telas/rodada/leitura_voz`
- [ ] T032 [US1] Implementar tela de resultado da rodada (estrelas,
      acertos/erros/precisão, contador de ajuda da modalidade) — faz
      T022 passar — em `app/lib/telas/resultado`, reusando T018
- [ ] T033 [US1] Ligar detecção de microfone indisponível (T017) à tela de
      Leitura · voz com mensagem de motivo real — faz T026 passar —
      (FR-013)
- [ ] T033a [US1] Ligar tratamento de erro (limpa resposta, conta erro,
      nova tentativa) nas três telas de desafio — faz T025 passar —
      (Princípio II)

**Checkpoint**: US1 funcional e testável sozinha — MVP jogável em leitura,
com o princípio supremo e o princípio "erro não pune" verificados por
teste, não só por revisão visual.

---

## Phase 4: User Story 2 - Resolver rodada de matemática (P2)

**Goal**: criança resolve desafios de matemática (conta pura ou problema
contextualizado).

**Independent Test**: configurar tipo "matemática", jogar uma rodada em
cada forma.

### Tests for User Story 2 ⚠️

- [ ] T034 [P] [US2] Teste unitário: gerador de alternativas nunca produz
      negativo nem repetição, mantém proximidade (doc001 §4) em
      `app/test/unit/gerador_matematica_test`
- [ ] T035 [P] [US2] Teste unitário: problema contextualizado de subtração
      nunca gera resultado negativo (FR-009) em
      `app/test/unit/problema_contextualizado_test`
- [ ] T036 [P] [US2] Teste unitário: o enunciado sorteia entre 2-3
      variações fixas por operação, e a variação não muda com o nível
      (D-36, FR-008) em `app/test/unit/variacao_frase_test`

### Implementation for User Story 2

- [ ] T037 [P] [US2] Modelar `DesafioMatematica` (operação, operandos,
      resultado, forma, tema quando contextualizada, alternativas) em
      `app/lib/modelos/desafio_matematica`
- [ ] T038 [US2] Implementar `gerador_matematica` (conta pura, 5 níveis de
      operação) — faz T034 passar — em `app/lib/servicos/gerador_matematica`
      (depende de T037)
- [ ] T039 [US2] Implementar `problema_contextualizado` (enunciado por
      tema/classificação, objetos visuais, fala automática, sorteio de
      variação) — faz T035 e T036 passarem — em
      `app/lib/servicos/problema_contextualizado` (D-23, D-24, D-36;
      depende de T014 para o tema)
- [ ] T040 [US2] Implementar tela de desafio de matemática (conta falada,
      botão de repetir, 4 alternativas) em `app/lib/telas/rodada/matematica`,
      reusando T032 para o resultado

**Checkpoint**: US1 + US2 funcionam juntas e independentemente.

---

## Phase 5: User Story 3 - Configurar a rodada (P3)

**Goal**: adulto escolhe tipo, modalidade, nível, classificação, forma de
matemática, tamanho, formato (sozinho/dupla) e voz antes de começar.

**Independent Test**: alterar configuração, iniciar, confirmar que a rodada
seguinte respeita as escolhas.

### Tests for User Story 3 ⚠️

- [ ] T041 [P] [US3] Teste de integração: combinação nível×classificação
      sem conteúdo suficiente não aparece selecionável (US3 cenário 2,
      FR-011) em `app/test/integration/configuracao_conteudo_test`
- [ ] T042 [P] [US3] Teste de integração: iniciar sem alterar nada usa
      valores padrão válidos (US3 cenário 1, FR-012) em
      `app/test/integration/configuracao_padrao_test`
- [ ] T043 [P] [US3] Teste de integração: sem permissão de microfone, a
      opção "Leitura · voz" aparece desabilitada com o motivo visível
      (US3 cenário 3, FR-013) em
      `app/test/integration/config_mic_desabilitado_test`
- [ ] T044 [P] [US3] Teste de integração: sem nenhuma voz pt instalada, o
      app informa e orienta a instalação, sem falhar silenciosamente (US3
      cenário 4, CU-07) em `app/test/integration/config_sem_voz_test`
- [ ] T045 [P] [US3] Teste de integração: a última voz escolhida aparece
      pré-selecionada ao reabrir a configuração (US3 cenário 5) em
      `app/test/integration/config_ultima_voz_test`

### Implementation for User Story 3

- [ ] T046 [P] [US3] Implementar `configuracao` (preferências persistidas:
      última voz, nome/fonema, últimos nível/classificação/tamanho/
      modalidade) — faz T045 passar — em `app/lib/servicos/configuracao`
- [ ] T047 [US3] Implementar tela de configuração da rodada (tipo,
      modalidade, nível, classificação, forma de matemática, tamanho,
      sozinho/dupla) — faz T041 e T042 passarem — em
      `app/lib/telas/configuracao`, ligada a T014/T046
- [ ] T048 [US3] Implementar tela de escolha e teste de voz (lista de vozes
      pt do aparelho, destaque de melhor qualidade, teste com toque) —
      faz T043 e T044 passarem — em `app/lib/telas/escolha_de_voz`,
      ligada a T016/T017 (CU-07)
- [ ] T049 [US3] Implementar seleção de "nome da letra" vs. "som da letra"
      (padrão fonema) em `app/lib/telas/configuracao` (D-26, FR-021)

**Checkpoint**: US1+US2+US3 funcionam juntas — rodada totalmente
configurável, com defaults ainda válidos, e todo caso de indisponibilidade
de recurso (mic/voz) coberto por teste, não só implementado.

---

## Phase 6: User Story 4 - Consultar o histórico (P4)

**Goal**: adulto vê resumo e lista das últimas 50 rodadas por perfil.

**Independent Test**: jogar 3 rodadas variadas, abrir histórico, conferir
os campos e o cálculo por perfil.

### Tests for User Story 4 ⚠️

- [ ] T050 [P] [US4] Teste unitário: resumo geral (total, precisão média,
      média de estrelas) calculado por perfil, sem cruzar modalidades
      (US4 cenário 4) em `app/test/unit/resumo_historico_test`
- [ ] T051 [P] [US4] Teste de integração: antes da primeira rodada, o
      histórico mostra mensagem explicando que estará vazio, não uma tela
      em branco sem contexto (US4 cenário 1) em
      `app/test/integration/historico_vazio_test`
- [ ] T052 [P] [US4] Teste de integração: apagar o histórico exige
      confirmação antes de executar (US4 cenário 3, CU-06) em
      `app/test/integration/historico_exclusao_confirma_test`

### Implementation for User Story 4

- [ ] T053 [US4] Implementar tela de histórico (lista mais recente→mais
      antiga, resumo geral, mensagem de vazio antes da 1ª rodada) — faz
      T050 e T051 passarem — em `app/lib/telas/historico`, ligada a T015
- [ ] T054 [US4] Implementar exclusão do histórico com confirmação — faz
      T052 passar — em `app/lib/telas/historico` (CU-06)

**Checkpoint**: histórico completo e correto para uso sozinho e futuro modo
dupla.

---

## Phase 7: User Story 5 - Jogar em dupla (P5)

**Goal**: duas crianças jogam rodadas individuais sequenciais com config
idêntica; resultado combinado cooperativo ou adversarial.

**Independent Test**: selecionar dupla, 2 perfis, jogar as duas rodadas,
ver os dois formatos de resultado combinado.

### Tests for User Story 5 ⚠️

- [ ] T055 [P] [US5] Teste de integração: rodada dupla incompleta (uma
      criança sai no meio) não entra no histórico comparativo (US5
      cenário 5, FR-018) em `app/test/integration/dupla_incompleta_test`
- [ ] T056 [P] [US5] Teste de integração: config idêntica é aplicada às
      duas rodadas da dupla (US5 cenário 6, D-33) em
      `app/test/integration/dupla_config_identica_test`
- [ ] T057 [P] [US5] Teste de integração: o adulto precisa escolher
      explicitamente cooperativo ou adversarial — nenhum formato é padrão
      implícito (US5 cenário 1, D-31) em
      `app/test/integration/dupla_formato_explicito_test`
- [ ] T058 [P] [US5] Teste de integração: a tela "passa o aparelho"
      impede a criança 1 de continuar jogando no lugar da criança 2 (US5
      cenário 2) em `app/test/integration/dupla_transicao_test`
- [ ] T059 [P] [US5] Teste de integração: resultado combinado mostra
      total somado + individual lado a lado no cooperativo, e os dois
      resultados lado a lado com destaque no adversarial (US5 cenário 3)
      em `app/test/integration/dupla_resultado_combinado_test`
- [ ] T060 [P] [US5] Teste de integração: no adversarial, a mensagem para
      quem teve menos segue a regra "nunca depreciativa" (US5 cenário 4,
      mesma regra de T025) em
      `app/test/integration/dupla_mensagem_nao_depreciativa_test`

### Implementation for User Story 5

- [ ] T061 [P] [US5] Implementar seleção/criação de perfil (nome + cor,
      cadastro mínimo) em `app/lib/telas/selecao_perfil`, ligada a T012
      (D-32 — seletor aparece com >1 perfil ou ao entrar em "dupla")
- [ ] T062 [US5] Implementar fluxo de dupla: escolha de formato
      (cooperativo/adversarial), 2 perfis, rodada 1 → tela "passa o
      aparelho" → rodada 2, reusando as telas de US1/US2 sem alteração —
      faz T057 e T058 passarem — em `app/lib/telas/dupla` (D-30)
- [ ] T063 [US5] Implementar tela de resultado combinado — cooperativo
      (soma + individual lado a lado) e adversarial (lado a lado com
      destaque, mensagem nunca depreciativa) — faz T059 e T060 passarem —
      em `app/lib/telas/resultado_dupla`, reusando T032
- [ ] T064 [US5] Persistir rodada dupla no histórico com os dois perfis
      vinculados e a flag de completude por perfil — faz T055 e T056
      passarem — (FR-018), ligada a T015

**Checkpoint**: todas as 5 user stories funcionam, cada uma isoladamente
testável, e **todo** *Acceptance Scenario* do `spec.md` tem uma tarefa de
teste correspondente.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T065 [P] Revisar todas as telas contra o Princípio VI da
      constituição, com checklist explícito por tela: (a) toda ação
      principal é um único toque, (b) nenhum gesto composto/ensinado,
      (c) o ícone sozinho basta pra criança entender a ação, sem depender
      do texto — antes do primeiro teste com criança real
- [ ] T066 [P] Gravar e integrar os ~52 clipes de letras/fonemas (nome +
      som) em `app/lib/audio/` (D-27)
- [ ] T067 Carregar e validar o banco de palavras inicial em
      `app/conteudo/` contra as 6 classificações confirmadas (D-34 —
      animais, comida, casa, corpo, natureza, ações), com **mínimo de 12
      palavras** por combinação nível×classificação exposta — roda T006 e
      T008 contra o conteúdo real, não mais só contra fixture de teste
      (D-35, FR-011)
- [ ] T068 Sessão de observação com criança real seguindo `doc/
      definições001.MD` §10 + `doc/definições002.MD` §10 (perguntas 1-10),
      medindo SC-001 a SC-006 de `spec.md`
- [ ] T069 Registrar resultado da sessão de observação e decidir A-06/A-09/
      A-10 remanescentes em `doc/definições003.MD` (consolidação prevista
      em `doc/definições002.MD`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Fase 1)** → **Foundational (Fase 2)** bloqueia todas as user
  stories.
- **US1 (P1)** é o MVP mínimo demonstrável; **US2–US5** podem seguir em
  paralelo depois da Fase 2, mas a ordem de prioridade recomendada é
  P1 → P2 → P3 → P4 → P5, pois cada uma reaproveita a anterior (US3
  configura o que US1/US2 já jogam com default; US5 reaproveita US1/US2
  inteiras).
- **US5** depende do modelo de `Perfil` multi-perfil (T012) e das telas de
  US1/US2 já existirem, mas não depende de US3 nem US4 em código — apenas
  reaproveita a mesma tela de resultado (T032).

### Cobertura de teste × Acceptance Scenarios (auditoria)

| User Story | Cenários no spec.md | Tarefas de teste |
|---|---|---|
| Foundational (sem US própria no spec, mas com contrato/regra testável) | — | T006–T011 |
| US1 | 7 | T019–T026 (7 tarefas cobrindo os 7 cenários) |
| US2 | 4 | T034–T036 (regras de geração; cenários 1/2 cobertos via T029/T030/T040 de UI + unit acima) |
| US3 | 5 | T041–T045 (5 tarefas cobrindo os 5 cenários) |
| US4 | 4 | T050–T052 (cenário 2 coberto por T050) |
| US5 | 6 | T055–T060 (6 tarefas cobrindo os 6 cenários) |

Nenhum *Acceptance Scenario* do `spec.md` ficou sem tarefa de teste
correspondente nesta revisão.

## Notes

- [P] = arquivos diferentes, sem dependência
- Testes marcados ⚠️ devem ser escritos e falhar antes da implementação
  correspondente
- Cada checkpoint de user story é um ponto válido para parar, demonstrar e
  validar com o dono do produto antes de seguir
- Anotações "faz TXXX passar" apontam de volta pro teste que a tarefa de
  implementação precisa deixar verde — não é decoração, é rastreabilidade
