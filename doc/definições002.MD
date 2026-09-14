# Desafios — Definições 002: resolução das decisões em aberto

Fecha **A-01 a A-06** do `definições001.MD` com as decisões tomadas nesta rodada.
Introduz a dimensão **classificação (tema)** no conteúdo. Registra **D-17 a D-27**
e as questões novas que essas decisões abriram.

> **Status:** decisões de produto tomadas. Nada aqui substitui a validação com a
> criança (001, seção 10) — o que este doc faz é tirar do caminho a contradição
> A-01, que impedia até o teste de ser interpretável.
>
> Deve ser fundido ao 001 num `definições003` consolidado depois da validação.
> Continua sem tecnologia e sem implementação.

---

## 1. As três modalidades — fecha A-01 e A-02

O modo "montar" de hoje combina palavra escondida (D-04) com som automático
(D-12): a criança ouve e escreve o que ouviu. Isso é **ditado**, não leitura.
Ditado é habilidade legítima — o erro era chamar de leitura e medir como leitura.

Decisão: **três modalidades nomeadas pelo que cada uma treina de verdade.**

| Modalidade | Palavra na tela | App fala? | A criança | Treina |
|---|---|---|---|---|
| **Ditado** | nunca aparece | **sim** (é o enunciado) | monta com as letras | som → letra (base da escrita) |
| **Leitura · montar** | aparece e **some** | **não** | monta pelo que leu e lembrou | decodificação + memória de trabalho |
| **Leitura · voz** | fica visível | **não** | lê no microfone | decodificação + produção oral |

### Consequências no que já estava escrito

- **CU-01, passo 2:** "modo de leitura" passa a ter **3 opções**, não 2.
- **CU-02** se divide: a parte com som vira **Ditado**; a parte silenciosa vira
  **Leitura · montar**.
- **CU-03** continua sendo **Leitura · voz**, sem mudança.
- **A-02 fica fechada como consequência**, não como decisão separada:
  - Ditado: palavra nunca aparece — não existe botão "ver a palavra", só "ouvir
    de novo". A pista é o som.
  - Leitura · montar: palavra aparece e some sozinha. **Que ela some é decisão
    (D-18); em quantos segundos é parâmetro da validação**, não decisão binária.
  - Leitura · voz: palavra fica visível o tempo todo (não há o que esconder).
- **D-04, D-11, D-12** continuam válidos, agora realocados por modalidade.

### Como as 3 modalidades funcionam no nível 1 (letras isoladas)

D-03 continua: nível 1 é sempre "escolher entre 4". O que muda entre modalidades
é o estímulo e a resposta:

| Modalidade | Estímulo | Resposta |
|---|---|---|
| Ditado | app fala a letra (nome ou fonema, ver §5) | toca na letra certa entre 4 |
| Leitura · montar | letra aparece e some | toca em qual era, entre 4 |
| Leitura · voz | letra visível | fala a letra no microfone |

### Métrica: contador de ajuda por modalidade — D-19

"Espiada" não significa a mesma coisa nas três. O princípio 7 (métrica honesta)
exige o contador certo pra cada uma:

| Modalidade | Contador de ajuda mostrado no resultado |
|---|---|
| Ditado | nº de **repetições do áudio** |
| Leitura · montar | nº de **espiadas** (revelar a palavra de novo) |
| Leitura · voz | nº de **tentativas** antes de acertar |

### Estrelas nunca cruzam modalidade — D-20

Cada modalidade tem sua própria série de estrelas no histórico. Estrela de Ditado
e estrela de Leitura medem habilidades diferentes; compará-las é ruído.

---

## 2. Classificação: a segunda dimensão do conteúdo — novo

O conteúdo de leitura/escrita deixa de ser uma lista por nível e passa a ser uma
**grade: nível 1–5 (dificuldade) × classificação (tema)**.

### Regras

- Toda palavra pertence a **um nível** e a **uma ou mais classificações**.
- **Classificação começa no nível 2** (D-22) — letra isolada não tem tema.
- No **CU-01**, o adulto escolhe: uma classificação, várias, ou **"todas"**.
  Padrão = "todas".
- A configuração só oferece combinações **que têm conteúdo suficiente** para a
  rodada escolhida não repetir palavra. Se "corpo" só tem 2 palavras no nível 3,
  não aparece como opção para rodada de 5 ou 8 nesse nível.
- A grade é **esparsa de propósito**: nem toda classificação tem todos os níveis.

### Conjunto inicial de classificações

Proposta a validar (vira A-07): **animais, comida, casa, corpo, natureza, ações.**

---

## 3. Matemática contextualizada — muda CU-04

Decisão: a matemática passa a ter **duas formas, e o adulto escolhe** no CU-01:

| Forma | Exemplo | Quando |
|---|---|---|
| **Conta pura** | "3 + 2" | como no 001 |
| **Problema contextualizado** | "3 maçãs, e mais 2 maçãs" | novo — D-23 |

### Regras do problema contextualizado

- O enunciado é **sempre falado**. Áudio em matemática já era permitido (CU-04):
  ler a conta não é a habilidade avaliada.
- A quantidade aparece **como objetos na tela** (3 maçãs desenhadas + 2 maçãs) —
  D-24. Isso **não contradiz** "não reconhecer figuras": aquela regra é sobre
  leitura. Em matemática concreta, ver a quantidade é o método, não a trapaça.
- A criança **não precisa ler** o enunciado: ele é falado e mostrado concreto.
- A resposta continua: escolher entre **4 numerais** — alternativas próximas, sem
  repetir, nunca resultado negativo (regras do 001 mantidas).
- O tema vem das classificações: problema de "comida" usa maçãs e pães; de
  "animais" usa gatos e passarinhos. Subtração: "tinha 5 passarinhos, voaram 2".

---

## 4. Perfis: um agora, modelo pronto para N — fecha A-05

Decisão (D-25): o MVP tem **um perfil implícito**. Sem tela de seleção, sem
cadastro, invisível para criança e adulto. Mas:

- Todo registro de histórico já carrega um **identificador de perfil** (valor
  fixo `"padrao"` no MVP).
- O resumo do CU-06 é calculado **por perfil**.
- Adicionar perfis depois = uma tela de seleção na abertura + um cadastro simples
  (nome + cor/avatar). **Sem migrar dado nenhum.**

É só uma precaução de modelagem — não é funcionalidade do MVP.

---

## 5. Áudio: síntese como base, gravação onde a síntese falha — fecha A-03 e A-04

### A-03 — nome ou fonema

Decisão (D-26): **o adulto escolhe**, configuração global no CU-01.
Opções: "nome da letra" ("ême") / "som da letra" ("mmm"). **Padrão = som (fonema)**,
que é o que a maioria dos métodos fônicos usa. Deixa alinhar com a escola sem
travar quem não sabe qual método ela usa.

Isso revoga D-13 ("falar sempre pelo nome") — que vira uma das duas opções.

### A-04 — gravado ou sintetizado

Decisão (D-27), dividida por camada:

| Camada de áudio | Fonte | Motivo |
|---|---|---|
| Palavras, frases, enunciados de matemática | **voz sintetizada** do aparelho (D-15 mantido: adulto escolhe e testa) | custo zero, funciona offline, qualidade suficiente para palavra inteira |
| **Letras e fonemas** | **áudio gravado**, embutido no app | voz sintetizada pronuncia fonema isolado mal — "mmm" sai esquisito ou é lido "eme" mesmo assim |

A camada gravada é pequena e fixa: ~26 letras × 2 modos (nome + fonema) ≈ 52
clipes curtos, graváveis por um adulto numa sessão. Fica local (D-16).

### Nova tabela de "o app fala?" — substitui a da seção 6 do 001

| Situação | App fala? |
|---|---|
| **Ditado** (qualquer nível) | **Sim** — o som É o enunciado. Repetível pelo botão. |
| **Leitura · montar** | **Não.** Palavra aparece e some; nenhum áudio. |
| **Leitura · voz** | **Não, nunca** (D-11 mantido) |
| **Matemática** (conta ou problema) | **Sim**, ao abrir e quando pedirem |

Regras de qualidade da fala (001, seção 6) continuam: palavra como palavra nunca
soletrada (D-14), velocidade um pouco mais lenta, letras/sílabas mais lentas
ainda.

---

## 6. Conteúdo: critério e dono — fecha A-06 em parte

- **Dono do conteúdo:** o dono do projeto, até haver validação pedagógica externa.
- **Formato de cada item de leitura:**
  `palavra · nível · classificação(ões) · [marcador fonético opcional]`
  O marcador (dígrafo, encontro consonantal, sílaba complexa) **não afeta a
  mecânica ainda** — só documenta e permite filtrar depois.
- **Critério de nível** (herda a progressão do 001, agora explícito):

| Nível | Conteúdo |
|---|---|
| 1 | Letras isoladas — sem classificação |
| 2 | Sílaba CV, dissílaba regular: bola, casa, pato |
| 3 | CVC / trissílaba regular: porta, sapato, cavalo |
| 4 | Dígrafos, encontros consonantais, palavras longas do cotidiano: chave, prato, escola, bicicleta |
| 5 | Frases de 3 a 5 palavras, só com vocabulário dos níveis anteriores |

- **Continua em aberto:** validação de cada lista por alguém com formação em
  alfabetização. **A-06 permanece** até isso.

---

## 7. Decisões registradas nesta rodada

| # | Decisão | Motivo |
|---|---|---|
| D-17 | Três modalidades nomeadas: Ditado, Leitura·montar, Leitura·voz | Cada uma treina e mede habilidade distinta; montar+som era ditado disfarçado de leitura |
| D-18 | Palavra some no Leitura·montar, nunca aparece no Ditado | Fecha A-02; sem isso o Leitura·montar vira cópia |
| D-19 | Contador de ajuda por modalidade: repetições / espiadas / tentativas | "Espiada" não é igual nos três; a métrica honesta precisa do contador certo pra cada um |
| D-20 | Estrelas por modalidade, nunca comparadas entre modalidades | Estrela de Ditado e de Leitura medem coisas diferentes |
| D-21 | Classificação (tema) como segunda dimensão do conteúdo de leitura | Organiza o vocabulário e abre trilhas de interesse |
| D-22 | Classificação começa no nível 2 | Letra isolada não tem tema |
| D-23 | Matemática ganha "problema contextualizado", falado e com quantidade visual | Liga a operação ao concreto; a criança resolve sem precisar ler |
| D-24 | Objetos visuais são permitidos em matemática | "Não reconhecer figuras" é regra de leitura, não de matemática concreta |
| D-25 | Um perfil implícito no MVP; modelo de dados já multi-perfil | Fecha A-05 sem inflar o MVP nem criar migração futura dolorosa |
| D-26 | A-03 vira config do adulto (nome/fonema), padrão fonema; revoga D-13 | Alinha com o método da escola sem travar quem não sabe qual é |
| D-27 | Áudio: síntese pra palavras/contas, gravação pra letras/fonemas | Síntese pronuncia fonema isolado mal; a camada de letra é pequena e fixa |

---

## 8. O que estas decisões abriram

| # | Questão | O que falta |
|---|---|---|
| **A-06** | Validação pedagógica das listas | Revisão de nível e classificação de cada palavra por alguém formado em alfabetização |
| ~~A-07~~ | ~~Conjunto e volume de classificações no lançamento~~ | **Fechada — ver §10** |
| **A-08** | Traçado à mão | Fora do escopo inicial (montar é a escrita desta fase). Reavaliar depois da validação |
| ~~A-09~~ | ~~Variação da frase no problema de matemática~~ | **Fechada — ver §10** |

---

## 9. Competição com múltiplos perfis — novo, muda CU-01 e CU-05, adiciona CU-08

Pedido do dono do projeto: duas crianças jogando no mesmo aparelho, em dupla,
cooperativo ou adversarial. Isso muda o que o D-25 tinha decidido — perfil
deixa de poder ficar sempre implícito.

### Desenho — a forma que reaproveita o máximo do que já existe

**Dupla = duas rodadas individuais sequenciais, mesma configuração, resultado
combinado no final.** Não é turno-a-turno dentro do mesmo desafio. Motivo:
CU-02, CU-03 e CU-04 continuam **exatamente como estão** — a única coisa nova é
o que acontece antes (escolher os 2 perfis) e depois (mostrar os dois
resultados juntos).

### CU-08 — Jogar em dupla (novo)

**Ator:** duas crianças (ou criança + adulto, sem restrição no app)

1. No CU-01, o adulto escolhe **"dupla"** em vez de "sozinho", e o **formato**:
   cooperativo ou adversarial
2. Escolhe os 2 perfis — ou cria um novo na hora (nome + cor, cadastro mínimo)
3. Tela "vez de [Nome 1]" — joga a rodada inteira, sem mudança nenhuma no que
   já existe
4. Ao terminar: tela "passa o aparelho pra [Nome 2]", alvo grande, impede a
   criança 1 de continuar sem querer no lugar da 2
5. Criança 2 joga **a mesma configuração** (nível, classificação, tamanho,
   modalidade) — obrigatório, senão a comparação não é honesta
6. Resultado combinado (variante do CU-05, abaixo)

**Regras:**
- Se uma criança sair no meio, a rodada dela fica **incompleta** e não entra
  no histórico comparativo — mesma honestidade que já vale pra métrica
  individual, não se inventa resultado pra quem não terminou
- Quem começa: ordem em que os perfis foram selecionados no passo 2

### CU-05, variante "resultado combinado"

- **Cooperativo:** mostra o total somado (estrelas de ambos + celebração
  conjunta) **e** o resultado individual de cada um, lado a lado, pro adulto
  ver o real por trás da soma
- **Adversarial:** estrelas dos dois lado a lado, destaque pra quem teve mais.
  A mensagem de quem teve menos **segue a regra que já existe no CU-05
  ("nunca depreciativa")** — ex.: "Você acertou 6 de 8 — [nome] tirou mais
  hoje, bora tentar de novo?", nunca "você perdeu"

### Decisões

| # | Decisão | Motivo |
|---|---|---|
| D-30 | Dupla = duas rodadas sequenciais + resultado combinado, não turno-a-turno | Reaproveita CU-02/03/04 inteiros, sem mecânica de turno dentro do desafio |
| D-31 | Adulto escolhe cooperativo ou adversarial por rodada | Os dois formatos têm público; nenhum substitui o outro |
| D-32 | Perfil deixa de ser sempre implícito: seletor aparece quando há >1 perfil cadastrado ou ao entrar em "dupla" | Dupla exige 2 perfis ativos de verdade — revisa a parte "invisível sempre" do D-25 (a parte "sem migração de dado" continua valendo) |
| D-33 | Config única (nível/classificação/tamanho/modalidade) vale pros dois perfis numa rodada dupla | Comparação com regras diferentes pra cada um não é comparação — não seria honesto nem no formato cooperativo |

### O que isso abre

| # | Questão | O que falta |
|---|---|---|
| **A-10** | Dupla entre perfis de níveis muito diferentes | Se um perfil está no nível 5 e outro no 1, "mesma config" força um dos dois pra fora do nível dele. Pendente: travar dupla só quando os níveis configurados baterem, ou deixar o adulto decidir sabendo que não vai ser comparação justa |

---

## 10. Fecha A-07 e A-09

### A-07 — conjunto e volume de classificações

Decisão (D-34): **mantém as 6 classificações propostas** no §2 —
animais, comida, casa, corpo, natureza, ações — como escopo do lançamento.
Não há indício de que alguma sobre ou falte para o volume de conteúdo do
MVP; revisar depois da validação com a criança (001 §10), não antes.

Decisão (D-35): o mínimo de palavras por combinação nível × classificação é
**12**, não 8 (o tamanho máximo de rodada). A folga de 4 palavras acima do
maior tamanho de rodada existe para que a mesma combinação, jogada em dias
diferentes, não sorteie sempre a mesma sequência de 8 — sem isso a "rodada
de 8" vira decoreba de ordem fixa, o que contraria o princípio da métrica
honesta (definições001 §7, princípio 7). Combinações abaixo de 12 palavras
continuam bloqueadas pela regra já registrada no §2 ("a configuração só
oferece combinações que têm conteúdo suficiente").

### A-09 — variação da frase no problema contextualizado

Decisão (D-36): **2 a 3 variações fixas por operação, sorteadas
aleatoriamente a cada desafio** — ex. soma: "X e mais Y" / "junte X com Y";
subtração: "tinha X, perdeu Y" / "X, e Y saíram". Não varia por nível no
MVP: a complexidade da frase não é a habilidade sendo avaliada (o enunciado
é sempre falado — §3), então crescer a frase com o nível adicionaria
complexidade de conteúdo e de lógica sem medir nada a mais. Fica como
possível evolução pós-validação, não como requisito do MVP.

### Decisões registradas nesta rodada

| # | Decisão | Motivo |
|---|---|---|
| D-34 | Mantém as 6 classificações propostas (animais, comida, casa, corpo, natureza, ações) | Fecha A-07 (parte 1); sem indício de ajuste necessário antes da validação |
| D-35 | Mínimo de 12 palavras por nível × classificação (rodada máxima é 8) | Fecha A-07 (parte 2); folga evita repetir sempre a mesma sequência na mesma combinação |
| D-36 | 2-3 variações de frase por operação no problema contextualizado, sorteio aleatório, sem variar por nível no MVP | Fecha A-09; evita decoreba de frase sem inflar o MVP com lógica por nível que a métrica não pede |

---

## 11. Viabilidade do STT offline — nova, abre A-11

Spike de STT (`spike-stt/`, rodado em duas rodadas — 2026-09-12 e
2026-09-14) mediu Vosk e faster-whisper contra 14 palavras/frase gravadas
por humano, em condição realista (enunciado curto único, volume normal).
Resultado: **nenhum motor passou de 14% de acerto**, mesmo depois de
descartar problemas de metodologia da primeira rodada (áudio com múltiplas
tentativas por arquivo). Um teste de controle com voz sintética limpa
confirmou que o pipeline e os modelos funcionam corretamente (Vosk 4/4,
Whisper 3/4) — a falha está isolada na gravação humana, não no código.

**Diagnóstico mais específico (2026-09-15):** a rodada de 2026-09-14
simulava deliberadamente o jeito real que uma criança em alfabetização lê
— **pausando e travando dentro da palavra** ("ga... to"), sem entonação
fluida. Isso é provavelmente a causa dominante do resultado ruim, mais que
"ambiente doméstico": motores de ASR (Vosk e Whisper igual) são treinados
majoritariamente sobre fala contínua, e uma pausa longa no meio de uma
palavra quebra a expectativa acústica/de modelo de linguagem do jeito que
nem ruído de fundo quebra. É um caso difícil conhecido de reconhecimento
de fala — e é exatamente o padrão de leitura que o produto precisa aceitar
como certo, não como ruído (ver D-37, abaixo).

Detalhe completo em `specs/001-mvp-desafios-leitura-matematica/research.md`
§T002.

### O que isso abre

| # | Questão | O que falta |
|---|---|---|
| **A-11** | Reconhecimento de fala offline pode não ser confiável o suficiente para leitura pausada/silabada de criança | Vosk grande não ajuda (7%, igual ao pequeno — não é falta de capacidade do Vosk especificamente). **Whisper escala bem**: small 7% → medium 29% → large-v3 43%, ainda offline, ainda abaixo dos 80% mas melhora real. Nuvem pesquisada e não é solução clara: até o Google Cloud STT (produção) acerta só 9.6-14.7% de fala infantil — o gap é do domínio (criança), não de estar offline. Falta medir latência de medium/large-v3 em aparelho real antes de decidir qual embarcar; caminho de revisar o Princípio V (ir pra nuvem) fica como último recurso, não descartado mas o mais caro — ver research.md §T002 pra tabela completa |

### D-37 — tolerância tem dois eixos, não um

A pergunta "dá pra tolerar mais a leitura hesitante?" (dono do projeto,
2026-09-15) expôs que D-08 tratava "tolerância fonética" como um conceito
só. Ela precisa ser dois, com regras opostas:

| Eixo | O que cobre | Tolerância |
|---|---|---|
| **Ritmo/pausa/entonação** | Quanto tempo demora, quantas pausas, se soa "fluida" | **Quase irrestrita.** Soletrar/segmentar em sílabas não é erro — é o método fônico funcionando (D-26). Nenhuma regra de avaliação pode usar duração, número de pausas ou "fluência" como critério de acerto/erro. |
| **Precisão fonética** | Se o som/palavra produzido é o certo | **Continua rígida (D-09 inalterado).** Trocar o som inicial ("pato" por "gato") continua sendo erro, não importa a velocidade com que foi dito. |

**Consequência prática (T028, `avaliacao_leitura`):** a comparação usa só
o **conteúdo fonético final** transcrito, ignorando pausas/tempo. Se o
motor de STT fragmentar a transcrição por causa de uma pausa (ex. devolver
`"ga"` e `"to"` como dois resultados separados em vez de `"gato"`), a
camada de avaliação deve **concatenar antes de comparar**, não reprovar
por fragmentação — a fragmentação é characteristic do motor, não um erro
da criança (Princípio III da constituição, adaptado: falha do
reconhecimento não é culpa da criança).

**Consequência prática (captura de áudio, telas de Leitura·voz):** o
toque no microfone não pode ter um timeout curto nem cortar a gravação
por silêncio breve — se o app corta a gravação assim que detecta uma
pausa, ele nunca dá tempo da criança terminar de soletrar. Gravação para
por toque explícito (soltar o botão/tocar de novo) ou um timeout **longo**
(vários segundos de silêncio, não frações de segundo), nunca por VAD
agressivo.

---

## 12. Acréscimo à validação com a criança (001, seção 10)

As perguntas do 001 continuam. Somam-se:

7. No Leitura·montar, o tempo até a palavra sumir é suficiente pra ela ler, ou
   frustra? (define o parâmetro de D-18)
8. Ela entende e prefere conta pura ou problema contextualizado?
9. Fonema ou nome da letra — qual ela responde melhor? (calibra o padrão de D-26)
10. Se houver duas crianças disponíveis: o adversarial motiva ou frustra quem
    tira menos? (informa a A-10 — se precisa travar por nível compatível)
11. Ela é compreensível o bastante pro reconhecimento de fala funcionar, ou
    A-11 já era esperado? (informa se A-11 é limite do motor ou também da
    fala infantil em si)
