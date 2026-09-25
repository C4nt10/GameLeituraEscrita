# Emulador Android via Docker

Setup para rodar o app (e eventualmente os specs Maestro em `app/e2e/`) num
emulador Android real, dentro de Docker, nesta máquina Windows + WSL2 +
Docker Desktop.

## Por quê

Sem Android SDK/emulador nem Maestro CLI instalados nesta máquina, nenhum
dos specs `app/e2e/*.yaml` escritos ao longo do projeto foi executado de
verdade — só existem como especificação. Isso também bloqueava testar STT
nativo do Android e medir latência em dispositivo real (research.md §T002,
"1b"). Este setup resolve os dois.

## Pré-requisitos (fazer 1x por reinício do WSL/Docker Desktop)

O passo de KVM abaixo **não é persistente** — some toda vez que o WSL
reinicia (`wsl --shutdown`, reboot do Windows, update do Docker Desktop
etc.) e precisa ser refeito.

1. **Nested virtualization habilitada** em `%USERPROFILE%\.wslconfig`:
   ```ini
   [wsl2]
   nestedVirtualization=true
   memory=12GB
   ```
   `memory=12GB` é necessário — o limite padrão do Docker Desktop (~50% da
   RAM do host) não é suficiente pra rodar o emulador junto com outra
   stack pesada (ex.: Plane rodando via docker compose). Nesta máquina
   (15.7GB de RAM total), 12GB pra a VM do WSL2 deixa ~3.7GB pro Windows —
   funciona, mas é apertado se outros containers pesados também estiverem
   de pé. **Pare outras stacks grandes (`docker compose stop` no projeto
   delas) antes de subir o emulador**, senão a VM estoura RAM e o
   `qemu-system-x86_64` do emulador morre com SIGSEGV, derrubando junto o
   backend do próprio Docker Desktop (visto na prática: `docker ps`
   passou a devolver 500 Internal Server Error até o WSL ser reiniciado).

2. Depois de qualquer `wsl --shutdown` (necessário pra aplicar mudança no
   `.wslconfig`), o dispositivo `/dev/kvm` **não existe** dentro da distro
   `docker-desktop` até os módulos serem carregados manualmente:
   ```powershell
   wsl.exe -d docker-desktop -- sh -c "modprobe kvm; modprobe kvm_intel; chmod 666 /dev/kvm"
   ```
   Confirma que funcionou: `ls -la /dev/kvm` deve mostrar o device (major
   10, minor 232) em vez de "No such file or directory".

## Subir o emulador

```bash
docker compose -f docker/android/docker-compose.yml up -d
```

Notas sobre o `docker-compose.yml`:
- `privileged: true` é obrigatório — o entrypoint da imagem
  `budtmo/docker-android` roda `sudo chown <uid>:<gid> /dev/kvm`
  internamente ao iniciar; sem `privileged: true` isso falha com
  `sudo: unknown user root` e o processo do emulador (`device` no
  supervisord) nem chega a subir.
- `EMULATOR_ADDITIONAL_ARGS` é o nome real da env var pra passar
  argumentos extra pro `emulator` do Android (confirmado em
  `documentations/CUSTOM_CONFIGURATIONS.md` do repo `budtmo/docker-android`
  — **não** é `ADDITIONAL_ARGS`, nome que aparece em alguns exemplos
  desatualizados por aí).

## Verificar que subiu

```bash
docker exec gle-android-emulator adb devices -l
# esperado: emulator-5554   device   product:sdk_gphone64_x86_64 ...
```

Boot completo (imagem `emulator_13.0` = Android 13/API 33) leva
tipicamente ~30s com aceleração KVM ativa (bem mais lento, ou nunca
termina, sem KVM). Log de boot: dentro do container,
`/home/androidusr/logs/device.stdout.log` — procurar por
`Boot completed in <N> ms`.

Tela do emulador via navegador (noVNC): http://localhost:6080

## Rodar o app nele

Nenhum módulo nativo hoje instalado (`expo-audio`, `expo-sqlite`,
`expo-router`, `expo-speech`) deveria exigir dev client/prebuild
customizado — dá pra usar o Expo Go padrão:

```bash
# 1. instala o Expo Go no emulador (baixar o APK da versão compatível
#    com o Expo SDK do projeto, ver app/package.json)
docker exec gle-android-emulator adb install /caminho/para/expo-go.apk

# 2. sobe o Metro no host
cd app && npx expo start

# 3. conecta o emulador ao Metro do host — o adb dentro do container e o
#    host compartilham rede via o port-forward da própria imagem
#    (porta 5555 publicada no compose)
```

`whisper.rn` (STT nativo, ainda não instalado) passaria a fazer sentido
testar aqui, já que agora existe um Android real pra rodar contra —
antes disso não havia onde validar.

## Parar

```bash
docker compose -f docker/android/docker-compose.yml down
```

Volta a subir a stack que você parou pra liberar RAM (ex.: Plane) depois.
