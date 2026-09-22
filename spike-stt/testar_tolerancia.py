#!/usr/bin/env python3
"""Valida a trava do D-09 em bate_com_tolerancia_fonetica() (testar.py).

Não depende de áudio nem de motor de STT — testa só a lógica de
comparação com pares conhecidos (adversariais e de variação legítima).
Achado da rodada 7 do spike (ver research.md §T002): sem essa validação,
não dá pra confiar que a tolerância fonética não deixaria "pato" passar
como leitura de "gato" — o que violaria D-09/Princípio IV.

Achado da rodada 12 (2026-09-21, pergunta do dono do projeto — "a
inferência é por comparação fonética de verdade?"): a trava original
comparava só a LETRA inicial, não o FONEMA — "galo" passava como leitura
aceita de "gelo" (mesma letra "g", som inicial diferente: /g/ forte vs
/ʒ/ suave). `gelo` e `galo` estão os dois no banco real
(`conteudo/leitura.json`, natureza e animais). Corrigido com
`_classe_fonema_inicial()` em testar.py — casos abaixo travam a
regressão.

Achado da rodada 15: `usar_damerau=True` conta troca de posição de 2
letras adjacentes ("perna"/"prena") como 1 edição, não 2 — recupera
casos reais de transcrição sem abrir colisão nova no banco (revarrido,
zero colisões). Casos abaixo travam essa regressão também.

Uso:
    python testar_tolerancia.py
"""
from testar import bate_com_tolerancia_fonetica

# vocabulario simulando o banco real — inclui pares que colidem a distancia 1
# mesmo com o fonema inicial certo (rodada 12: gato/galo, cama/casa, os dois
# pares reais achados ao varrer conteudo/leitura.json)
VOCAB_SIMULADO = {"gato", "galo", "cama", "casa", "gelo"}

CASOS = [
    # (esperado, transcrito, deveria_passar, motivo)
    ("gato", "pato", False, "pato nao pode passar como leitura de gato (D-09)"),
    ("pato", "gato", False, "gato nao pode passar como leitura de pato (D-09)"),
    ("gato", "pa to", False, "mesmo fragmentado, pato != gato"),
    ("mao", "pao", False, "pao nao pode passar como leitura de mao"),
    ("gato", "gato", True, "identico tem que passar"),
    ("gato", "ga to", True, "fragmentado mas mesmo som tem que passar (D-37)"),
    ("casa", "caza", True, "c/z sao quase-homofonos em pt-br, tolerancia esperada"),
    ("bola", "pola", False, "b/p sao consoantes diferentes na abertura, nao deveria passar"),
    ("gelo", "galo", False, "letra 'g' igual, fonema inicial diferente (/Z/ suave vs /g/ forte) — rodada 12"),
    ("galo", "gelo", False, "o inverso tambem"),
    ("gelo", "gelo", True, "identico com c/g tem que continuar passando"),
    ("gato", "gata", True, "mesma classe de fonema (ga- forte), distancia 1, sem colidir com vocabulario"),
    ("gato", "galo", False, "mesmo fonema inicial E distancia 1, mas 'galo' e OUTRA palavra real do banco — rodada 12"),
    ("galo", "gato", False, "o inverso tambem"),
    ("cama", "casa", False, "'casa' e OUTRA palavra real do banco, nao ruido de 'cama' — rodada 12"),
    ("casa", "cama", False, "o inverso tambem"),
]

# casos so testados com usar_damerau=True — (esperado, transcrito, deveria_passar, motivo)
CASOS_DAMERAU = [
    ("perna", "prena", True, "transposicao de 2 letras adjacentes conta como 1 edicao — rodada 15"),
    ("gato", "pato", False, "trava do D-09 continua valendo com damerau tambem"),
    ("gato", "galo", False, "guard de vocabulario continua valendo com damerau tambem"),
]


def main():
    falhas = 0
    for esperado, transcrito, deveria_passar, motivo in CASOS:
        resultado = bate_com_tolerancia_fonetica(esperado, transcrito, distancia_max=1,
                                                   vocabulario_conhecido=VOCAB_SIMULADO)
        ok = resultado == deveria_passar
        if not ok:
            falhas += 1
            print(f"FALHOU: esperado={esperado!r} transcrito={transcrito!r} "
                  f"esperava={deveria_passar} obteve={resultado} — {motivo}")
    for esperado, transcrito, deveria_passar, motivo in CASOS_DAMERAU:
        resultado = bate_com_tolerancia_fonetica(esperado, transcrito, distancia_max=1,
                                                   vocabulario_conhecido=VOCAB_SIMULADO,
                                                   usar_damerau=True)
        ok = resultado == deveria_passar
        if not ok:
            falhas += 1
            print(f"FALHOU (damerau): esperado={esperado!r} transcrito={transcrito!r} "
                  f"esperava={deveria_passar} obteve={resultado} — {motivo}")
    total = len(CASOS) + len(CASOS_DAMERAU)
    if falhas:
        print(f"\n{total - falhas}/{total} OK — {falhas} FALHA(S). Trava do D-09 comprometida.")
        raise SystemExit(1)
    print(f"{total}/{total} OK — trava do D-09 validada.")


if __name__ == "__main__":
    main()
