# GameLeituraEscrita

Jogo infantil **offline** de leitura e matemática para a fase de
alfabetização. Sem bloqueio de tela, sem contas, sem anúncio — o objetivo é
a criança **ler de verdade**, não passar de fase.

> **Princípio supremo:** o aplicativo não entrega a resposta que a criança
> deveria produzir. Toda decisão de mecânica, conteúdo ou interface é
> medida contra essa frase antes de qualquer outro critério.

## Status

🚧 **Em desenvolvimento inicial.** Este projeto segue
[spec-driven development](https://github.com/github/spec-kit): produto,
constituição e plano técnico já estão fechados. Das 75 tarefas em
[`tasks.md`](specs/001-mvp-desafios-leitura-matematica/tasks.md), 55 estão
concluídas — decisão de stack (T001), spike de reconhecimento de fala
offline (T002, fechado em 2026-09-22 após 19 rodadas de teste; ver
[detalhe](specs/001-mvp-desafios-leitura-matematica/research.md)), o
scaffold do projeto React Native + Expo com lint/format/testes
configurados (T003-T005), e as Fases 2 a 5 completas:

- **Fase 2 — Foundational** (T006-T018): modelos, banco de conteúdo,
  histórico, capacidade do aparelho, TTS, precisão/estrelas.
- **Fase 3 — User Story 1** (T019-T033b): leitura nas 3 modalidades
  (Ditado, Leitura·montar, Leitura·voz), motor de avaliação fonética,
  orquestrador de rodada.
- **Fase 4 — User Story 2** (T034-T040a): matemática, conta pura e
  problema contextualizado, mesmo orquestrador.
- **Fase 5 — User Story 3** (T041-T049a): tela de configuração (tipo,
  modalidade, nível, classificação, tamanho), escolha e teste de voz,
  preferências persistidas por perfil. `index.tsx` virou a tela inicial
  de verdade (não mais placeholder) — o app agora tem um fluxo completo
  **configurar → jogar → resultado → histórico gravado**.

Também nesta janela: D-10 (troca automática de modalidade) foi revogado
a pedido do dono do projeto — trocava de modalidade sozinho depois de 2
falhas, o que escondia o ponto que a criança precisa treinar.
Substituído por D-39 (botão "sair da rodada" sempre visível, nunca
automático) e D-40 (a *próxima* rodada, não a atual, sugere 1 nível
abaixo depois de 2+ erros, sem mascarar o que já foi errado). Ver
[`doc/definições002.MD`](doc/definições002.MD) §14.

77/77 testes, `tsc`/`eslint` limpos, build web exportado com sucesso.
**Lacunas reais e documentadas**: `tipo: "misto"` e o modo "dupla" são
selecionáveis na configuração mas ainda não têm orquestrador (desabilitados
com o motivo visível, nunca escondidos); os testes de integração
(Maestro) foram escritos mas nunca executados (sem Android SDK/emulador
nesta máquina).

## Sobre o projeto

Três modalidades de desafio de leitura — **Ditado**, **Leitura · montar**
e **Leitura · voz** — mais desafios de matemática contextualizada, com
troca automática de modalidade quando uma falha, métricas de ajuda sempre
visíveis (nunca escondidas) e configuração 100% opcional. Roda inteiramente
offline: sem essa restrição, uma queda de conexão poderia impedir a
criança de jogar.

Todas as decisões de produto e as regras que guiam o desenvolvimento estão
documentadas — não é código "adivinhando" requisito:

- [`.specify/memory/constitution.md`](.specify/memory/constitution.md) —
  os 7 princípios inegociáveis do produto (a criança nunca fica presa,
  erro não pune, métrica sempre honesta, funciona sem internet, entre
  outros).
- [`doc/definições001.MD`](doc/definições001.MD) — definição de produto
  original (visão, personas, casos de uso CU-01 a CU-07, decisões D-01 a
  D-16).
- [`doc/definições002.MD`](doc/definições002.MD) — resolução das decisões
  em aberto do 001 (três modalidades de leitura, classificação de
  conteúdo, matemática contextualizada, perfis, modo dupla — D-17 a D-37).

## Estrutura do repositório

| Caminho | Conteúdo |
|---|---|
| [`specs/001-mvp-desafios-leitura-matematica/`](specs/001-mvp-desafios-leitura-matematica/) | Artefatos de spec-driven development: `spec.md`, `plan.md`, `tasks.md`, `data-model.md`, `research.md`, `contracts/`. |
| [`spike-stt/`](spike-stt/) | Spike de viabilidade de reconhecimento de fala offline (Vosk vs. faster-whisper vs. ASR fonético), usado para decidir o motor de STT de Leitura · voz. 19 rodadas de teste documentadas. |
| [`app/`](app/) | Projeto React Native + Expo (criado no T003) — código do app, ainda sem telas/lógica de jogo. |
| [`app/assets/conteudo/`](app/assets/conteudo/) | Rascunho v0 (**não validado pedagogicamente**, issue A-06 aberta) do banco de palavras e dos temas de matemática contextualizada. |
| [`design/prototipo.html`](design/prototipo.html) | Protótipo clicável das 8 telas do MVP — referência visual para as tarefas de tela em `tasks.md`. |
| [`doc/`](doc/) | Documentos de definição de produto (histórico de decisões numeradas D-01 a D-37). |
| [`.specify/`](.specify/) | Configuração do [spec-kit](https://github.com/github/spec-kit) (templates, scripts, constituição). |

## Stack técnica

Decidida e registrada em [`research.md`](specs/001-mvp-desafios-leitura-matematica/research.md).
Scaffold criado (T003-T005); lógica de jogo ainda não implementada:

- **App**: React Native + Expo + TypeScript.
- **Voz (síntese)**: `expo-speech` (TTS nativo do aparelho).
- **Voz (reconhecimento)**: Whisper offline, com viés de vocabulário via
  prompt e tolerância fonética — vencedor do spike de STT frente a Vosk
  (validado em Python com `faster-whisper`; no app, entra via
  [`whisper.rn`](https://www.npmjs.com/package/whisper.rn), binding React
  Native de whisper.cpp). Faixa de acurácia validada contra criança real:
  **62–81%**, ainda abaixo do critério de aceite (≥80%); decisão de
  produto sobre isso segue em aberto.
- **Testes**: Jest + React Native Testing Library, Maestro para fluxos E2E.
- **Plataforma alvo**: Android no mínimo, iOS desejável — modelo de STT
  embutido no app, sem servidor.

## Privacidade

Este projeto lida com voz de crianças (gravações usadas para validar o
reconhecimento de fala). Esses áudios **nunca são versionados** —
`spike-stt/audio/` está no `.gitignore` e vive só localmente. O produto em
si roda 100% offline por princípio de constituição (Princípio V): nenhum
áudio, resposta ou histórico sai do aparelho da criança.

## Como rodar o app

```bash
cd app
npm install
npm start        # abre o Expo dev server, escaneia o QR code no Expo Go
npm run lint
npm run format:check
npm test
```

Sem tela nem lógica de jogo ainda (Fase 2 em diante) — por ora só valida
que o scaffold roda. Detalhes e pré-requisitos completos em
[`specs/001-mvp-desafios-leitura-matematica/quickstart.md`](specs/001-mvp-desafios-leitura-matematica/quickstart.md).

## Como rodar o spike de STT

O spike de reconhecimento de fala é independente do app, executável
isoladamente:

```bash
cd spike-stt
python -m venv .venv
.venv/Scripts/activate   # Windows; source .venv/bin/activate no Linux/Mac
pip install faster-whisper vosk thefuzz
python testar.py
```

Conversão de áudio (`.mp3`/`.m4a` → `.wav` 16kHz mono) chama um binário
`ffmpeg` local em `spike-stt/ffmpeg-bin/` (fora do repo — baixar à parte).
Não há `requirements.txt` ainda — dependências instaladas ad-hoc durante o
spike; ver imports no topo de cada função em `testar.py`.

Veja [`spike-stt/`](spike-stt/) e o histórico completo de rodadas em
`research.md` (§T002) para metodologia e resultados.

## Planejamento

O plano de tarefas (`tasks.md`) é acompanhado em um board interno (Plane),
uma issue por fase/user story (Setup, Fundação, US1–US5 na prioridade
P1–P5 do `spec.md`, Polish), cada uma com a lista de tarefas `T0xx`
correspondente.

## Licença

Ainda não definida.
