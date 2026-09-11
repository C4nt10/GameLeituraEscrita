# Desafios — Definições do Produto

Documento de referência do que foi decidido até agora: experiência, casos de
uso e regras de usabilidade. Sem tecnologia, sem implementação.

> **Status:** definições consolidadas a partir das decisões tomadas até aqui.
> A seção *Decisões em aberto* no final registra o que ainda não foi resolvido —
> incluindo uma contradição central que precisa de resposta antes de evoluir.

---

## 1. Visão geral

Um aplicativo que apresenta desafios de **leitura** e **matemática** para
crianças em fase de alfabetização, em rodadas curtas, com avaliação de
desempenho ao final e histórico de evolução.

### Objetivo declarado

Fazer a criança **ler de fato** — não reconhecer figuras, não repetir de
cor, não adivinhar por eliminação.

### Princípio que orienta todo o resto

> **O aplicativo não entrega a resposta que a criança deveria produzir.**

Toda decisão de mecânica é medida contra essa frase. Se uma ajuda faz a
criança acertar sem exercer a habilidade treinada, essa ajuda precisa ser
limitada, ou ao menos contabilizada.

---

## 2. Escopo

### Faz parte

- Desafios de leitura em níveis progressivos
- Desafios de matemática em níveis progressivos
- Duas formas de responder um desafio de leitura
- Avaliação por precisão, expressa em estrelas
- Histórico de rodadas anteriores
- Configuração feita por um adulto

### Não faz parte

| Item | Situação |
|---|---|
| Bloqueio de tela do aparelho | **Removido do escopo** |
| Recompensa em minutos de uso | **Removido do escopo** |
| Contas de usuário / login | Não previsto |
| Sincronização entre aparelhos | Não previsto |
| Vários perfis de criança | Não previsto (ver decisões em aberto) |

O bloqueio de tela era a ideia original — o app tomaria a tela e liberaria
tempo de uso ao ser resolvido. Foi retirado deliberadamente para que o
produto fosse validado primeiro como experiência de aprendizado.

---

## 3. Personas

### A criança — usuária principal

- Está em fase de alfabetização
- Lê com hesitação; pronúncia incompleta é normal e esperada
- Pode ainda não ler as instruções da tela
- Se frustra rápido quando não entende o que fazer ou quando é punida
  por algo que não foi culpa dela
- Usa o aparelho com o dedo, em pé ou sentada, muitas vezes sem supervisão
  no momento exato do uso

**Implicação de projeto:** a instrução precisa estar no ícone e na ação, não
no texto. Nenhum estado pode deixar a criança sem saída.

### O adulto — configurador e observador

- Define tipo de desafio, nível e tamanho da rodada
- Não acompanha cada resposta; olha o resultado depois
- Precisa saber se o desempenho é real ou inflado por ajudas
- Escolhe a voz do aparelho antes de entregar para a criança

**Implicação de projeto:** o resultado precisa ser interpretável sem
explicação — e precisa revelar quando a nota está inflada.

---

## 4. Estrutura de conteúdo

### Níveis de leitura

| Nível | Nome | Conteúdo |
|---|---|---|
| 1 | Vogais e letras | Letras isoladas |
| 2 | Sílabas simples | Sílabas de consoante + vogal |
| 3 | Palavras CVC | Palavras curtas e concretas |
| 4 | Palavras frequentes | Palavras mais longas do cotidiano |
| 5 | Frases curtas | Frases completas simples |

A progressão é pedagógica: da unidade menor para a maior. O nível é
escolhido pelo adulto e pode ser aumentado ao final de uma rodada.

### Níveis de matemática

| Nível | Operação |
|---|---|
| 1 | Soma com resultados pequenos |
| 2 | Soma com números maiores |
| 3 | Subtração, sempre com resultado positivo |
| 4 | Soma e subtração misturadas |
| 5 | Multiplicação básica |

**Regras do conteúdo de matemática:**

- Nunca gerar resultado negativo
- As alternativas erradas devem ser **próximas da resposta certa**, para que
  a criança não acerte por descarte óbvio
- Alternativas nunca se repetem
- Sempre 4 alternativas

---

## 5. Casos de uso

### CU-01 — Configurar uma rodada

**Ator:** adulto
**Quando:** antes de entregar o aparelho para a criança

1. Escolhe o **tipo**: leitura, matemática ou misto
2. Escolhe o **modo de leitura**: montar palavra ou ler em voz alta
3. Escolhe o **nível inicial** (1 a 5)
4. Escolhe o **tamanho da rodada**: 3, 5 ou 8 desafios
5. Escolhe e testa a **voz** do aparelho
6. Inicia

**Regras:**
- Todas as configurações têm valor padrão; iniciar sem configurar é válido
- Se o aparelho não permitir ouvir a criança, o modo de voz aparece
  desabilitado, com o motivo visível
- A voz escolhida fica lembrada para as próximas vezes

---

### CU-02 — Resolver desafio de leitura no modo "montar palavra"

**Ator:** criança

**Para uma letra isolada (nível 1):**

1. A letra começa **escondida**
2. A criança toca em "Ver a letra", lê, e pode esconder de novo
3. Escolhe entre 4 letras a que corresponde
4. Acerto avança; erro marca e permite nova tentativa

**Para palavra ou frase (níveis 2 a 5):**

1. A palavra começa **escondida**
2. A criança toca em "Ver a palavra", lê, e pode esconder de novo
3. Monta a palavra tocando nas letras embaralhadas, na ordem
4. A resposta só é avaliada quando todos os espaços estão preenchidos
5. Se estiver errada, os espaços são limpos e ela tenta de novo

**Regras:**
- Cada vez que a palavra é revelada conta como uma **espiada**
- A palavra pode ficar visível durante toda a montagem — isso é permitido,
  mas fica registrado
- Errar não bloqueia nem encerra o desafio

---

### CU-03 — Resolver desafio de leitura no modo "ler em voz alta"

**Ator:** criança

1. A palavra aparece na tela, visível
2. **O aplicativo permanece calado** — quem lê é a criança
3. Ela toca no microfone e lê em voz alta
4. O app confere e mostra o que entendeu
5. Acerto avança; erro permite nova tentativa

**Regras:**

- A conferência é **tolerante à pronúncia**: hesitação, som incompleto e
  variação regional não podem reprovar uma leitura correta
- A tolerância **não pode ser tão frouxa** a ponto de aceitar outra palavra.
  Trocar o som inicial muda a palavra ("pato" não é leitura de "gato") e
  deve ser recusado
- O app sempre mostra **o que entendeu**, para a criança perceber a diferença
- Após **2 tentativas sem sucesso**, o app troca sozinho para o modo montar
  palavra, com mensagem acolhedora — nunca deixa a criança presa
- Quando a mensagem de erro for causada pelo aparelho (sem permissão, sem
  microfone, sem conexão), o motivo real precisa aparecer, não um erro genérico

---

### CU-04 — Resolver desafio de matemática

**Ator:** criança

1. A conta aparece na tela e é falada em voz alta
2. A criança escolhe entre 4 alternativas
3. Acerto marca em verde e avança; erro marca em vermelho e permite tentar

**Regras:**
- A conta pode ser repetida em voz alta quantas vezes a criança quiser
- Diferente da leitura, aqui falar o enunciado **é permitido** — ler a conta
  não é a habilidade sendo avaliada

---

### CU-05 — Concluir a rodada e receber estrelas

**Ator:** criança (resultado lido também pelo adulto)

Ao completar o número de desafios configurado:

1. Aparece a comemoração e as **5 estrelas**, preenchidas conforme o desempenho
2. Aparecem os números da rodada: precisão, acertos, erros e espiadas
3. A criança pode jogar de novo, subir de nível, ver o histórico ou voltar

**Regras da avaliação:**

- **Precisão = acertos ÷ tentativas totais**
- **Toda tentativa errada conta como erro.** Sem isso a precisão seria sempre
  100% e a estrela não significaria nada
- As estrelas são preenchidas proporcionalmente, com meia estrela de
  granularidade
- Rodada sem nenhum erro recebe destaque especial
- A mensagem muda conforme o desempenho, e **nunca é depreciativa**: o pior
  caso é um convite a treinar mais

---

### CU-06 — Consultar o histórico

**Ator:** adulto

1. Acessa o histórico pela tela inicial ou ao final de uma rodada
2. Vê um resumo geral: total de rodadas, precisão geral e média de estrelas
3. Vê a lista das rodadas, da mais recente para a mais antiga

**Cada rodada registra:**

| Campo | Para quê |
|---|---|
| Data e hora | Situar quando aconteceu ("Hoje", "Ontem", data) |
| Tipo e nível | Comparar desempenho entre conteúdos |
| Acertos e erros | Ver o esforço bruto |
| Precisão | Comparar rodadas de tamanhos diferentes |
| Estrelas | Leitura rápida do resultado |
| **Espiadas** | **Saber se a nota é real ou inflada** |

**Regras:**
- O histórico guarda as últimas 50 rodadas
- Pode ser apagado, sempre com confirmação
- Antes da primeira rodada, mostra mensagem explicando que estará vazio

---

### CU-07 — Escolher a voz do aparelho

**Ator:** adulto

1. Vê a lista de vozes em português disponíveis no aparelho
2. As de melhor qualidade aparecem destacadas
3. Testa qualquer voz com um toque
4. A escolha fica salva

**Regras:**
- Se não houver voz em português, o app informa e orienta o adulto a instalar
- A qualidade do som depende da voz do aparelho, não do aplicativo — isso
  precisa estar dito com clareza para o adulto não culpar o app

---

## 6. Regras de áudio

Essas regras existem porque o áudio é o ponto onde é mais fácil, sem querer,
entregar a resposta.

| Situação | O app fala? |
|---|---|
| Desafio de leitura no modo montar | **Sim**, uma vez ao abrir |
| Repetição pelo botão de som | **Sim**, quantas vezes pedirem |
| Desafio de leitura no modo voz alta | **Não, nunca** |
| Desafio de matemática | **Sim**, ao abrir e quando pedirem |

**Qualidade da fala:**

- Palavra deve ser falada **como palavra**, nunca soletrada letra por letra
- Letra isolada deve ser falada pelo **nome** ("M" → "ême"), não como som mudo
- Velocidade um pouco mais lenta que a fala normal
- Letras e sílabas ainda mais lentas que palavras

---

## 7. Princípios de usabilidade

Regras derivadas dos problemas reais encontrados durante a definição.

### 1. A criança nunca fica presa

Todo caminho tem saída. Se o microfone não funciona, oferece montar. Se ela
erra duas vezes na voz, troca de modo. Se um recurso não existe no aparelho,
a opção aparece desabilitada com o motivo, não some nem falha em silêncio.

### 2. Erro não pune

Errar limpa a resposta e devolve a tentativa. Não há vidas, tempo esgotando,
volta ao início nem som de derrota. O erro é registrado para a métrica, não
para castigar.

### 3. Falha do aparelho não é culpa da criança

Se o microfone não tem permissão, se não há voz instalada, se falta conexão —
a mensagem diz o que aconteceu, em linguagem de adulto, e o app oferece outro
caminho. Nunca marca como erro da criança.

### 4. Feedback imediato e visível

Toda resposta produz retorno instantâneo: ✅ ou ❌ em tela cheia, cor no botão
tocado, avanço automático depois do acerto. Sem precisar ler nada.

### 5. Um toque por decisão

Toda ação principal é um toque em alvo grande. Sem arrastar, sem toque duplo,
sem menu escondido, sem gesto que precise ser ensinado.

### 6. A instrução está no símbolo

👁️ mostra, 🙈 esconde, 🔊 repete, 🎤 ouve. O texto acompanha para o adulto,
mas o ícone basta para a criança.

### 7. A métrica precisa ser honesta

Estrela sozinha mente. Cinco estrelas com uma espiada e cinco estrelas com
oito espiadas são aprendizados opostos, e o adulto precisa conseguir
distinguir. Por isso a espiada é contada e mostrada junto.

### 8. Ajuda é permitida, mas nunca invisível

A criança pode ver a palavra, ouvir de novo, trocar de modo. Nada disso é
bloqueado. Mas tudo que substitui a habilidade treinada aparece no resultado.

### 9. Configurar é opcional

O app abre pronto para uso. Nenhuma configuração é obrigatória para começar.

### 10. Funciona sem internet

Todo o conteúdo é local. Depender de conexão para gerar um desafio é
inaceitável: uma falha de rede não pode impedir a criança de usar o app.

---

## 8. Registro de decisões

O que foi decidido, e por quê. Serve para não refazer discussões já vencidas.

| # | Decisão | Motivo |
|---|---|---|
| D-01 | Retirar o bloqueio de tela do escopo | Validar primeiro a experiência de aprendizado |
| D-02 | Retirar a recompensa em minutos | Consequência direta de D-01 |
| D-03 | Nível 1 mostra alternativas, não uma peça só | Com uma única peça, não havia desafio nenhum |
| D-04 | Palavra começa escondida | Com a palavra à vista, a criança copia letra por letra sem ler |
| D-05 | Contar espiadas | Sem isso, D-04 seria contornável e a estrela não mediria nada |
| D-06 | Toda tentativa errada conta como erro | Sem isso, a precisão seria sempre 100% |
| D-07 | Estrelas por precisão, não por quantidade | Recompensar acerto, não persistência bruta |
| D-08 | Tolerância fonética na leitura em voz alta | Pronúncia hesitante é normal na alfabetização |
| D-09 | Rejeitar troca do som inicial em palavra curta | A tolerância aceitava "pato" como "gato" |
| D-10 | Trocar para montar após 2 falhas na voz | Impedir que a criança fique presa por falha de reconhecimento |
| D-11 | App calado no modo voz alta | Falar a palavra elimina a necessidade de ler |
| D-12 | Som toca uma vez, botão repete | Equilíbrio entre orientar e não entregar |
| D-13 | Falar letra pelo nome | Letra solta saía incompreensível |
| D-14 | Nunca soletrar palavras | Palavra soletrada não é palavra |
| D-15 | Adulto escolhe e testa a voz | A qualidade depende do aparelho, e só o adulto pode julgar |
| D-16 | Conteúdo 100% local | Falha de rede não pode impedir o uso |

---

## 9. Decisões em aberto

### ⚠️ A-01 — Leitura ou ditado? (decisão central)

**As definições atuais se contradizem.**

O objetivo declarado é *forçar a leitura*. Mas o modo montar hoje combina
**palavra escondida** (D-04) com **som automático** (D-12). Nessa combinação,
a criança ouve a palavra e escreve o que ouviu — isso é **ditado**, não leitura.

Leitura de verdade exige o oposto: palavra **visível** e app **calado**.

Ditado é uma habilidade legítima e útil na alfabetização. O problema não é
fazer ditado; é fazer ditado achando que se está treinando leitura, e medir
o resultado como se fosse leitura.

**Caminhos possíveis:**

| Opção | Consequência |
|---|---|
| Assumir que o modo montar é ditado | Renomear o modo e ajustar a métrica; leitura fica só no modo voz |
| Voltar ao silêncio no modo montar | Vira leitura de fato; perde a pista sonora que ajuda quem ainda não decodifica |
| Separar em dois modos distintos | Mais completo e mais honesto; adiciona uma escolha a mais para o adulto |

**Esta decisão precisa ser tomada antes de qualquer evolução do produto**,
porque define o que as estrelas significam.

### A-02 — A palavra deve sumir sozinha?

Hoje a criança pode revelar a palavra e deixá-la aberta durante toda a
montagem. A espiada é contada, mas nada impede.

Uma alternativa é a palavra sumir automaticamente alguns segundos após ser
revelada, forçando leitura e memória em vez de cópia.
**Pendente:** adotar ou não, e com quantos segundos.

### A-03 — Nome da letra ou som da letra?

Hoje a letra é falada pelo nome ("M" → "ême"). Vários métodos de alfabetização
preferem o **fonema** ("mmm").
**Pendente:** confirmar qual método a escola da criança usa e alinhar.

### A-04 — Áudio gravado em vez de voz sintetizada?

A qualidade da fala depende inteiramente da voz instalada no aparelho, e o
adulto pode não ter uma boa opção disponível. Áudio gravado com voz humana
resolveria isso e permitiria trabalhar fonemas (A-03).
**Pendente:** avaliar depois de testar com a criança se a voz do aparelho basta.

### A-05 — Mais de uma criança no mesmo aparelho?

O histórico hoje é único. Com dois filhos usando o mesmo aparelho, os dados
se misturam e as estrelas perdem sentido.
**Pendente:** decidir se haverá perfis separados.

### A-06 — Como as palavras entram no banco?

Os níveis têm listas fixas definidas por conveniência. Não houve validação
pedagógica, nem definição de quem decide se uma palavra pertence a um nível.
**Pendente:** definir critério e responsável pelo conteúdo.

---

## 10. Como validar

O produto não está validado. Está definido.

A próxima etapa não é adicionar recursos — é **sentar com a criança e
observar**, procurando responder:

1. Ela entende o que fazer **sem alguém explicar**?
2. Em que momento ela desiste ou se frustra?
3. Quantas espiadas ela dá de verdade — e o que isso revela sobre A-01?
4. A tolerância de pronúncia reprova leitura correta? Aceita leitura errada?
5. O nível escolhido é fácil demais ou difícil demais?
6. Ela quer jogar de novo sem ser convidada?

A pergunta 6 vale mais que todas as outras juntas.
