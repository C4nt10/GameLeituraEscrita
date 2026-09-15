#!/usr/bin/env python3
"""Valida a trava do D-09 em bate_com_tolerancia_fonetica() (testar.py).

Não depende de áudio nem de motor de STT — testa só a lógica de
comparação com pares conhecidos (adversariais e de variação legítima).
Achado da rodada 7 do spike (ver research.md §T002): sem essa validação,
não dá pra confiar que a tolerância fonética não deixaria "pato" passar
como leitura de "gato" — o que violaria D-09/Princípio IV.

Uso:
    python testar_tolerancia.py
"""
from testar import bate_com_tolerancia_fonetica

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
]


def main():
    falhas = 0
    for esperado, transcrito, deveria_passar, motivo in CASOS:
        resultado = bate_com_tolerancia_fonetica(esperado, transcrito, distancia_max=1)
        ok = resultado == deveria_passar
        if not ok:
            falhas += 1
            print(f"FALHOU: esperado={esperado!r} transcrito={transcrito!r} "
                  f"esperava={deveria_passar} obteve={resultado} — {motivo}")
    total = len(CASOS)
    if falhas:
        print(f"\n{total - falhas}/{total} OK — {falhas} FALHA(S). Trava do D-09 comprometida.")
        raise SystemExit(1)
    print(f"{total}/{total} OK — trava do D-09 validada.")


if __name__ == "__main__":
    main()
