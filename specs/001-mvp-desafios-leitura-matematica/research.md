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

### Rodada 4 (2026-09-15) — modelo Vosk grande (FalaBrasil, 1.6GB), descarta a hipótese "falta de capacidade"

Testei o caminho 2 dos três listados abaixo: `vosk-model-pt-fb-v0.1.1`
(FalaBrasil/UFPA, 1.6GB, treinado em 8 bases públicas + 3 privadas de
PT-BR — bem mais robusto que o "small" de 40MB usado até aqui). Baixado
de [alphacephei.com/vosk/models](https://alphacephei.com/vosk/models).

Achado técnico à parte: o arquivo `rescore/G.carpa` do modelo tem
**2.27GB**, e a biblioteca `vosk` (Python, Windows) falhou ao carregá-lo
(`ConstArpaLm <LmStates> section reading failed` — parece limite de
arquivo grande na lib, não corrupção de download). Contornado movendo
`rescore/` pra fora do caminho, o que desativa o rescoring de 2 passos
(4-gram) mas mantém o modelo acústico maior e o grafo de decodificação
completo — ainda uma comparação válida do "modelo bem maior/melhor treinado
ajuda?", só que sem o refinamento final do rescore.

**Resultado: não ajudou.** Vosk grande: 1/14 (7%) — igual ao modelo
pequeno, só que errando de forma diferente. Preocupante: as transcrições
do modelo grande são **mais confiantes em respostas erradas** ("gato" →
"catorze", "casa" → "criar um certo", "cavalo" → "k voar pular") em vez de
garbage claramente sem sentido — vocabulário maior parece ter dado mais
chance de alucinar uma palavra real errada, não mais chance de acertar a
certa.

**Isso descarta a hipótese "só falta capacidade/treino do modelo".** Um
modelo ~40x maior, especificamente treinado em português brasileiro, teve
a mesma taxa de acerto que o modelo pequeno genérico contra fala pausada.
Reforça a leitura da rodada 3: o problema é estrutural em como esses
motores tratam pausa dentro de palavra, não algo que escala com tamanho
de modelo.

### Rodada 5 (2026-09-15) — "capacidade não ajuda" era certo só pro Vosk

O dono do projeto perguntou se um motor **online** resolveria. Antes de
mexer no Princípio V (funciona sem internet — não-negociável), busquei
dado real sobre acurácia de STT em fala infantil especificamente,
[assemblyai.com/blog/how-accurate-speech-to-text](https://www.assemblyai.com/blog/how-accurate-speech-to-text)
e o estudo de reconhecimento de fala infantil que cita: **mesmo o Google
Cloud Speech-to-Text — motor de nuvem, produção, empresa com escala
máxima — acerta só 9.6% de utterances infantis (14.7% com critério
relaxado), WER de 49%.** Bem perto do que medimos localmente (7-14%). "Ir
pra nuvem" não é bala de prata pra voz de criança — o gap de acurácia pra
fala infantil é conhecido e afeta motores de nuvem também.

O mesmo dado mostra o **Whisper** (modelo cheio) muito à frente pra fala
infantil: 36.8%/60.3% de acerto, WER 21.3% (vs. 49% Google, 30% Azure) —
mas essa vantagem parece vir da **escala de treino do Whisper** (680 mil
horas, 96 idiomas), não de estar na nuvem. Isso abre um caminho que
**não** exige revisar o Princípio V: testar Whisper com um checkpoint
maior que o "small" usado até aqui, ainda 100% offline.

Testei `whisper medium` (769M parâmetros, vs. 39M do "small") contra os
mesmos 14 áudios pausados:

| Motor | Resultado (1ª medição) |
|---|---|
| Whisper small | 1/14 (7%) |
| Whisper medium | 4/14 (29%) |
| Whisper large-v3 | 6/14 (43%) |

### Rodada 6 (2026-09-15) — a medição em si tinha um furo em D-37

O dono do projeto perguntou, corretamente: **a comparação acima aplicava
os dois eixos de tolerância de verdade?** Resposta honesta: só parte.
`bate()` já concatenava tokens separados por espaço (D-37), mas **o
Whisper pontua hesitação/pausa com vírgula, ponto e interrogação**
("ca, sa" pra casa, "ta? ta" pra pato, "fa, va, lo" pra cavalo) —
`normalizar()` só tirava pontuação das **bordas** da string
(`.strip(".,!? ")`), não do meio. Uma transcrição como `"ca, sa"` virava
`"ca, sa"` (vírgula preservada no meio), a concatenação dava `"ca,sa"`,
e a comparação com `"casa"` falhava — **por causa da própria pontuação
que marca a pausa que D-37 diz que não pode contar contra a criança.**
Bug real na medição, não no motor.

Corrigido (`normalizar()` agora remove pontuação em qualquer posição, não
só nas bordas) e re-testado:

| Motor | 1ª medição (furo em D-37) | Corrigido |
|---|---|---|
| Whisper small | 7% | 7% (sem mudança — erros eram genuínos) |
| Whisper medium | 29% | 29% (sem mudança) |
| Whisper large-v3 | 43% | **57% (8/14)** |

O `large-v3` ganhou 2 acertos a mais (`casa`, `pato`) só por corrigir a
medição — ele **já tinha reconhecido os sons certos**, só que separados
por pontuação de pausa que a comparação anterior não ignorava. Vosk não
muda (nunca pontuou hesitação nos testes, output sempre foi texto corrido
sem pontuação interna).

**57% é o número real do large-v3 contra fala pausada até aqui — bem mais
perto dos 80% do que os 43% registrados antes.** Isso não muda a
conclusão da rodada 5 (Whisper escala, Vosk não) — reforça ela, e mostra
que a distância até o critério de aceite é menor do que parecia.

### Rodada 7 (2026-09-15) — tolerância fonética de verdade (D-08), com trava do D-09

Até aqui todo `bate()` comparava **exato** (depois de concatenar/limpar
pontuação) — nunca testou a tolerância a variação de pronúncia que D-08
já exige. Implementei `bate_com_tolerancia_fonetica()`: aceita distância
de edição (Levenshtein) ≤ 1 contra qualquer token ou a concatenação,
**com trava dura** — o primeiro som/letra tem que bater exatamente, nunca
importa a distância (opera D-09 concretamente: "pato" nunca passa como
leitura de "gato", os dois começam com som diferente, ficam fora do
candidato antes mesmo de medir distância).

| Motor | Estrita | Tolerante (distância ≤ 1, trava no som inicial) |
|---|---|---|
| Whisper small | 7% | 36% (5/14) |
| Whisper medium | 29% | 43% (6/14) |
| Whisper large-v3 | 57% | **64% (9/14)** |

Achado que valida a abordagem, não só o número: **"M" foi transcrito como
"e me"** (fragmentado) — a tolerância aceitou, e isso é **certo de
verdade**: a letra M se fala "ême" em português (D-13/D-26), o motor
reconheceu o som certo, só fragmentado pela pausa. Não é frouxidão, é
tolerância fazendo exatamente o que D-08 pede.

**Validação adversarial da trava (feita na sequência, mesma rodada):**
`spike-stt/testar_tolerancia.py` testa a lógica sozinha, sem depender de
áudio — 8 casos incluindo os pares adversariais diretos (`gato`/`pato` nos
dois sentidos, `mão`/`pão`, `bola`/`pola`) e casos de variação legítima
(`casa`/`caza`, `gato` fragmentado). **8/8 corretos** — a trava barra
todo par adversarial testado e aceita toda variação legítima testada.
Isso não prova que a trava é infalível pra todo caso futuro (novo
conteúdo pode ter pares mínimos não cobertos aqui), mas tira o risco de
"nunca foi testado contra o caso óbvio que preocupa" — que era o estado
antes desta validação.

### Rodada 8 (2026-09-15) — vocabulário no prompt + fix de hífen: 86%, primeira vez acima do critério

O dono do projeto pediu mais um tratamento pra aumentar o número. Dois
testados:

**1. `initial_prompt` com o vocabulário da rodada.** No app real, sempre
se sabe o conjunto de palavras possíveis daquela combinação
nível×classificação (FR-011 já garante ≥12 itens). Passar essa lista como
`initial_prompt` do faster-whisper é reconhecimento com vocabulário
restrito — técnica padrão de produto de voz (é como assistentes de voz
enviesam pra nomes de contato, ou um IVR enviesa pras opções do menu), não
"colar a resposta": o modelo ainda decide pela evidência acústica, o
prompt só influencia o modelo de linguagem.

**Checagem de segurança antes de confiar nisso** (o risco óbvio: será que
o prompt não faz o modelo "chutar" uma palavra da lista só por ela estar
lá, violando D-09?): testei com voz sintética limpa dizendo "pato" com
`gato` no vocabulário do prompt — reconheceu "pato" correto, não "gato".
Testei de novo com a gravação humana real e difícil de "pato" — não virou
"gato" (a trava barrou), só continuou não reconhecendo a palavra certa
também. **Pior caso observado: falso negativo (continua não sabendo),
nunca falso positivo (nunca credita a palavra errada).**

**2. Fix de mais um buraco na limpeza de pontuação**: o Whisper também
fragmenta sílaba com **hífen** ("ca-ca" pra "casa", achado ao rodar com
prompt) — mesmo problema da vírgula/ponto da rodada 6, só que com outro
caractere. `normalizar()` agora trata hífen como pausa (vira espaço) do
mesmo jeito. Revalidei `testar_tolerancia.py` depois do fix — **8/8,
trava continua de pé**.

| Motor/tratamento | Resultado |
|---|---|
| large-v3, estrito | 57% |
| large-v3, + tolerância fonética (rodada 7) | 64% |
| large-v3, + `initial_prompt` do vocabulário | 79% |
| large-v3, + fix do hífen | **86% (12/14)** |

**Primeira vez acima do critério de aceite (≥80%).** Os 2 que continuam
errando: `cavalo` (reconhecido como "pa va lo" — som inicial genuinamente
diferente, a trava do D-09 rejeita corretamente) e a frase `o gato corre`
(comparação de frase ainda não ganhou tolerância, só a de palavra única).

**Ressalva séria, que impede fechar T002 mesmo com 86%:** essa lógica de
comparação (concatenação, limpeza de pontuação/hífen, tolerância com
trava) foi **ajustada olhando os erros destes mesmos 14 áudios**, rodada
após rodada (6, 7 e 8). Isso é risco real de **overfitting numa amostra
de 14 itens, 1 pessoa só**. Parte da melhora pode ser regra genuinamente
melhor (o fix de pontuação certamente é — corrige um bug de verdade,
independente da amostra); parte pode ser só "aprendi as manias de
transcrição deste teste específico" e não generaliza pra áudio novo.
**Antes de tratar 86% como número real, falta testar contra áudio novo
que não foi usado pra ajustar nada** — outra pessoa lendo, ou a mesma
pessoa gravando de novo sem eu ter visto o resultado antes de fixar a
lógica.

**Trade-off que ainda falta medir**: large-v3 (~3GB fp32, ou quantizado
int8 aqui usado no teste) é pesado pra embarcar e mais lento que os
menores; nenhuma medição de **tempo de resposta em dispositivo real**
foi feita (tudo rodou em desktop) — latência alta quebra a experiência de
qualquer forma. `initial_prompt` também tem custo: o app precisa montar e
passar a lista de vocabulário a cada desafio, pequeno mas não nulo.

**Não fechar T002 como aprovado — 86% é o melhor número até aqui, mas com
duas pendências sérias antes de virar decisão.** Caminhos restantes, em
ordem de custo crescente:

1. **Validar contra áudio novo** (não usado pra ajustar `normalizar()`/
   `bate_com_tolerancia_fonetica()`) — o teste mais barato e mais
   importante agora, é o que decide se 86% é real ou overfit na amostra
   de 14. Regravar as mesmas 14 palavras (ou um conjunto novo) sem mexer
   mais na lógica de comparação até depois de rodar.
2. Medir latência de `medium`/`large-v3` (via whisper.cpp quantizado, não
   Python puro) num dispositivo Android real — se `large-v3` rodar rápido
   o bastante, o número validado no passo 1 já dá base pra decidir qual
   checkpoint embarcar.
3. Regravar isolando a variável — a mesma palavra fluida vs. pausada, pra
   medir quanto da queda de acurácia original (antes de qualquer
   tratamento) era só efeito da pausa.
4. Reconsiderar a tolerância fonética de D-08/D-09 (ex.: distância máxima
   maior que 1) ou a própria obrigatoriedade de Leitura · voz no MVP, se
   a validação do passo 1 não se sustentar.
5. Ir para um motor online **exigiria revisar o Princípio V** — decisão de
   constituição, não de implementação. Dado o gap de acurácia infantil que
   afeta nuvem também (Google 9.6-14.7%), e que Whisper offline já captura
   a maior parte da vantagem do Whisper (a mesma arquitetura, só sem ser
   hospedada), não está claro que valeria o custo de abrir mão do "funciona
   sem internet". Não descartado, mas é o caminho mais caro e o menos
   promissor.

Também corrigido no processo (independente do resultado): `testar.py`
normalizava mal nomes de arquivo com `_`/espaço à direita (nasal escapado
e frase), e quebrava com `UnicodeEncodeError` no console do Windows
(cp1252). Ambos corrigidos e commitados nas duas rodadas.
