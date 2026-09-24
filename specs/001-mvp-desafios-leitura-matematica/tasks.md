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

- [x] T001 Decidir e registrar o framework — **React Native + Expo +
      TypeScript**, ver [`research.md`](./research.md) (revisado em
      2026-09-13, trocado de Flutter pela familiaridade de quem constrói);
      `plan.md` atualizado, sem mais NEEDS CLARIFICATION em Language/Version
- [x] T002 **FECHADO por agora (2026-09-22)** — Rodar o spike de STT
      (`spike-stt/testar.py`) com os 14 áudios gravados e registrar o
      resultado em `research.md`. Spike concluído: 19 rodadas, todas as
      avenidas testáveis sem dispositivo real esgotadas (motores, ajuste
      de vocabulário, 4 métodos de comparação, ASR fonético nativo).
      Fechado como investigação, **não como "problema resolvido"** — o
      resultado fica **abaixo do critério de aceite** e a decisão de
      produto sobre isso segue em aberto (ver abaixo). **Status final
      (2026-09-22, rodada 19 — 19 rodadas ao todo)**: **62-81%** (faixa,
      não ponto único — variância execução-a-execução do Whisper,
      achado da rodada 16) (Whisper small/medium/large-v3, com
      vocabulário no prompt, tolerância fonética + Damerau-Levenshtein;
      `thefuzz`/`fuzz.ratio`, fonetizador externo e ASR fonético nativo
      (`wav2vec2-lv-60-espeak-cv-ft`, rodada 19 — 35%, bem pior, e sem
      mecanismo de vocabulário no prompt) testados e descartados, piores
      que o método atual) contra voz de **criança real** em alfabetização
      (não adulto — todas as rodadas sempre foram com a criança; erro de
      registro em versões anteriores desta linha, corrigido). Vosk
      descartado (10-19%, vocabulário base insuficiente pro idioma do
      banco). Abaixo do critério de aceite (≥80%) em todos os motores
      testáveis sem dispositivo real. **Única pendência real restante**:
      medir latência + testar STT nativo Android (`SpeechRecognizer`,
      modo on-device) — exige Android SDK/emulador, **adiado pro T003**
      (mesmo setup serve pros dois, decisão do dono do projeto em
      2026-09-21). Ver research.md §T002 (rodadas 1-19) pra timeline e
      análise completas. **Critério de aceite**: não cumprido nos motores
      offline embarcáveis testados até aqui; decisão de produto pendente
      sobre se 62-81% é aceitável pro MVP. **Pendências que sobrevivem ao
      fechamento do spike** (não bloqueiam T003 em diante): (1) medir
      latência real + testar STT nativo Android — retomar quando o T003
      montar o ambiente Android; (2) decisão do dono do produto sobre
      aceitar 62-81% pro MVP ou revisar D-08/D-09/obrigatoriedade de
      Leitura · voz — não técnica, pode acontecer a qualquer momento
- [x] T003 Criar a estrutura de projeto conforme `plan.md` §Project
      Structure (`app/src/`, `app/assets/conteudo/`, `app/src/__tests__/`,
      `app/e2e/`). **Concluído (2026-09-23)**: `npx create-expo-app@latest
      app --template blank-typescript` (SDK Expo 57, TypeScript, React
      Native 0.86.3); `expo-speech`, `expo-audio`, `expo-sqlite`
      instalados via `expo install`. Banco de conteúdo movido de
      `conteudo/` pra `app/assets/conteudo/` (destino final planejado em
      `conteudo/README.md`, agora `app/assets/conteudo/README.md`).
      Removido `LICENSE` gerado pelo template (copyright da Expo/650
      Industries, incompatível com "licença ainda não definida" do
      `README.md` raiz). Achado importante: `react-native-vosk` não é
      mais a escolha de motor de STT — T002 fechou com Whisper vencendo;
      o binding RN a usar é `whisper.rn` (checado no ecossistema agora,
      ativo — research.md §"Consequência arquitetural" atualizado).
- [x] T004 [P] Configurar lint/format do framework escolhido.
      **Concluído (2026-09-23)**: `npx expo lint` gerou `eslint.config.js`
      (`eslint-config-expo`, flat config); Prettier instalado à parte
      (`.prettierrc.json`, `npm run format`/`format:check`).
      `.prettierignore` protege `assets/conteudo/*.json` e seu README —
      são dado curado à mão (1 item por linha, A-06), não deixar o
      Prettier explodir em multi-linha.
- [x] T005 [P] Configurar runner de testes (unit/integration/contract) do
      framework escolhido. **Concluído (2026-09-23)**: Jest via
      `jest-expo` (preset em `package.json`), `@testing-library/react-native`
      instalado, `tsconfig.json` com `"types": ["jest"]`. `npx jest
      --passWithNoTests` roda limpo (0 testes ainda — T006+ escrevem os
      primeiros). Maestro (E2E) ainda não instalado — só entra quando
      houver tela pra testar (Phase 3+).

**Checkpoint**: projeto roda vazio, lint e testes configurados. ✅
(`npx tsc --noEmit` limpo, `npx eslint .` limpo, `npx jest
--passWithNoTests` limpo — 2026-09-23)

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: nenhuma user story começa antes desta fase.

### Tests for Foundational ⚠️

> **NOTE**: escrever e ver falhar antes de implementar. Esta seção não
> existia na primeira versão do `tasks.md` — a fundação (modelos e
> serviços de base) estava sem teste próprio, cobrindo `T008`
> (validação de conteúdo) só de forma indireta, três fases depois.

- [x] T006 [P] Teste de contrato: `app/assets/conteudo/leitura.json`
      valida contra `contracts/item-leitura.schema.json` em
      `app/src/__tests__/contract/item_leitura_schema_test`. **Concluído
      (2026-09-24)** via `ajv`; achado no processo: o schema tinha um
      aviso de strict-mode (if-condition sem `type` explícito) — corrigido
      no próprio `item-leitura.schema.json`, sem mudar semântica.
- [x] T007 [P] Teste de contrato: `app/assets/conteudo/matematica_temas.json`
      valida contra `contracts/tema-matematica.schema.json` em
      `app/src/__tests__/contract/tema_matematica_schema_test`. **Concluído
      (2026-09-24)**.
- [x] T008 [P] Teste unitário: `banco_de_conteudo` rejeita/oculta uma
      combinação nível×classificação com **menos de 12** itens (FR-011,
      D-35) em `app/src/__tests__/unit/banco_de_conteudo_test`.
      **Concluído (2026-09-24)** — testado com fixture isolada (não o
      banco real, pra não depender da revisão pedagógica em aberto, A-06)
      mais 1 caso de integração confirmando que o banco real carrega.
- [x] T009 [P] Teste unitário: `historico` aplica a retenção de 50
      rodadas por perfil — ao inserir a 51ª rodada **concluída**, a mais
      antiga é removida (FR-015) em
      `app/src/__tests__/unit/historico_retencao_test`. **Concluído
      (2026-09-24)** — testa a regra pura (`historico/regras.ts`), não o
      `expo-sqlite` (módulo nativo, não roda em Jest).
- [x] T010 [P] Teste unitário: detecção de capacidade do aparelho retorna
      "desabilitado com motivo" quando microfone/voz pt está indisponível
      (mock de plataforma) (Princípio I/III da constituição, FR-013) em
      `app/src/__tests__/unit/capacidade_aparelho_test`. **Concluído
      (2026-09-24)** — `jest.mock('expo-speech')`/`jest.mock('expo-audio')`
      controlando os retornos por caso.
- [x] T011 [P] Teste unitário: cálculo de precisão/estrelas
      (`acertos ÷ tentativas totais`, meia estrela de granularidade,
      nunca cruzando modalidades) (D-06, D-20, FR-007) em
      `app/src/__tests__/unit/avaliacao_test`. **Concluído (2026-09-24)**.

### Implementation for Foundational

- [x] T012 Modelar `Perfil` (id, nome, cor/avatar) em
      `app/src/models/perfil` — sempre multi-perfil no modelo, mesmo com
      valor único `"padrao"` usado no MVP (D-25, FR-014). **Concluído
      (2026-09-24)**.
- [x] T013 Modelar `RegistroHistorico` (data/hora, tipo, nível,
      classificação, modalidade, acertos, erros, precisão, estrelas,
      contador de ajuda, perfil(is), concluída?) em
      `app/src/models/registro_historico`. **Concluído (2026-09-24)**.
- [x] T014 [P] Implementar `banco_de_conteudo`: carregar a grade
      nível×classificação de `app/assets/conteudo/`, com validação de que toda
      combinação exposta tem ≥ 12 palavras (FR-010, FR-011) — faz T006,
      T007 e T008 passarem — em `app/src/services/banco_de_conteudo`.
      **Concluído (2026-09-24)**.
- [x] T015 [P] Implementar `historico` (serviço de persistência local: até
      50 rodadas por perfil, retenção, exclusão com confirmação) — faz
      T009 passar — em `app/src/services/historico` (FR-015). **Concluído
      (2026-09-24)** via `expo-sqlite` (API async moderna,
      `openDatabaseAsync`/`runAsync`/`getAllAsync`). Exclusão implementada
      sem o passo de confirmação em si — isso é UI (Fase 3+), o serviço só
      executa a exclusão já confirmada.
- [x] T016 [P] Implementar `tts` (serviço de fala: síntese do aparelho para
      palavra/frase/enunciado; reprodução dos ~52 clipes gravados para
      letra/fonema) em `app/src/services/tts` (D-27, FR-020). **Concluído
      parcialmente (2026-09-24)**: `falar()`/`pararFala()` via
      `expo-speech` completos; `tocarClipe()` via `expo-audio`
      (`createAudioPlayer`) implementado mas recebe o **mapa de clipes por
      fora** — os ~52 arquivos gravados ainda não existem em
      `app/assets/audio/` (só o `.gitkeep`), e Metro exige `require()`
      estático por arquivo, não dá pra montar o caminho em tempo de
      execução. Montar o mapa de verdade é tarefa de conteúdo, não deste
      serviço.
- [x] T017 Implementar detecção de capacidade do aparelho (microfone
      disponível/permitido, vozes pt instaladas) com motivo legível,
      reutilizada por qualquer tela que precise desabilitar uma opção —
      faz T010 passar — (Princípio I/III da constituição, FR-013).
      **Concluído (2026-09-24)** — checa (`getRecordingPermissionsAsync`),
      nunca pede (`requestRecordingPermissionsAsync` fica pra tela de
      Leitura·voz, no momento real de uso).
- [x] T018 Implementar cálculo de precisão/estrelas — faz T011 passar —
      em `app/src/services/avaliacao` (D-06, D-20, FR-007). **Concluído
      (2026-09-24)**.

**Checkpoint**: fundação pronta, com teste próprio passando — user
stories podem começar. ✅ (2026-09-24) `npx jest` 24/24, `npx tsc --noEmit`
limpo, `npx eslint .` limpo.

---

## Phase 3: User Story 1 - Resolver rodada de leitura nas 3 modalidades (P1) 🎯 MVP

**Goal**: criança completa uma rodada de leitura em Ditado, Leitura ·
montar ou Leitura · voz, com resultado honesto ao final.

**Independent Test**: iniciar sem configurar, jogar uma rodada em cada
modalidade, chegar à tela de estrelas.

### Tests for User Story 1 ⚠️

- [x] T019 [P] [US1] Teste unitário: geração de 4 alternativas de letra sem
      repetição em `app/src/__tests__/unit/alternativas_letra_test`.
      **Concluído (2026-09-24)** — não há regra de "próxima da correta"
      documentada pra letras (a regra do doc001 §4 é especificamente de
      matemática); implementado como sorteio sem repetição a partir de um
      pool de candidatas injetável.
- [x] T020 [P] [US1] Teste unitário: tolerância fonética aceita variação de
      pronúncia e rejeita troca do som inicial (D-09) em
      `app/src/__tests__/unit/tolerancia_fonetica_test`. **Concluído
      (2026-09-24)** — porta fiel dos 19 casos adversariais de
      `spike-stt/testar_tolerancia.py`, não reescrita.
- [x] T020a [P] [US1] Teste unitário: leitura soletrada/pausada dentro da
      palavra (ex. transcrição fragmentada `"ga"` + `"to"`) é aceita como
      acerto — comparação ignora pausa/duração, só concatena e compara
      conteúdo fonético (US1 cenário 8, D-37) em
      `app/src/__tests__/unit/tolerancia_pausa_test`. **Concluído
      (2026-09-24)**.
- [ ] T021 [P] [US1] Teste de integração: troca automática para Leitura ·
      montar após 2 falhas em Leitura · voz (D-10) em
      `app/e2e/troca_modalidade.yaml`
- [ ] T022 [P] [US1] Teste de integração: contador de ajuda correto por
      modalidade (repetições/espiadas/tentativas) aparece no resultado
      (D-19) em `app/e2e/contador_ajuda.yaml`
- [ ] T023 [P] [US1] Teste de integração: Ditado **nunca** exibe a
      letra/palavra escrita na tela, em nenhum nível — só fala (US1
      cenário 1, princípio supremo da constituição) em
      `app/e2e/ditado_nunca_mostra.yaml`
- [ ] T024 [P] [US1] Teste de integração: em Leitura · montar a palavra
      aparece e **some sozinha**, sem áudio algum, e a espiada é contada a
      cada revelação (US1 cenário 2, D-18) em
      `app/e2e/leitura_montar_some.yaml`
- [ ] T025 [P] [US1] Teste de integração: uma resposta errada, em
      qualquer modalidade, limpa a resposta, conta como erro e libera
      nova tentativa sem vidas/penalidade visível (US1 cenário 5, D-06,
      Princípio II da constituição) em
      `app/e2e/erro_nao_pune.yaml`
- [ ] T026 [P] [US1] Teste de integração: microfone sem permissão em
      Leitura · voz mostra o motivo real, nunca um erro genérico (US1
      cenário 7, FR-013) em
      `app/e2e/microfone_indisponivel.yaml`

### Implementation for User Story 1

- [x] T027 [P] [US1] Modelar `DesafioLeitura` (palavra/letra, nível,
      classificação(ões), marcador fonético opcional) em
      `app/src/models/desafio_leitura`. **Concluído (2026-09-24)** —
      diferença de `ItemLeitura` (registro estático do banco): carrega
      `modalidade` (spec.md Key Entities — a instância jogada numa
      rodada, não o registro do banco em si).
- [ ] T028 [US1] Implementar `avaliacao_leitura`: tolerância fonética sobre
      a saída do STT (depende de T002 — motor de STT escolhido); remove
      qualquer pontuação que o motor insira pra marcar pausa/hesitação
      (vírgula, ponto, interrogação — não só nas bordas, em qualquer
      posição), concatena fragmentos antes de comparar, e aceita distância
      de edição pequena (≤1, a calibrar) **com trava dura**: o primeiro
      som/letra precisa bater exatamente, nunca entra na tolerância —
      opera D-09 concretamente ("pato" nunca passa como "gato", distâncias
      diferentes ou não). Nunca usa duração/pausa como critério — faz T020
      e T020a passarem — em `app/src/services/avaliacao_leitura` (D-08,
      D-09, D-37; achados do spike rodadas 6-7, research.md §T002 — uma
      limpeza incompleta de pontuação mascarou 2 acertos, tolerância
      fonética real levou large-v3 de 57% pra 64%; trava validada contra
      8 casos adversariais em `spike-stt/testar_tolerancia.py` — 8/8.
      Reusar essa mesma lógica/casos como base de T020a, não reescrever.
      **Também**: passar o vocabulário da combinação nível×classificação
      da rodada como `initial_prompt`/hint do motor de STT (rodada 8 do
      spike — reconhecimento com vocabulário restrito, técnica padrão,
      não "colar a resposta"). **Número validado (rodada 10, com
      metodologia correta): ~70%**, não os 86% das rodadas 8-9 (que usavam
      lista de prompt arbitrária, não realista — não confiar nesse número).
      **Comparação NÃO é fonética de verdade, é ortográfica** (distância de
      edição sobre as letras da transcrição) — achado da rodada 12
      (research.md §T002): isso escondia 2 bugs reais que fariam D-09
      furar na prática — "c"/"g" mudam de som conforme a vogal seguinte em
      português ("gato" ≠ "gelo" foneticamente, mesma letra), e mesmo com
      fonema certo, distância ≤1 deixava palavra real trocar por outra
      ("gato"/"galo", "cama"/"casa"). **Requisitos que T028 precisa
      herdar de `spike-stt/testar.py` (não reinventar)**:
      `_classe_fonema_inicial()` (trava por classe de fonema aproximada,
      não letra crua) e o parâmetro `vocabulario_conhecido` (nunca aceita
      um candidato que seja, ele mesmo, outra palavra real e diferente do
      banco carregado por T014) — sem os dois, a trava de D-09 furava
      contra o próprio banco de conteúdo (272 itens revarridos, zero
      colisão depois do fix). **Também**: usar distância Damerau-
      Levenshtein (transposição de 2 letras adjacentes = 1 edição, não 2
      — recupera casos reais como "perna" transcrito "prena") em vez de
      Levenshtein simples — ganho pequeno mas seguro, revalidado contra o
      banco inteiro sem abrir colisão nova (rodada 15).
      `spike-stt/testar_tolerancia.py` tem 19 casos de regressão — reusar
      como base de T020a, não reescrever). **Concluído (2026-09-24)** —
      `app/src/services/avaliacao_leitura`: porta fiel de
      `normalizar`/`distanciaLevenshtein`/`distanciaDamerauLevenshtein`/
      `classeFonemaInicial`/`bateComToleranciaFonetica` do
      `spike-stt/testar.py`, mais `avaliarLeitura()` (pipeline completo,
      Damerau por padrão) e `construirPromptVocabulario()`. **Escopo real
      entregue vs. pendente**: a lógica de comparação está completa e
      testada (T020/T020a, 24 casos). A chamada de verdade ao motor de
      STT (`whisper.rn`, ainda não instalado — precisa de `expo prebuild`
      porque não roda no Expo Go) fica pra T031 (tela de Leitura·voz),
      que é quem de fato tem o áudio do microfone pra mandar pro motor.
- [ ] T029 [US1] Implementar tela de desafio — Ditado (áudio automático +
      repetição, escolha entre 4 letras nível 1 / montagem sem palavra
      visível níveis 2+) — faz T023 passar — em
      `app/src/screens/rodada/ditado`
- [ ] T030 [US1] Implementar tela de desafio — Leitura · montar (palavra
      aparece e some sozinha — D-18, sem som, montagem com letras
      embaralhadas) — faz T024 passar — em
      `app/src/screens/rodada/leitura_montar`
- [ ] T031 [US1] Implementar tela de desafio — Leitura · voz (palavra
      visível, app calado, captura de microfone, mostra o que entendeu;
      gravação para por toque explícito ou timeout longo — nunca por VAD
      agressivo/pausa curta, D-37) em `app/src/screens/rodada/leitura_voz`
- [ ] T032 [US1] Implementar tela de resultado da rodada (estrelas,
      acertos/erros/precisão, contador de ajuda da modalidade) — faz
      T022 passar — em `app/src/screens/resultado`, reusando T018
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
      `app/src/__tests__/unit/gerador_matematica_test`
- [ ] T035 [P] [US2] Teste unitário: problema contextualizado de subtração
      nunca gera resultado negativo (FR-009) em
      `app/src/__tests__/unit/problema_contextualizado_test`
- [ ] T036 [P] [US2] Teste unitário: o enunciado sorteia entre 2-3
      variações fixas por operação, e a variação não muda com o nível
      (D-36, FR-008) em `app/src/__tests__/unit/variacao_frase_test`

### Implementation for User Story 2

- [ ] T037 [P] [US2] Modelar `DesafioMatematica` (operação, operandos,
      resultado, forma, tema quando contextualizada, alternativas) em
      `app/src/models/desafio_matematica`
- [ ] T038 [US2] Implementar `gerador_matematica` (conta pura, 5 níveis de
      operação) — faz T034 passar — em `app/src/services/gerador_matematica`
      (depende de T037)
- [ ] T039 [US2] Implementar `problema_contextualizado` (enunciado por
      tema/classificação, objetos visuais, fala automática, sorteio de
      variação) — faz T035 e T036 passarem — em
      `app/src/services/problema_contextualizado` (D-23, D-24, D-36;
      depende de T014 para o tema)
- [ ] T040 [US2] Implementar tela de desafio de matemática (conta falada,
      botão de repetir, 4 alternativas) em `app/src/screens/rodada/matematica`,
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
      FR-011) em `app/e2e/configuracao_conteudo.yaml`
- [ ] T042 [P] [US3] Teste de integração: iniciar sem alterar nada usa
      valores padrão válidos (US3 cenário 1, FR-012) em
      `app/e2e/configuracao_padrao.yaml`
- [ ] T043 [P] [US3] Teste de integração: sem permissão de microfone, a
      opção "Leitura · voz" aparece desabilitada com o motivo visível
      (US3 cenário 3, FR-013) em
      `app/e2e/config_mic_desabilitado.yaml`
- [ ] T044 [P] [US3] Teste de integração: sem nenhuma voz pt instalada, o
      app informa e orienta a instalação, sem falhar silenciosamente (US3
      cenário 4, CU-07) em `app/e2e/config_sem_voz.yaml`
- [ ] T045 [P] [US3] Teste de integração: a última voz escolhida aparece
      pré-selecionada ao reabrir a configuração (US3 cenário 5) em
      `app/e2e/config_ultima_voz.yaml`

### Implementation for User Story 3

- [ ] T046 [P] [US3] Implementar `configuracao` (preferências persistidas:
      última voz, nome/fonema, últimos nível/classificação/tamanho/
      modalidade) — faz T045 passar — em `app/src/services/configuracao`
- [ ] T047 [US3] Implementar tela de configuração da rodada (tipo,
      modalidade, nível, classificação, forma de matemática, tamanho,
      sozinho/dupla) — faz T041 e T042 passarem — em
      `app/src/screens/configuracao`, ligada a T014/T046
- [ ] T048 [US3] Implementar tela de escolha e teste de voz (lista de vozes
      pt do aparelho, destaque de melhor qualidade, teste com toque) —
      faz T043 e T044 passarem — em `app/src/screens/escolha_de_voz`,
      ligada a T016/T017 (CU-07)
- [ ] T049 [US3] Implementar seleção de "nome da letra" vs. "som da letra"
      (padrão fonema) em `app/src/screens/configuracao` (D-26, FR-021)

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
      (US4 cenário 4) em `app/src/__tests__/unit/resumo_historico_test`
- [ ] T051 [P] [US4] Teste de integração: antes da primeira rodada, o
      histórico mostra mensagem explicando que estará vazio, não uma tela
      em branco sem contexto (US4 cenário 1) em
      `app/e2e/historico_vazio.yaml`
- [ ] T052 [P] [US4] Teste de integração: apagar o histórico exige
      confirmação antes de executar (US4 cenário 3, CU-06) em
      `app/e2e/historico_exclusao_confirma.yaml`

### Implementation for User Story 4

- [ ] T053 [US4] Implementar tela de histórico (lista mais recente→mais
      antiga, resumo geral, mensagem de vazio antes da 1ª rodada) — faz
      T050 e T051 passarem — em `app/src/screens/historico`, ligada a T015
- [ ] T054 [US4] Implementar exclusão do histórico com confirmação — faz
      T052 passar — em `app/src/screens/historico` (CU-06)

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
      cenário 5, FR-018) em `app/e2e/dupla_incompleta.yaml`
- [ ] T056 [P] [US5] Teste de integração: config idêntica é aplicada às
      duas rodadas da dupla (US5 cenário 6, D-33) em
      `app/e2e/dupla_config_identica.yaml`
- [ ] T057 [P] [US5] Teste de integração: o adulto precisa escolher
      explicitamente cooperativo ou adversarial — nenhum formato é padrão
      implícito (US5 cenário 1, D-31) em
      `app/e2e/dupla_formato_explicito.yaml`
- [ ] T058 [P] [US5] Teste de integração: a tela "passa o aparelho"
      impede a criança 1 de continuar jogando no lugar da criança 2 (US5
      cenário 2) em `app/e2e/dupla_transicao.yaml`
- [ ] T059 [P] [US5] Teste de integração: resultado combinado mostra
      total somado + individual lado a lado no cooperativo, e os dois
      resultados lado a lado com destaque no adversarial (US5 cenário 3)
      em `app/e2e/dupla_resultado_combinado.yaml`
- [ ] T060 [P] [US5] Teste de integração: no adversarial, a mensagem para
      quem teve menos segue a regra "nunca depreciativa" (US5 cenário 4,
      mesma regra de T025) em
      `app/e2e/dupla_mensagem_nao_depreciativa.yaml`

### Implementation for User Story 5

- [ ] T061 [P] [US5] Implementar seleção/criação de perfil (nome + cor,
      cadastro mínimo) em `app/src/screens/selecao_perfil`, ligada a T012
      (D-32 — seletor aparece com >1 perfil ou ao entrar em "dupla")
- [ ] T062 [US5] Implementar fluxo de dupla: escolha de formato
      (cooperativo/adversarial), 2 perfis, rodada 1 → tela "passa o
      aparelho" → rodada 2, reusando as telas de US1/US2 sem alteração —
      faz T057 e T058 passarem — em `app/src/screens/dupla` (D-30)
- [ ] T063 [US5] Implementar tela de resultado combinado — cooperativo
      (soma + individual lado a lado) e adversarial (lado a lado com
      destaque, mensagem nunca depreciativa) — faz T059 e T060 passarem —
      em `app/src/screens/resultado_dupla`, reusando T032
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
      som) em `app/assets/audio/` (D-27)
- [ ] T067 Carregar e validar o banco de palavras inicial em
      `app/assets/conteudo/` contra as 6 classificações confirmadas (D-34 —
      animais, comida, casa, corpo, natureza, ações), com **mínimo de 12
      palavras** por combinação nível×classificação exposta — roda T006 e
      T008 contra o conteúdo real, não mais só contra fixture de teste
      (D-35, FR-011)
- [ ] T068 Sessão de observação com criança real seguindo `doc/
      definições001.MD` §10 + `doc/definições002.MD` §10 (perguntas 1-10),
      medindo SC-001 a SC-006 de `spec.md`. **Nota sobre A-11**: as 15
      rodadas do spike de STT (`research.md` §T002) já foram gravadas com
      uma criança real em fase de alfabetização (não adulto simulando —
      correção de registro em 2026-09-21), então 62-76% já é o número
      real contra o usuário-alvo, não estimativa por proxy. Se der pra
      testar com **outra(s) criança(s)** nesta sessão, roda de novo contra
      `spike-stt/testar.py`/`fonetica.py` pra ganhar robustez estatística
      (n=1 hoje) — não é pré-requisito, é reforço
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
| US1 | 8 (cenário 8 adicionado 2026-09-15, D-37) | T019–T026 + T020a (8 tarefas cobrindo os 8 cenários) |
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
