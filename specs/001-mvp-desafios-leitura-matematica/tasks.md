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
- [x] T021 [P] [US1] **Revisado (2026-09-25) — D-10 revogado.** Não troca
      mais de modalidade automaticamente (dono do projeto: isso esconde
      o ponto que a criança precisa treinar, contra o Princípio IV — ver
      `doc/definições002.MD` §14, D-39). Agora: teste de integração pro
      botão "sair da rodada" sempre visível, em qualquer modalidade, sem
      trocar de tela sozinho (D-39) em `app/e2e/sair_da_rodada.yaml`.
      **Escrito, parcialmente implementado**: `BotaoSairRodada` (UI +
      callback) ligado nas 3 telas de desafio; a persistência de verdade
      como rodada não concluída depende do orquestrador de rodada, ainda
      não construído. E2E não executado (sem device/Maestro CLI).
- [x] T021b [P] [US1] Teste unitário: depois de 2+ erros somados numa
      rodada, `sugerirProximoNivel` sugere 1 nível abaixo (nunca abaixo
      de 1) — D-40 em `app/src/__tests__/unit/ajuste_dificuldade_test`.
      **Concluído (2026-09-25)**. Persistência em `configuracao.
      ultimo_nivel` depende de T046 (Fase 5/US3, ainda não construído) —
      aqui só a função pura, testável sem isso.
- [x] T022 [P] [US1] Teste de integração: contador de ajuda correto por
      modalidade (repetições/espiadas/tentativas) aparece no resultado
      (D-19) em `app/e2e/contador_ajuda.yaml`. **Escrito (2026-09-24)** —
      implementado em `TelaResultado` (T032). Não executado (sem
      device/Maestro CLI).
- [x] T023 [P] [US1] Teste de integração: Ditado **nunca** exibe a
      letra/palavra escrita na tela, em nenhum nível — só fala (US1
      cenário 1, princípio supremo da constituição) em
      `app/e2e/ditado_nunca_mostra.yaml`. **Escrito (2026-09-24)** —
      garantido estruturalmente por `MontagemPalavra` nunca renderizar a
      palavra como texto corrido. Não executado.
- [x] T024 [P] [US1] Teste de integração: em Leitura · montar a palavra
      aparece e **some sozinha**, sem áudio algum, e a espiada é contada a
      cada revelação (US1 cenário 2, D-18) em
      `app/e2e/leitura_montar_some.yaml`. **Escrito (2026-09-24)**. Não
      executado.
- [x] T025 [P] [US1] Teste de integração: uma resposta errada, em
      qualquer modalidade, limpa a resposta, conta como erro e libera
      nova tentativa sem vidas/penalidade visível (US1 cenário 5, D-06,
      Princípio II da constituição) em
      `app/e2e/erro_nao_pune.yaml`. **Escrito (2026-09-24)** — limitação
      documentada no próprio arquivo: `gerarAlternativasLetra` embaralha
      com RNG real (não seedado), então o script não consegue mirar
      deterministicamente "toque na errada"; cobre só a invariante
      verificável (nenhuma alternativa trava/some depois de um toque).
      Não executado.
- [x] T026 [P] [US1] Teste de integração: microfone sem permissão em
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
- [x] T028 [US1] Implementar `avaliacao_leitura`: tolerância fonética sobre
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
- [x] T029 [US1] Implementar tela de desafio — Ditado (áudio automático +
      repetição, escolha entre 4 letras nível 1 / montagem sem palavra
      visível níveis 2+) — faz T023 passar — em
      `app/src/screens/rodada/ditado`. **Concluído (2026-09-24)** — áudio
      injetado via prop `falar` (nível 1 usa clipe gravado, nível 2+ usa
      síntese; T016 documentou que os clipes ainda não existem como
      asset, então quem resolve isso é quem monta a tela, não o
      componente).
- [x] T030 [US1] Implementar tela de desafio — Leitura · montar (palavra
      aparece e some sozinha — D-18, sem som, montagem com letras
      embaralhadas) — faz T024 passar — em
      `app/src/screens/rodada/leitura_montar`. **Concluído (2026-09-24)**
      — a montagem (`MontagemPalavra`, componente compartilhado com o
      Ditado nível 2+) fica sempre montada por trás da revelação, só
      escondida, pra não perder o progresso já feito se a criança pedir
      "ver de novo" no meio da montagem.
- [x] T031 [US1] Implementar tela de desafio — Leitura · voz (palavra
      visível, app calado, captura de microfone, mostra o que entendeu;
      gravação para por toque explícito ou timeout longo — nunca por VAD
      agressivo/pausa curta, D-37) em `app/src/screens/rodada/leitura_voz`.
      **Concluído (2026-09-24)** — grava por toque explícito de
      início/fim (nunca segurar, Princípio VI). `iniciarGravacao`/
      `pararGravacao`/`transcrever` são injetados: `whisper.rn` não está
      instalado (T028), então a chamada real ao motor de STT ainda não
      existe — o componente só define a interface e usa
      `avaliacao_leitura.avaliarLeitura()` (já testado) pra decidir
      acerto/erro sobre o que a função injetada devolver.
- [x] T032 [US1] Implementar tela de resultado da rodada (estrelas,
      acertos/erros/precisão, contador de ajuda da modalidade) — faz
      T022 passar — em `app/src/screens/resultado`, reusando T018.
      **Concluído (2026-09-24)**.
- [x] T033 [US1] Ligar detecção de microfone indisponível (T017) à tela de
      Leitura · voz com mensagem de motivo real — faz T026 passar —
      (FR-013). **Concluído (2026-09-24)** — `TelaLeituraVoz` chama
      `capacidade_aparelho.verificarCapacidades()` ao carregar; se
      indisponível, mostra o motivo no lugar do botão do microfone
      (nunca esconde a opção, nunca erro genérico).
- [x] T033a [US1] Ligar tratamento de erro (limpa resposta, conta erro,
      nova tentativa) nas três telas de desafio — faz T025 passar —
      (Princípio II). **Concluído (2026-09-24)** — satisfeito
      estruturalmente pelas 3 telas: `MontagemPalavra` limpa a montagem
      e devolve os ladrilhos num toque errado (Ditado 2+/Leitura·montar);
      as 4 alternativas do Ditado nível 1 continuam tocáveis depois de
      qualquer toque (nada trava); Leitura·voz volta pro estado "parado"
      depois de uma tentativa, mic tocável de novo. Nenhuma das 3 tem
      mecânica de "vida"/bloqueio.
- [x] T033b [US1] **Nova (2026-09-25)** — orquestrador de rodada
      (`RodadaLeitura`, `app/src/screens/rodada/index.tsx`): sorteia os
      desafios (`sortearDesafios`, T014 estendido), escolhe a tela certa
      pra modalidade configurada (uma só por rodada — rodadas mistas com
      vários tipos de desafio ficaram pra depois, pedido do dono do
      projeto), acumula acertos/erros/ajuda da **rodada inteira**, não
      por desafio (D-19 — corrigido: as 3 telas de desafio guardavam o
      contador localmente e reiniciavam a cada desafio; agora expõem
      `onAjuda` pra quem orquestra acumular de verdade), e mostra
      `TelaResultado` ao final com a sugestão de D-40 quando aplicável.
      Teste de integração em `app/e2e/rodada_completa.yaml` (não
      executado). ~~**Pendência real, documentada**: não persiste nada em
      `historico` (T015)~~ **Fechada em 2026-09-25** (Fase 5, ver
      checkpoint de US1+US2+US3) — `RodadaLeitura` agora chama
      `historico.registrarRodada`.

**Checkpoint**: US1 funcional e testável sozinha — MVP jogável em leitura,
com o princípio supremo e o princípio "erro não pune" verificados por
teste, não só por revisão visual. **Status real (2026-09-25)**: as 4
telas de desafio (T029-T032), o orquestrador de rodada (T033b) e a
fundação (Fase 2) estão prontos e verificados (`tsc`, `eslint`, `jest`
61/61, e `npx expo export -p web` bundlando com sucesso via rotas de
desenvolvimento em `app/src/app/_dev/` — ainda não a tela inicial de
verdade, essa é da Fase 5/US3). "Iniciar sem configurar, jogar uma
rodada em cada modalidade, chegar à tela de estrelas" (Independent Test
da Fase 3) **agora é um fluxo real**, não só telas isoladas. D-10
(troca automática de modalidade) foi revogado (2026-09-25) e substituído
por D-39 (botão "sair da rodada" sempre visível) + D-40 (próxima rodada
1 nível abaixo depois de 2+ erros) — ver `doc/definições002.MD` §14.
**Lacunas reais que sobrevivem, não escondidas**: (1) o orquestrador não
persiste nada em `historico` (T015) — falta perfil/configuração vindos
de fora (T046, Fase 5) pra montar a `Rodada` completa antes de gravar;
o resultado só aparece na tela, não fica no histórico ainda. (2) a
persistência de D-40 em `configuracao.ultimo_nivel` depende do mesmo
T046 — só a função pura (`sugerirProximoNivel`, T021b) existe por ora.
(3) os testes de integração (T021-T026, T033b) foram escritos como
specs Maestro mas **nenhum foi executado** — sem Android SDK/emulador
nem Maestro CLI nesta máquina (mesma pendência de sempre, ver
research.md §T002 "1b").

---

## Phase 4: User Story 2 - Resolver rodada de matemática (P2)

**Goal**: criança resolve desafios de matemática (conta pura ou problema
contextualizado).

**Independent Test**: configurar tipo "matemática", jogar uma rodada em
cada forma.

### Tests for User Story 2 ⚠️

- [x] T034 [P] [US2] Teste unitário: gerador de alternativas nunca produz
      negativo nem repetição, mantém proximidade (doc001 §4) em
      `app/src/__tests__/unit/gerador_matematica_test`. **Concluído
      (2026-09-25)** — "próxima" calibrada como distância ≤5 (não vem de
      número do doc, só da regra qualitativa).
- [x] T035 [P] [US2] Teste unitário: problema contextualizado de subtração
      nunca gera resultado negativo (FR-009) em
      `app/src/__tests__/unit/problema_contextualizado_test`. **Concluído
      (2026-09-25)**.
- [x] T036 [P] [US2] Teste unitário: o enunciado sorteia entre 2-3
      variações fixas por operação, e a variação não muda com o nível
      (D-36, FR-008) em `app/src/__tests__/unit/variacao_frase_test`.
      **Concluído (2026-09-25)**.

### Implementation for User Story 2

- [x] T037 [P] [US2] Modelar `DesafioMatematica` (operação, operandos,
      resultado, forma, tema quando contextualizada, alternativas) em
      `app/src/models/desafio_matematica`. **Concluído (2026-09-25)**.
- [x] T038 [US2] Implementar `gerador_matematica` (conta pura, 5 níveis de
      > **Revisado 2026-09-26 (D-41):** a grade de 5 níveis abaixo foi
      > substituída por 8 níveis mais fáceis — reescrita em T079. O que
      > está descrito aqui é o histórico do que foi entregue.
      operação) — faz T034 passar — em `app/src/services/gerador_matematica`
      (depende de T037). **Concluído (2026-09-25)** — faixas numéricas
      por nível (soma pequena/maior, subtração, multiplicação básica)
      calibradas aqui, marcadas pra revisão junto com a validação com
      criança (definições001 §10).
- [x] T039 [US2] Implementar `problema_contextualizado` (enunciado por
      tema/classificação, objetos visuais, fala automática, sorteio de
      variação) — faz T035 e T036 passarem — em
      `app/src/services/problema_contextualizado` (D-23, D-24, D-36;
      depende de T014 para o tema). **Concluído (2026-09-25)** — escopo
      assumido: só soma/subtração têm forma contextualizada (o schema de
      tema só define variação pra essas duas), nível 5/multiplicação é
      sempre pura no MVP.
- [x] T040 [US2] Implementar tela de desafio de matemática (conta falada,
      > **Revisado 2026-09-26 (D-42):** a tela ganha apoio visual de
      > quantidade nas duas formas — T080/T081.
      botão de repetir, 4 alternativas) em `app/src/screens/rodada/matematica`,
      reusando T032 para o resultado. **Concluído (2026-09-25)** —
      objeto visual da forma contextualizada usa um marcador genérico
      (●), não um ícone por tema: `matematica_temas.json` só guarda o
      NOME do objeto, a resolução nome→asset foi deixada pra
      implementação (mesmo gap documentado do `tts`/clipes de letra,
      T016).
- [x] T040a [US2] **Nova (2026-09-25)** — orquestrador de rodada de
      matemática (`RodadaMatematica`, `app/src/screens/rodada_matematica`),
      espelhando T033b: gera os desafios (procedural, não sorteio de
      banco), acumula acertos/erros, mostra `TelaResultado` com a
      sugestão de D-40. `contadorAjuda` sempre `null` — `data-model.md`
      não define contador de ajuda pra rodada de matemática (D-19),
      mesmo a repetição sendo visível ao vivo na tela; decisão do
      produto, não omissão. Teste em `app/e2e/rodada_matematica_completa.yaml`
      (não executado). ~~Mesma pendência de `RodadaLeitura`: não persiste
      em `historico` ainda~~ **Fechada em 2026-09-25**, igual a
      `RodadaLeitura`.

**Checkpoint**: US1 + US2 funcionam juntas e independentemente. ✅
(2026-09-25) 77/77 testes, `tsc`/`eslint` limpos, build web exportado
com sucesso.

---

## Phase 5: User Story 3 - Configurar a rodada (P3)

**Goal**: adulto escolhe tipo, modalidade, nível, classificação, forma de
matemática, tamanho, formato (sozinho/dupla) e voz antes de começar.

**Independent Test**: alterar configuração, iniciar, confirmar que a rodada
seguinte respeita as escolhas.

### Tests for User Story 3 ⚠️

- [x] T041 [P] [US3] Teste de integração: combinação nível×classificação
      sem conteúdo suficiente não aparece selecionável (US3 cenário 2,
      FR-011) em `app/e2e/configuracao_conteudo.yaml`. **Escrito
      (2026-09-25)**, garantido por `TelaConfiguracao` usar
      `combinacoesDisponiveis()` (T014, já filtra ≥12 itens) pras opções
      de nível/classificação. Não executado (sem device/Maestro CLI).
- [x] T042 [P] [US3] Teste de integração: iniciar sem alterar nada usa
      valores padrão válidos (US3 cenário 1, FR-012) em
      `app/e2e/configuracao_padrao.yaml`. **Escrito (2026-09-25)**. Não
      executado.
- [x] T043 [P] [US3] Teste de integração: sem permissão de microfone, a
      opção "Leitura · voz" aparece desabilitada com o motivo visível
      (US3 cenário 3, FR-013) em
      `app/e2e/config_mic_desabilitado.yaml`. **Escrito (2026-09-25)**.
      Não executado.
- [x] T044 [P] [US3] Teste de integração: sem nenhuma voz pt instalada, o
      > **Obsoleto (D-46, 2026-09-26):** a escolha/teste de voz saiu do
      > MVP; o spec Maestro fica no repo mas não cobre mais um cenário
      > vigente da spec.
      app informa e orienta a instalação, sem falhar silenciosamente (US3
      cenário 4, CU-07) em `app/e2e/config_sem_voz.yaml`. **Escrito
      (2026-09-25)**. Não executado.
- [x] T045 [P] [US3] Teste de integração: a última voz escolhida aparece
      > **Obsoleto (D-46, 2026-09-26):** idem T044.
      pré-selecionada ao reabrir a configuração (US3 cenário 5) em
      `app/e2e/config_ultima_voz.yaml`. **Escrito (2026-09-25)**. Não
      executado.

### Implementation for User Story 3

- [x] T046 [P] [US3] Implementar `configuracao` (preferências persistidas:
      última voz, nome/fonema, últimos nível/classificação/tamanho/
      modalidade) — faz T045 passar — em `app/src/services/configuracao`.
      **Concluído (2026-09-25)** via `expo-sqlite` (`INSERT ... ON
      CONFLICT DO UPDATE`). Sem teste unitário próprio — mesma situação
      de `historico`: é encanamento de SQL direto, sem regra de negócio
      pra isolar, e `expo-sqlite` não roda em Jest. Extraído
      `app/src/lib/bancoLocal.ts` (conexão compartilhada com
      `historico` — 2 tabelas, 1 arquivo `.db`).
- [x] T047 [US3] Implementar tela de configuração da rodada (tipo,
      modalidade, nível, classificação, forma de matemática, tamanho,
      sozinho/dupla) — faz T041 e T042 passarem — em
      `app/src/screens/configuracao`, ligada a T014/T046. **Concluído
      (2026-09-25)**. **Escopo assumido, não confirmado**: `tipo =
      "misto"` e `formato = "dupla"` são selecionáveis (CU-01/CU-08
      listam as opções), mas nenhum orquestrador pra eles existe ainda
      — "Começar" fica desabilitado com o motivo visível nesses casos,
      em vez de silenciosamente iniciar uma rodada errada (Princípio
      III), até esses fluxos existirem (Fase 7 pra dupla; rodada mista
      não tem fase própria ainda).
- [x] T048 [US3] Implementar tela de escolha e teste de voz (lista de vozes
      > **Desligada da navegação (D-46, 2026-09-26):** a tela continua no
      > código, sem link a partir da configuração — reativar é decisão
      > futura.
      pt do aparelho, destaque de melhor qualidade, teste com toque) —
      faz T043 e T044 passarem — em `app/src/screens/escolha_de_voz`,
      ligada a T016/T017 (CU-07). **Concluído (2026-09-25)** — escolha
      salva de verdade em `configuracao.vozId` a cada toque (T045).
- [x] T049 [US3] Implementar seleção de "nome da letra" vs. "som da letra"
      > **Sem interface (D-46, 2026-09-26):** o campo continua, o seletor
      > saiu da configuração; vale sempre o padrão fonema (D-26).
      (padrão fonema) em `app/src/screens/configuracao` (D-26, FR-021).
      **Concluído (2026-09-25)** — salva em `configuracao.nomeOuFonema`
      assim que muda, igual ao padrão da escolha de voz.
- [x] T049a [US3] **Nova (2026-09-25)** — `app/src/app/index.tsx` virou
      a tela inicial de verdade (não mais placeholder/menu de dev):
      carrega `configuracao` do perfil (T046) e `capacidade_aparelho`
      (T017) de verdade, renderiza `TelaConfiguracao`, e "Começar"
      navega pra rotas reais `/rodada` e `/rodada-matematica` (movidas
      de `_dev/` pra rotas de verdade, recebendo a configuração escolhida
      via query string). `/escolha-de-voz` também virou rota real (saiu
      de `_dev/`). Achado no processo: `expo-sqlite` no alvo **web**
      precisa de config extra do Metro pra resolver o `.wasm` do
      `wa-sqlite` (`metro.config.js` criado, `docs.expo.dev` confirma
      isso é esperado, não bug) — sem isso o `npx expo export -p web`
      (usado como validação de build em toda a sessão) quebrava; o alvo
      real do produto é Android/iOS nativo, onde isso não se aplica.
      As rotas `_dev/*` continuam no código (debug direto por URL), só
      não aparecem mais linkadas no menu principal.

**Checkpoint**: US1+US2+US3 funcionam juntas — rodada totalmente
configurável, com defaults ainda válidos, e todo caso de indisponibilidade
de recurso (mic/voz) coberto por teste, não só implementado. ✅
(2026-09-25) 77/77 testes, `tsc`/`eslint` limpos, build web exportado
com sucesso. **Pendência de persistência fechada no mesmo dia**:
`RodadaLeitura`/`RodadaMatematica` agora chamam
`historico.registrarRodada` (T015) — `concluida: true` ao terminar
todos os desafios, `concluida: false` ao sair pelo botão de D-39 (mesmo
tratamento de qualquer rodada abandonada). `perfilId` ainda é sempre
`PERFIL_PADRAO_ID` (`models/perfil.ts`) — não existe seleção de perfil
de verdade (isso é US5/Fase 7, modo dupla), mas o modelo já é
multi-perfil (D-25), então trocar isso depois não exige migração. A
Fase 3-5 forma agora um fluxo real e completo: configurar → jogar →
resultado → **histórico gravado**.

---

## Phase 6: User Story 4 - Consultar o histórico (P4)

**Goal**: adulto vê resumo e lista das últimas 50 rodadas por perfil.

**Independent Test**: jogar 3 rodadas variadas, abrir histórico, conferir
os campos e o cálculo por perfil.

### Tests for User Story 4 ⚠️

- [x] T050 [P] [US4] Teste unitário: resumo geral (total, precisão média,
      média de estrelas) calculado por perfil, sem cruzar modalidades
      (US4 cenário 4) em `app/src/__tests__/unit/resumo_historico_test`.
      **Concluído (2026-09-25)** — agrupa por modalidade pra leitura
      (Ditado/Leitura·montar/Leitura·voz, D-20 explícito) e matemática
      como grupo único (pura+contextualizada juntas — D-20 não as
      distingue como medindo habilidades diferentes, só as 3 modalidades
      de leitura são citadas; interpretação, não confirmada literalmente
      no doc).
- [x] T051 [P] [US4] Teste de integração: antes da primeira rodada, o
      histórico mostra mensagem explicando que estará vazio, não uma tela
      em branco sem contexto (US4 cenário 1) em
      `app/e2e/historico_vazio.yaml`. **Escrito (2026-09-25)**. Não
      executado (sem device/Maestro CLI).
- [x] T052 [P] [US4] Teste de integração: apagar o histórico exige
      confirmação antes de executar (US4 cenário 3, CU-06) em
      `app/e2e/historico_exclusao_confirma.yaml`. **Escrito
      (2026-09-25)**, implementado via `Alert.alert` nativo. Não
      executado.

### Implementation for User Story 4

- [x] T053 [US4] Implementar tela de histórico (lista mais recente→mais
      antiga, resumo geral, mensagem de vazio antes da 1ª rodada) — faz
      T050 e T051 passarem — em `app/src/screens/historico`, ligada a T015.
      **Concluído (2026-09-25)** — data formatada "Hoje"/"Ontem"/data
      (CU-06). Acessível pela tela inicial e ao final de uma rodada
      (CU-06 passo 1) — link em `TelaConfiguracao` e botão opcional em
      `TelaResultado`.
- [x] T054 [US4] Implementar exclusão do histórico com confirmação — faz
      T052 passar — em `app/src/screens/historico` (CU-06). **Concluído
      (2026-09-25)** — `historico.limparHistoricoDoPerfil` (nova função,
      apaga todas as rodadas do perfil; `excluirRodada` já existia pra 1
      rodada só, mas CU-06 pede apagar o histórico inteiro).

**Checkpoint**: histórico completo e correto para uso sozinho e futuro modo
dupla. ✅ (2026-09-25) 81/81 testes, `tsc`/`eslint` limpos, build web
exportado com sucesso.

---

## Phase 7: User Story 5 - Jogar em dupla (P5)

**Goal**: duas crianças jogam rodadas individuais sequenciais com config
idêntica; resultado combinado cooperativo ou adversarial.

**Independent Test**: selecionar dupla, 2 perfis, jogar as duas rodadas,
ver os dois formatos de resultado combinado.

### Tests for User Story 5 ⚠️

- [x] T055 [P] [US5] Teste de integração: rodada dupla incompleta (uma
      criança sai no meio) não entra no histórico comparativo (US5
      cenário 5, FR-018) em `app/e2e/dupla_incompleta.yaml`. **Escrito
      (2026-09-25)**. Não executado (sem device/Maestro CLI).
- [x] T056 [P] [US5] Teste de integração: config idêntica é aplicada às
      duas rodadas da dupla (US5 cenário 6, D-33) em
      `app/e2e/dupla_config_identica.yaml`. **Escrito (2026-09-25)**,
      garantido estruturalmente (`RodadaDupla` lê a config uma vez só,
      passa a mesma referência pras duas rodadas). Não executado.
- [x] T057 [P] [US5] Teste de integração: o adulto precisa escolher
      explicitamente cooperativo ou adversarial — nenhum formato é padrão
      implícito (US5 cenário 1, D-31) em
      `app/e2e/dupla_formato_explicito.yaml`. **Escrito (2026-09-25)**.
      Não executado.
- [x] T058 [P] [US5] Teste de integração: a tela "passa o aparelho"
      impede a criança 1 de continuar jogando no lugar da criança 2 (US5
      cenário 2) em `app/e2e/dupla_transicao.yaml`. **Escrito
      (2026-09-25)**. Não executado.
- [x] T059 [P] [US5] Teste de integração: resultado combinado mostra
      total somado + individual lado a lado no cooperativo, e os dois
      resultados lado a lado com destaque no adversarial (US5 cenário 3)
      em `app/e2e/dupla_resultado_combinado.yaml`. **Escrito
      (2026-09-25)**. Não executado.
- [x] T060 [P] [US5] Teste de integração: no adversarial, a mensagem para
      quem teve menos segue a regra "nunca depreciativa" (US5 cenário 4,
      mesma regra de T025) em
      `app/e2e/dupla_mensagem_nao_depreciativa.yaml`. **Escrito
      (2026-09-25)**. Não executado.

### Implementation for User Story 5

- [x] T061 [P] [US5] Implementar seleção/criação de perfil (nome + cor,
      cadastro mínimo) em `app/src/screens/selecao_perfil`, ligada a T012
      (D-32 — seletor aparece com >1 perfil ou ao entrar em "dupla").
      **Concluído (2026-09-25)** — junto veio a peça que faltava desde
      T012: persistência real de `perfis` (`app/src/services/perfis`,
      só o TS type existia até aqui). `garantirPerfilPadrao()` roda no
      boot do app (`index.tsx`) pra semear a linha `"padrao"`.
- [x] T062 [US5] Implementar fluxo de dupla: escolha de formato
      (cooperativo/adversarial), 2 perfis, rodada 1 → tela "passa o
      aparelho" → rodada 2, reusando as telas de US1/US2 sem alteração —
      faz T057 e T058 passarem — em `app/src/screens/dupla` (D-30).
      **Concluído (2026-09-25)** — `RodadaLeitura`/`RodadaMatematica`
      ganharam `onRegistrada` (novo callback, opcional, não muda
      comportamento existente) pra o orquestrador de dupla saber o id
      gravado de cada rodada. Se uma criança sai no meio (D-39), a
      dupla é persistida incompleta e o fluxo termina sem resultado
      combinado — comparar incompleta com completa não seria honesto.
- [x] T063 [US5] Implementar tela de resultado combinado — cooperativo
      (soma + individual lado a lado) e adversarial (lado a lado com
      destaque, mensagem nunca depreciativa) — faz T059 e T060 passarem —
      em `app/src/screens/resultado_dupla`, reusando T032. **Concluído
      (2026-09-25)** — mensagem adversarial segue literalmente o exemplo
      do doc002 §9 ("Você acertou X de Y — [nome] tirou mais hoje, bora
      tentar de novo?").
- [x] T064 [US5] Persistir rodada dupla no histórico com os dois perfis
      vinculados e a flag de completude por perfil — faz T055 e T056
      passarem — (FR-018), ligada a T015. **Concluído (2026-09-25)** —
      nova tabela `rodadas_duplas` em `historico` (mesmo arquivo/conexão
      de `rodadas`, T015). `completa` calculada na hora (ambos
      `concluida`), nunca guardada como suposição.

**Checkpoint**: todas as 5 user stories funcionam, cada uma isoladamente
testável, e **todo** *Acceptance Scenario* do `spec.md` tem uma tarefa de
teste correspondente. ✅ (2026-09-25) 81/81 testes, `tsc`/`eslint`
limpos, build web exportado com sucesso. **Escopo assumido, não
confirmado**: comparação de "quem teve mais" no resultado adversarial
usa estrelas como critério (não havia número exato no doc — só "estrelas
dos dois lado a lado, destaque pra quem teve mais").

---

## Phase 8: Polish & Cross-Cutting Concerns

- [x] T065 [P] Revisar todas as telas contra o Princípio VI da
      constituição, com checklist explícito por tela: (a) toda ação
      principal é um único toque, (b) nenhum gesto composto/ensinado,
      (c) o ícone sozinho basta pra criança entender a ação, sem depender
      do texto — antes do primeiro teste com criança real. **Concluído
      (2026-09-25)** — auditoria de todo `TouchableOpacity` do app (13
      arquivos). (a)/(b): **sem violação** — nenhum `onLongPress`, drag,
      swipe ou duplo-toque em lugar nenhum do código, confirmado por
      busca em todo `src/`. (c): ícones das telas de desafio já seguem o
      vocabulário canônico do Princípio I (🔊 repete, 👁️ mostra, 🎤 ouve);
      alternativas de letra/número usam o próprio conteúdo como "ícone",
      não decoração. **2 achados reais de alvo pequeno, corrigidos**:
      `BotaoSairRodada` (✕ sair) e "👁️ ver de novo"
      (Leitura·montar) não tinham tamanho mínimo de toque — os únicos
      controles de tela de desafio sem `ALVO_TOQUE_MINIMO`; ambos
      corrigidos. **1 achado sem correção de código possível, registrado
      pra validar com T068**: "✕" sozinho (sem o texto "sair") é uma
      convenção adulta de UI — não está confirmado que uma criança em
      alfabetização reconhece isso como "sair"; só teste real decide.
      Telas do adulto (Configuração, Histórico, Escolha de voz, Seleção
      de perfil — todas CU-01/06/07/08 "Ator: adulto") não seguem o
      critério (c) à risca (usam link de texto) — constitution.md já
      prevê isso: "o texto acompanha apenas para o adulto".
- [ ] T066 [P] Gravar e integrar os ~52 clipes de letras/fonemas (nome +
      som) em `app/assets/audio/` (D-27). **Não é tarefa de código —
      não posso gravar áudio.** Precisa de alguém gravando a própria voz
      (ou contratando locução) falando nome/som de cada letra/dígrafo.
      `tts.tocarClipe()` (T016) já está pronto pra tocar os arquivos
      assim que existirem — só falta o conteúdo em si.
- [x] T067 Carregar e validar o banco de palavras inicial em
      `app/assets/conteudo/` contra as 6 classificações confirmadas (D-34 —
      animais, comida, casa, corpo, natureza, ações), com **mínimo de 12
      palavras** por combinação nível×classificação exposta — roda T006 e
      T008 contra o conteúdo real, não mais só contra fixture de teste
      (D-35, FR-011). **Parte mecânica concluída (2026-09-25)**:
      recalculado contra os 272 itens reais — bate exatamente com a
      tabela já documentada em `app/assets/conteudo/README.md` (corpo
      nível 2 com 9, abaixo de 12; todo nível 5 abaixo de 12 nas 6
      classificações) — `combinacoesDisponiveis()` já esconde essas
      combinações corretamente, confirmado, não é bug. **Parte
      pedagógica (A-06) continua em aberto, não é tarefa de código** —
      registrado em `app/assets/conteudo/README.md`.
- [ ] T068 Sessão de observação com criança real seguindo `doc/
      definições001.MD` §10 + `doc/definições002.MD` §10 (perguntas 1-10),
      medindo SC-001 a SC-006 de `spec.md`. **Nota sobre A-11**: as 19
      rodadas do spike de STT (`research.md` §T002) já foram gravadas com
      uma criança real em fase de alfabetização (não adulto simulando —
      correção de registro em 2026-09-21), então 62-81% já é o número
      real contra o usuário-alvo, não estimativa por proxy. Se der pra
      testar com **outra(s) criança(s)** nesta sessão, roda de novo contra
      `spike-stt/testar.py`/`fonetica.py` pra ganhar robustez estatística
      (n=1 hoje) — não é pré-requisito, é reforço. **Não é tarefa de
      código — exige uma criança real e alguém observando.** O app já
      está pronto pra essa sessão acontecer (fluxo completo configurar →
      jogar → resultado → histórico, Fases 3-7), incluindo o achado do
      T065 sobre "✕ sair" que essa sessão pode confirmar ou refutar.
- [ ] T069 Registrar resultado da sessão de observação e decidir A-06/A-09/
      A-10 remanescentes em `doc/definições003.MD` (consolidação prevista
      em `doc/definições002.MD`). **Bloqueado por T068** — não dá pra
      registrar resultado de uma sessão que ainda não aconteceu.

---

## Phase 9: Ajustes depois do primeiro teste em aparelho real (2026-09-26)

**Origem**: `doc/definições002.MD` §15 (D-41 a D-47) e `plan.md` "Revisão de
2026-09-26". **Regra desta fase**: a spec e o plano foram alterados *antes*
de qualquer código novo — os blocos 9b e 9c abaixo estão **todos em aberto**
e só executam depois de o dono do projeto aprovar spec/plano. O bloco 9a
registra o que já foi feito e verificado em código (tsc, eslint, 81 testes,
`expo export -p web`) antes deste replanejamento, pra o rastreador não
ficar atrás do código.

### 9a. Já feito e verificado (registro)

- [x] T070 [US1] **Bug real do Ditado**: `MontagemPalavra` é reusada
      entre desafios da rodada (só a prop `palavra` muda) e o estado de
      vagas/ladrilhos só inicializava no 1º mount — ao acertar, o áudio
      trocava mas a montagem ficava travada no desafio anterior. Corrigido
      com `key={palavra}` (remount), não com `useEffect`+`setState` (o
      eslint do projeto rejeita, com razão). **Sem teste automatizado** —
      o projeto não tem teste de componente; coberto só por verificação
      manual no aparelho. Lacuna registrada, não escondida.
- [x] T071 **Safe area**: container raiz de todas as telas reais trocado
      por `SafeAreaView` (`react-native-safe-area-context`), bordas topo e
      base — botões do rodapé (ex.: "Começar") ficavam sob a barra de
      navegação do Android. (FR-026)
- [x] T072 **Identidade visual do protótipo**: fontes Baloo 2 + Figtree
      carregadas (`expo-font`/`useFonts` nunca existiram no app — só
      cores/raios tinham sido portados de `design/prototipo.html`), `Botao`
      com raio 16 e fantasma com fundo `papelAlt` (estavam pill/transparente,
      errado), `sombraBlk`, vagas tracejadas.
- [x] T073 **Simplificação pedida (D-46)**: removidos da tela de configurar
      "Letra: nome ou som" e "escolher e testar a voz". `TelaEscolhaDeVoz`
      e o campo `nomeOuFonema` continuam no código, desligados.
- [x] T074 **Regras de UX infantil (D-47, FR-026)**: "mais opções"
      recolhido por padrão, avisos em tom de jogo, chips com alvo 56,
      "✕ sair" com aparência de botão, pop de escala ao acertar uma vaga.
- [ ] T075 **Som de acerto/erro gentil (feedback sonoro)**. **Bloqueado por
      asset**: precisa de um arquivo de áudio real que não existe no
      projeto — mesma dependência humana de T066; não vou fabricar um.
      Sem som de derrota (US1 cenário 5, Princípio II).

### 9b. Matemática: 8 níveis + apoio visual + nível próprio (D-41, D-42, D-43)

**Independent Test**: em tipo matemática, iniciar no nível 1 (padrão) e
completar uma rodada só contando o que aparece na tela, sem nenhuma conta
passar de 5; subir até o nível 5 e ver as quantidades de 11 a 20 no estilo
material dourado.

#### Tests for 9b ⚠️ (escrever e ver falhar antes)

- [ ] T076 [P] [US2] Teste unitário: `gerador_matematica` respeita o teto
      de cada um dos 8 níveis (resultado ≤ 5 no 1, ≤ 10 nos 2-4, ≤ 20 nos
      5-7), nunca gera negativo nem zero em subtração, sempre 4
      alternativas distintas e próximas; nível fora de 1–8 lança erro em
      vez de virar multiplicação. Varredura com muitas amostras e gerador
      de números com seed. (US2 cenários 3, 4, 5; FR-022)
- [ ] T077 [P] [US2] Teste unitário: `representacao_quantidade` — até 10
      devolve bolinhas em linhas de 5 (ex.: 7 → 5+2); de 11 a 20 devolve
      dezenas + unidades (ex.: 14 → 1 barra + 4 cubinhos); 10 exato e 20
      exato nas bordas; nível 8 devolve N grupos de M. (US2 cenário 6;
      FR-023)
- [ ] T078 [P] [US3] Teste unitário: `configuracao` guarda e devolve
      `ultimo_nivel_matematica` separado de `ultimo_nivel`; padrão 1;
      migração aditiva não perde linha existente. (US2 cenário 7, US3
      cenário 6; FR-024)

#### Implementation for 9b

- [ ] T079 [US2] Reescrever `gerador_matematica` pra grade de 8 níveis
      (faz T076 passar); ajustar `problema_contextualizado` se ele depender
      da grade antiga. Faixas marcadas "a calibrar" (A-14).
- [ ] T080 [P] [US2] Implementar `representacao_quantidade` (função pura,
      faz T077 passar) e o componente `QuantidadeVisual` (bolinhas em
      linhas de 5; barra de 10 + cubinhos; grupos no nível 8). Só exibição.
- [ ] T081 [US2] Ligar `QuantidadeVisual` a `TelaMatematica` nas duas
      formas, níveis 1–7 (substitui o `'●'.repeat(n)` da forma
      contextualizada); respeitar alvo/legibilidade em retrato e paisagem
      (D-38).
- [ ] T082 [US3] `configuracao`: campo `ultimoNivelMatematica` + migração
      aditiva no `expo-sqlite` (faz T078 passar). `data-model.md` já
      atualizado.
- [ ] T083 [US3] Seletor de nível de matemática (1–8) em "mais opções"
      quando o tipo envolve matemática; `/rodada-matematica` passa a usar
      o nível de matemática (deixa de herdar o de leitura); D-40
      (`sugerirProximoNivel`) age sobre o nível do tipo jogado e respeita
      o teto 8 vs 5.
- [ ] T084 [P] Atualizar/criar specs Maestro (`app/e2e/`) pra: "mais
      opções" recolhido por padrão, matemática nível 1 com quantidade
      visual, seletor de nível de matemática. **Ressalva**: até hoje nenhum
      spec Maestro foi executado; o emulador Docker (`docker/android/`) agora
      permite tentar — se rodar, registrar; se não, manter a ressalva.

### 9c. Leitura·voz de verdade (D-44, D-45)

**Independent Test**: em aparelho real, sem rede, a criança toca no
microfone, lê a palavra, toca de novo, e o app mostra o que entendeu; e,
num build sem o motor, a modalidade aparece desabilitada com o motivo.

- [ ] T085 [P] [US1] Teste unitário/integração: com a capacidade
      `reconhecimentoDeVoz` indisponível, a configuração mostra "Leitura ·
      voz" desabilitada com motivo visível e "Começar" não inicia uma
      rodada de voz. (US1 cenário 9; FR-013, FR-025)
- [ ] T086 [US1] Implementar a capacidade `reconhecimentoDeVoz` em
      `capacidade_aparelho` + o gate na configuração (faz T085 passar). É a
      correção **imediata** do defeito do teste: entra antes do motor.
- [ ] T087 [US1] **Spike de integração do `whisper.rn`** em aparelho real
      (build EAS): compila/roda no SDK 57? formato de áudio exigido vs o
      que o `expo-audio` grava (e a conversão, se precisar); tamanho de
      modelo que cabe no APK e latência real. Saída: seção nova em
      `research.md` e decisão de modelo. **Bloqueia T090.** Verificar a
      documentação atual do pacote e do SDK antes de escrever qualquer
      integração — nada disso está verificado neste projeto.
- [ ] T088 [P] [US1] Testes unitários (com fake do motor e do gravador):
      `gravacao` pede permissão ao iniciar, toque inicia/toque para sem
      timeout (D-37), permissão negada vira motivo visível (não erro
      genérico); `stt` devolve texto do motor e trata modelo ausente. (US1
      cenário 10; T026 já cobre "sem permissão")
- [ ] T089 [US1] Implementar serviço `gravacao` (`expo-audio`) — faz T088
      passar (parte gravador).
- [ ] T090 [US1] Implementar serviço `stt` (`whisper.rn`, modelo embarcado,
      100% offline) — faz T088 passar (parte motor). **Depende de T087.**
- [ ] T091 [US1] Trocar os stubs de `iniciarGravacao`/`pararGravacao`/
      `transcrever` na rota `/rodada` pelos serviços reais e **remover o
      gate de T086 somente quando o modelo carregar de verdade**.
- [ ] T092 [US1] Validar em aparelho real (não no emulador Docker, sem
      microfone): captura, latência, falso negativo/positivo (SC-003,
      SC-008), com o app em modo avião; registrar em `research.md` e
      alimentar T068. **Não é tarefa de código puro — exige aparelho e
      alguém falando.**

### 9d. Rastreamento

- [ ] T093 Sincronizar este plano no Plane (uma issue por bloco 9a-9c, com
      a lista T070-T092), workspace `esteira`. **Bloqueado**: precisa de um
      personal access token do Plane (ver conversa de 2026-09-26) — sem
      ele não há como escrever no board.


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
- **Fase 9 (2026-09-26)** vem depois de tudo acima e não bloqueia nada
  do que já está pronto. Dentro dela: **9b (matemática) e 9c (voz) são
  independentes entre si** e podem seguir em paralelo; em 9c a ordem é
  T085/T086 (gate honesto) → T087 (spike) → T088-T090 → T091 → T092 —
  **T090 não começa antes de T087**. 9a já está feito; T075 e T093 estão
  bloqueados por dependência externa (asset de áudio; token do Plane).
- **US5** depende do modelo de `Perfil` multi-perfil (T012) e das telas de
  US1/US2 já existirem, mas não depende de US3 nem US4 em código — apenas
  reaproveita a mesma tela de resultado (T032).

### Cobertura de teste × Acceptance Scenarios (auditoria)

| User Story | Cenários no spec.md | Tarefas de teste |
|---|---|---|
| Foundational (sem US própria no spec, mas com contrato/regra testável) | — | T006–T011 |
| US1 | 10 (cenário 8 em 2026-09-15, D-37; cenários 9-10 em 2026-09-26, D-44/D-45) | T019–T026 + T020a (cenários 1-8); **T085 (cenário 9) e T088 (cenário 10) — a escrever**; T092 valida o 10 em aparelho real |
| US2 | 7 (cenários 5-7 em 2026-09-26, D-41/D-42/D-43) | T034–T036 (cenários 1-4, regras de geração; 1/2 via T029/T030/T040 de UI + unit acima); **T076 (cenário 5), T077 (cenário 6), T078 (cenário 7) — a escrever** |
| US3 | 6 (cenários 4-5 substituídos e 6 novo em 2026-09-26, D-46/D-47/D-43) | T041–T045 escritos contra a versão antiga; **os testes de voz/nome-fonema (T044, T045) ficam obsoletos pelo D-46** e o cenário 5 novo ("mais opções") não tem teste automatizado — só Maestro (T084); T078 cobre o cenário 6 |
| US4 | 4 | T050–T052 (cenário 2 coberto por T050) |
| US5 | 6 | T055–T060 (6 tarefas cobrindo os 6 cenários) |

Depois da revisão de 2026-09-26 **há cenários sem teste ainda escrito**
(US1 9 e 10, US2 5-7, US3 5-6) — as tarefas existem na Fase 9, mas
estão em aberto; a afirmação anterior de "nenhum cenário sem tarefa" só
vale pra versão anterior da spec.

## Notes

- [P] = arquivos diferentes, sem dependência
- Testes marcados ⚠️ devem ser escritos e falhar antes da implementação
  correspondente
- Cada checkpoint de user story é um ponto válido para parar, demonstrar e
  validar com o dono do produto antes de seguir
- Anotações "faz TXXX passar" apontam de volta pro teste que a tarefa de
  implementação precisa deixar verde — não é decoração, é rastreabilidade
