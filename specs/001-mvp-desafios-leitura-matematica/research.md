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

**Status**: **rodado duas vezes, não fechado — resultado real, mas abaixo
do critério de aceite.** Não é mais problema de metodologia (2026-09-14);
é um resultado de verdade que expõe uma questão maior de produto.

### Rodada 1 (2026-09-12) — descartada por metodologia

Os primeiros 14 áudios (`.ogg`) tinham várias gravações de fala dentro de
um único arquivo, separadas por silêncio — de 2 trechos (`A.ogg`) a **18**
(`SAPATO.ogg`, 28 segundos para uma palavra). Resultado (Vosk 14%,
Whisper 0%) descartado como não confiável — não era o formato que o app
real captura (um enunciado curto por toque no microfone).

### Rodada 2 (2026-09-14) — áudio corrigido, resultado real

Áudios regravados como um único enunciado curto por arquivo (0.4s a 7.5s,
`.mp3`, volume normal −20 a −23dB, sem clipping). Resultado:

| Cenário | Vosk | Whisper (small) |
|---|---|---|
| Áudio bruto | 1/14 (7%) | 1/14 (7%) |
| Com 300ms de silêncio nas bordas (`adelay`+`apad`) | 2/14 (14%) | 0/14 (0%) |

Bem abaixo do critério de aceite (≥ 80%). Antes de aceitar isso como
limite real dos motores, validei se o **pipeline em si** funciona: gerei
áudio sintético em pt-BR (voz "Microsoft Maria Desktop", já instalada no
Windows) para 4 das palavras e rodei os dois motores contra ele.

| Palavra (sintética, voz limpa) | Vosk | Whisper (small) |
|---|---|---|
| gato | ✅ gato | ✅ gato |
| porta | ✅ porta | quase — "porto" |
| sapato | ✅ sapato | ✅ sapato |
| cavalo | ✅ cavalo | ✅ cavalo |

**Pipeline e modelos funcionam corretamente** (Vosk 4/4, Whisper 3/4 com
erro mínimo) — a falha está isolada nas gravações humanas em si, não no
código nem na escolha de motor.

### Diagnóstico refinado (2026-09-15): a variável provável é a pausa, não o ruído

As gravações humanas da rodada 2 simulavam deliberadamente o jeito real
que uma criança em alfabetização lê: **pausando e travando dentro da
palavra** ("ga... to"), não fala fluida de adulto. Isso muda a leitura do
resultado — nível de volume normal não é garantia de qualidade, mas o
fator dominante aqui é mais específico que "ruído doméstico": **motores de
ASR (Vosk e Whisper) são treinados majoritariamente sobre fala contínua, e
uma pausa longa no meio de uma palavra quebra a expectativa acústica/de
modelo de linguagem de um jeito que nem ruído de fundo quebra.** É um caso
difícil documentado de reconhecimento de fala — e coincide exatamente com
o padrão de leitura que o produto precisa tratar como acerto, não como
ruído (ver D-37 em `doc/definições002.MD` §11, criada a partir desta
mesma investigação).

Efeito colateral técnico a considerar em T028: se o motor fragmenta a
transcrição por causa da pausa (ex. devolve `"ga"` e `"to"` como dois
resultados separados em vez de um `"gato"` contínuo), uma comparação
ingênua por igualdade de string rejeitaria uma leitura correta só por
causa da fragmentação — a camada de avaliação precisa concatenar antes de
comparar (D-37).

### Rodada 3 (2026-09-15) — testar se a concatenação (D-37) recupera o resultado

Apliquei a mitigação de D-37 no próprio `testar.py` (`bate()` agora aceita
`esperado` como a concatenação de todos os tokens transcritos, não só
igualdade exata) e rodei de novo contra os mesmos áudios da rodada 2.
**Resultado idêntico**: Vosk 1/14 (7%), Whisper 1/14 (7%) — a concatenação
não recuperou nenhum acerto a mais.

**Isso é um achado real, e desmonta parte da hipótese anterior.** Olhando
as transcrições linha a linha ("sapato" → "esta a tal", "porta" → "va! ta",
"pato" → "ta? ta"), não são fragmentos corretos separados por uma pausa
que a concatenação resolveria — são **sons genuinamente diferentes dos
esperados**, não apenas mal segmentados. A fragmentação por pausa (D-37,
efeito colateral técnico) continua sendo um cuidado correto pra manter no
T028 — é boa prática e não custa nada — mas **não é a explicação principal
do resultado ruim**. O problema é mais fundo: os modelos parecem errar a
identidade dos sons/sílabas quando a fala é pausada, não só a colagem
deles. Isso é consistente com um efeito acústico conhecido — coarticulação
(a forma como um som influencia o seguinte) carrega informação real que o
modelo usa pra reconhecer, e falta quando a fala é segmentada — mas neste
ponto isso é uma hipótese, não algo verificado por este spike.

### O que isso significa pro produto

Isto deixou de ser "escolher Vosk ou Whisper" e virou uma pergunta maior:
**reconhecimento de fala offline embarcado pode não aguentar leitura
pausada/silabada de criança** — nenhum motor testado passou de 14% mesmo
com áudio humano limpo e curto simulando esse padrão, e mitigar só na
camada de comparação (D-37, rodada 3) não recuperou o resultado. Ver A-11
em `doc/definições002.MD` §11. Manter a mitigação de D-37 no T028 mesmo
assim (é higiene correta, sem custo), mas **não tratá-la como solução**
pro problema de acurácia — o problema está no reconhecimento acústico em
si, não só na comparação de texto depois.

**Não fechar T002 como aprovado.** Três caminhos possíveis, nenhum
decidido ainda:

1. Regravar isolando a variável — a mesma palavra fluida vs. pausada, pra
   medir quanto da queda de acurácia é só efeito da pausa (mais preciso
   que só "gravar num ambiente mais controlado").
2. Testar um modelo Vosk maior (o atual é o "small" pt, ~40MB;
   existe modelo pt maior, ~1GB+, mais pesado pra embarcar num app infantil
   mas potencialmente mais preciso).
3. Reconsiderar a tolerância fonética de D-08/D-09 ou a própria viabilidade
   de Leitura · voz como modalidade obrigatória no MVP — se nem 15% de
   acerto em condição real for viável, talvez a modalidade precise de um
   fallback mais agressivo (ex.: cair pra Leitura·montar mais cedo, não só
   após 2 falhas).

Também corrigido no processo (independente do resultado): `testar.py`
normalizava mal nomes de arquivo com `_`/espaço à direita (nasal escapado
e frase), e quebrava com `UnicodeEncodeError` no console do Windows
(cp1252). Ambos corrigidos e commitados nas duas rodadas.
