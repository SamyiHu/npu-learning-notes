"""Mix narration + BGM into a final audio track with narration-driven ducking."""
import numpy as np, soundfile as sf, json, argparse, glob, os

SR = 48000

def read(p):
    x, sr = sf.read(p, dtype='float32', always_2d=True)
    if sr != SR:
        # linear resample (short, fine for our own 48k assets)
        n = int(round(len(x) * SR / sr))
        idx = np.linspace(0, len(x) - 1, n)
        x = np.stack([np.interp(idx, np.arange(len(x)), x[:, c]) for c in range(x.shape[1])], axis=1).astype(np.float32)
    return x

def to_mono(x):
    return x.mean(axis=1).astype(np.float32) if x.ndim == 2 else x.astype(np.float32)

def place(buf, sig, start_s):
    s0 = int(round(start_s * SR))
    if s0 >= len(buf): return
    end = min(len(buf), s0 + len(sig))
    buf[s0:end] += sig[:end - s0]

def smooth_envelope(x, atk=0.012, rel=0.30):
    """Fast attack / slow release envelope follower for ducking."""
    a = np.exp(-1.0 / (atk * SR))
    r = np.exp(-1.0 / (rel * SR))
    env = np.zeros_like(x)
    prev = 0.0
    # vectorised approximation via cumulative max of decayed signal
    y = np.abs(x)
    # attack
    out = np.empty_like(y)
    for i in range(len(y)):
        if y[i] > prev:
            prev = y[i]
        else:
            prev = prev * r
        out[i] = prev
    return out

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--proj', required=True)
    ap.add_argument('--duration', type=float, required=True)
    ap.add_argument('--bgm', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--bgm-gain', type=float, default=0.9)
    ap.add_argument('--duck', type=float, default=0.55)
    a = ap.parse_args()

    n = int(round(a.duration * SR))
    mix = np.zeros(n, dtype=np.float32)

    tl = json.load(open(os.path.join(a.proj, 'audio', 'timeline.json'), encoding='utf-8-sig'))
    for t in tl:
        p = os.path.join(a.proj, t['file'].replace('/', os.sep))
        y = to_mono(read(p))
        place(mix, y, t['start'])

    # normalize narration to a consistent level
    peak = float(np.max(np.abs(mix))) or 1.0
    mix /= peak
    mix *= 0.86

    bgm = to_mono(read(a.bgm))
    if len(bgm) < n:
        bgm = np.pad(bgm, (0, n - len(bgm)))
    bgm = bgm[:n]

    # build ducking from smoothed narration envelope
    env = smooth_envelope(mix)
    # normalise env to 0..1 relative to its own high percentile
    p95 = float(np.percentile(env, 95)) or 1.0
    env = np.clip(env / p95, 0, 1)
    gain = a.bgm_gain * (1.0 - a.duck * env)
    mix = mix + bgm * gain

    # master: gentle limiter + loudness target
    mix = np.tanh(mix * 1.18) * 0.9
    peak = float(np.max(np.abs(mix))) or 1.0
    if peak > 0.95:
        mix *= 0.95 / peak
    sf.write(a.out, mix.astype(np.float32), SR, subtype='PCM_16')
    print(f'wrote {a.out}  {len(mix)/SR:.1f}s')

if __name__ == '__main__':
    main()
