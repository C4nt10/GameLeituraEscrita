# Research — Fase 0

## T001 — Framework/stack (decidido)

**Decisão**: Flutter (Dart), canal stable. Versão exata pinada no T003
(scaffold do projeto), não aqui — evita registrar um número que já estará
desatualizado quando a implementação começar.

**Por quê, contra as alternativas reais**:

| Opção | Por que não |
|---|---|
| React Native | TTS/áudio nativo exige mais pontes manuais por plataforma; ecossistema de STT offline embarcado é mais raro que em Flutter |
| Nativo (Kotlin + Swift, dois códigos) | Dobra o esforço de manutenção de uma única pessoa/time pequeno mantendo o mesmo produto duas vezes — sem ganho que justifique, dado que nada aqui exige API nativa exclusiva de uma plataforma |
| PWA / Web | Falha o Princípio V (funciona sem internet) na prática de instalação/atualização de PWA em tablets infantis, e microfone/TTS offline em web têm suporte inconsistente entre navegadores |

Flutter atende: um codebase para Android (mínimo viável) + iOS (desejável),
STT e TTS embarcados com plugins maduros, sem dependência de rede em
runtime (Princípio V da constituição).

### Consequência arquitetural encontrada durante a decisão (afeta o T002)

Bindings Flutter para STT offline **existem prontos para Vosk**
(`vosk_flutter`), mas **não existem prontos para faster-whisper** (é uma
biblioteca Python; embarcar Whisper em Flutter exigiria whisper.cpp + uma
ponte FFI própria — trabalho de integração adicional, não só troca de
pacote). Isso não decide o T002 sozinho — a decisão de motor de STT
continua dependendo da acurácia medida no spike — mas muda o custo de cada
opção: se a acurácia do Vosk for aceitável, ele é estritamente mais barato
de integrar. Só vale pagar o custo extra do whisper.cpp se o spike mostrar
o Vosk claramente insuficiente.

## Primary Dependencies (decidido, condicionado ao T002 para o motor de STT)

| Necessidade | Pacote/abordagem | Cobre |
|---|---|---|
| TTS (palavras/frases/enunciados) | `flutter_tts` (embrulha TextToSpeech/AVSpeechSynthesizer nativos) | D-27, CU-07 (listar/testar vozes pt do aparelho) |
| STT (Leitura · voz) | `vosk_flutter` (pendente confirmação de acurácia no T002) | CU-03, FR-004 |
| Reprodução dos clipes gravados (letras/fonemas) | `audioplayers` | D-27 |
| Persistência dinâmica (histórico, perfis, configuração) | `sqflite` (SQLite embarcado) | FR-014, FR-015, T006, T007, T009 |
| Banco de palavras/classificações (conteúdo estático) | assets JSON versionados em `app/conteudo/`, carregados em memória | FR-010, FR-011, T008 — não precisa de SQL, é dado só de leitura, pequeno, e revisado por alguém sem formação técnica (mais simples de editar como JSON do que via SQL) |

## Testing (decidido)

`flutter_test` para unitários/widget, pacote `integration_test` para os
fluxos ponta-a-ponta (rodada completa por modalidade, dupla). Cobre o que
`plan.md` já exigia como mínimo (cálculo de precisão/estrelas, geração de
alternativas, troca automática de modalidade, exclusão de dupla
incompleta).

## T002 — Spike de STT

**Status**: **inconclusivo, não fechado** (2026-09-12). Os 14 áudios
chegaram e o spike rodou, mas o resultado (Vosk 2/14 = 14%, faster-whisper
0/14 = 0%) não é um dado confiável sobre acurácia dos motores — é sintoma
de qualidade de gravação, não de motor de STT. Registrar isso como
resultado real seria a mesma desonestidade que a esteira já pegou uma vez
neste projeto (DOCOCR-1): declarar validado o que não foi.

**Diagnóstico**: cada arquivo tem várias gravações de fala dentro de um
único `.ogg`, separadas por silêncio — de 2 trechos (`A.ogg`) a **18**
(`SAPATO.ogg`, 28 segundos de duração para uma palavra). `GATO.ogg` sozinho
tem 9 trechos em 16 segundos. Isso não é o formato que o spike (nem o app
real) espera: a captura de Leitura·voz é de um enunciado curto por toque no
microfone, não uma gravação longa com múltiplas tentativas.

Uma tentativa de cortar automaticamente para o maior trecho contínuo de
fala (`aparar.py`, via `ffmpeg silencedetect`) **piorou** o resultado
(Vosk caiu pra 7%, Whisper continuou girando em torno de alucinações tipo
"tchau"/"eca" características de entrada quase-silenciosa) — sinal de que
o trecho mais longo detectado nem sempre é a palavra-alvo, pode ser
respiração ou ruído de fundo entre tentativas. Cortar certo exigiria ouvir
cada arquivo manualmente, o que derrota o propósito de um spike rápido.

Também corrigido no processo, achado real e independente do resultado
acima: `testar.py` normalizava mal os nomes de arquivo com `_` — `MAO_` e
`PAO_` (nasal escapado) e `O_GATO_CORRE` (frase) nunca bateriam com a
transcrição mesmo com reconhecimento perfeito, e a tabela quebrava com
`UnicodeEncodeError` no console do Windows (cp1252) sempre que o STT
devolvia acento fora do padrão. Ambos corrigidos e commitados.

**Próximo passo real**: regravar os 14 áudios como um único enunciado
curto por arquivo (tocar gravar, falar a palavra uma vez, parar — do jeito
que a criança realmente vai usar o microfone no app), não uma sessão longa
com repetições. Só então o spike mede o que precisa medir. Motor de STT
(`vosk_flutter` vs. custo de integrar whisper.cpp) continua em aberto até
lá.
