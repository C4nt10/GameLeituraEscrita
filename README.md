# GameLeituraEscrita

Jogo infantil offline de leitura e matemática para a fase de alfabetização.
Sem bloqueio de tela, sem contas — o objetivo é a criança **ler de fato**.

## Onde está o quê

- [`doc/definições001.MD`](doc/definições001.MD) — definição de produto original
  (visão, personas, casos de uso CU-01 a CU-07, princípios de usabilidade,
  decisões D-01 a D-16).
- [`doc/definições002.MD`](doc/definições002.MD) — resolução das decisões em
  aberto do 001 (três modalidades de leitura, classificação de conteúdo,
  matemática contextualizada, perfis, modo dupla — D-17 a D-33).
- [`spike-stt/`](spike-stt/) — spike de viabilidade de reconhecimento de fala
  offline (Vosk vs. faster-whisper), usado para decidir o motor de STT de
  Leitura · voz.
- [`.specify/`](.specify/) + [`specs/001-mvp-desafios-leitura-matematica/`](specs/001-mvp-desafios-leitura-matematica/)
  — artefatos de spec-driven development ([spec-kit](https://github.com/github/spec-kit)):
  `constitution.md`, `spec.md`, `plan.md`, `tasks.md`.

## Planejamento

O planejamento (`tasks.md`) está registrado como issues no Plane:
**workspace `esteira`, projeto `GameLeituraEscrita` (GLE)** —
http://localhost/esteira/projects/bf8adc45-ed42-4618-83e7-0da06e31d5e7/issues/

8 issues, uma por fase/user story (Setup, Fundação, US1–US5 na prioridade
P1–P5 do `spec.md`, Polish), cada uma com a lista de tarefas `T0xx`
correspondente de `tasks.md`.

> Nota: este projeto é independente do esteira/PipeCoder — reaproveita
> apenas a mesma instância local do Plane, já que ambos rodam no mesmo
> ambiente de desenvolvimento.
