#!/usr/bin/env python3
"""Genera las voces de Beto (MP3) con una voz neuronal de Microsoft, gratis y sin cuenta.

Uso (desde la carpeta del proyecto):
    pip3 install edge-tts
    python3 tools/generar_voces.py                    # voz por defecto: es-MX-JorgeNeural
    python3 tools/generar_voces.py --voz es-MX-JorgeNeural
    python3 tools/generar_voces.py --lista            # muestra las voces en español
    python3 tools/generar_voces.py --forzar           # regenera todo (por ejemplo al cambiar de voz)
    python3 tools/generar_voces.py --probar           # genera solo 1 frase en audio/_prueba.mp3

Necesita internet. Lee audio/frases.json y guarda audio/<id>.mp3. Los que ya existen se saltan.
"""
import argparse, asyncio, json, sys, time
from pathlib import Path

try:
    import edge_tts
except ImportError:
    sys.exit("Falta edge-tts. Instálalo con:  pip3 install edge-tts")

RAIZ = Path(__file__).resolve().parent.parent
AUDIO = RAIZ / "audio"


async def listar():
    voces = await edge_tts.list_voices()
    for v in voces:
        if v["Locale"].lower().startswith("es-"):
            print(f'{v["ShortName"]:28} {v["Gender"]:7} {v["Locale"]}')


async def generar(texto, destino, voz, rate, pitch, intentos=4):
    for n in range(1, intentos + 1):
        try:
            await edge_tts.Communicate(texto, voz, rate=rate, pitch=pitch).save(str(destino))
            if destino.stat().st_size > 500:
                return True
        except Exception as e:  # red inestable: reintenta
            err = e
        time.sleep(1.5 * n)
    print(f"   ✗ no se pudo generar ({err})")
    destino.unlink(missing_ok=True)
    return False


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voz", default="es-MX-JorgeNeural")
    ap.add_argument("--rate", default="-5%", help="velocidad, ej. -10%% para más lento")
    ap.add_argument("--pitch", default="+6Hz", help="tono, ej. +10Hz para más agudo/amable")
    ap.add_argument("--forzar", action="store_true")
    ap.add_argument("--lista", action="store_true")
    ap.add_argument("--probar", action="store_true")
    a = ap.parse_args()

    if a.lista:
        return await listar()

    frases = json.loads((AUDIO / "frases.json").read_text(encoding="utf-8"))
    if a.probar:
        AUDIO.mkdir(exist_ok=True)
        ok = await generar(frases[0]["texto"], AUDIO / "_prueba.mp3", a.voz, a.rate, a.pitch)
        print("Listo: abre audio/_prueba.mp3" if ok else "Falló la prueba")
        return

    hechas = saltadas = fallos = 0
    for i, f in enumerate(frases, 1):
        destino = AUDIO / f'{f["id"]}.mp3'
        if destino.exists() and not a.forzar:
            saltadas += 1
            continue
        print(f'[{i}/{len(frases)}] {f["texto"][:60]}')
        if await generar(f["texto"], destino, a.voz, a.rate, a.pitch):
            hechas += 1
        else:
            fallos += 1
    print(f"\nGeneradas: {hechas} · ya existían: {saltadas} · fallidas: {fallos}  (voz: {a.voz})")
    if fallos:
        print("Vuelve a ejecutar el comando: solo repetirá las que faltan.")


asyncio.run(main())
