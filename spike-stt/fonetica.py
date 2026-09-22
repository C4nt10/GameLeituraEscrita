#!/usr/bin/env python3
"""Fonemizador aproximado de PT-BR — rodada 14 do spike de STT.

Converte uma palavra escrita num fonema aproximado (não IPA formal, um
alfabeto interno simplificado), pra permitir comparação por SOM em vez de
por LETRA. Resolve o que a rodada 12 encontrou: a "tolerância fonética"
até aqui (`testar.bate_com_tolerancia_fonetica`) era comparação
ortográfica com uma heurística pontual só pro "c"/"g" — não cobria outros
casos reais do português (dígrafos, "j", "s" intervocálico, nasalização).

Regras cobertas (aproximação prática, não fonologia formal):
- Dígrafos: ch->/S/, lh->/L/, nh->/J/, rr->/R/, ss->/s/
- qu/gu antes de e,i: perde o "u" (que/qui = k+vogal, gue/gui = g+vogal)
- c antes de e,i -> /s/; c antes de a,o,u/consoante -> /k/; ç -> /s/
- g antes de e,i -> /Z/ (mesmo som de "j", sempre /Z/); g antes de
  a,o,u/consoante -> /g/
- x -> /S/ (aproximação — x tem 4 valores possíveis em português, este é
  o mais comum em palavras nativas; limitação conhecida, não resolvida)
- s entre vogais -> /z/
- h sozinho (fora de dígrafo) é mudo -> removido
- Nasalização: "ão"->/6/, "ãe"->/6i/, "õe"->/oi~/, vogal+m/n em fim de
  sílaba (antes de consoante ou fim de palavra) -> nasaliza a vogal e
  descarta o m/n
- Acentos (á,à,â,é,ê,í,ó,ô,ú) reduzidos à vogal base — informação de
  tonicidade descartada (limitação conhecida)

Não é um fonemizador de produção — é bom o bastante pra este spike medir
se comparar por SOM muda o resultado da avaliação, e onde as duas
abordagens (ortográfica vs. fonética) concordam ou discordam.
"""
import re
import unicodedata

_MAPA_ACENTO = {
    "á": "a", "à": "a", "â": "a", "ã": "a",
    "é": "e", "ê": "e",
    "í": "i",
    "ó": "o", "ô": "o", "õ": "o",
    "ú": "u",
}

_VOGAIS = set("aeiou")
_VOGAIS_FRONTAIS = set("ei")


def _remove_acento_basico(c: str) -> str:
    return _MAPA_ACENTO.get(c, c)


def fonemizar_pt(palavra: str) -> str:
    """Converte uma palavra (ou token) em fonema aproximado. Ver regras no
    docstring do módulo. Espera entrada já em minúsculas, sem pontuação."""
    s = palavra.lower().strip()
    if not s:
        return ""

    # nasalizacao a partir de digrafos com til, antes de qualquer outra regra
    s = s.replace("ão", "6").replace("ãe", "6i").replace("õe", "9i")

    # digrafos e clusters (ordem importa: mais longos primeiro)
    s = s.replace("qu", "k#").replace("gu", "g#")  # marca #, resolvido depois conforme vogal
    s = s.replace("ch", "S").replace("lh", "L").replace("nh", "J")
    s = s.replace("rr", "R").replace("ss", "s")
    s = s.replace("ç", "s")

    saida = []
    i = 0
    n = len(s)
    while i < n:
        c = s[i]
        prox = s[i + 1] if i + 1 < n else ""

        if c == "#":
            # sobra do qu/gu: se a vogal seguinte e e/i, o # so existiu pra
            # marcar "k"/"g" que ja foi emitido — descarta o # (u mudo)
            i += 1
            continue

        if c in "kg" and prox == "#":
            # qu/gu antes de a,o (raro: "quando") — mantem consoante + glide
            # simplificado: emite a consoante, deixa o # ser descartado no
            # proximo passo, perde o glide /w/ (limitacao aceita)
            saida.append(c)
            i += 1
            continue

        if c == "c":
            if prox in _VOGAIS_FRONTAIS:
                saida.append("s")
            else:
                saida.append("k")
            i += 1
            continue

        if c == "g":
            if prox in _VOGAIS_FRONTAIS:
                saida.append("Z")
            else:
                saida.append("g")
            i += 1
            continue

        if c == "j":
            saida.append("Z")
            i += 1
            continue

        if c == "x":
            saida.append("S")
            i += 1
            continue

        if c == "h":
            # h sozinho e mudo (digrafos ch/lh/nh ja foram tratados acima)
            i += 1
            continue

        if c == "s" and saida and saida[-1] in _VOGAIS and prox in _VOGAIS:
            saida.append("z")
            i += 1
            continue

        if c in ("m", "n") and saida and saida[-1] in _VOGAIS:
            seguinte_e_vogal = prox in _VOGAIS
            if not seguinte_e_vogal:
                # nasaliza a vogal anterior, descarta o m/n
                saida[-1] = saida[-1] + "~"
                i += 1
                continue

        saida.append(_remove_acento_basico(c))
        i += 1

    return "".join(saida)


def distancia_levenshtein(a: str, b: str) -> int:
    if a == b:
        return 0
    if not a:
        return len(b)
    if not b:
        return len(a)
    anterior = list(range(len(b) + 1))
    for i, ca in enumerate(a, start=1):
        atual = [i]
        for j, cb in enumerate(b, start=1):
            custo = 0 if ca == cb else 1
            atual.append(min(anterior[j] + 1, atual[j - 1] + 1, anterior[j - 1] + custo))
        anterior = atual
    return anterior[-1]


def bate_por_fonema_real(esperado: str, transcrito: str, distancia_max: int = 1,
                          vocabulario_conhecido: "set[str] | None" = None) -> bool:
    """Mesma estrutura de testar.bate_com_tolerancia_fonetica (trava no som
    inicial + guard de vocabulario conhecido), mas comparando FONEMA
    (fonemizar_pt) em vez de LETRA crua. `vocabulario_conhecido`, se
    passado, deve ser o conjunto de palavras JA fonemizadas do banco.
    """
    if " " in esperado:
        return esperado in transcrito  # frase: mantem substring ortografico
    if not esperado:
        return False
    fon_esperado = fonemizar_pt(esperado)
    if not fon_esperado:
        return False
    fonema_inicial_esperado = fon_esperado[0]
    tokens = transcrito.split()
    candidatos_texto = tokens + ["".join(tokens)]
    for candidato_texto in candidatos_texto:
        if not candidato_texto:
            continue
        fon_cand = fonemizar_pt(candidato_texto)
        if not fon_cand:
            continue
        if fon_cand == fon_esperado:
            return True
        if fon_cand[0] != fonema_inicial_esperado:
            continue  # D-09 por fonema de verdade agora, nao so aproximacao de letra
        if vocabulario_conhecido and fon_cand in vocabulario_conhecido and fon_cand != fon_esperado:
            continue  # e o fonema de outra palavra real do banco
        if distancia_levenshtein(fon_esperado, fon_cand) <= distancia_max:
            return True
    return False
