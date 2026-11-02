"""Generate narration audio with Edge neural TTS, with backoff + rate limiting."""
import asyncio, json, os, sys, random
import edge_tts

VOICES = {
    'L1-01': 'zh-CN-XiaoxiaoNeural', 'L1-02': 'zh-CN-XiaoxiaoNeural', 'L1-03': 'zh-CN-XiaoxiaoNeural',
    'L2-01': 'zh-CN-YunxiNeural', 'L2-02': 'zh-CN-YunxiNeural',
    'L2-03': 'zh-CN-YunyangNeural', 'L2-04': 'zh-CN-YunyangNeural',
    'L3-01': 'zh-CN-YunxiNeural', 'L3-02': 'zh-CN-YunxiNeural', 'L3-03': 'zh-CN-YunyangNeural',
}
RATES  = {'L1': '-4%', 'L2': '-6%', 'L3': '-8%'}
PITCH  = {'L1': '+2Hz', 'L2': '+0Hz', 'L3': '-2Hz'}
VOLS   = {'L1': '+4%', 'L2': '+3%', 'L3': '+2%'}

async def synth_one(text, out, voice, rate, pitch, volume, max_tries=6):
    delay = 3.0
    last = None
    for attempt in range(max_tries):
        try:
            c = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, volume=volume)
            await c.save(out)
            return
        except Exception as e:
            last = e
            if attempt == max_tries - 1:
                raise
            wait = delay + random.uniform(0.4, 1.6)
            await asyncio.sleep(wait)
            delay = min(delay * 1.6, 20.0)
    raise last

def main():
    proj, ep_id, level, text_file = sys.argv[1:5]
    out_dir = os.path.join(proj, 'audio')
    os.makedirs(out_dir, exist_ok=True)
    lines = [l.strip() for l in open(text_file, encoding='utf-8') if l.strip()]
    voice = VOICES.get(ep_id, 'zh-CN-YunxiNeural')
    rate, pitch, volume = RATES.get(level, '-5%'), PITCH.get(level, '+0Hz'), VOLS.get(level, '+3%')

    async def run():
        for i, line in enumerate(lines, 1):
            n = f'{i:02d}'
            out = os.path.join(out_dir, f'n{n}.mp3')
            if os.path.exists(out) and os.path.getsize(out) > 2000:
                print(f'  {n}/{len(lines)}', end='', flush=True)
                continue
            await synth_one(line, out, voice, rate, pitch, volume)
            print(f'  {n}/{len(lines)}', end='', flush=True)
            # rate limit between requests to avoid service throttling
            await asyncio.sleep(0.9 + random.uniform(0.1, 0.5))
    asyncio.run(run())
    print(f' done voice={voice} rate={rate}')

if __name__ == '__main__':
    main()
