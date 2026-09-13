# Quickstart

> **Status atual (2026-09-13, revisado):** o framework mudou de Flutter
> para **React Native + Expo + TypeScript** (T001, ver `research.md`). O
> projeto `app/` ainda não foi criado (T003 do `tasks.md`) — mas,
> diferente da situação com Flutter, **o pré-requisito básico (Node.js)
> já está instalado nesta máquina** (`node v22.14.0`, `npm 10.9.2`), então
> T003 não está mais bloqueado por ferramenta ausente. Falta só rodar o
> scaffold.

## Pré-requisitos

1. Node.js — ✅ já instalado (`node --version`, `npm --version`)
2. Expo CLI — não precisa instalar global; `npx create-expo-app` baixa na
   hora
3. **Para rodar de verdade** (não só preview via Expo Go): Android
   Studio/emulador **ou** um Android físico com o app **Expo Go**
   instalado, pra escanear o QR code de `npx expo start` — não há Android
   SDK nesta máquina ainda, mas isso só bloqueia build nativo (dev
   client), não o scaffold nem o preview inicial em JS puro
4. Como `react-native-vosk` e `expo-speech` são módulos nativos, o app
   real (com STT/TTS) exige um **development build** (`expo prebuild` +
   `eas build` ou build local), não roda no Expo Go genérico — ver
   `research.md` §"Workflow escolhido"
5. Um dispositivo físico com microfone é necessário pra testar
   Leitura · voz de verdade — emulador sem áudio de entrada real não
   valida CU-03

## Criar o projeto (T003 — agora executável)

```bash
npx create-expo-app@latest app --template blank-typescript
cd app
npx expo install expo-speech expo-av expo-sqlite
```

(`react-native-vosk` entra depois, quando o T002 confirmar o motor de STT
— exige `expo prebuild` porque não é compatível com Expo Go.)

## Rodar o app localmente (preview em JS, sem STT/TTS nativo ainda)

```bash
cd app
npx expo start
```

Escaneia o QR code no Expo Go (Android/iOS) ou aperta `a`/`i` pra abrir
num emulador, se houver um configurado.

## Rodar os testes

```bash
cd app
npx jest                      # unit + contrato (app/src/__tests__/unit, app/src/__tests__/contract)
npx maestro test e2e/         # fluxos ponta-a-ponta (app/e2e/*.yaml)
```

## Validar o requisito offline (SC-005)

Depois de instalar o app num dispositivo/emulador, ativar modo avião e
percorrer: abrir → configurar (ou não) → jogar uma rodada completa → ver
resultado → abrir histórico. Nenhum passo deve falhar ou travar por falta
de rede — se falhar, é regressão do Princípio V da constituição.

## Rodar o spike de STT (independente do app)

O spike em `spike-stt/` é Python puro, não depende do projeto React
Native/Expo estar criado — pode rodar isoladamente a qualquer momento:

```bash
cd spike-stt
.venv/Scripts/python testar.py
```

Resultado grava-se em `specs/001-mvp-desafios-leitura-matematica/research.md`,
seção "T002". **Status atual: rodado, inconclusivo — áudios precisam ser
regravados como enunciado único por arquivo** (ver `research.md`).
