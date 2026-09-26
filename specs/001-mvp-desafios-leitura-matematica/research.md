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

### Consequência arquitetural (T002 fechado — atualizado em 2026-09-23)

Nota histórica (2026-09-15, na época da comparação Flutter/RN): bindings
prontos pra **Vosk** existiam (`react-native-vosk`), pra **faster-whisper**
não — biblioteca Python, presumia-se exigir embarcar whisper.cpp via
módulo nativo próprio. Essa assimetria de custo era o motivo de só migrar
pra Whisper "se o spike mostrar Vosk claramente insuficiente".

**O spike mostrou exatamente isso** (T002, rodada 13: Vosk 10-19%, base de
vocabulário insuficiente pro idioma do banco; Whisper 67-81% — ver
`research.md` §T002 completo). Ao checar o ecossistema RN de novo no T003
(2026-09-23, mesmo cuidado do research.md original — "não confiar só na
memória"), a suposição de "exigiria módulo nativo próprio" também estava
**desatualizada**: existe um binding RN mantido pra whisper.cpp,
[`whisper.rn`](https://www.npmjs.com/package/whisper.rn) (v0.7.4,
publicado 2026-08-27 — ativo). **Decisão**: usar `whisper.rn` pra
`avaliacao_leitura` (T028), não `react-native-vosk`. Ainda não instalado
nem testado em RN — o spike validou a acurácia em Python puro
(faster-whisper), a integração real via `whisper.rn` (mesmo motor
whisper.cpp por baixo, mas binding diferente) precisa de smoke test
próprio antes de confiar 100% que reproduz os mesmos números.

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
| STT (Leitura · voz) | `whisper.rn` (binding RN de whisper.cpp) — Whisper venceu o T002 (62-81%, ver §T002); `react-native-vosk` descartado junto com Vosk (10-19%) | CU-03, FR-004 |
| Reprodução dos clipes gravados (letras/fonemas) | `expo-audio` (confirmado no T003 — `expo-av` não existe mais no SDK 57, substituído) | D-27 |
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

**Correção (2026-09-21): as gravações de todas as rodadas deste spike
são de uma criança de verdade, em fase de alfabetização — não um adulto
simulando** (registrado errado em várias passagens anteriores deste
documento; corrigido aqui e nas rodadas 9/13-15 abaixo). Isso muda a
leitura de tudo que segue: os números de acurácia não são estimativa por
proxy, são o resultado real contra o usuário-alvo. As gravações têm
exatamente o padrão esperado de leitura em alfabetização: **pausando e
travando dentro da palavra** ("ga... to"), não fala fluida de adulto.
Isso muda a leitura do
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
com áudio de criança real, limpo e curto, e mitigar só na
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

> **Isto NÃO é treinar/fazer fine-tuning do modelo** — é uma dica de
> contexto passada a cada chamada de `transcribe()`, que influencia só a
> busca de decodificação daquela transcrição específica. Os pesos do
> `large-v3` continuam sendo exatamente os do checkpoint original baixado
> do Hugging Face, sem nenhuma alteração permanente. Nenhum treinamento
> rodou neste spike, em nenhuma rodada — sem isso ficar claro, a queda de
> 86% (rodada 8) para 57% em palavras novas (rodada 9) poderia parecer
> "o modelo decorou as 14 palavras de treino", o que é uma leitura errada:
> o modelo está igualmente "frio" (pesos inalterados) para as 23 palavras
> testadas nas duas rodadas. A queda vem da **lógica de comparação**
> (`normalizar()`, tolerância), ajustada olhando as manias de transcrição
> destas 14 palavras especificamente — não do modelo "sabendo mais" sobre
> elas.

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

### Rodada 9 (2026-09-21) — validação a frio: replica no conjunto ajustado, cai no conjunto novo

Sessão nova de gravação, uma semana depois, **sem tocar em nenhuma linha
de `normalizar()`/`bate_com_tolerancia_fonetica()` antes de rodar** — a
validação contra overfitting que a rodada 8 deixou pendente. Dois
conjuntos:

- **As mesmas 14 palavras, gravadas de novo** (sessão nova, mesma pessoa) —
  testa se 86% se repete ou foi sorte de uma gravação específica.
- **7 palavras novas** (de 8 pedidas — `correr` não foi gravada; vieram 2
  extras não planejadas, `comida`/`corpo`, que são nomes de classificação,
  não itens de conteúdo — sem vocabulário de prompt pra elas), tiradas do
  banco real (`conteudo/leitura.json`), cobrindo níveis/classificações que
  as 14 originais não cobriam — testa se a lógica generaliza além do que
  foi usado pra ajustá-la. Prompt de vocabulário passado por item, igual o
  app real faria: todas as palavras do mesmo nível×classificação (ex.
  `leão` recebeu o vocabulário completo de nível 2 × animais).

| Conjunto | Resultado |
|---|---|
| 14 originais (sessão nova) | **12/14 (86%) — idêntico à rodada 8, inclusive as mesmas 2 falhas** (`cavalo`, `o gato corre`) |
| 7 palavras novas (generalização) | **4/7 (57%)** |
| Total combinado | 17/23 (74%) |

**Leitura honesta dos dois números, que apontam em direções opostas:**

- **86% replicado é notícia real e boa** — não foi sorte de uma gravação,
  nem ajuste artificial só pra essa amostra: a mesma pessoa, lendo as
  mesmas palavras do mesmo jeito pausado, numa sessão totalmente nova,
  bateu o mesmo número, com os mesmos dois itens difíceis (sinal de que
  `cavalo` e a frase são genuinamente mais difíceis pra esse motor/estilo,
  não ruído aleatório).
- **57% em conteúdo novo é o número que preocupa** — mostra que parte do
  ganho das rodadas 6-8 não generaliza igual pra palavras que nunca
  entraram no ajuste da lógica. Ainda bem acima do baseline original
  (~7-14%), mas abaixo do critério de aceite.
- Erros do conjunto novo, olhando caso a caso: `banana` → "b a l a"
  (confusão acústica genuína), `escova` → "cova" (som inicial sumiu,
  travado corretamente pela regra D-09), `perna` → "prena" — **este
  último é troca de posição de duas letras (metátese), que Levenshtein
  simples conta como 2 edições (substituir 2 vezes) em vez de 1**; um
  algoritmo que reconhece transposição como 1 edição só (Damerau-
  Levenshtein) teria aceitado esse caso. Refinamento real, não testado
  ainda.

### Rodada 10 (2026-09-21) — contexto consistente pra todas: 86% não se sustenta

O dono do projeto pediu pra fornecer "o contexto atualizado" ao Whisper.
Ao investigar isso a sério, achei um problema de metodologia: das 14
palavras originais, **7 (`bola`, `casa`, `cavalo`, `mão`, `pão`, `porta`,
`sapato`) nunca estiveram no banco de conteúdo real** (`conteudo/
leitura.json`) — são exemplos históricos do `doc001`/`doc002`
("bola, casa, pato" nível 2; "porta, sapato, cavalo" nível 3) que nunca
viraram entrada de conteúdo de verdade. O `initial_prompt` que usei nas
rodadas 8-9 pra essas 14 era uma **lista solta arbitrária** (as 14
palavras do próprio teste), não o vocabulário real de nível×classificação
que o app geraria — diferente do que fiz corretamente pras 7 palavras
novas.

Corrigido: adicionei essas 7 ao banco (rascunho, mesma ressalva de sempre
— `conteudo/README.md`), nas classificações que os próprios docs já
sugeriam (`porta`/`cavalo` nível 3, `bola`/`casa`/`mão`/`pão` nível 2), e
rodei **todas as 20 palavras válidas com contexto derivado do banco,
de forma uniforme** — o mesmo processo que o app real usaria pra montar
o prompt de qualquer rodada.

**Resultado: 70% (14/20), não 86%.** E o mais revelador não é o número
final, é a comparação direta: as **mesmas 14 palavras**, com o **mesmo
áudio**, só trocando o conteúdo do prompt (lista solta arbitrária →
vocabulário real do banco), caíram de 86% pra ~77% — `p` e `porta`, que
antes acertavam, agora erraram (`p` → "b", `porta` → "ta").

**Isso é o achado mais importante das 10 rodadas**: o ganho do
`initial_prompt` **não é um efeito estável e generalizável** — é sensível
ao conteúdo exato da lista (tamanho, quais palavras estão perto
foneticamente, quantos itens). Uma lista de 14 itens heterogêneos (que
por acaso incluía sempre a palavra-alvo) enviesou melhor que o
vocabulário real de 12-13 itens da mesma classificação. **86% não deve
ser tratado como o número real do `initial_prompt` — foi, em boa parte,
artefato da lista específica usada, não uma propriedade confiável da
técnica.** 70% (ou os 57% do conjunto totalmente novo) são leituras mais
honestas do que esperar em produção.

### Rodada 11 (2026-09-21) — teste de teto: contexto = exatamente as palavras avaliadas

Pedido explícito do dono do projeto, já nomeando o risco: um único
arquivo de contexto com **exatamente** as palavras sob avaliação (as 21
válidas — 20 palavras + a frase — todas juntas, mesma lista fixa pra
cada transcrição, não uma por item). **Isto é deliberadamente um teste de
teto/limite superior, não uma estimativa de produção** — numa rodada
real do jogo, o prompt vem do vocabulário de UMA combinação
nível×classificação (12-14 itens, rodada 10), nunca de "todas as
respostas possíveis da nossa validação inteira" misturando categorias.

**Resultado: 76% (16/21)** — entre os 70% da rodada 10 (contexto
realista) e os 86% infladas das rodadas 8-9 (lista arbitrária velha).
Recuperou `perna` (agora "perna" exato, antes "prena").

**Leitura correta deste número**: confirma que universo de candidatos
menor/mais fechado tende a ajudar um pouco — mas 76% aqui usa um
universo artificialmente pequeno (21 palavras no total, cobrindo *todos*
os níveis e classificações de uma vez) que não corresponde a nenhuma
rodada real do jogo. **Não substitui os 70% da rodada 10 como estimativa
de produção** — é mais um ponto de dado confirmando que o `initial_prompt`
ajuda, na medida certa do tamanho do universo de candidatos, sem virar
uma técnica confiável e estável o bastante pra fechar T002 sozinha.

### Rodada 12 (2026-09-21) — "a inferência é por comparação fonética de verdade?": não era, e isso escondia 2 bugs reais

Pergunta direta do dono do projeto. **Resposta: não.**
`bate_com_tolerancia_fonetica()` sempre foi comparação **ortográfica**
(distância de edição sobre as LETRAS da transcrição do Whisper), não
fonética de verdade (não compara sons/fonemas) — funciona razoavelmente
porque o português tem ortografia bem próxima da fala, mas "razoavelmente"
não é "de verdade", e a pergunta expôs exatamente onde isso quebra.

**Bug 1 — a trava do D-09 comparava LETRA, não FONEMA.** O "c"/"g" do
português muda de som conforme a vogal seguinte (`gato` = /g/ forte,
`gelo` = /ʒ/ suave — mesma letra "g", fonema diferente). Testei
diretamente: `bate_com_tolerancia_fonetica("gelo", "galo")` devolvia
`True` — **"galo" passava como leitura aceita de "gelo"**, duas palavras
reais e diferentes do banco (`natureza` e `animais`, ambas nível 2).
Corrigido com `_classe_fonema_inicial()`: classifica "ca/co/cu"/"ga/go/gu"
(som forte) separado de "ce/ci"/"ge/gi" (som suave) antes de comparar,
em vez de só a letra.

**Bug 2 — mesmo com o fonema certo, distância ≤1 ainda deixava palavra
real trocar por outra palavra real.** Varri o banco inteiro (272 itens)
procurando pares que colidiriam dentro da mesma rodada (mesmo
nível×classificação): achei **`gato`/`galo`** (nível 2, animais) e
`cama`/`casa` (nível 2, casa) — nos dois casos, mesmo fonema inicial,
1 letra de distância, mas são palavras diferentes de verdade, não ruído
de transcrição uma da outra. Corrigido: `bate_com_tolerancia_fonetica()`
ganhou o parâmetro opcional `vocabulario_conhecido` — um candidato dentro
da distância só passa se ele **não for, ele mesmo, outra palavra
diferente e real do banco**. Revarri o banco inteiro depois do fix:
**zero colisões restantes** nos 272 itens.

**Nenhum número já reportado (57%-86% nas rodadas 6-11) foi contaminado
por esses 2 bugs** — nenhum dos áudios testados até aqui esbarrou neles
por acaso. Mas eram riscos reais e latentes pro banco de conteúdo INTEIRO
(que continua crescendo — T067 ainda precisa validar isso de novo depois
de qualquer expansão de conteúdo), e ficariam sem detecção até acontecer
de verdade com uma criança, o que seria uma violação de D-09/Princípio IV
sem ninguém perceber. `spike-stt/testar_tolerancia.py` ganhou 8 casos
novos (16 no total) cobrindo os dois bugs — 16/16 passa depois do fix.

**Consequência pro T028 (avaliação real)**: `avaliacao_leitura` precisa
receber o vocabulário conhecido (do banco de conteúdo carregado,
`banco_de_conteudo`/T014) como parâmetro, não só comparar contra a
palavra-alvo isolada — e usar classificação de fonema aproximado pro
"c"/"g", não só a letra. Isto é requisito novo, não estava em D-08/D-09
originais porque a ambiguidade nunca tinha sido testada até esta rodada.

### Rodada 13 (2026-09-21) — comparação final entre todos os motores, com a lógica corrigida

Pedido do dono do projeto: rodar todos os motores testados no spike lado
a lado, com a comparação final (fonema aproximado + guard de vocabulário
conhecido, rodada 12), vocabulário restrito por item em cada engine —
`grammar` do Vosk (`KaldiRecognizer` aceita lista de palavras como
gramática), `initial_prompt` do Whisper — derivado do banco real por
nível×classificação (rodada 10), igual pra todos, contra os 21 itens
válidos da sessão de 2026-09-21.

| Motor | Resultado |
|---|---|
| Vosk small | 19% (4/21) |
| Vosk grande (FalaBrasil) | 10% (2/21) |
| Whisper small | 71% (15/21) |
| Whisper medium | **76% (16/21)** |
| Whisper large-v3 | 67% (14/21) |

**Achado 1 — Vosk descartado de vez, com um motivo novo.** Restringir a
gramática não ajudou (piorou até, no caso do modelo grande: 10% vs. ~7%
sem restrição nas rodadas anteriores). E apareceu um problema estrutural
novo: **vários avisos do próprio Vosk** ("Ignoring word missing in
vocabulary") pra palavras do nosso banco — `leão`, `feijão`, `colchão`,
`jacaré`, `pescoço`, `furacão`, `armário`, `televisão`, `pântano`,
`vulcão`, entre outras. O vocabulário base do Vosk (fechado, por modelo)
não cobre parte do português que o jogo usa — diferente do Whisper, que
decodifica por subpalavra e não tem esse limite fixo.

**Achado 2 — o mais importante desta rodada**: com vocabulário restrito
aplicado de forma justa a **todos** os tamanhos de Whisper (não só ao
large-v3, como nas rodadas 8-10), **o tamanho do modelo passou a importar
muito menos**. Sem prompt (rodada 5): 7% → 29% → 43-57%, escalando forte
com o tamanho. Com prompt (esta rodada): 71% → 76% → 67% — os três
tamanhos ficam na mesma faixa, a ordem entre eles nem é mais monotônica
(medium > large-v3 nesta amostra, provavelmente ruído de amostra pequena,
21 itens). **Implicação prática real**: talvez não seja necessário
embarcar o `large-v3` (~3GB) — o `small` (~75MB quantizado) já chega
numa faixa parecida, uma vez que o app sempre vai fornecer o vocabulário
da rodada como prompt. Isso muda a conversa sobre viabilidade de embarcar
no app (tamanho de instalação, tempo de carregamento) — ainda falta medir
latência em dispositivo real (pendência que segue de pé desde a rodada
8), mas agora com uma pergunta adicional: "`small` com prompt te dá quase
o mesmo resultado que `large-v3` — vale o peso extra?"

**Lembrete sobre a pergunta "é fonética de verdade?"**: continua sendo
comparação ortográfica com heurística de classe de fonema pro "c"/"g"
(rodada 12) — não é análise de som/IPA. "Fonética" aqui é aproximação
prática, não garantia formal.

**Nenhum número desta rodada foi usado pra ajustar a lógica** — a
comparação (fonema + vocabulário) já estava fechada e commitada antes
desta rodada rodar; isto é um teste de comparação entre motores, não mais
um ciclo de ajuste da lógica em si.

### Rodada 14 (2026-09-21) — ortográfica vs. fonética real, lado a lado, só Whisper

Pedido explícito do dono do projeto: comparar os 3 tamanhos de Whisper
pontuando a **mesma transcrição** de dois jeitos — a comparação
ortográfica com heurística de "c"/"g" (rodada 12) e uma comparação
**fonética de verdade** (não mais aproximação): implementei
`fonetica.fonemizar_pt()`, um conversor grafema→fonema aproximado pra
PT-BR cobrindo dígrafos (ch/lh/nh/rr/ss), qu/gu antes de e/i, c/g
conforme a vogal seguinte, "j" sempre igual ao "g" suave, "s" intervocálico
como /z/, "x" aproximado a /ʃ/, e nasalização (vogal+m/n em fim de
sílaba, ão/ãe/õe). Validado contra os mesmos 12 casos adversariais da
rodada 12 antes de usar pra valer — 12/12.

Sem Vosk nesta rodada (pedido explícito — já descartado na rodada 13).
Mesma transcrição de cada modelo, pontuada pelos dois métodos:

| Motor | Ortográfica (c/g) | Fonética (fonemizador completo) |
|---|---|---|
| Whisper small | 71% (15/21) | 71% (15/21) |
| Whisper medium | 76% (16/21) | 76% (16/21) |
| Whisper large-v3 | 67% (14/21) | 67% (14/21) |

**Zero divergências** — nenhuma palavra, em nenhum dos 3 modelos, mudou
de veredito entre os dois métodos de comparação.

**Leitura honesta**: isso não significa "fonética não faz diferença
nunca" — significa que, **neste conjunto de 21 palavras específico**, a
única ambiguidade fonética real que existia (o "c"/"g", já corrigido na
rodada 12) foi suficiente; os outros fenômenos que o fonemizador cobre
(dígrafos, s/z, nasalização, j) simplesmente não apareceram como ponto de
discórdia nas transcrições reais coletadas até aqui. **Não está provado
que os dois métodos são equivalentes em geral** — só que são equivalentes
*nesta amostra*. Um conjunto de teste com mais dígrafos/nasalização
poderia revelar divergência que este não revelou. Ficaram os dois
implementados (`testar.bate_com_tolerancia_fonetica`, mais simples e já
usado em T028/tasks.md; `fonetica.bate_por_fonema_real`, mais completo,
disponível se uma expansão futura do banco de conteúdo expuser um caso
onde a heurística pontual do "c"/"g" não for suficiente).

**Isso muda a leitura de T002 outra vez**: o critério de aceite tal como
está escrito em `tasks.md` foi cumprido na rodada 9 (86%) só porque o
teste ainda não usava contexto realista e consistente. Com o teste
metodologicamente correto (rodada 10, confirmado nas rodadas 13-14), **o
número real fica na faixa 62-76% conforme o tamanho do modelo**, sempre
abaixo do critério — T002 não deveria ser considerado aprovado com base
nos números das rodadas 8-9.

### Rodada 15 (2026-09-21) — Damerau-Levenshtein: recupera `perna`, sem abrir colisão nova

Item 1 da lista de caminhos (abaixo) resolvido. `distancia_damerau_levenshtein()`
conta troca de posição de 2 letras adjacentes como 1 edição, não 2 —
"perna"/"prena" (a mesma transcrição que se repetiu em várias rodadas)
passa a bater. Antes de usar pra valer: revarri o banco inteiro (272
itens) procurando colisões novas que o Damerau poderia abrir (ele aceita
mais coisas que o Levenshtein simples, na mesma distância) — **nenhuma
colisão nova**. Revalidei os 16 casos adversariais — 16/16.

| Motor | Levenshtein simples | Damerau-Levenshtein |
|---|---|---|
| Whisper small | 71% (15/21) | 71% (15/21) |
| Whisper medium | 76% (16/21) | 76% (16/21) |
| Whisper large-v3 | 67% (14/21) | **71% (15/21)** |

Só o `large-v3` tinha um caso de transposição pra recuperar. Ganho
pequeno mas real e seguro — `bate_com_tolerancia_fonetica()` ganhou o
parâmetro `usar_damerau` (`False` por padrão, mantém compatibilidade;
`True` ativa o recurso).

### Rodada 16 (2026-09-22) — `thefuzz`/`fuzz.ratio` ≥80%: pior que o que já tínhamos

Pedido do dono do projeto: testar `thefuzz.fuzz.ratio()` (similaridade
proporcional 0-100, baseada em `python-Levenshtein`) com limiar de 80%
como critério de acerto, no lugar da distância de edição fixa (`≤1`).
Implementei `bate_por_fuzz_ratio()` — mesma estrutura/travas de sempre
(fonema inicial aproximado + guard de vocabulário conhecido, D-09), só
trocando o critério de comparação final.

**Checagem adversarial antes de usar pra valer** (os 19 casos de
`testar_tolerancia.py`): **17/19** — 2 falhas, e as duas são rejeição de
variação **legítima** que devia ter passado: `casa`/`caza` e
`gato`/`gata`, ambos com `ratio=75`, abaixo do limiar de 80. Causa
matemática: **qualquer palavra de 4 letras com 1 substituição sempre dá
exatamente 75%** (`2×3 acertos / 8 letras totais × 100`) — o limiar fixo
de 80% é estrutural mente rígido demais pra palavras curtas, que são a
maioria do conteúdo nos níveis 1-2 do jogo.

Rodado contra os 3 Whisper (mesmas transcrições, mesmo vocabulário no
prompt), comparando com o Damerau-Levenshtein da rodada 15:

| Motor | Damerau-Levenshtein (≤1) | `fuzz.ratio` (≥80%) |
|---|---|---|
| Whisper small | 62% (13/21) | 57% (12/21) |
| Whisper medium | 71% (15/21) | 71% (15/21) |
| Whisper large-v3 | 71% (15/21) | 62% (13/21) |

*(números da baseline levemente diferentes das rodadas 13/15 —
não-determinismo do `beam_search` do Whisper entre execuções, ver
ressalva abaixo)*

**`fuzz.ratio` ≥80% perdeu ou empatou em todos os 3 modelos, nunca
ganhou.** Os casos que ele erra e o Damerau acerta confirmam o problema
da checagem adversarial: `"m"` → `"e me"` (a letra "M" dita "ême" —
achado da rodada 7, validado desde então) foi **rejeitado** pelo
`fuzz.ratio` (`ratio("m","eme")=50%`) — palavra de 1 letra é ainda mais
penalizada que palavra de 4. `"a"` → `"ah"` também rejeitado
(`ratio=67%`). Só um caso favoreceu o `fuzz.ratio` (`"banana"` →
`"b a n a"`, aceito por ele e rejeitado pelo Damerau — a similaridade
proporcional tolera 2 deleções no fim de uma palavra de 6 letras, o que a
distância fixa `≤1` não permite; parece um acerto legítimo, mas não
compensa as perdas nas palavras curtas).

**Conclusão: `fuzz.ratio` com limiar fixo não substitui o que já
tínhamos.** Um limiar único não serve pra um vocabulário com palavras de
1 a ~10 letras ao mesmo tempo — precisaria de limiar adaptativo por
tamanho de palavra pra ser competitivo, o que é essencialmente
reinventar, de forma mais complicada, o que `distancia_max` já resolve
de forma simples. Mantida a função `bate_por_fuzz_ratio()` em
`testar.py` (documentada, não removida), mas **não recomendada** — o
método vencedor continua sendo `bate_com_tolerancia_fonetica(...,
usar_damerau=True)`.

**Ressalva nova, encontrada nesta rodada**: os números de baseline
(Damerau-Levenshtein) vieram diferentes entre a rodada 15 (67/76/71%) e
esta execução (62/71/71%) — mesma lógica, mesmos áudios, mesmo prompt.
A causa é não-determinismo do `beam_search` do faster-whisper entre
execuções (a busca por feixe pode convergir pra transcrições levemente
diferentes em decisões de fronteira). **Isso é uma limitação real da
metodologia do spike inteiro**: com amostra pequena (21 itens) e alguma
variância execução-a-execução, qualquer número isolado tem uma margem de
incerteza de alguns pontos percentuais — a faixa 62-76% descreve melhor
o que esperar do que qualquer número único.

### Rodada 17 (2026-09-22) — fonetizador externo (github.com/alvelvis/fonetizador): também pior

Pedido do dono do projeto: testar a biblioteca `foneticabr`/método
`fonetizar` — não existe no PyPI sob esse nome, e o único repositório
`FoneticaBR` no GitHub é PL/SQL (Oracle), inutilizável aqui. O candidato
mais próximo real é
[`alvelvis/fonetizador`](https://github.com/alvelvis/fonetizador) — sua
função pública se chama `fonetiza()`, não `fonetizar()` (nome
aproximado, mesmo projeto). **Sem licença declarada no repositório** —
aceitável pra investigação/spike, mas não deve virar dependência de
produto sem resolver isso com o autor ou trocar por alternativa
licenciada. Vendorizado localmente em `spike-stt/fonetizador_externo.py`
(não está no PyPI, não dá pra `pip install`).

É uma transcrição fonética bem mais completa que o `fonetica.py` caseiro
da rodada 14 — cobre tonicidade, ditongos, redução de vogal átona final
(`corre`→ termina em som de "i", `carro`→ termina em som de "u", regra
real do português brasileiro que o fonemizador caseiro não tinha) e o
mesmo caso de "c"/"g" que já tratávamos.

**Achado de integração, antes de qualquer resultado**: `fonetiza()` só
funciona **palavra por palavra** — passar uma string com espaço não
"simplesmente não transforma", produz fonema **inconsistente**
(`fonetiza("e me")` ≠ `fonetiza("e") + fonetiza("me")`). Implementação
(`bate_por_fonetizador_externo()`) sempre fonemiza token por token antes
de concatenar, nunca a string bruta com espaço — mesmo cuidado do D-37,
aplicado agora na camada fonética.

**Checagem adversarial** (19 casos): **18/19**. A única "falha" é
esperada, não bug: `perna`/`prena`, que a rodada 15 tinha aceitado via
Damerau-Levenshtein na ortografia. A distância fonética REAL entre elas
(via este fonemizador) é **3**, não 1 — `perna` mantém o "r" preso à
sílaba anterior (tepe/coda), `prena` tem "pr" como encontro consonantal
no início — estruturas de sílaba genuinamente diferentes, não só letras
trocadas de lugar. **Isso não invalida a decisão da rodada 15** (o mais
provável ainda é que a criança disse "perna" certo e o Whisper errou a
ordem na transcrição, não que ela disse outra coisa), mas mostra que
aquela tolerância foi uma escolha prática (aceitar provável erro do
motor), não uma equivalência fonética de verdade — vale registrar a
diferença.

Rodado contra os 3 Whisper, mesmo vocabulário no prompt, comparando com
o método atual (Damerau-Levenshtein na ortografia):

| Motor | Damerau-Levenshtein (atual) | Fonetizador externo |
|---|---|---|
| Whisper small | 67% (14/21) | 67% (14/21) |
| Whisper medium | 71% (15/21) | 67% (14/21) |
| Whisper large-v3 | 71% (15/21) | **57% (12/21)** |

**Zero vitórias pro fonetizador externo — empatou ou perdeu em todos.**
Causa raiz, olhando os casos que divergem (`cavalo`→"ca va lo",
`casa`→"ca ca"): fonemizar **cada fragmento isoladamente** introduz
ruído de tonicidade que a concatenação de letras crua não tinha — "ca"
sozinho recebe marcação de sílaba tônica diferente da que "ca" tem
dentro de "cavalo"/"casa" inteiras, então o fonema do fragmento concatenado
se afasta mais da palavra completa do que a simples soma de letras se
afastava. Paradoxo real: **uma transcrição fonética mais rigorosa piora
quando o texto de entrada já vem fragmentado** (que é exatamente o
padrão de leitura pausada de criança que este spike inteiro investiga) —
ferramentas feitas pra texto contínuo bem formado carregam uma
suposição que nosso caso de uso quebra estruturalmente.

**Conclusão: mais uma técnica testada e descartada.** Mantida
`bate_por_fonetizador_externo()` em `testar.py` (documentada), mas **não
recomendada**. Depois de 4 tentativas de trocar/refinar o critério de
comparação (tolerância com trava — vencedora, rodada 7/12; Damerau —
pequeno ganho real, rodada 15; `fuzz.ratio` — pior, rodada 16;
fonetizador externo — pior, rodada 17), o método atual continua sendo o
melhor validado: `bate_com_tolerancia_fonetica(..., usar_damerau=True)`.

### Rodada 18 (2026-09-22) — empilhar os 3 métodos (OU): cruza 80% pela primeira vez, mas só no `medium`

Pedido do dono do projeto: em vez de escolher um método só, considerar
acerto se **qualquer um dos 3** (atual/Damerau, `fuzz.ratio`, fonetizador
externo) aceitar. Antes de rodar contra áudio real: **validei o ensemble
inteiro contra os 19 casos adversariais** — como nenhum dos 3 métodos
tinha, sozinho, dado falso positivo (só ficavam rígidos demais em casos
legítimos), a hipótese era que o "OU" só recuperaria recall sem abrir
brecha de segurança nova. Confirmado: **19/19** — nenhum par adversarial
escapou pela combinação.

Rodado contra os 3 Whisper:

| Motor | Método atual (Damerau) | Ensemble (OU dos 3) |
|---|---|---|
| Whisper small | 67% (14/21) | 67% (14/21) — sem mudança |
| Whisper medium | 76% (16/21) | **81% (17/21) — primeira vez ≥80%** |
| Whisper large-v3 | 71% (15/21) | 71% (15/21) — sem mudança |

O único caso recuperado foi `banana` → `"b a n a"`, e **só via
`fuzz.ratio`** (o mesmo achado positivo isolado da rodada 16 — tolera 2
deleções no fim de palavra longa). **O fonetizador externo não recuperou
nenhum caso nesta rodada** — sua contribuição ao ensemble foi zero.

**Leitura honesta, sem inflar**: sim, muda o cenário — é a primeira vez
que um número cruza 80% com metodologia validada (contexto realista,
trava de D-09 íntegra, sem overfitting de amostra). Mas com ressalvas
reais:

1. **Só o `medium` cruzou, e só nesta execução específica.** A rodada 16
   já mostrou que o `beam_search` do Whisper tem variância
   execução-a-execução de vários pontos percentuais — não há garantia de
   que rodar de novo ainda dá 81%.
2. **Ganho vem de 1 método só, dos 3.** Empilhar o fonetizador externo
   (com sua complexidade de integração token-a-token e licença não
   resolvida) não trouxe nada nesta amostra — um ensemble mais simples,
   `atual OU fuzz.ratio` (2 métodos, sem dependência não-licenciada),
   teria dado exatamente o mesmo resultado.
3. Amostra pequena (21 itens): recuperar 1 caso a mais é uma mudança de
   ~5 pontos percentuais — significativo na proporção, mas é literalmente
   1 palavra.

**Recomendação, se for pra usar ensemble**: `bate_com_tolerancia_fonetica(...,
usar_damerau=True) OU bate_por_fuzz_ratio(..., limiar=80)` — 2 métodos,
não 3, mesmo resultado desta rodada, sem carregar a dependência sem
licença. Documentado, não implementado como padrão em T028 ainda —
decisão de produto sobre se vale a complexidade adicional (rodar 2
comparações em vez de 1 a cada resposta) por ~1 palavra a mais em 21.

### Rodada 19 (2026-09-22) — ASR fonético nativo (`wav2vec2-lv-60-espeak-cv-ft`): descartado

Motivação: o dono do projeto pediu análise de um paper (SSRN, "A Hybrid
Post-Processing Approach for Improving Child Speech-to-Text Accuracy via
Phoneme-Aware Rule-Based Correction", Zane A. Graper, dez/2025). **Leitura
crítica**: o paper propõe uma arquitetura de 3 estágios (ASR fonético →
correção por regras de fonologia infantil → decoder seq2seq IPA→texto),
mas **não tem nenhum resultado empírico** — a seção "Results" só afirma
que o pipeline "funciona" funcionalmente, sem WER antes/depois em lugar
nenhum, e explicitamente adia validação quantitativa pra trabalho futuro.
A única ideia transferível de fato (não validada pelo paper, só a
arquitetura): usar um ASR que já produz fonemas diretamente
(`facebook/wav2vec2-lv-60-espeak-cv-ft`), em vez de fonemizar a saída de
texto do Whisper depois — pulando o estágio 3 do paper (decoder
IPA→texto), já que aqui o vocabulário é fechado (comparação direta contra
a palavra esperada, não geração livre).

**Sanity check com áudio limpo (TTS, mesma voz usada nas rodadas
anteriores)** — antes de gastar esforço no áudio real e difícil, o mesmo
cuidado usado pra validar Vosk/Whisper na rodada 2: de 4 palavras
(`gato`, `porta`, `sapato`, `cavalo`), só `cavalo` saiu limpo. `gato`
ganhou um fonema `n` que a palavra não tem; `sapato` saiu com caracteres
estranhos (`5`) e inserções; `porta` trocou a consoante inicial `p`→`b`.
Já era pior que o sanity check do Whisper (rodada 2: Vosk 4/4, Whisper
3/4) e do Vosk, num áudio limpo e sintético — sinal de alerta antes mesmo
do teste real.

Rodado mesmo assim contra os 20 itens de palavra única do conjunto real
(frases fora de escopo dessa comparação fonema-a-fonema), com tolerância
proporcional ao tamanho do fonema esperado (mais generosa que o
`distancia_max=1` do método vencedor, e **sem** a trava de
`vocabulario_conhecido` — ainda mais permissivo que o padrão):

**7/20 (35%)** — muito abaixo de qualquer configuração do Whisper testada
(62-81%). Exemplos do tipo de erro: `banana`→`"b ɑ5 m ʉ n a"` (dist. 5),
`perna`→`"p ʌ r aɪ j ʌ n n aː"` (dist. 9), `porta`→`"ɑ t a"` (perdeu a
consoante inicial toda).

Há também uma **limitação estrutural**, não só de acurácia: esse modelo é
um reconhecedor acústico puro (fonema por fonema), **sem mecanismo de
`initial_prompt`/viés de vocabulário** — a alavanca que, sozinha, tirou o
Whisper de 57% pra 76-81% (rodadas 8-18). Mesmo que a acurácia bruta
melhorasse, não há como aplicar a mesma técnica que gerou o maior ganho
até agora.

**Conclusão, sem inflar**: avenida testada e **descartada**. Nem o sanity
check limpo nem o teste real sustentam essa direção — pior em acurácia
bruta e sem a alavanca que mais ajudou até aqui. Volta a fechar o leque:
depois de 19 rodadas, a melhor opção continua sendo Whisper + vocabulário
no prompt + Damerau-Levenshtein (rodada 15), com o ensemble opcional
`atual OU fuzz.ratio` (rodada 18) como teto observado uma vez.

**Não fechar T002 sozinho — esta decisão é do dono do projeto**, mas com
um número mais honesto agora: **62-81% é a melhor estimativa atual**
(faixa, não ponto único — rodada 16 mostrou variância execução-a-execução
do próprio Whisper; o topo, 81%, só apareceu 1 vez, no `medium`, via o
ensemble da rodada 18) (Whisper, qualquer tamanho, com vocabulário no
prompt e Damerau-Levenshtein; `fuzz.ratio` isolado não ajuda, mas somado
ao método atual via OU recupera 1 caso). `fuzz.ratio` sozinho (rodada 16),
o fonetizador externo sozinho (rodada 17) e o ASR fonético nativo (rodada
19) testados e descartados — nenhum supera o método atual sozinho; **só o
ensemble `atual OU fuzz.ratio` cruzou 80%**, uma vez, no `medium` (rodada
18). Caminhos restantes, em ordem de custo crescente — o que dava pra
testar sem depender de mais nada do dono do projeto já foi testado
(rodadas 1-19); os que sobram **exigem ação de fora do spike**:

**Correção importante (2026-09-21):** as 15 rodadas deste spike **já
foram feitas com voz de uma criança real em fase de alfabetização**, não
um adulto simulando — isso estava registrado errado em várias passagens
anteriores deste documento (corrigido acima e em `doc/definições002.MD`
§11). **O item "validar com criança real" não é mais uma pendência — já
está satisfeito.** Os 62-76% são o resultado real contra o usuário-alvo,
não uma estimativa por proxy.

1. **Medir latência em dispositivo real** (via whisper.cpp quantizado,
   não Python puro, num Android real) — decide qual checkpoint embarcar,
   já que a rodada 13 mostrou que o tamanho do modelo importa pouco pra
   acurácia quando há prompt de vocabulário. Bloqueado até existir um
   dispositivo/emulador Android configurado (T003 ainda pendente). **Esta
   é a única pendência técnica real que resta.**
1b. **Testar o STT nativo do Android (`SpeechRecognizer`, modo
   on-device) contra os mesmos áudios** — pergunta do dono do projeto em
   2026-09-21. Não dá pra testar em Python puro (precisa de emulador
   Android + Android Studio + um app mínimo injetando os áudios como
   microfone virtual); iOS (`SFSpeechRecognizer`) nem isso — exige macOS/
   Xcode, indisponível nesta máquina. **Decisão: adiado pra quando o T003
   rodar** (o setup de Android SDK/emulador serve pros dois — testar STT
   nativo e rodar o app de verdade — não é esforço duplicado). Ao testar,
   confirmar que o reconhecimento roda **on-device de verdade**
   (`EXTRA_PREFER_OFFLINE`, checar `isOnDeviceRecognitionAvailable()`) —
   o modo padrão do Android pode cair pra nuvem silenciosamente conforme
   idioma/configuração, o que violaria o Princípio V se fosse parar no
   produto sem essa checagem.
2. Testar com mais de uma criança/sessão, se possível — os 62-76% vêm de
   uma criança só; robustez estatística melhora com mais vozes, mas isso
   já é refinamento, não pré-requisito (diferente do que a versão anterior
   deste documento dizia).
3. Regravar isolando a variável — a mesma palavra fluida vs. pausada, pra
   medir quanto da queda de acurácia original (antes de qualquer
   tratamento) era só efeito da pausa. Valor menor agora que já temos o
   número real com o padrão de leitura que a criança vai usar de fato.
4. Reconsiderar a tolerância fonética de D-08/D-09 (ex.: distância máxima
   maior que 1, ou proporcional ao tamanho da palavra) ou a própria
   obrigatoriedade de Leitura · voz no MVP — decisão de produto, não mais
   investigação técnica.
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

### Encerramento do spike (2026-09-22)

**T002 fechado por agora**, a pedido do dono do projeto. Fechado como
**investigação concluída**, não como "problema resolvido" — as 19
rodadas esgotaram tudo que dava pra testar sem depender de mais nada de
fora do spike (motores diferentes, ajuste de vocabulário via prompt, 4
técnicas de comparação, inclusive um ASR fonético nativo). O resultado
honesto continua **62-81%**, abaixo do critério de aceite (≥80%) na
leitura estrita.

O que sobrevive ao fechamento, sem bloquear o resto do roadmap:

1. **Medir latência real + testar STT nativo Android** — só é possível
   com o ambiente do T003 montado (Android SDK/emulador); não é uma
   incógnita de acurácia, é de performance/plataforma.
2. **Decisão de produto**: aceitar 62-81% pro MVP como está, ou revisar
   D-08/D-09/a obrigatoriedade de Leitura · voz — não é mais uma questão
   técnica, pode ser decidida a qualquer momento pelo dono do projeto,
   independente do calendário do T003.

Se qualquer uma dessas pendências mudar o cenário (dispositivo real
disponível, ou decisão de produto sobre o critério), reabrir T002 com uma
nova rodada numerada, mantendo o histórico das 19 rodadas anteriores
intacto.

---

## Pré-spike de integração do `whisper.rn` (2026-09-26, antes de T087)

**Por que existe**: o primeiro teste em aparelho real (doc002 §15, D-44)
mostrou que Leitura·voz "não captou a voz" — causa real: gravação e
transcrição da rota `/rodada` são stubs desde T031. O spike de 2026-09-22
provou que Whisper acerta 62-81% **em desktop**; nunca provou que a
integração no app funciona. Isto é a lista do que **não sabemos** e que T087
precisa responder, medindo, antes de qualquer serviço ser escrito:

1. `whisper.rn` compila e roda com o Expo SDK 57 (config plugin/prebuild,
   arquitetura nova do React Native)? Só o T003 de 2026-09-23 checou que o
   pacote é "mantido e ativo" — não que builda neste projeto.
2. Formato de áudio: o que o motor aceita como entrada versus o que o
   gravador do `expo-audio` produz por padrão? Se houver conversão
   (taxa de amostragem, canais, contêiner), é o principal risco técnico.
3. Tamanho do modelo no APK e latência de transcrição num aparelho real —
   o `research.md` já dizia (rodada 8, item 1 das pendências acima) que a
   latência real nunca foi medida.
4. Microfone no emulador Docker (`docker/android/`) não é real — a
   validação de captura precisa de aparelho físico (T092).

Nenhuma dessas quatro está verificada. Resultado do T087 entra aqui, como
seção numerada, mantendo o histórico anterior intacto.


### Resultado parcial do T087 (2026-09-26) — o que se verificou sem aparelho

Lido nos tipos e na documentação do `whisper.rn` 0.7.4 (publicado em
2026-09-17), instalado no projeto:

- **Import**: o `package.json` só declara `exports` de subcaminho (`./*`),
  sem entrada raiz — `import 'whisper.rn'` não resolve no TypeScript;
  funciona `whisper.rn/index`.
- **Formato do áudio**: `transcribeData` aceita "base64 encoded float32 PCM
  data or ArrayBuffer". O microfone em tempo real entrega PCM de 16 bits —
  conversão em `services/stt/pcm.ts`, testada.
- **Captura**: o `RealtimeTranscriber` do `whisper.rn` não grava sozinho
  ("requires @fugood/react-native-audio-pcm-stream") e traz VAD/auto-corte,
  que D-37 proíbe. O `expo-audio` no Android grava por `MediaRecorder`, que
  não produz WAV/PCM. Caminho adotado: `@fugood/react-native-audio-pcm-stream`
  capturando 16 kHz/mono/16 bits, sem gravar arquivo (conferido no código
  Java do módulo), com a permissão pedida pelo `expo-audio`.
- **Modelo**: `ggml-tiny-q5_1` 32.152.673 B · `ggml-base-q5_1` 59.707.625 B ·
  `ggml-small-q5_1` 190.085.487 B (content-length no Hugging Face). Escolhido
  `small` porque é o único com evidência de acerto (62-81% no spike, desktop).
  Não cabe no git (limite de 100 MB) → `scripts/baixar-modelo.mjs`, rodado
  também pelo hook `eas-build-post-install`.
- **Aviso de risco**: o módulo de PCM usa a API antiga de `NativeModules` (e
  `NativeEventEmitter`); o app roda na arquitetura nova do RN 0.86.
  Compatibilidade **não verificada**.

**Ainda sem resposta (só um aparelho responde)**: o `whisper.rn` sobe neste
SDK? Latência real do `small` quantizado num Android de verdade? O acerto do
`small` quantizado bate os 62-81% do desktop? O módulo de PCM entrega áudio
na arquitetura nova? Isso é o T092.
