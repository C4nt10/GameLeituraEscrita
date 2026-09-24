# GameLeituraEscrita Constitution
<!-- Jogo de alfabetização e matemática para crianças -->

## Princípio supremo

> **O aplicativo não entrega a resposta que a criança deveria produzir.**

Toda decisão de mecânica, conteúdo ou interface é medida contra esta frase
antes de qualquer outro critério. Se uma ajuda faz a criança acertar sem
exercer a habilidade treinada, essa ajuda precisa ser limitada, ou ao menos
contabilizada e exibida (ver Princípio IV).

## Core Principles

### I. A criança nunca fica presa

Todo caminho tem saída. Se o microfone não funciona, oferece montar. Um
botão pra sair da rodada fica sempre visível, em qualquer modalidade — a
criança (ou o adulto) decide quando trocar de caminho, o app nunca decide
sozinho trocando a modalidade por ela (isso esconderia justamente o ponto
que precisa de treino, violando o Princípio IV). Se um recurso não existe
no aparelho, a opção aparece desabilitada com o motivo visível — nunca
some, nunca falha em silêncio. Nenhuma tela, nenhum estado de erro, pode
deixar a criança sem uma próxima ação possível.

### II. Erro não pune

Errar limpa a resposta e devolve a tentativa. Não há vidas, tempo esgotando,
volta ao início nem som de derrota. O erro é registrado para a métrica
(Princípio IV), nunca para castigar. A mensagem de resultado, mesmo no pior
desempenho, nunca é depreciativa — é sempre um convite a treinar mais.

### III. Falha do aparelho não é culpa da criança

Sem permissão de microfone, sem voz instalada, sem conexão: a mensagem diz o
que aconteceu, em linguagem de adulto, e o app oferece outro caminho. Nunca
marca como erro da criança, nunca mostra erro genérico quando a causa real é
conhecida.

### IV. A métrica é sempre honesta (NON-NEGOTIABLE)

Toda ajuda que substitui a habilidade sendo treinada — espiada, repetição de
áudio, tentativa adicional — é contabilizada e exibida junto ao resultado,
nunca escondida. Cada modalidade tem seu próprio contador de ajuda e sua
própria série de estrelas; estrelas de modalidades diferentes medem
habilidades diferentes e não são comparadas entre si. Nomear uma mecânica
errado (ex.: chamar ditado de leitura) é uma violação deste princípio tanto
quanto esconder um número.

### V. Funciona sem internet

Todo o conteúdo — palavras, desafios de matemática, reconhecimento de fala,
histórico — é local. Depender de conexão para gerar ou avaliar um desafio é
inaceitável: uma falha de rede não pode impedir o uso.

### VI. Um toque, instrução no símbolo

Toda ação principal é um toque em alvo grande — sem arrastar, sem toque
duplo, sem gesto que precise ser ensinado. O ícone (👁️ mostra, 🙈 esconde,
🔊 repete, 🎤 ouve) basta para a criança entender o que fazer; o texto
acompanha apenas para o adulto.

### VII. Configurar é opcional

O app abre pronto para uso, com valores padrão para todas as configurações.
Nenhuma configuração é obrigatória para a criança começar a jogar.

## Restrições de produto

- **Sem contas, sem login, sem sincronização entre aparelhos** — fora de
  escopo até decisão em contrário.
- **Perfil:** o modelo de dados é sempre multi-perfil (mesmo quando a
  interface expõe um perfil implícito só), para nunca exigir migração de
  dado ao introduzir seleção de perfil ou o modo dupla.
- **Conteúdo de leitura** é uma grade nível (1–5) × classificação (tema);
  classificação só existe a partir do nível 2. Nenhuma rodada pode oferecer
  uma combinação nível×classificação×tamanho sem palavras suficientes para
  não repetir.
- **Áudio:** voz sintetizada do aparelho para palavras/frases/enunciados;
  áudio gravado embutido apenas para o conjunto fechado de letras/fonemas
  (síntese pronuncia fonema isolado mal). Nunca soletrar uma palavra.

## Governance

Esta constituição prevalece sobre convenções de código ou de arquitetura
específicas. Qualquer especificação (`spec.md`) ou plano (`plan.md`) que
proponha algo em conflito com um destes princípios precisa justificar a
exceção explicitamente (seção Complexity Tracking do plano) ou a proposta é
rejeitada. Alterações a esta constituição exigem registrar o motivo na
mesma forma usada no registro de decisões dos documentos de produto
(`doc/definições001.MD` §8, `doc/definições002.MD` §7).

**Version**: 1.1.0 | **Ratified**: 2026-09-10 | **Last Amended**: 2026-09-25

### Histórico de emendas

- **1.1.0 (2026-09-25)**: Princípio I — removida a troca automática de
  modalidade após 2 falhas em Leitura·voz como exemplo de "saída".
  Motivo (dono do projeto): trocar de modalidade automaticamente esconde
  o ponto exato que a criança precisa treinar, o que entra em conflito
  com o Princípio IV (métrica honesta) — a criança nunca teria a chance
  de continuar tentando a habilidade real sendo avaliada. Substituído
  por um botão de saída manual sempre visível (revoga D-10, ver
  `doc/definições002.MD` §14).
