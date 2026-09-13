#!/usr/bin/env python3
"""Corta cada audio em audio/ para o MAIOR trecho continuo de fala
(via silencedetect do ffmpeg), com uma margem pequena. Diagnostico pra
saber se a acuracia ruim do spike principal e do audio (varias tentativas
numa gravacao so) ou do motor de STT em si.

Grava em audio/aparado/<nome>.wav — nao mexe nos originais.
"""
import re
import subprocess
from pathlib import Path

RAIZ = Path(__file__).parent
PASTA_AUDIO = RAIZ / "audio"
PASTA_SAIDA = PASTA_AUDIO / "aparado"
FFMPEG = RAIZ / "ffmpeg-bin" / "ffmpeg.exe"
MARGEM = 0.25  # segundos de folga antes/depois do trecho detectado


def segmentos_de_fala(caminho: Path, ruido_db=-30, duracao_min=0.4):
    """Roda silencedetect e devolve lista de (inicio, fim) dos trechos SEM silencio."""
    r = subprocess.run(
        [str(FFMPEG), "-i", str(caminho), "-af",
         f"silencedetect=noise={ruido_db}dB:d={duracao_min}", "-f", "null", "-"],
        capture_output=True, text=True,
    )
    saida = r.stderr
    duracao_total = None
    m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", saida)
    if m:
        h, mi, s = m.groups()
        duracao_total = int(h) * 3600 + int(mi) * 60 + float(s)

    silencios = []
    inicio_atual = None
    for linha in saida.splitlines():
        m1 = re.search(r"silence_start: ([\d.]+)", linha)
        if m1:
            inicio_atual = float(m1.group(1))
        m2 = re.search(r"silence_end: ([\d.]+)", linha)
        if m2 and inicio_atual is not None:
            silencios.append((inicio_atual, float(m2.group(1))))
            inicio_atual = None

    # inverte silencios -> segmentos de fala
    fala = []
    cursor = 0.0
    for s_ini, s_fim in silencios:
        if s_ini > cursor:
            fala.append((cursor, s_ini))
        cursor = s_fim
    if duracao_total and cursor < duracao_total:
        fala.append((cursor, duracao_total))
    return fala


def main():
    PASTA_SAIDA.mkdir(exist_ok=True)
    arquivos = sorted(p for p in PASTA_AUDIO.iterdir() if p.suffix.lower() == ".ogg")
    for arq in arquivos:
        fala = segmentos_de_fala(arq)
        if not fala:
            print(f"{arq.name}: nenhum segmento de fala detectado, copiando integral")
            ini, fim = 0.0, 999
        else:
            ini, fim = max(fala, key=lambda t: t[1] - t[0])
            ini = max(0.0, ini - MARGEM)
            fim = fim + MARGEM
        saida = PASTA_SAIDA / (arq.stem + ".wav")
        subprocess.run(
            [str(FFMPEG), "-y", "-i", str(arq), "-ss", str(ini), "-to", str(fim),
             "-ar", "16000", "-ac", "1", "-sample_fmt", "s16", str(saida)],
            check=True, capture_output=True,
        )
        print(f"{arq.name}: {len(fala)} trecho(s) de fala, maior = {ini:.2f}s-{fim:.2f}s ({fim-ini:.2f}s)")


if __name__ == "__main__":
    main()
