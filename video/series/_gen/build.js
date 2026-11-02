const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { buildIndexHtml } = require('./render.js');

const DATA = require('./episodes.json');
const ROOT = path.resolve(__dirname, '..');
const FFPROBE = path.join(process.env.TEMP || '', 'hf-tools', 'node_modules', '@ffprobe-installer', 'win32-x64', 'ffprobe.exe');

const args = process.argv.slice(2);
const only = args.filter(a => !a.startsWith('-'));
const skipAudio = args.includes('--no-audio');
const onlyAudio = args.includes('--audio-only');

function sh(cmd, cmdArgs, opts = {}) {
  return execFileSync(cmd, cmdArgs, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts });
}
function fmt(sec) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  const p = (n, w = 2) => String(Math.floor(n)).padStart(w, '0');
  return `${p(h)}:${p(m)}:${p(s)},000`;
}
function writeJson(p, obj) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(obj, null, 2), 'utf8'); }

const probeScript = path.join(__dirname, 'probe.ps1');
const ttsEdge = path.join(__dirname, 'tts_edge.py');
const bgmPy = path.join(__dirname, 'bgm.py');
const mixPy = path.join(__dirname, 'mix.py');

const PKG = JSON.parse(fs.readFileSync(path.join(ROOT, '..', 'npu-intro', 'package.json'), 'utf8'));
const HFJSON = fs.readFileSync(path.join(ROOT, '..', 'npu-intro', 'hyperframes.json'), 'utf8');

// BGM musical seeds per episode: [seed, bpm, key(midi), intensity]
const BGM = {
  'L1-01': [11, 78, 57, 0.55],
  'L1-02': [12, 82, 55, 0.6],
  'L1-03': [13, 80, 53, 0.6],
  'L2-01': [21, 88, 52, 0.85],
  'L2-02': [22, 84, 50, 0.8],
  'L2-03': [23, 80, 48, 0.7],
  'L2-04': [24, 86, 50, 0.8],
  'L3-01': [31, 92, 55, 0.9],
  'L3-02': [32, 96, 57, 1.0],
  'L3-03': [33, 84, 53, 0.75],
};

let built = [];
for (const ep of DATA.episodes) {
  if (only.length && !only.includes(ep.id)) continue;
  const dir = path.join(ROOT, ep.filename);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'narration.txt'), ep.narration.join('\r\n'), 'utf8');

  // clean old wav narration so only mp3 remains
  for (const f of fs.existsSync(path.join(dir, 'audio')) ? fs.readdirSync(path.join(dir, 'audio')) : []) {
    if (f.endsWith('.wav')) fs.unlinkSync(path.join(dir, 'audio', f));
  }
  fs.mkdirSync(path.join(dir, 'audio'), { recursive: true });

  if (!skipAudio) {
    process.stdout.write(`[tts:edge] ${ep.id} ... `);
    sh('python', [ttsEdge, dir, ep.id, ep.level, path.join(dir, 'narration.txt')]);
    console.log('ok');
  }

  const timelinePath = path.join(dir, 'audio', 'timeline.json');
  if (!skipAudio) sh('powershell', ['-ExecutionPolicy', 'Bypass', '-NoProfile', '-File', probeScript, '-ProjectDir', dir]);
  let timeline = [];
  if (fs.existsSync(timelinePath)) {
    timeline = JSON.parse(fs.readFileSync(timelinePath, 'utf8').replace(/^\uFEFF/, ''));
    if (!Array.isArray(timeline)) timeline = [];
  }
  const duration = timeline.length ? Math.round((timeline[timeline.length - 1].start + timeline[timeline.length - 1].dur) * 100) / 100 : 60;

  // BGM with risers at scene boundaries
  const marks = timeline.map(t => t.start);
  const [seed, bpm, key, intensity] = BGM[ep.id] || [1, 84, 57, 0.8];
  const bgmPath = path.join(dir, 'audio', 'bgm.wav');
  if (!skipAudio) {
    process.stdout.write(`[bgm] ${ep.id} ... `);
    sh('python', [bgmPy, '--duration', String(duration), '--out', bgmPath,
      '--marks', JSON.stringify(marks), '--seed', String(seed), '--bpm', String(bpm),
      '--key', String(key), '--intensity', String(intensity), '--gain', '0.30']);
    console.log('ok');
  }

  // Mixed master audio (narration + ducked bgm)
  const mixPath = path.join(dir, 'audio', 'mix.wav');
  if (!skipAudio) {
    process.stdout.write(`[mix] ${ep.id} ... `);
    sh('python', [mixPy, '--proj', dir, '--duration', String(duration), '--bgm', bgmPath, '--out', mixPath]);
    console.log('ok');
  }

  if (!onlyAudio) {
    const html = buildIndexHtml(ep, { timeline, duration, audioOverride: 'audio/mix.wav', hasOverride: fs.existsSync(mixPath) });
    fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ ...PKG, name: ep.filename }, null, 2), 'utf8');
    fs.writeFileSync(path.join(dir, 'hyperframes.json'), HFJSON, 'utf8');
    writeJson(path.join(dir, 'meta.json'), { id: ep.filename, name: ep.filename, level: ep.level, duration, voice: 'edge-neural', bgm: { seed, bpm, key, intensity }, createdAt: new Date().toISOString() });
    fs.copyFileSync(path.join(ROOT, '..', 'npu-intro', 'DESIGN.md'), path.join(dir, 'DESIGN.md'));

    const srt = timeline.map((t, i) => {
      const end = i + 1 < timeline.length ? timeline[i + 1].start : duration;
      return `${i + 1}\r\n${fmt(t.start)} --> ${fmt(end)}\r\n${ep.narration[i]}\r\n`;
    }).join('\r\n');
    fs.writeFileSync(path.join(dir, 'subtitles.srt'), '\uFEFF' + srt, 'utf8');
    fs.writeFileSync(path.join(dir, 'subtitles.vtt'), 'WEBVTT\r\n\r\n' + timeline.map((t, i) => {
      const end = i + 1 < timeline.length ? timeline[i + 1].start : duration;
      return `${fmt(t.start)} --> ${fmt(end)}\r\n${ep.narration[i]}\r\n`;
    }).join('\r\n'), 'utf8');

    const md = [];
    md.push(`# ${ep.id} · ${ep.title}`, '');
    md.push(`> ${ep.subtitle}`);
    md.push(`> 分级：${ep.level} · 时长 ${ep.minutes} 分钟 · 配音 Edge Neural TTS · 配乐程序化合成（seed ${seed}, ${bpm} BPM）`, '');
    md.push(`## 学习目标`, '', ep.goal, '');
    md.push('## 逐段讲解', '');
    ep.narration.forEach((n, i) => { md.push(`${i + 1}. ${n}`); });
    md.push('', '## 练习', '');
    ep.exercises.forEach((x, i) => { md.push(`${i + 1}. ${x}`); });
    md.push('', '## 对应讲义', '');
    (ep.files || []).forEach(f => { md.push(`- ../../${f.replace(/\\/g, '/')}`); });
    md.push('');
    fs.writeFileSync(path.join(dir, 'lecture-notes.md'), md.join('\r\n'), 'utf8');
  }

  built.push({ id: ep.id, dir, duration, lines: timeline.length });
  console.log(`[build] ${ep.id}  ${duration}s  ${timeline.length} clips`);
}

writeJson(path.join(__dirname, 'manifest.json'), { builtAt: new Date().toISOString(), episodes: built });
console.log('\nDone. ' + built.length + ' episodes.');
