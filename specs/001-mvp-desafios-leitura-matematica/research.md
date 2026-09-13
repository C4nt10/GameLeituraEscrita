# Research — Fase 0

## T001 — Framework/stack (decidido, revisado em 2026-09-13)

**Decisão original (2026-09-10): Flutter.** Revista e **trocada para React
Native + Expo + TypeScript** depois de reavaliar a pedido do dono do
projeto. Versão exata (SDK do Expo) pinada no T003, não aqui.

### Por que a decisão original mudou

A comparação técnica entre Flutter e React Native, feita com dado atual
(não só memória), deu **empate nos dois pontos que antes pareciam decidir
a favor do Flutter**:

| Critério | Flutter | React Native |
|---|---|---|
| STT offline (Vosk, pt) | `vosk_flutter` | `react-native-vosk` — **ativamente mantido (v2.1.7)**, suporte explícito a português. A nota da decisão original ("binding pronto só existe em Flutter") estava **desatualizada** — corrigida aqui. |
| TTS nativo do aparelho | `flutter_tts`, ativo | `expo-speech` (mantido pelo time do Expo, evita o pacote `react-native-tts` avulso, que está sem publicação há ~2 anos) |
| UI 100% customizada, sem nada "parecendo nativo" | Vantagem estrutural (Skia renderiza tudo) | Alcançável (Reanimated 3), exige mais cuidado de normalização entre plataformas |
| Performance em tablet mais fraco | Levemente melhor (AOT nativo) | New Architecture (Fabric/Hermes) fechou boa parte da diferença |
| Ecossistema geral | Menor, cobre o necessário | Maior (npm) |
| **Familiaridade de quem constrói** | Nenhuma (Dart do zero) | **JS/TypeScript e React — conhecimento real já existente** |

Nenhum critério técnico é decisivo sozinho — dava pra construir bem nos
dois. O critério que decidiu de fato foi o único que não é uma questão de
ecossistema: **quem vai construir já tem experiência real em
JavaScript/TypeScript e React (web), nenhuma em Dart/Flutter.** Isso pesa
mais que qualquer diferença marginal de performance ou maturidade de
pacote — ramp-up numa linguagem nova é custo real e recorrente, as
diferenças técnicas da tabela não são.

### Consequência arquitetural (afeta o T002 do mesmo jeito que antes)

A mesma lógica que valia para Flutter vale para React Native: bindings
prontos para **Vosk** existem (`react-native-vosk`), para **faster-whisper**
não (biblioteca Python; exigiria embarcar whisper.cpp via módulo nativo
próprio, não um pacote existente). Isso não decide o T002 sozinho — a
acurácia medida no spike continua sendo o critério — mas mantém a mesma
assimetria de custo: Vosk mais barato de integrar, whisper.cpp só se o
spike mostrar Vosk claramente insuficiente.

### Workflow escolhido: Expo com dev client (não Expo Go puro)

`react-native-vosk` e `expo-speech`/módulos nativos em geral não rodam no
app genérico "Expo Go" — exigem um **development build** (`expo prebuild`
+ `eas build` ou build local). Isso é o padrão recomendado do próprio Expo
para apps com módulos nativos em 2025/2026, não uma fuga do "modo Expo" —
mantém as vantagens de tooling (EAS Build, config plugins, atualização
OTA para o JS) sem abrir mão de código nativo quando necessário.

## Primary Dependencies (decidido, condicionado ao T002 para o motor de STT)

| Necessidade | Pacote/abordagem | Cobre |
|---|---|---|
| TTS (palavras/frases/enunciados) | `expo-speech` (embrulha TextToSpeech/AVSpeechSynthesizer nativos) | D-27, CU-07 (listar/testar vozes pt do aparelho) |
| STT (Leitura · voz) | `react-native-vosk` (pendente confirmação de acurácia no T002) | CU-03, FR-004 |
| Reprodução dos clipes gravados (letras/fonemas) | `expo-av` (ou `expo-audio`, sucessor mais recente no SDK do Expo — confirmar versão estável no T003) | D-27 |
| Persistência dinâmica (histórico, perfis, configuração) | `expo-sqlite` (SQLite embarcado) | FR-014, FR-015, T012 (Perfil), T013 (RegistroHistorico), T015 (historico) |
| Banco de palavras/classificações (conteúdo estático) | assets JSON versionados em `app/assets/conteudo/`, carregados em memória | FR-010, FR-011, T014 — não precisa de SQL, é dado só de leitura, pequeno, e revisado por alguém sem formação técnica (mais simples de editar como JSON do que via SQL) |

## Testing (decidido)

**Jest + React Native Testing Library** para unitários e de componente
(`app/src/__tests__/unit/`, `app/src/__tests__/contract/`); **Maestro**
(fluxos YAML, sem exigir build nativo pesado como o Detox) para os fluxos
ponta-a-ponta (`app/e2e/`) — rodada completa por modalidade, dupla. Cobre
o que `plan.md` já exigia como mínimo (cálculo de precisão/estrelas,
geração de alternativas, troca automática de modalidade, exclusão de
dupla incompleta).

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
