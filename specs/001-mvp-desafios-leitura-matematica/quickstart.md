# Quickstart

> **Status atual (2026-09-23):** T001 (stack) e T002 (spike de STT)
> fechados — React Native + Expo + TypeScript, motor de STT `whisper.rn`
> (Whisper via whisper.cpp). **T003 concluído**: `app/` criado
> (`create-expo-app@latest`, template `blank-typescript`, SDK Expo 57),
> `expo-speech`, `expo-audio` e `expo-sqlite` instalados. Ainda falta
> `whisper.rn` — entra junto com a implementação de `avaliacao_leitura`
> (T028), que exige `expo prebuild` por ser módulo nativo (não roda no
> Expo Go genérico).

## Pré-requisitos

1. Node.js — ✅ já instalado (`node --version`, `npm --version`)
2. Expo CLI — não precisa instalar global; `npx expo` baixa na hora
3. **Para rodar de verdade** (não só preview via Expo Go): Android
   Studio/emulador **ou** um Android físico com o app **Expo Go**
   instalado, pra escanear o QR code de `npx expo start` — não há Android
   SDK nesta máquina ainda, mas isso só bloqueia build nativo (dev
   client), não o preview em JS puro
4. Como `whisper.rn` e `expo-speech` são módulos nativos, o app real (com
   STT/TTS) exige um **development build** (`expo prebuild` + `eas build`
   ou build local), não roda no Expo Go genérico — ver `research.md`
   §"Workflow escolhido"
5. Um dispositivo físico com microfone é necessário pra testar
   Leitura · voz de verdade — emulador sem áudio de entrada real não
   valida CU-03

## Projeto já criado (T003)

```bash
npx create-expo-app@latest app --template blank-typescript
cd app
npx expo install expo-speech expo-audio expo-sqlite
```

(`whisper.rn` entra na implementação de `avaliacao_leitura`, T028 — exige
`expo prebuild` porque não é compatível com Expo Go. `expo-audio`, não
`expo-av`: o SDK 57 do Expo não tem mais `expo-av`.)

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
Native/Expo — pode rodar isoladamente a qualquer momento:

```bash
cd spike-stt
.venv/Scripts/python testar.py
```

**T002 fechado (2026-09-22)**: 19 rodadas, faixa honesta 62-81% contra
áudio de criança real (Whisper, vocabulário no prompt + tolerância
fonética). Detalhe completo em `research.md` §T002.

## Modelo de fala (Leitura · voz)

**D-56 (2026-09-30):** o modelo **não vai mais embutido no app** — não fica
no git nem no APK. `services/stt/download` baixa pro armazenamento do
aparelho na primeira vez que a criança/adulto toca em "baixar" na tela de
Leitura · voz (achado num build real: o Node/V8 não cria string maior que
~512 MiB, e o Metro precisa disso pra empacotar um `require()` de asset —
qualquer modelo acima disso, incluindo o próprio `medium`, nunca coube).

Qual modelo este build baixa é `EXPO_PUBLIC_MODELO_DE_VOZ` (`small` por
padrão, `~190 MB`; `medium`, `~514 MB`), lido em runtime
(`services/stt/modelos_remotos.ts`) e definido por perfil em `eas.json`
(`preview` / `preview-voz-medium`). Sem download nenhum, o app funciona
normalmente — "Leitura · voz" aparece desabilitada com um motivo acionável
("toque para baixar", D-44). `whisper.rn` é módulo nativo: não roda no Expo
Go, só num build (EAS/prebuild) — e o download em si só funciona num
build real, nunca no Expo Go.

## Verificação antes de gastar um build no EAS

`npx expo export -p web` **não basta**: a web resolve módulos do Node (como
`buffer`) sozinha e o Android não. O primeiro build com o `whisper.rn` falhou
por isso ("Unable to resolve module buffer", vindo de `safe-buffer`) e o
export web passou. Rode também:

```bash
cd app
npx expo export --platform android --output-dir dist-android && rm -rf dist-android
```

Pega erro de resolução de módulo em ~10 s, em vez de ~10 min de fila do EAS.
(Não pega erro de compilação nativa — esse só o build mostra.)
