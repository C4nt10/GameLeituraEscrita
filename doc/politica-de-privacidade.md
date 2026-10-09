# Política de Privacidade — Letra Viva

**Última atualização:** 09 de outubro de 2026

> **Rascunho.** Este texto foi escrito pra cobrir o que o app faz hoje e
> pra servir de ponto de partida pro cadastro na Play Store. Ainda não
> passou por revisão jurídica — ver avisos ao final antes de publicar.

## Resumo rápido

O Letra Viva é um app educativo infantil que funciona **inteiramente no
aparelho, sem internet**. Nenhum áudio, resposta, nome ou resultado da
criança sai do celular ou tablet — não existe servidor, não existe conta,
não existe nuvem. A única exceção é um download único e opcional, feito
só quando o adulto responsável pede (explicado abaixo).

## Quem é o responsável por este app

**Letra Viva** é desenvolvido por **Devir Labs**. Dúvidas sobre esta
política ou sobre o app podem ser enviadas para **acantidio@gmail.com**.

## Dado que o app NÃO coleta

O Letra Viva não coleta, não transmite e não compartilha com ninguém:
nome completo, e-mail, telefone, localização, contatos, fotos, ou
qualquer outro dado pessoal identificável. Não existe cadastro, login,
conta de usuário, anúncio, rastreador de uso (analytics) ou ferramenta de
terceiros de qualquer tipo.

## Dado que fica só no aparelho

Pra funcionar, o app guarda um pouco de informação **localmente, no
próprio aparelho** (nunca em um servidor):

- **Perfil da criança**: um apelido e uma cor, escolhidos livremente pelo
  adulto responsável — não precisa ser o nome verdadeiro.
- **Histórico de rodadas jogadas**: pontuação, nível, data e acertos/erros
  de cada rodada, pra mostrar o progresso e sugerir o próximo nível. O app
  guarda só as 50 rodadas mais recentes — as mais antigas são apagadas
  automaticamente.
- **Preferências**: nível atual, tamanho de rodada preferido, e outras
  configurações de como o app deve abrir da próxima vez.

Esse dado nunca sai do aparelho. Apagar o app, ou usar o botão **"Apagar
histórico"** dentro do próprio Letra Viva, remove tudo imediatamente.

## Microfone

O modo "Ler em voz alta" usa o microfone do aparelho pra ouvir a criança
falando uma palavra. Esse áudio é processado **inteiramente no
aparelho**, por um modelo de reconhecimento de fala que roda offline
(Whisper) — nunca é enviado pra internet, nunca é salvo em arquivo, nunca
é compartilhado. Assim que o app calcula se a resposta bateu com a
palavra esperada, o áudio é descartado da memória.

A permissão de microfone só é pedida quando a criança entra nesse modo
específico; os outros modos de jogo (Ouvir e montar, Ler e montar, Conta)
não usam o microfone.

## A única conexão com a internet

O Letra Viva foi pensado pra funcionar 100% offline (é um dos princípios
do projeto). A única exceção: o modo "Ler em voz alta" depende de um
arquivo de modelo de voz que é grande demais pra vir junto com o
aplicativo instalado. Por isso, **só quando o adulto toca explicitamente
em "Baixar"**, o app faz o download desse arquivo de um servidor público
(Hugging Face, hospedando o projeto open-source whisper.cpp). Esse
download:

- nunca acontece sozinho — só quando alguém toca no botão;
- baixa só um arquivo de modelo de voz, sem nenhum dado pessoal junto;
- acontece uma vez só; depois disso o app volta a funcionar 100% offline.

## Dado de criança (LGPD, Marco Civil, e afins)

Como nenhum dado sai do aparelho, não existe "tratamento de dado" por
parte do desenvolvedor no sentido que a LGPD regula (Art. 14) — não há
coleta, armazenamento remoto, nem compartilhamento de dado de criança em
nenhum servidor nosso ou de terceiros. Quem tem controle total sobre o
que fica guardado é o adulto responsável pelo aparelho, localmente, a
qualquer momento (ver "Dado que fica só no aparelho" acima).

## Mudanças nesta política

Se esta política mudar — por exemplo, se o app ganhar algum recurso que
use a internet de um jeito novo — a data no topo deste documento é
atualizada e a mudança é destacada na loja na próxima versão.

## Contato

Dúvidas, pedidos de exclusão de dado, ou qualquer outra questão sobre
privacidade: **acantidio@gmail.com**.

---

### Avisos antes de publicar (remover esta seção do documento final)

- **Natureza jurídica do responsável**: este texto assume "Devir Labs"
  como o nome do desenvolvedor, mas não confirma se é pessoa física,
  MEI, ou empresa com CNPJ — **assumido, não confirmado pelo dono**.
  Ajustar conforme a situação real antes de publicar.
- **D-51 (doc002)**: o nome "Letra Viva" tem consulta ao INPI pendente
  antes da loja (risco de colisão com outros produtos de alfabetização).
  Se o nome mudar, este documento (e o Termo de Uso) precisam ser
  atualizados junto.
- Este rascunho cobre o app como ele é hoje (sem anúncio, sem compra
  dentro do app, sem conta). Se qualquer um desses entrar no futuro, a
  política precisa ser reescrita antes do lançamento dessa mudança.
- Recomendado revisão por advogado antes de publicar na Play Store,
  principalmente pela natureza infantil do app (políticas da Play de
  "Designed for Families" / conteúdo direcionado a crianças).
