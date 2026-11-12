"""Música original para el video de STIRE, compuesta por código (sin licencias de terceros).
Secciones atadas a las escenas; baja de volumen bajo la voz."""
import numpy as np, wave, sys, json

SR = 44100
R = json.load(open(sys.argv[3]))
E = R['escenas']
TOTAL = R['total']
def H(n, x):
    e = E[n]; o = e['o']
    if x <= o: return e['inicio'] + x
    if e['E'] is None or x < e['E']: return e['inicio'] + o + (x - o) / R['K']
    return e['inicio'] + x - e['E'] + e['E2']
BPM = 110.0
BEAT = 60.0 / BPM
N = int(SR * TOTAL)
rng = np.random.default_rng(7)
mix = np.zeros((N, 2))

def nota(n):  # número MIDI -> Hz
    return 440.0 * 2 ** ((n - 69) / 12)

def poner(sig, t, pan=0.0, gan=1.0):
    i = int(t * SR)
    if i >= N: return
    sig = sig[: N - i] * gan
    l = np.sqrt((1 - pan) / 2); r = np.sqrt((1 + pan) / 2)
    mix[i:i + len(sig), 0] += sig * l
    mix[i:i + len(sig), 1] += sig * r

def env(n, ata, cai):
    t = np.arange(n) / SR
    e = np.exp(-t / cai)
    a = int(ata * SR)
    if a > 0: e[:a] *= np.linspace(0, 1, a)
    return e

def marimba(f, dur=0.6):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t / 0.05) + 0.15 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t / 0.02)
    return s * env(n, 0.002, 0.22)

def pluck(f, dur=0.45):
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * k * t) / k ** 1.6 * np.exp(-t * k * 3.0) for k in range(1, 7))
    return s * env(n, 0.003, 0.18)

def bajo(f, dur=0.5):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t) + 0.08 * np.sin(2 * np.pi * 3 * f * t)
    return np.tanh(1.4 * s) * env(n, 0.005, 0.32)

def colchon(fs, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.zeros(n)
    for f in fs:
        for d in (-0.15, 0.15):
            s += np.sin(2 * np.pi * (f + d) * t + 0.3 * np.sin(2 * np.pi * 5 * t))
    a = min(int(0.4 * SR), n // 3); e = np.ones(n); e[:a] = np.linspace(0, 1, a); e[-a:] = np.linspace(1, 0, a)
    return s * e / (2 * len(fs))

def bombo(dur=0.35):
    n = int(dur * SR); t = np.arange(n) / SR
    f = 45 + 90 * np.exp(-t / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.12)

def ruido(dur, cai, agudo=True):
    n = int(dur * SR); s = rng.standard_normal(n)
    if agudo: s = np.diff(np.concatenate([[0], s]))
    return s * env(n, 0.001, cai)

def palmas():
    s = np.zeros(int(0.25 * SR))
    for k, d in enumerate((0, 0.008, 0.017)):
        r = ruido(0.2, 0.03 if k < 2 else 0.07); i = int(d * SR); s[i:i + len(r)] += r[: len(s) - i]
    return s * 0.5

def campana(f, dur=1.2):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.2)
    return s * env(n, 0.002, 0.45)

# Acordes (raíz MIDI, tipo)
MAY = [(60, 'M'), (67, 'M'), (69, 'm'), (65, 'M')]      # C G Am F
MEN = [(57, 'm'), (53, 'M'), (50, 'm'), (52, 'M')]      # Am F Dm E
def tonos(r, k): return [r, r + (4 if k == 'M' else 3), r + 7]

# Secciones: (inicio, fin, nombre)
ALIVIO = H('miedo', 7.4); CRASH = H('logro', 2.15); FIN = E['cierre']['inicio']
SEC = [(0, E['nombre']['inicio'], 'intro'), (E['nombre']['inicio'], E['miedo']['inicio'], 'crece'), (E['miedo']['inicio'], ALIVIO, 'tension'),
       (ALIVIO, E['leccion']['inicio'], 'alivio'), (E['leccion']['inicio'], E['repasos']['inicio'], 'ritmo'), (E['repasos']['inicio'], E['logro']['inicio'], 'ligero'),
       (E['logro']['inicio'], CRASH, 'subida'), (CRASH, E['docente']['inicio'], 'fiesta'), (E['docente']['inicio'], FIN, 'ritmo2'), (FIN, TOTAL, 'final')]

def seccion(t):
    for a, b, n in SEC:
        if a <= t < b: return n
    return 'final'

bar = 4 * BEAT
t = 0.0; nb = 0
while t < FIN:
    sec = seccion(t + 0.01)
    prog = MEN if sec == 'tension' else MAY
    r, k = prog[nb % 4]; ch = tonos(r, k)
    # colchón
    gp = {'intro': 0.35, 'crece': 0.3, 'tension': 0.45, 'alivio': 0.4, 'ritmo': 0.22, 'ligero': 0.3, 'subida': 0.35, 'fiesta': 0.25, 'ritmo2': 0.22}[sec]
    poner(colchon([nota(x) for x in ch], bar + 0.3), t, 0, gp)
    for b8 in range(8):
        tt = t + b8 * BEAT / 2
        if tt >= FIN: break
        s2 = seccion(tt + 0.001)
        # marimba arpegiada
        if s2 in ('intro', 'crece', 'ritmo', 'ligero', 'ritmo2', 'fiesta', 'subida'):
            patron = [0, 1, 2, 1, 0, 2, 1, 2]
            n = ch[patron[b8]] + 12
            if s2 == 'intro' and b8 % 2: pass
            else: poner(marimba(nota(n)), tt, -0.3 if b8 % 2 else 0.3, 0.32)
        if s2 == 'tension' and b8 in (0, 3, 6):
            poner(pluck(nota(ch[b8 % 3] + 12)), tt, 0.2, 0.35)
        # bajo
        if s2 not in ('intro', 'tension') and b8 in (0, 3, 4, 6):
            poner(bajo(nota(r - 24 if r - 24 >= 36 else r - 12)), tt, 0, 0.45)
        if s2 == 'tension' and b8 == 0:
            poner(bajo(nota(r - 24), 1.2), tt, 0, 0.5)
        # batería
        if s2 in ('crece', 'ritmo', 'ritmo2', 'fiesta', 'subida', 'ligero'):
            if b8 in (0, 4): poner(bombo(), tt, 0, 0.75)
            if b8 in (2, 6) and s2 != 'ligero': poner(palmas(), tt, 0.1, 0.32)
            poner(ruido(0.06, 0.012), tt, -0.2 if b8 % 2 else 0.2, 0.10 if b8 % 2 else 0.06)
        if s2 == 'intro' and b8 == 0: poner(bombo(), tt, 0, 0.35)
        if s2 == 'tension' and b8 in (0, 4): poner(bombo(0.5), tt, 0, 0.55)
        # pluck melódico en la fiesta
        if s2 in ('fiesta', 'subida') and b8 % 2 == 0:
            poner(campana(nota(ch[(b8 // 2) % 3] + 24)), tt, 0.4, 0.12)
    t += bar; nb += 1

# Acentos en momentos clave
poner(campana(nota(84), 2.0), ALIVIO, 0, 0.25)         # alivio tras los errores
poner(campana(nota(88), 2.0), ALIVIO + 0.2, 0.3, 0.18)
for k, f in enumerate((72, 76, 79, 84)):               # subida al festejo
    poner(campana(nota(f), 1.0), CRASH - 1.25 + k * 0.28, -0.3 + 0.2 * k, 0.2)
poner(ruido(1.6, 0.6, agudo=True), CRASH, 0, 0.18)    # platillo del festejo
# Final: acorde que se queda sonando con el logo
for f in (48, 60, 64, 67, 72, 76):
    poner(marimba(nota(f), 3.0), FIN + 0.5, 0, 0.35)
poner(colchon([nota(x) for x in (60, 64, 67, 72)], 6.0), FIN + 0.5, 0, 0.4)
poner(bombo(0.6), FIN + 0.5, 0, 0.9)
poner(ruido(2.5, 0.9), FIN + 0.5, 0, 0.15)

# Baja bajo la voz (tramos de voz con margen)
voz = json.load(open(sys.argv[2]))
g = np.ones(N)
for a, b in voz:
    i, j = int((a - 0.15) * SR), int((b + 0.25) * SR)
    g[max(i, 0):min(j, N)] = 0.42
k = int(0.12 * SR); g = np.convolve(g, np.ones(k) / k, mode='same')
mix *= g[:, None]
# Entrada y salida suaves
fi = int(0.5 * SR); mix[:fi] *= np.linspace(0, 1, fi)[:, None]
fo = int(2.5 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.85
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('ok', TOTAL)
