"""
Procedural tech BGM generator (fully offline, deterministic, vectorised).
Dark ambient techno bed: sub drone, off-beat pulse bass, sparse arp, per-bar
kick/hat, scene-boundary risers. Designed to sit under narration.
"""
import numpy as np, soundfile as sf, argparse, json, math
from scipy.signal import lfilter, butter, sosfilt

SR = 48000
A4 = 440.0

def midi(n): return A4 * (2 ** ((n - 69) / 12.0))

def lp(x, cutoff, order=2):
    sos = butter(order, min(0.99, cutoff / (SR / 2)), btype='low', output='sos')
    return sosfilt(sos, x).astype(np.float32)

def hp(x, cutoff, order=2):
    sos = butter(order, max(1e-4, cutoff / (SR / 2)), btype='high', output='sos')
    return sosfilt(sos, x).astype(np.float32)

def saw(phase): return 2.0 * (phase - np.floor(phase + 0.5))

def sine_sweep(n, f0, f1):
    t = np.arange(n) / SR
    k = (f1 - f0) / (n / SR)
    return np.sin(2 * np.pi * (f0 * t + 0.5 * k * t * t)).astype(np.float32)

def env_exp(n, attack_ms, decay):
    t = np.arange(n) / SR
    a = np.exp(-t / max(1e-4, attack_ms / 1000.0))
    d = np.exp(-t * decay)
    return (a * d).astype(np.float32)

def add_at(bus, sig, start_s):
    s0 = int(start_s * SR)
    if s0 >= len(bus): return
    end = min(len(bus), s0 + len(sig))
    bus[s0:end] += sig[:end - s0]

def kick(n=0.55, punch=1.0):
    ln = int(n * SR)
    t = np.arange(ln) / SR
    f = 130 * np.exp(-t * 30) + 46
    ph = np.cumsum(f) / SR
    body = np.sin(2 * np.pi * ph)
    click = (np.random.default_rng(11).standard_normal(ln) * np.exp(-t * 400)).astype(np.float32)
    y = (body * np.exp(-t * 13) + click * 0.25)
    y = hp(y, 40)
    return (y * punch).astype(np.float32)

def hat(n=0.07, amp=0.2, seed=7):
    ln = int(n * SR)
    noise = np.random.default_rng(seed).standard_normal(ln).astype(np.float32)
    noise = hp(noise, 6500)
    return (noise * np.exp(-np.arange(ln) / SR * 70) * amp).astype(np.float32)

def pluck(freq, seconds, amp=1.0, cutoff=3000):
    ln = int(seconds * SR)
    t = np.arange(ln) / SR
    x = (np.sin(2 * np.pi * freq * t) * 0.6 + saw(freq * t) * 0.22).astype(np.float32)
    x = lp(x, cutoff)
    return (x * env_exp(ln, 3, 7.0) * amp).astype(np.float32)

def pad(freq, seconds, amp=0.12, cutoff=850, detune=0.005):
    ln = int(seconds * SR)
    t = np.arange(ln) / SR
    x = np.zeros(ln, dtype=np.float32)
    for d in (0.0, detune, -detune):
        f = freq * (1 + d)
        x += np.sin(2 * np.pi * f * t + d * 30)
        x += 0.35 * np.sin(2 * np.pi * f * 2 * t)
    x /= 3.0
    x = lp(x, cutoff)
    fade = min(int(1.2 * SR), ln // 4)
    e = np.ones(ln, dtype=np.float32)
    e[:fade] = np.linspace(0, 1, fade)
    e[-fade:] = np.linspace(1, 0, fade)
    return (x * e * amp).astype(np.float32)

def riser(seconds, amp=0.14, seed=3):
    ln = int(seconds * SR)
    noise = np.random.default_rng(seed).standard_normal(ln).astype(np.float32)
    noise = hp(noise, 500)
    # progressive band opening via repeated one-pole lowpass subtraction (vectorised cascade)
    y = np.zeros(ln, dtype=np.float32)
    cur = noise.copy()
    steps = 10
    for k in range(steps):
        y += cur / steps
        cur = lp(cur, 900 + k * 2600, order=1) * 0.86
    env = np.linspace(0.0, 1.0, ln) ** 1.6
    return (y * env * amp).astype(np.float32)

def build(duration, seed, scene_marks, bpm=84.0, key=57, intensity=1.0):
    rng = np.random.default_rng(seed)
    ln = int(duration * SR)
    pulse = np.zeros(ln, dtype=np.float32)
    drone = np.zeros(ln, dtype=np.float32)
    lead = np.zeros(ln, dtype=np.float32)
    beat = 60.0 / bpm
    bar = beat * 4

    # Drone: root + fifth per scene region, gentle swell
    marks2 = [0.0] + [m for m in scene_marks if 0.5 < m < duration - 1] + [duration]
    for i in range(len(marks2) - 1):
        start, stop = marks2[i], marks2[i + 1]
        secs = stop - start
        if secs <= 0: continue
        seg = pad(midi(key - 12), secs, amp=0.17, cutoff=300)
        seg += pad(midi(key - 5), secs, amp=0.10, cutoff=260)
        if i % 2 == 1:
            seg += pad(midi(key - 1), secs, amp=0.05, cutoff=240)
        t = np.arange(int(secs * SR)) / SR
        seg *= (0.72 + 0.28 * np.sin(2 * np.pi * t / max(5.0, secs))).astype(np.float32)
        add_at(drone, seg, start)

    # Off-beat pulse bass
    step = beat / 2
    pat = [1, 0, 1, 1, 0, 1, 1, 1]
    degs = [0, 0, 7, 3, 0, 5, 7, 10]
    t_all, idx = 0.0, 0
    while t_all < duration - 0.1:
        if pat[idx % 8]:
            n = int(step * 1.5 * SR)
            f = midi(key - 24 + degs[idx % 8])
            seg = saw(np.arange(n) / SR * f).astype(np.float32)
            seg = lp(seg, 230)
            seg *= env_exp(n, 2, 10.0) * 0.33
            add_at(pulse, seg, t_all)
        t_all += step
        idx += 1

    # Kick / hat grid (intensity gates how busy it gets)
    t_all, k = 0.0, 0
    while t_all < duration - 0.1:
        if k % 4 in (0, 2):
            add_at(pulse, kick(0.5, 0.42 * intensity), t_all)
        if intensity > 0.6 and k % 4 == 3:
            add_at(pulse, kick(0.3, 0.22 * intensity), t_all + beat / 2)
        if k % 2 == 1:
            add_at(pulse, hat(0.06, 0.085 * intensity), t_all)
        t_all += beat
        k += 1

    # Sparse arp motif
    scale = [0, 3, 5, 7, 10, 12, 15, 12, 10, 7]
    t_all, kk = beat * 2, 0
    while t_all < duration - 0.2:
        if rng.random() < 0.5 * intensity:
            deg = scale[kk % len(scale)]
            add_at(lead, pluck(midi(key + 12 + deg), 1.5, 0.095, 3400), t_all)
            kk += 1
        t_all += beat * (1 if rng.random() < 0.62 else 2)

    # Scene risers
    for m in scene_marks:
        if 1.2 < m < duration - 0.4:
            add_at(lead, riser(1.25, 0.13), m - 1.25)

    # Mix
    bus = drone + pulse * 0.85 + lead * 0.9
    bus = hp(bus, 30)
    bus = lp(bus, 10500)
    bus = np.tanh(bus * 1.3) * 0.72

    # Gentle pumping sidechain at 2 Hz for motion under narration
    t = np.arange(ln) / SR
    pump = 1.0 - 0.16 * (0.5 + 0.5 * np.cos(2 * np.pi * t / beat)) * intensity
    bus *= pump.astype(np.float32)

    fi, fo = int(1.6 * SR), int(3.0 * SR)
    e = np.ones(ln, dtype=np.float32)
    e[:fi] = np.linspace(0, 1, fi)
    e[-fo:] = np.linspace(1, 0, fo)
    bus *= e
    return bus

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--duration", type=float, required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--marks", default="[]")
    ap.add_argument("--seed", type=int, default=1)
    ap.add_argument("--bpm", type=float, default=84.0)
    ap.add_argument("--key", type=int, default=57)
    ap.add_argument("--intensity", type=float, default=1.0)
    ap.add_argument("--gain", type=float, default=0.32)
    a = ap.parse_args()
    y = build(a.duration, a.seed, json.loads(a.marks), a.bpm, a.key, a.intensity)
    peak = float(np.max(np.abs(y))) or 1.0
    y = (y / peak * a.gain).astype(np.float32)
    sf.write(a.out, y, SR, subtype="PCM_16")
    print(f"wrote {a.out}  {len(y)/SR:.1f}s  peak={peak:.3f}")

if __name__ == "__main__":
    main()
