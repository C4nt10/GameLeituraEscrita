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
- Reconhecimento de fala (Leitura · voz): `react-native-vosk` — **motor
  final ainda pendente de confirmação pelo spike em `spike-stt/`** (T002)
  comparando Vosk vs. faster-whisper em precisão. Vosk é o favorito também
  por integração: tem binding React Native mantido, faster-whisper não
  (exigiria whisper.cpp + módulo nativo próprio — ver research.md).
- Reprodução dos clipes gravados de letra/fonema: `expo-av` (confirmar se
  `expo-audio`, sucessor mais recente, já está estável no T003).
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
("Multiplataforma com modelo embutido").

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
caber num tamanho de instalação razoável para um app infantil (favorece
Vosk sobre Whisper small, a confirmar). Interface para criança pré-leitora:
sem texto como única pista de ação (Princípio VI da constituição).

**Scale/Scope**: uso doméstico, 1–2 perfis por aparelho no MVP (D-25,
D-32), histórico de até 50 rodadas por perfil. Sem exigência de escala
multiusuário/concorrência — é um app local de uso individual/familiar.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio da constituição | Verificação nesta spec |
|---|---|
| Princípio supremo (não entregar a resposta) | FR-001–FR-005 mantêm palavra escondida/silêncio conforme a modalidade; nenhuma modalidade expõe a resposta que a criança deve produzir. **Pass.** |
| I. Nunca fica presa | FR-005, FR-013, edge cases cobrem microfone/voz ausentes e troca automática de modalidade. **Pass.** |
| II. Erro não pune | US1 cenário 5, FR-007 — erro só conta para métrica, nunca bloqueia. **Pass.** |
| III. Falha do aparelho não é culpa da criança | FR-013, US1 cenário 7. **Pass.** |
| IV. Métrica sempre honesta (NON-NEGOTIABLE) | FR-003, FR-007, SC-004 — contador de ajuda por modalidade, estrelas nunca cruzadas. **Pass.** |
| V. Funciona sem internet | FR-019, SC-005, restrição "Storage"/"Constraints" acima. **Pass.** |
| VI. Um toque, instrução no símbolo | Não detalhado a nível de FR nesta spec (é requisito de UI, tratado no design visual, não bloqueia o plano). **Pass condicional** — validar em wireframe antes da Fase 1 de design de UI. |
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
│   ├── models/              # Perfil, Rodada, DesafioLeitura, DesafioMatematica, RegistroHistorico (TS types)
│   ├── services/            # avaliacaoLeitura (react-native-vosk + tolerância fonética), geradorMatematica,
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
