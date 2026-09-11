# Feature Specification: MVP — Desafios de leitura e matemática

**Feature Branch**: `001-mvp-desafios-leitura-matematica`

**Created**: 2026-09-10

**Status**: Draft

**Input**: `doc/definições001.MD` + `doc/definições002.MD` — definições de produto
consolidadas (casos de uso CU-01 a CU-08, decisões D-01 a D-33, princípios de
usabilidade). Sem tecnologia, sem implementação — traduzido aqui para o
formato de spec sem adicionar decisão nova.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Resolver uma rodada de leitura, nas três modalidades (Priority: P1)

A criança abre o app (sem precisar de configuração prévia — Princípio VII) e
resolve uma rodada de desafios de leitura. Cada desafio é apresentado em uma
das três modalidades — **Ditado**, **Leitura · montar** ou **Leitura · voz**
— e a criança responde tocando ou falando. Ao final, vê estrelas e os
contadores de ajuda daquela modalidade.

**Why this priority**: é o núcleo do produto — sem isto não há jogo. É a
única história que, sozinha, já verifica o princípio supremo ("o app não
entrega a resposta") e o Princípio IV (métrica honesta).

**Independent Test**: instalar o app, sem tocar em nenhuma configuração,
iniciar uma rodada de leitura padrão e completá-la até a tela de estrelas.
Repetir uma vez em cada modalidade.

**Acceptance Scenarios**:

1. **Given** um desafio de Ditado no nível 1, **When** o app fala a letra,
   **Then** a criança escolhe entre 4 letras e a palavra/letra nunca aparece
   escrita na tela.
2. **Given** um desafio de Leitura · montar (nível ≥ 2), **When** a criança
   toca em "ver a palavra", **Then** a palavra aparece e depois some
   sozinha, e a montagem é feita com as letras embaralhadas, sem som algum.
3. **Given** um desafio de Leitura · voz, **When** a criança fala no
   microfone, **Then** o app mostra o que entendeu sem ter falado a palavra
   antes, aceita variação de pronúncia razoável e rejeita uma palavra
   diferente (ex.: "pato" não é aceito como leitura de "gato").
4. **Given** duas tentativas sem sucesso em Leitura · voz, **When** a
   segunda tentativa falha, **Then** o app troca automaticamente para
   Leitura · montar com mensagem acolhedora, sem travar a criança.
5. **Given** uma resposta errada em qualquer modalidade, **When** a criança
   erra, **Then** a resposta é limpa, o erro é contado, e uma nova tentativa
   é oferecida sem penalidade visível (sem vidas, sem som de derrota).
6. **Given** o fim da rodada, **When** todos os desafios são respondidos,
   **Then** a tela mostra estrelas (granularidade de meia estrela),
   precisão, acertos, erros, e o contador de ajuda específico da modalidade
   (repetições / espiadas / tentativas).
7. **Given** o microfone sem permissão do sistema, **When** a criança tenta
   Leitura · voz, **Then** o app explica o motivo real (não um erro
   genérico) e oferece caminho alternativo.

---

### User Story 2 - Resolver uma rodada de matemática (Priority: P2)

A criança resolve desafios de matemática — conta pura ou problema
contextualizado, conforme configurado pelo adulto — escolhendo entre 4
alternativas numéricas.

**Why this priority**: segunda pilastra do produto, reaproveita a mesma tela
de resultado/estrelas da User Story 1, mas é uma habilidade e uma mecânica
de conteúdo totalmente diferentes (geração de conta vs. banco de palavras) —
por isso é independentemente testável e entregável depois da US1.

**Independent Test**: configurar tipo "matemática", iniciar uma rodada e
completá-la, uma vez em "conta pura" e uma vez em "problema
contextualizado".

**Acceptance Scenarios**:

1. **Given** uma conta pura (ex. nível 1: soma pequena), **When** o desafio
   abre, **Then** a conta é falada em voz alta e pode ser repetida quantas
   vezes a criança tocar no botão de som.
2. **Given** um problema contextualizado (ex. "3 maçãs, e mais 2 maçãs"),
   **When** o desafio abre, **Then** o enunciado é falado, a quantidade
   aparece como objetos desenhados na tela, e a criança não precisa ler
   nenhum texto para responder.
3. **Given** qualquer desafio de matemática, **When** as 4 alternativas são
   geradas, **Then** nenhuma é negativa, nenhuma se repete, e as erradas
   estão próximas da correta (sem descarte óbvio).
4. **Given** um problema de subtração contextualizado, **When** o resultado
   seria negativo, **Then** o gerador não produz esse desafio.

---

### User Story 3 - Configurar a rodada antes de entregar o aparelho (Priority: P3)

O adulto escolhe tipo de desafio (leitura, matemática ou misto), modalidade
de leitura, nível, classificação (tema), forma de matemática, tamanho da
rodada, formato (sozinho ou dupla) e a voz do aparelho, antes de entregar
para a criança.

**Why this priority**: as US1 e US2 já funcionam com valores padrão (Princípio
VII); esta história adiciona controle explícito sobre elas, então pode ser
entregue depois sem bloquear as anteriores.

**Independent Test**: abrir a tela de configuração, alterar nível,
classificação e modalidade, testar uma voz, iniciar, e confirmar que a
rodada seguinte respeita exatamente o que foi escolhido.

**Acceptance Scenarios**:

1. **Given** a tela de configuração, **When** o adulto não altera nada e
   toca em iniciar, **Then** a rodada começa com valores padrão válidos.
2. **Given** o adulto escolhe uma classificação (tema) para nível ≥ 2,
   **When** essa combinação nível×classificação não tem palavras
   suficientes para o tamanho de rodada escolhido sem repetir, **Then** a
   combinação não aparece como opção selecionável.
3. **Given** o aparelho sem permissão de microfone, **When** o adulto chega
   à escolha de modalidade, **Then** "Leitura · voz" aparece desabilitada
   com o motivo visível.
4. **Given** a lista de vozes em português do aparelho, **When** não existe
   nenhuma instalada, **Then** o app informa isso e orienta a instalação —
   nunca falha silenciosamente.
5. **Given** uma voz escolhida e testada, **When** o adulto volta a
   configurar depois, **Then** a última escolha aparece pré-selecionada.

---

### User Story 4 - Consultar o histórico de rodadas (Priority: P4)

O adulto acessa um resumo e a lista das últimas 50 rodadas, por perfil, para
avaliar desempenho real — não inflado por ajuda.

**Why this priority**: depende de haver rodadas já jogadas (US1/US2), e
entrega valor de acompanhamento que não bloqueia o uso do jogo em si —
correto que venha depois do núcleo jogável.

**Independent Test**: jogar 3 rodadas variadas, abrir o histórico e conferir
que cada uma aparece com data, tipo, nível, acertos/erros, precisão,
estrelas e o contador de ajuda daquela modalidade.

**Acceptance Scenarios**:

1. **Given** nenhuma rodada jogada ainda, **When** o adulto abre o
   histórico, **Then** aparece uma mensagem explicando que estará vazio (não
   uma tela em branco sem contexto).
2. **Given** rodadas já jogadas, **When** o histórico é aberto, **Then**
   aparecem da mais recente para a mais antiga, com resumo geral (total de
   rodadas, precisão geral, média de estrelas) calculado por perfil.
3. **Given** o histórico com itens, **When** o adulto pede para apagar,
   **Then** o app pede confirmação antes de apagar.
4. **Given** duas modalidades de leitura jogadas, **When** o resumo é
   calculado, **Then** as estrelas de modalidades diferentes não são
   somadas nem comparadas entre si (Princípio IV).

---

### User Story 5 - Jogar em dupla, cooperativo ou adversarial (Priority: P5)

Duas crianças jogam no mesmo aparelho: cada uma faz uma rodada individual
completa, com a mesma configuração, e o resultado final é mostrado
combinado — somado (cooperativo) ou lado a lado com destaque (adversarial).

**Why this priority**: reaproveita inteiramente US1/US2/US3 sem alterar a
mecânica de nenhum desafio (D-30); é a história mais nova e a de maior
complexidade de perfil (seleção de 2 perfis ativos), por isso vem por
último.

**Independent Test**: escolher "dupla", selecionar 2 perfis (ou criar um
novo), jogar as duas rodadas em sequência e conferir a tela de resultado
combinado nos dois formatos (cooperativo e adversarial).

**Acceptance Scenarios**:

1. **Given** o adulto escolhe "dupla", **When** define o formato, **Then**
   escolhe explicitamente cooperativo ou adversarial (nenhum é padrão
   implícito).
2. **Given** 2 perfis selecionados, **When** a criança 1 termina sua
   rodada, **Then** aparece uma tela "passa o aparelho pra [Nome 2]" com
   alvo grande, impedindo a criança 1 de continuar no lugar da 2.
3. **Given** as duas rodadas completas, **When** o resultado é mostrado,
   **Then** no formato cooperativo aparece o total somado E o resultado
   individual de cada um; no adversarial aparecem os dois lado a lado com
   destaque para quem teve mais.
4. **Given** o adversarial, **When** um perfil tem desempenho menor,
   **Then** a mensagem para esse perfil segue a mesma regra de "nunca
   depreciativa" da US1 (US1 Acceptance Scenario 5).
5. **Given** uma criança sai no meio da sua rodada em modo dupla, **When**
   a dupla não se completa, **Then** essa rodada não entra no histórico
   comparativo (nenhum resultado é inventado).
6. **Given** uma rodada dupla, **When** a criança 2 começa, **Then** ela
   joga exatamente a mesma configuração (nível, classificação, tamanho,
   modalidade) escolhida para a criança 1 — nunca uma diferente.

### Edge Cases

- O que acontece se o adulto reduzir o nível/classificação disponível
  durante uma rodada em andamento (app em segundo plano)? A rodada em
  andamento deve terminar com a configuração com que começou.
- Como o sistema se comporta se a bateria/app fechar no meio de uma rodada?
  A rodada incompleta não deve aparecer no histórico como se tivesse sido
  concluída (mesma regra da US5, cenário 5, generalizada para modo sozinho).
- O que acontece se todas as classificações do nível escolhido ficarem sem
  conteúdo suficiente (banco de palavras insuficiente)? A US3 já impede a
  seleção da combinação; mas se isso ocorrer por dado corrompido, o app deve
  informar e sugerir outra combinação, nunca travar.
- Como o app trata um dispositivo sem nenhuma voz em português E sem
  microfone? Ditado e Leitura · voz ficam ambos indisponíveis com motivo
  visível; Leitura · montar continua disponível (não depende de áudio nem
  de STT).
- O que acontece se a criança 1 e a criança 2 (modo dupla) tiverem níveis
  configurados historicamente muito diferentes? Ver questão em aberto A-10
  — ainda não decidido se o app trava ou apenas avisa.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST oferecer desafios de leitura em 3 modalidades
  distintas — Ditado, Leitura · montar, Leitura · voz — cada uma com regras
  próprias de exibição da palavra e de fala do app (D-17, D-18, doc002 §1 e §5).
- **FR-002**: O sistema MUST nunca falar a palavra/frase em Leitura · montar
  ou Leitura · voz, e MUST sempre falar o enunciado em Ditado (D-11, D-18).
- **FR-003**: O sistema MUST contar e exibir, junto ao resultado, o
  contador de ajuda correto por modalidade: repetições de áudio (Ditado),
  espiadas (Leitura · montar), tentativas antes de acertar (Leitura · voz)
  (D-19).
- **FR-004**: O sistema MUST tolerar variação de pronúncia razoável em
  Leitura · voz, e MUST rejeitar uma palavra foneticamente diferente da
  esperada (ex.: troca do som inicial) (regras do CU-03, D-09).
- **FR-005**: O sistema MUST trocar automaticamente de Leitura · voz para
  Leitura · montar após 2 tentativas sem sucesso, com mensagem acolhedora
  (D-10).
- **FR-006**: O sistema MUST oferecer 4 alternativas em todo desafio de
  escolha (letra isolada, matemática), nunca repetidas, com as erradas
  próximas da correta (D-03, regras de matemática do doc001 §4).
- **FR-007**: O sistema MUST calcular precisão como acertos ÷ tentativas
  totais, contando toda tentativa errada como erro (D-06), e MUST exibir
  estrelas com granularidade de meia estrela, nunca comparadas entre
  modalidades diferentes (D-20).
- **FR-008**: O sistema MUST oferecer matemática em duas formas — conta pura
  e problema contextualizado com objetos visuais e enunciado falado — e
  MUST permitir ao adulto escolher qual (D-23, D-24).
- **FR-009**: O sistema MUST nunca gerar resultado negativo em desafios de
  subtração, puros ou contextualizados (doc001 §4, D-23).
- **FR-010**: O sistema MUST organizar o conteúdo de leitura como grade
  nível (1–5) × classificação (tema), com classificação aplicável apenas a
  partir do nível 2 (D-21, D-22).
- **FR-011**: O sistema MUST restringir, na configuração da rodada, as
  combinações nível×classificação×tamanho às que têm palavras suficientes
  para não repetir dentro da rodada (doc002 §2).
- **FR-012**: O sistema MUST permitir iniciar uma rodada sem que nenhuma
  configuração tenha sido alterada (valores padrão válidos para todo campo)
  (Princípio VII).
- **FR-013**: O sistema MUST apresentar qualquer recurso indisponível no
  aparelho (microfone, voz em português) como opção desabilitada com o
  motivo visível, nunca oculta e nunca com erro genérico (Princípio I e III).
- **FR-014**: O sistema MUST manter um identificador de perfil em todo
  registro de histórico (valor único implícito no MVP de perfil único), sem
  exigir migração de dado ao introduzir seleção explícita de perfil (D-25).
- **FR-015**: O sistema MUST manter as últimas 50 rodadas por perfil no
  histórico, com exclusão apenas mediante confirmação (CU-06).
- **FR-016**: O sistema MUST oferecer um modo "dupla" onde dois perfis jogam
  rodadas individuais sequenciais com configuração idêntica, e MUST exigir
  que o adulto escolha explicitamente entre formato cooperativo e
  adversarial (D-30, D-31, D-33).
- **FR-017**: O sistema MUST, no modo dupla, impedir que a rodada de uma
  criança avance sem uma transição explícita ("passa o aparelho") entre uma
  criança e a outra (CU-08).
- **FR-018**: O sistema MUST excluir do histórico comparativo qualquer
  rodada dupla em que um dos dois perfis não completou a sua parte (CU-08).
- **FR-019**: O sistema MUST operar todo o fluxo de geração e avaliação de
  desafio sem exigir conexão de rede (Princípio V, D-16).
- **FR-020**: O sistema MUST usar voz sintetizada do aparelho para
  palavras/frases/enunciados de matemática, e áudio gravado embutido apenas
  para o conjunto fechado de letras e fonemas (D-27).
- **FR-021**: O sistema MUST permitir ao adulto escolher entre "nome da
  letra" e "som da letra" (fonema) como configuração global, com padrão
  fonema (D-26).

### Key Entities *(include if feature involves data)*

- **Perfil**: identifica quem joga. Único e implícito no MVP (`"padrao"`),
  mas o modelo já suporta N perfis (nome, cor/avatar) sem migração (D-25,
  D-32).
- **Rodada**: uma sessão de desafios configurada (tipo, modalidade, nível,
  classificação(ões), tamanho, formato sozinho/dupla) associada a um ou dois
  perfis, com data/hora, lista de desafios respondidos e resultado agregado
  (acertos, erros, precisão, estrelas, contador de ajuda).
- **Desafio de leitura**: uma unidade de conteúdo (letra, sílaba, palavra ou
  frase) associada a nível, uma ou mais classificações, modalidade jogada, e
  marcador fonético opcional (dígrafo, encontro consonantal — apenas
  documental no MVP).
- **Desafio de matemática**: uma conta (operação, operandos, resultado) com
  forma (pura ou contextualizada), tema (quando contextualizada) e as 4
  alternativas geradas.
- **Registro de histórico**: uma rodada persistida — data/hora, tipo,
  nível, classificação, modalidade, acertos, erros, precisão, estrelas,
  contador de ajuda, perfil(is) envolvidos, e se foi concluída.
- **Configuração**: preferências persistidas por padrão — última voz
  escolhida, nome/fonema, e os últimos valores de nível/classificação/
  tamanho/modalidade usados.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Uma criança na faixa de alfabetização consegue iniciar e
  completar uma rodada de leitura sem intervenção verbal de um adulto, em
  observação direta (doc001 §10, pergunta 1).
- **SC-002**: Zero estados sem saída (Princípio I) registrados em sessão de
  observação com criança real — todo erro, falha de microfone ou falta de
  voz instalada resulta em um próximo passo disponível.
- **SC-003**: Em Leitura · voz, a taxa de rejeição de leitura foneticamente
  correta (falso negativo) e a taxa de aceitação de palavra diferente
  (falso positivo) são ambas mensuradas e reportadas após a validação com
  criança (doc001 §10, pergunta 4) — meta inicial: nenhuma das duas acima
  de 10% das tentativas observadas.
- **SC-004**: 100% dos resultados de rodada exibem o contador de ajuda
  correto para a modalidade jogada, verificável em toda rodada do histórico.
- **SC-005**: O app opera do início ao fim de uma rodada (abrir, configurar
  ou não, jogar, ver resultado, consultar histórico) com o aparelho em modo
  avião — nenhuma chamada de rede necessária.
- **SC-006**: Numa sessão de observação, a criança pede para jogar de novo
  sem ser convidada (doc001 §10, pergunta 6 — "vale mais que todas as
  outras juntas").

## Assumptions

- **Plataforma**: multiplataforma com modelo de reconhecimento de fala
  embutido no app (decisão já tomada fora deste documento); framework e
  motor de STT concretos ficam para o `plan.md`, condicionados ao resultado
  do spike em `spike-stt/` (Vosk vs. faster-whisper).
- **A-06** (validação pedagógica das listas de palavras) segue em aberto —
  o conteúdo inicial é responsabilidade do dono do projeto até validação
  externa (doc002 §6), o que é suficiente para implementar o MVP mas não
  para lançamento validado.
- **A-07** (conjunto de classificações): assume-se o conjunto proposto no
  doc002 §2 — animais, comida, casa, corpo, natureza, ações — como ponto de
  partida implementável; volume mínimo por nível×classificação para uma
  rodada de 8 não repetir fica como parâmetro de conteúdo, não de código
  (a validar durante a carga do banco de palavras).
- **A-08** (traçado à mão) permanece fora do escopo desta spec — "montar" é
  a escrita desta fase (doc001, decisão já registrada).
- **A-09** (variação da frase no problema contextualizado): assume-se ao
  menos uma variação fixa por operação no MVP ("X e mais Y", "tinha X,
  perdeu/ganhou Y"); múltiplas variações por nível ficam como melhoria
  futura, não bloqueiam FR-008.
- **A-10** (dupla entre níveis muito diferentes): o MVP MUST permitir a
  dupla mesmo com níveis historicamente diferentes (o adulto decide, ver
  doc002 §9); travar por compatibilidade de nível fica como possível
  melhoria pós-validação, não é requisito desta spec.
- Nenhuma conta de usuário, login ou sincronização entre aparelhos está no
  escopo (doc001 §2).
