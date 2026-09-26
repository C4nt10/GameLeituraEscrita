# Implementation Plan: MVP — Desafios de leitura e matemática

**Branch**: `001-mvp-desafios-leitura-matematica` | **Date**: 2026-09-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-mvp-desafios-leitura-matematica/spec.md`

## Summary

App infantil offline-first com 3 modalidades de leitura (Ditado, Leitura ·
montar, Leitura · voz), matemática em 2 formas (conta pura, problema
contextualizado), configuração opcional por um adulto, histórico local por
perfil, e um modo dupla (cooperativo/adversarial) que reaproveita a mecânica
de rodada individual sem turno-a-turno. Abordagem técnica: app
multiplataforma com todo conteúdo e reconhecimento de fala embutidos no
pacote — nenhuma dependência de backend para o MVP.

## Technical Context

**Language/Version**: TypeScript, React Native + Expo (T001, **revisado em
2026-09-13** — trocado de Flutter; ver [research.md](./research.md) para
a comparação e o motivo da troca. Versão exata do SDK do Expo pinada no
T003).

**Primary Dependencies** (decidido — ver research.md):
- Síntese de voz: `expo-speech` (TTS nativo da plataforma — D-27 exige
  apenas "voz do aparelho", já valida esta escolha).
- Reconhecimento de fala (Leitura · voz): `whisper.rn` (binding React
  Native de whisper.cpp) — **motor confirmado pelo spike em `spike-stt/`**
  (T002, fechado em 2026-09-22): Whisper com vocabulário no prompt +
  tolerância fonética, 62-81% contra criança real; Vosk descartado
  (10-19%, vocabulário insuficiente). `react-native-vosk` não é mais a
  escolha; checagem no T003 (2026-09-23) achou `whisper.rn` mantido e
  ativo, então a integração não exige módulo nativo próprio do zero como
  se presumia em 2026-09-15 — ver research.md §"Consequência
  arquitetural".
- Reprodução dos clipes gravados de letra/fonema: `expo-audio` (confirmado
  no T003 — `expo-av` não existe mais no SDK 57 do Expo).
- Persistência dinâmica local: `expo-sqlite` (histórico, perfis, configuração).
- Banco de palavras/classificações: assets JSON estáticos em
  `app/assets/conteudo/`, carregados em memória (não precisa de SQL).

**Storage**: local, embutido no dispositivo (histórico de até 50 rodadas
por perfil via `expo-sqlite` + banco de palavras/classificações via JSON +
áudio gravado de letras/fonemas ~52 clipes como asset). Sem servidor, sem
sincronização (FR-019, Princípio V).

**Testing**: Jest + React Native Testing Library (unit/componente) +
Maestro (fluxos E2E em YAML: rodada completa por modalidade, fluxo de
dupla — mais leve de configurar que Detox para um dev solo). Deve cobrir,
no mínimo, os cenários de aceitação de cada user story do spec.md (cálculo
de precisão/estrelas, geração de alternativas sem repetição/negativo, troca
automática de modalidade após 2 falhas, exclusão de rodada dupla incompleta
do histórico).

**Target Platform**: dispositivos móveis (tablet/celular), touch, uso
majoritário sem supervisão direta no momento do toque. Multiplataforma
(Android no mínimo; iOS desejável) — decisão de produto já tomada
("Multiplataforma com modelo embutido"). **Orientação: retrato e paisagem,
adaptativo** (D-38, `doc/definições002.MD` §13) — tablet infantil é usado
em paisagem com frequência; `app.json` configurado com `orientation:
"default"` (sem trava) no T003. Cada tela do MVP precisa de layout pras
duas orientações — decisão pendente de UI concreta pra Fase 3 (A-12).

**Project Type**: mobile-app (single codebase, sem projeto de backend
separado).

**Performance Goals**: resposta a toque **imediata** (Princípio de
usabilidade "feedback imediato e visível" — sem número formal ainda,
tratar como <200ms de latência de toque→feedback visual como meta de
engenharia). Reconhecimento de fala deve responder em tempo aceitável para
uma criança não perder o engajamento — meta a calibrar no spike de STT
(pendente).

**Constraints**: **offline-capable é obrigatório** (FR-019, SC-005, não
negociável — ver constituição, Princípio V). Modelo de STT embarcado deve
caber num tamanho de instalação razoável para um app infantil (motor
escolhido: Whisper via `whisper.rn`; tamanho do modelo e latência em
aparelho real seguem **não medidos** — A-17, T087). Interface para criança pré-leitora:
sem texto como única pista de ação (Princípio VI da constituição).

**Scale/Scope**: uso doméstico, 1–2 perfis por aparelho no MVP (D-25,
D-32), histórico de até 50 rodadas por perfil. Sem exigência de escala
multiusuário/concorrência — é um app local de uso individual/familiar.

## Revisão de 2026-09-26 — depois do primeiro teste em aparelho real

Origem: doc002 §15 (D-41 a D-47). Nada abaixo foi implementado ainda — este
plano vem **antes** da execução, por pedido do dono do projeto. As tarefas
estão em `tasks.md`, Fase 9.

### A. Matemática: 8 níveis + apoio visual de quantidade (D-41, D-42, D-43)

- **`gerador_matematica`** (função pura, já testada em T034/T038) é
  reescrito pra grade de 8 níveis — faixas em `doc002 §15/D-41`. Continua
  recebendo o gerador de números aleatórios por parâmetro (testável com
  seed) e continua garantindo: 4 alternativas, sem repetir, sem negativo,
  erradas próximas da certa. O ramo `else` que hoje trata "qualquer nível
  ≥ 5" como multiplicação sai — nível fora de 1–8 é erro explícito, não
  multiplicação por engano.
- **`representacao_quantidade`** (novo, função pura): operando →
  descrição do que desenhar (`bolinhas` em linhas de 5 até 10; `dourado`
  com `dezenas` e `unidades` de 11 a 20; grupos no nível 8). Puro
  justamente pra ser testado sem renderizar nada.
- **`QuantidadeVisual`** (novo componente): desenha a descrição acima;
  substitui o `'●'.repeat(n)` da forma contextualizada e passa a valer
  nas duas formas. Só exibição — sem gesto.
- **Persistência**: `configuracao` ganha `ultimo_nivel_matematica`
  (migração **aditiva**, `ADD COLUMN ... DEFAULT 1`). A tela de configuração
  passa a mostrar esse seletor em "mais opções" quando o tipo envolve
  matemática; a rota `/rodada-matematica` deixa de receber o nível de
  leitura. D-40 age sobre o nível do tipo jogado.
- **Risco**: histórico antigo de matemática tem níveis 1–5 da grade antiga
  — fica como gravado, sem reinterpretar (`data-model.md`).

### B. Leitura·voz de verdade (D-44, D-45)

Ordem obrigatória, cada passo desbloqueia o seguinte:

1. **Honestidade primeiro (rápido, sem motor):** nova capacidade
   `reconhecimentoDeVoz` em `capacidade_aparelho`; enquanto ela for
   "indisponível", a configuração mostra Leitura·voz desabilitada com
   motivo. Isso já resolve o defeito mais grave do teste (a modalidade
   parecia funcionar e não podia).
2. **Spike curto em aparelho real (T087)** — antes de escrever serviço:
   `whisper.rn` compila e roda no SDK 57? Que formato de áudio ele exige e
   o que o `expo-audio` grava (a conversão, se precisar, é o risco
   principal)? Qual tamanho de modelo cabe no APK e responde rápido o
   bastante? Resultado registrado em `research.md`; **nenhuma dessas
   respostas está verificada hoje** — o spike de 2026-09-22 rodou em
   desktop.
3. **Serviços com testes primeiro:** `gravacao` (permissão pedida ao entrar
   no desafio, toque-inicia/toque-para, sem timeout — D-37) e `stt`
   (carregar modelo, transcrever arquivo). Ambos atrás de interface
   pequena, com fake nos testes — o motor real só roda em aparelho.
4. **Ligar na rota `/rodada`** no lugar dos stubs e **remover o gate** do
   passo 1 só quando o modelo carregar de verdade.
5. **Validar em aparelho real** e registrar latência e taxa de falso
   negativo/positivo (SC-003, SC-008) — não dá pra validar no emulador
   Docker, que não tem microfone real.

**Restrições de build:** `whisper.rn` é módulo nativo — não roda no Expo
Go; cada teste no aparelho exige um build EAS novo (minutos, não
segundos). Isso encarece o ciclo e é o motivo de o gate (passo 1) vir
antes: o app instalado precisa ser honesto mesmo enquanto o motor não
chega.

### C. Correções já feitas em código (registradas em `tasks.md`, T070-T075)

Bug de montagem de palavra que travava o Ditado, safe area, fontes do
protótipo, simplificação da configuração (D-46) e regras de UX infantil
(D-47) — implementados e verificados antes deste plano; a spec estava
atrasada em relação ao código e foi alinhada agora.

## Revisão de 2026-09-26 (2) — Padrão visual "Letra Viva" v1

Origem: `design/` do dono e doc002 §16 (D-50 a D-54, A-19 a A-35). **Só
planejamento** — nada implementado. Tarefas na Fase 10 do `tasks.md`.

### Tamanho real da mudança (medido, não estimado)

20 arquivos importam o tema atual, com 342 usos de token (`cores.*`,
`fontes.*`, `raio.*`, `espacamento.*`); ~3.300 linhas de telas e componentes
a refazer; 24 specs Maestro com texto de tela; 7 rotas. É um redesenho, não um
ajuste de cor.

### Decisões técnicas propostas

1. **Tokens — migração em duas etapas, sem "big bang".** `tema.ts` entra em
   `app/src/theme/tema.ts` convivendo com o `theme/index.ts` atual; cada tela
   migra sozinha e o arquivo antigo só sai quando nada mais o importar (T118).
   Um teste compara `design/tema.ts` com a cópia do app e falha se divergirem
   — o arquivo do dono é a fonte, a cópia não pode envelhecer em silêncio
   (Metro não importa de fora da pasta do app).
2. **Fontes.** Adicionar Andika (`@expo-google-fonts/andika` 0.4.1, existe no
   npm) e os pesos Figtree 500/700/800 do guia. O nome exato do export
   `Andika_700Bold` **ainda não foi conferido** no pacote — primeiro passo de
   T102.
3. **Ícones, mascote e fundo quadriculado: `react-native-svg`** (versão que o
   Expo SDK 57 traz: 15.15.4). Hoje o app usa emoji; o guia usa SVG próprio
   (som, x, voltar, play, mic, parar, olho, estrela, maçã, engrenagem,
   mascote). O SVG também resolve o caderno quadriculado (`Pattern`), que o
   React Native não faz com CSS. **É módulo nativo novo**: precisa passar no
   `expo export --platform android` e num build EAS antes de qualquer tela
   depender dele (T103) — o build do `whisper.rn` mostrou que o export web
   sozinho não basta.
4. **Movimento: `Animated` do próprio React Native.** Tudo que o guia pede
   (afundar 3 px, mola de encaixe 0,6→1, tremor ±7 px, queda, pulo, pulso e
   onda em loop, anel enchendo em 1,2 s) é transform/opacity — não precisa de
   `reanimated`, que hoje **nem está** no projeto e traria `worklets` com
   acoplamento de versão. "Reduzir movimento" do sistema
   (`AccessibilityInfo.isReduceMotionEnabled`) zera durações e desliga loops.
5. **Layout em duas zonas (D-38).** Um componente `ZonasDoDesafio`
   (estímulo + resposta) com `useWindowDimensions`: uma sobre a outra em pé,
   lado a lado deitado, resposta à direita. Hoje nenhuma tela se adapta.
6. **Estrutura de rotas.** `/` vira a abertura (só na abertura a frio, A-30) e
   o início da criança passa a `/inicio`; a folha do adulto é um `Modal` na
   própria tela de início. As rotas de rodada e o orquestrador **não mudam** —
   só as telas que eles renderizam.
7. **Lógica pura extraída e testada** (o projeto não tem teste de componente):
   `caixaDaLetra` (acentos, "ç", "ã"), cor do bloco por índice
   (`cicloDeBlocos` deslocado), rótulo de tema com acento (A-33), ícones de
   estrela em meias (A-22), mensagem de resultado (hoje dentro do componente),
   duração de movimento com "reduzir movimento", e um teste de **contraste**
   que recalcula a tabela do guia (já conferida à mão: bate) e trava os pares
   que o guia proíbe.
8. **Comportamento não muda sem decisão.** Contagem de erro (A-20), contador
   de ajuda em contas (A-21), meia estrela (A-22) e ações sem lugar (A-23)
   ficam como estão até o dono responder; as tarefas de tela afetadas ficam
   marcadas com ⛔ e a pergunta que as bloqueia.

### Ordem (cada passo entregável e verificável)

Decisões (T096) → fundação (T097-T107: tokens, fontes, SVG, componentes base,
movimento) → telas por valor: início + folha do adulto (T108, que também
fecha A-31/A-32/A-33), desafios (T109-T112), resultado e histórico
(T113-T114), dupla (T115), abertura (T116) → identidade do app (T117) →
limpeza, Maestro, aparelho real e Plane (T118-T121).

### Riscos

- `react-native-svg` como módulo nativo novo (mesma classe de risco do
  `whisper.rn`): validar com export Android + build EAS antes de usar.
- Custo de desempenho do fundo quadriculado e de muitas animações ao mesmo
  tempo em aparelho barato — medir em aparelho real (T120).
- `toLocaleUpperCase('pt-BR')` no Hermes/Android: conferir no aparelho.
- Portão de "segurar" sem alternativa é barreira de acessibilidade (A-19).
- Arte final (mascote, ícone, splash) vem do dono (A-35); não vou inventar.
- Nome "Letra Viva": INPI antes da loja (D-50).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio da constituição | Verificação nesta spec |
|---|---|
| Princípio supremo (não entregar a resposta) | FR-001–FR-005 mantêm palavra escondida/silêncio conforme a modalidade; nenhuma modalidade expõe a resposta que a criança deve produzir. **Pass.** |
| I. Nunca fica presa | FR-005 (botão de sair sempre visível, D-39, revisado 2026-09-25 — não mais troca automática), FR-013, edge cases cobrem microfone/voz ausentes. **Pass.** |
| II. Erro não pune | US1 cenário 5, FR-007 — erro só conta para métrica, nunca bloqueia. **Pass.** |
| III. Falha do aparelho não é culpa da criança | FR-013, US1 cenários 7 e 9. **Revisado 2026-09-26:** até então a Leitura·voz era oferecida com gravação/transcrição em stub — violação real, achada no teste em aparelho; corrigida na spec (D-44, FR-025) e no plano (Revisão §B, passo 1). **Pass após T085/T086.** |
| IV. Métrica sempre honesta (NON-NEGOTIABLE) | FR-003, FR-007, SC-004 — contador de ajuda por modalidade, estrelas nunca cruzadas. **Pass.** |
| V. Funciona sem internet | FR-019, SC-005, restrição "Storage"/"Constraints" acima. **Pass.** |
| VI. Um toque, instrução no símbolo | **Revisado 2026-09-26:** virou requisito de FR (FR-026, D-47) depois de a auditoria achar chips de 40 (abaixo dos 56 declarados) e botões sob a barra do Android. **Pass após T074.** |
| VII. Configurar é opcional | FR-012. **Pass.** |

Nenhuma violação que exija entrada em Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/001-mvp-desafios-leitura-matematica/
├── plan.md              # Este arquivo
├── research.md          # Fase 0 — decisão de framework + resultado do spike de STT
├── data-model.md        # Fase 1 — Perfil, Rodada, Desafio de leitura/matemática, Registro de histórico
├── quickstart.md        # Fase 1 — como rodar o app localmente
├── contracts/           # Fase 1 — não aplicável a backend; usar para o "contrato" do banco de palavras (schema do item de conteúdo)
└── tasks.md             # Fase 2 (gerado após este plano)
```

### Source Code (repository root)

```text
app/                          # projeto React Native + Expo (package.json, app.json na raiz)
├── src/
│   ├── app/                  # rotas do Expo Router (T003a, 2026-09-24) — arquivo fino por rota,
│   │                        # importa o componente de tela de src/screens/; _layout.tsx é o Stack raiz
│   ├── models/              # Perfil, Rodada, DesafioLeitura, DesafioMatematica, RegistroHistorico (TS types)
│   ├── services/            # avaliacaoLeitura (whisper.rn + tolerância fonética), geradorMatematica,
│   │                        # problemaContextualizado, bancoDeConteudo (grade nível×classificação),
│   │                        # tts (expo-speech), historico (expo-sqlite), configuracao
│   ├── screens/              # Configuracao, Rodada (Ditado/LeituraMontar/LeituraVoz/Matematica),
│   │                        # Resultado, ResultadoDupla, Historico, EscolhaDeVoz, SelecaoPerfil, Dupla
│   └── __tests__/
│       ├── unit/            # regras puras: cálculo de precisão/estrelas, geração de alternativas,
│       │                    # tolerância fonética, seleção de combinação nível×classificação
│       └── contract/         # formato do item de conteúdo (palavra · nível · classificação · marcador)
├── assets/
│   ├── audio/                # clipes gravados de letras/fonemas, empacotados como asset (D-27)
│   └── conteudo/              # banco de palavras por nível×classificação — asset JSON, dado não código
└── e2e/                        # fluxos Maestro (YAML): rodada completa por modalidade, fluxo de dupla
```

**Navegação (decidido em 2026-09-24, durante a Fase 3):** Expo Router,
recomendação atual do próprio Expo (`AGENTS.md` gerado no T003) — sem
isso, teria de se hand-rolar stack/estado de navegação. `src/app/`
detectado automaticamente pelo Metro (confirmado com `npx expo export -p
web`: "Using src/app as the root directory for Expo Router"), tem
precedência sobre um `app/` na raiz do projeto Expo. Não contradiz a
divisão de `src/screens/` já decidida aqui — a rota só importa e
renderiza o componente de tela; a lógica de tela continua em
`src/screens/`, testável isoladamente do roteamento.

**Structure Decision**: projeto único React Native + Expo (mobile-app),
sem separação frontend/backend — não há backend no MVP (T001, research.md,
revisado 2026-09-13: Flutter → React Native pela familiaridade de quem
constrói). `assets/conteudo/` fica separado de `src/` porque é dado
versionado (banco de palavras), não lógica, e será a peça mais
frequentemente revisada por alguém sem formação técnica (A-06). Testes de
fluxo completo (E2E) ficam fora de `src/` em `e2e/` porque são arquivos
Maestro (YAML), não código TypeScript.

## Complexity Tracking

*Sem violações da constituição a justificar nesta fase.*
