# Quickstart

> **Status atual (2026-09-10): o Flutter SDK ainda não está instalado
> nesta máquina de desenvolvimento**, e o projeto `app/` ainda não foi
> criado (T003 do `tasks.md`). Os passos abaixo são o quickstart-alvo,
> válido a partir do momento em que T003 for concluído — não é possível
> executá-los hoje.

## Pré-requisitos

1. Flutter SDK (canal stable) — <https://docs.flutter.dev/get-started/install>
2. `flutter doctor` sem erros para ao menos uma plataforma alvo (Android
   mínimo viável — ver `plan.md`)
3. Um emulador Android ou dispositivo físico com microfone (necessário
   para testar Leitura · voz de verdade — emulador sem áudio de entrada
   real não valida CU-03)

## Rodar o app localmente

```bash
cd app
flutter pub get
flutter run
```

## Rodar os testes

```bash
cd app
flutter test                 # unit + widget (app/test/unit, app/test/contract)
flutter test integration_test # fluxos ponta-a-ponta (app/test/integration)
```

## Validar o requisito offline (SC-005)

Depois de instalar o app num dispositivo/emulador, ativar modo avião e
percorrer: abrir → configurar (ou não) → jogar uma rodada completa → ver
resultado → abrir histórico. Nenhum passo deve falhar ou travar por falta
de rede — se falhar, é regressão do Princípio V da constituição.

## Rodar o spike de STT (independente do app Flutter)

O spike em `spike-stt/` é Python puro, não depende do Flutter estar
instalado — pode rodar isoladamente a qualquer momento assim que os
áudios existirem:

```bash
cd spike-stt
python testar.py
```

Resultado grava-se em `specs/001-mvp-desafios-leitura-matematica/research.md`,
seção "T002".
