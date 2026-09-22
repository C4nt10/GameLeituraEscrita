#!/usr/bin/env python3
"""Spike de viabilidade de STT offline — A-04/A-09 do GameLeituraEscrita.

Roda cada arquivo em audio/ contra Vosk (modelo pequeno pt) e Whisper
(tiny/base multilíngue) e compara com o nome esperado do arquivo.

Uso:
    python testar.py

Convenção de nome de arquivo: <palavra_esperada>.wav (ou .m4a, .mp3 — o
script converte). Ex.: audio/gato.wav, audio/m.wav (letra M).
"""
import json
import sys
import wave
from pathlib import Path

# console do Windows por padrao usa cp1252, que nao cobre boa parte do que o
# STT pode transcrever (acentos incomuns, hesitacao com reticencias etc.) —
# sem isso o script quebra no meio da tabela em vez de so imprimir estranho.
sys.stdout.reconfigure(encoding="utf-8")

RAIZ = Path(__file__).parent
PASTA_AUDIO = RAIZ / "audio"
MODELO_VOSK = RAIZ / "modelo-vosk-pt"
FFMPEG = RAIZ / "ffmpeg-bin" / "ffmpeg.exe"


def converter_para_wav_16k_mono(caminho: Path) -> Path:
    """Vosk exige WAV PCM 16kHz mono. Converte qualquer formato de entrada."""
    if caminho.suffix.lower() == ".wav":
        with wave.open(str(caminho), "rb") as w:
            if w.getframerate() == 16000 and w.getnchannels() == 1 and w.getsampwidth() == 2:
                return caminho
    import subprocess
    saida = caminho.with_suffix(".16k.wav")
    subprocess.run(
        [str(FFMPEG), "-y", "-i", str(caminho), "-ar", "16000", "-ac", "1", "-sample_fmt", "s16", str(saida)],
        check=True, capture_output=True,
    )
    return saida


def rodar_vosk(caminho_wav: Path) -> str:
    from vosk import KaldiRecognizer, Model

    model = rodar_vosk._modelo_cache
    if model is None:
        model = Model(str(MODELO_VOSK))
        rodar_vosk._modelo_cache = model

    with wave.open(str(caminho_wav), "rb") as wf:
        rec = KaldiRecognizer(model, wf.getframerate())
        rec.SetWords(True)
        texto = []
        while True:
            data = wf.readframes(4000)
            if len(data) == 0:
                break
            if rec.AcceptWaveform(data):
                texto.append(json.loads(rec.Result()).get("text", ""))
        texto.append(json.loads(rec.FinalResult()).get("text", ""))
    return " ".join(t for t in texto if t).strip()


rodar_vosk._modelo_cache = None


def rodar_whisper(caminho_wav: Path, tamanho_modelo: str = "small") -> str:
    from faster_whisper import WhisperModel

    cache_attr = f"_modelo_cache_{tamanho_modelo}"
    modelo = getattr(rodar_whisper, cache_attr, None)
    if modelo is None:
        modelo = WhisperModel(tamanho_modelo, device="cpu", compute_type="int8")
        setattr(rodar_whisper, cache_attr, modelo)

    segmentos, _info = modelo.transcribe(str(caminho_wav), language="pt", beam_size=5)
    return " ".join(s.text for s in segmentos).strip()


def normalizar(s: str) -> str:
    import re
    import unicodedata
    s = s.lower().strip()
    s = "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")
    # "_" no nome do arquivo marca nasal escapado (MAO_ = "mao" -> "mão") ou
    # separador de frase (O_GATO_CORRE = "o gato corre") — os dois casos
    # colapsam certo virando espaço e comprimindo espaço sobrando.
    s = s.replace("_", " ")
    # D-37: o Whisper pontua hesitacao/pausa com virgula, ponto, interrogacao
    # ("ca, sa", "ta? ta", "fa, va, lo") — essa pontuacao E a marca da pausa
    # que a tolerancia tem que ignorar. Tirar so das bordas (strip) nao E
    # suficiente, a pontuacao fica NO MEIO da transcricao. Sem isso, a
    # concatenacao de bate() falha silenciosamente ("ca,sa" != "casa").
    s = re.sub(r"[.,!?;:]+", " ", s)
    # mesmo motivo, achado na rodada 8: o Whisper tambem fragmenta silaba
    # com hifen ("ca-ca", "ga-bo-ca-ca-ze-co-he") — sem isso "ca-ca" nao
    # concatena pra "caca"/"casa", fica preso como token unico com hifen.
    s = s.replace("-", " ")
    return " ".join(s.split())


def distancia_levenshtein(a: str, b: str) -> int:
    """Numero minimo de insercoes/remocoes/substituicoes pra transformar a em b."""
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


_VOGAIS_FRONTAIS = set("ei")  # depois de c/g, som suave: ce/ci = /s/-/ʒ/... (ce, ci, ge, gi)
_VOGAIS_POSTERIORES = set("aou")  # depois de c/g, som forte: ca/co/cu, ga/go/gu


def _classe_fonema_inicial(palavra: str) -> str:
    """Aproxima o FONEMA inicial, nao so a LETRA — cobre o caso classico do
    portugues onde 'c'/'g' mudam de som conforme a vogal seguinte ('gato' som
    forte /g/, 'gelo' som suave /Z/; mesma letra 'g', fonema diferente).

    Achado real (2026-09-21, pergunta do dono do projeto): a trava anterior
    comparava so a LETRA inicial (candidato[0] == esperado[0]), e isso deixava
    'galo' passar como leitura aceita de 'gelo' — palavras diferentes, letra
    igual, fonema inicial diferente. Sem essa funcao, D-09 nao era cumprido
    de verdade nesse caso, so nos casos onde a letra tambem era diferente.
    """
    if len(palavra) < 2 or palavra[0] not in "cg":
        return palavra[0] if palavra else ""
    seguinte = palavra[1]
    if seguinte in _VOGAIS_FRONTAIS:
        return palavra[0] + "~suave"  # ce/ci, ge/gi
    if seguinte in _VOGAIS_POSTERIORES:
        return palavra[0] + "~forte"  # ca/co/cu, ga/go/gu
    return palavra[0] + "~cluster"  # cr/cl/gr/gl etc. — som forte tambem, classe propria


def bate_com_tolerancia_fonetica(esperado: str, transcrito: str, distancia_max: int = 1,
                                  vocabulario_conhecido: "set[str] | None" = None) -> bool:
    """Compara com tolerancia a pequena variacao de pronuncia (D-08), mas com trava
    dura no primeiro FONEMA (aproximado): nunca aceita troca do som inicial (D-09 —
    'pato' nao pode passar como leitura de 'gato', nem 'galo' como leitura de
    'gelo', nao importa a distancia de edicao).

    Achado real (rodada 12, mesma investigacao): mesmo com o fonema inicial
    certo, distancia<=1 ainda deixa 'gato'/'galo' e 'cama'/'casa' colidirem —
    palavras REAIS e diferentes do banco de conteudo, a so 1 letra uma da
    outra. `vocabulario_conhecido` (opcional: o conjunto de todas as palavras
    validas do banco, normalizadas) fecha essa brecha: um candidato dentro da
    distancia so passa se ele NAO for, ele mesmo, uma palavra diferente e
    conhecida do banco — nesse caso e mais provavel que a crianca tenha lido
    (ou o motor tenha ouvido) a OUTRA palavra de verdade, nao uma variacao
    ruidosa da esperada.

    Frase (varias palavras): mantido como substring exato — tolerancia fonetica
    por palavra ainda nao se estende a frase inteira neste spike.
    """
    if " " in esperado:
        return esperado in transcrito
    if not esperado:
        return False
    classe_esperado = _classe_fonema_inicial(esperado)
    tokens = transcrito.split()
    candidatos = tokens + ["".join(tokens)]
    for candidato in candidatos:
        if not candidato:
            continue
        if candidato == esperado:
            return True  # identico sempre passa, mesmo que tambem esteja no vocabulario
        if _classe_fonema_inicial(candidato) != classe_esperado:
            continue  # D-09: som inicial diferente nunca passa, nao importa a distancia
        if vocabulario_conhecido and candidato in vocabulario_conhecido:
            continue  # e uma palavra DIFERENTE e real do banco — nao e ruido de "esperado"
        if distancia_levenshtein(esperado, candidato) <= distancia_max:
            return True
    return False


def main():
    arquivos = sorted(
        p for p in PASTA_AUDIO.iterdir()
        if p.suffix.lower() in (".wav", ".m4a", ".mp3", ".ogg") and ".16k" not in p.name
    )
    if not arquivos:
        print(f"Nenhum audio encontrado em {PASTA_AUDIO}")
        print("Grave e salve como <palavra_esperada>.wav (ex.: gato.wav, m.wav)")
        sys.exit(1)

    print(f"{'esperado':<15} {'vosk':<20} {'whisper (small)':<20} {'vosk ok?':<9} {'whisper ok?'}")
    print("-" * 90)

    acertos_vosk = acertos_whisper = 0
    for arq in arquivos:
        esperado = normalizar(arq.stem)
        try:
            wav = converter_para_wav_16k_mono(arq)
        except FileNotFoundError:
            print(f"{arq.name}: ffmpeg nao encontrado no PATH — instale pra converter audio nao-wav")
            continue

        texto_vosk = normalizar(rodar_vosk(wav))
        texto_whisper = normalizar(rodar_whisper(wav))

        def bate(esperado: str, transcrito: str) -> bool:
            # palavra unica: aceita como palavra inteira na transcricao OU como a
            # concatenacao de todos os tokens transcritos (D-37 — se o motor
            # fragmentou a transcricao por causa de uma pausa no meio da palavra,
            # "ga" + "to" vira "gato" concatenado; a pausa nao pode reprovar uma
            # leitura foneticamente correta, so a precisao do som/palavra conta).
            # Frase (varias palavras): substring basta, ja que o reconhecedor pode
            # incluir hesitacao/filler ao redor.
            if " " in esperado:
                return esperado in transcrito
            concatenado = transcrito.replace(" ", "")
            return esperado in transcrito.split() or transcrito == esperado or concatenado == esperado

        ok_vosk = bate(esperado, texto_vosk)
        ok_whisper = bate(esperado, texto_whisper)
        acertos_vosk += ok_vosk
        acertos_whisper += ok_whisper

        print(f"{esperado:<15} {texto_vosk:<20} {texto_whisper:<20} {'sim' if ok_vosk else 'NAO':<9} {'sim' if ok_whisper else 'NAO'}")

    total = len(arquivos)
    print("-" * 90)
    print(f"Vosk:    {acertos_vosk}/{total} ({100*acertos_vosk/total:.0f}%)")
    print(f"Whisper: {acertos_whisper}/{total} ({100*acertos_whisper/total:.0f}%)")


if __name__ == "__main__":
    main()
