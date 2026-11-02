// Motion engine: real diagrams, staggered entrances, and per-kind animation.
(function () {
  const tl = gsap.timeline({ paused: true });
  const rootEl = document.getElementById('root');
  const D = rootEl ? (parseFloat(rootEl.getAttribute('data-duration')) || 60) : 60;

  gsap.set('.scene', { opacity: 0, pointerEvents: 'none' });
  gsap.set('.hero > *', { opacity: 0 });
  const sceneEls = document.querySelectorAll('.scene');

  // compute scene start times
  const starts = [];
  for (let i = 0; i < sceneEls.length; i++) starts.push(i === 0 ? 0 : TIMELINE[i].start);

  function accent() {
    const c = getComputedStyle(document.body).getPropertyValue('--accent') || '#D4895A';
    return c.trim();
  }

  // ---- per-scene entrance (staggered, purposeful) ----
  function entrance(i, t0) {
    const sc = document.getElementById('sc-' + i);
    const kids = Array.from(sc.querySelector('.hero').children);
    tl.to(sc, { opacity: 1, duration: 0.4 }, t0);
    kids.forEach((k, j) => {
      tl.fromTo(k, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.42, ease: 'power2.out' }, t0 + 0.06 * j);
    });
    const cap = document.getElementById('cap-' + i);
    if (cap) tl.fromTo(cap, { opacity: 0 }, { opacity: 1, duration: 0.4 }, t0 + 0.3);
  }

  function exit(i, t) {
    if (i === sceneEls.length - 1) return;
    tl.to('#sc-' + i, { opacity: 0, duration: 0.35 }, t);
  }

  // ---- animation behaviours by directive ----
  function animateScene(i, t0, spec) {
    const sel = (s) => `#sc-${i} ${s}`;
    const dur = (i < TIMELINE.length ? TIMELINE[i].dur : 4) - 0.6;
    const A = spec.anim || '';

    switch (A) {
      case 'bitflip': {
        const cells = document.querySelectorAll(sel('.bitcell'));
        tl.fromTo(cells, { opacity: 0, scale: 0.8, y: -14 }, { opacity: 1, scale: 1, y: 0, duration: 0.3, stagger: 0.055 }, t0 + 0.5);
        const row = document.querySelector(sel('.bitrow'));
        const bits = '00001101';
        const obj = { n: 0 };
        tl.to(obj, {
          n: 8, duration: Math.min(2.2, dur), ease: 'none',
          onUpdate() {
            const k = Math.floor(obj.n);
            row.textContent = bits.slice(0, k);
            cells.forEach((c, idx) => {
              c.textContent = idx < k ? bits[idx] : '';
              c.style.color = idx < k && bits[idx] === '1' ? accent() : (idx < k ? '#EDE8F5' : '#918AA3');
            });
          }
        }, t0 + 0.9);
        break;
      }
      case 'binarysign': {
        const neg = document.querySelectorAll(sel('#v' + i + '-neg .b'));
        const pos = document.querySelectorAll(sel('#v' + i + '-pos .b'));
        tl.fromTo(neg, { opacity: 0, x: -22 }, { opacity: 1, x: 0, duration: 0.26, stagger: 0.05 }, t0 + 0.5);
        tl.fromTo(pos, { opacity: 0, x: 22 }, { opacity: 1, x: 0, duration: 0.26, stagger: 0.05 }, t0 + 1.4);
        break;
      }
      case 'gridquant': case 'griddequant': {
        const rows = document.querySelectorAll(sel('.qrow'));
        tl.fromTo(rows, { opacity: 0, x: -18 }, { opacity: 1, x: 0, duration: 0.32, stagger: 0.28 }, t0 + 0.5);
        const bars = document.querySelectorAll(sel('.qbar i'));
        tl.fromTo(bars, { width: '0%' }, { width: (idx, el) => el.style.getPropertyValue('--w') || '60%', duration: 0.9, stagger: 0.28 }, t0 + 0.7);
        break;
      }
      case 'macshrink': {
        const fp = document.querySelector(sel('.mbox[data-k="fp"] i'));
        const it = document.querySelector(sel('.mbox[data-k="int"] i'));
        tl.fromTo(fp, { width: '0%' }, { width: '100%', duration: 0.9 }, t0 + 0.5);
        tl.fromTo(it, { width: '0%' }, { width: '25%', duration: 0.9 }, t0 + 1.5);
        tl.fromTo(sel('.mbox[data-k="int"]'), { borderColor: '#2C2839' }, { borderColor: accent(), duration: 0.6 }, t0 + 2.2);
        break;
      }
      case 'byteslide': {
        const fp = document.querySelector(sel('.mbox[data-k="fp"] i'));
        const it = document.querySelector(sel('.mbox[data-k="int"] i'));
        tl.fromTo(fp, { width: '0%' }, { width: '100%', duration: 0.6 }, t0 + 0.5);
        tl.fromTo(it, { width: '0%' }, { width: '25%', duration: 0.6 }, t0 + 1.1);
        tl.to(sel('.mbox[data-k="fp"]'), { x: -14, duration: 0.18, repeat: 3, yoyo: true }, t0 + 2.0);
        break;
      }
      case 'modelshrink': {
        const fp = document.querySelector(sel('.mbox[data-k="fp"] i'));
        const it = document.querySelector(sel('.mbox[data-k="int"] i'));
        tl.fromTo(fp, { width: '0%' }, { width: '100%', duration: 0.5 }, t0 + 0.5);
        tl.fromTo(it, { width: '0%' }, { width: '25%', duration: 0.5 }, t0 + 1.0);
        break;
      }
      case 'growstack': {
        const rows = document.querySelectorAll(sel('.lrow'));
        tl.fromTo(rows, { opacity: 0, width: 0 }, { opacity: 1, width: (idx, el) => el.style.getPropertyValue('--w') || '80%', duration: 0.55, stagger: 0.32 }, t0 + 0.5);
        break;
      }
      case 'tensorgrid': {
        const cells = document.querySelectorAll(sel('.tgrid span'));
        tl.fromTo(cells, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.22, stagger: 0.035 }, t0 + 0.5);
        tl.to(cells, { backgroundColor: accent(), duration: 0.12, stagger: { each: 0.02, from: 'random' }, yoyo: true, repeat: 3 }, t0 + 1.6);
        break;
      }
      case 'rowcoltrace': {
        const rows = document.querySelectorAll(sel('.mgrid:not(.col) .mc2'));
        const cols = document.querySelectorAll(sel('.mgrid.col .mc2'));
        tl.fromTo(rows, { opacity: 0 }, { opacity: 1, duration: 0.24, stagger: 0.12 }, t0 + 0.5);
        tl.fromTo(cols, { opacity: 0 }, { opacity: 1, duration: 0.24, stagger: 0.12 }, t0 + 0.8);
        tl.fromTo(sel('.mop'), { opacity: 0 }, { opacity: 1, duration: 0.24 }, t0 + 1.0);
        const res = document.querySelector(sel('.mres'));
        const vals = ['19', '43'];
        const o = { i: 0 };
        tl.to(o, {
          i: 2, duration: 0.9, ease: 'none',
          onUpdate() {
            const k = Math.floor(o.i);
            if (res.children.length !== k) {
              res.innerHTML = '';
              for (let j = 0; j < k; j++) {
                const d = document.createElement('div');
                d.className = 'rv';
                d.textContent = vals[j];
                res.appendChild(d);
              }
            }
          }
        }, t0 + 1.5);
        break;
      }
      case 'dimcheck': {
        tl.fromTo(sel('.dm[data-k="A"]'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.3 }, t0 + 0.5);
        tl.fromTo(sel('.dm[data-k="B"]'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.3 }, t0 + 0.75);
        tl.to(sel('.dmop'), { opacity: 1, duration: 0.2 }, t0 + 1.0);
        tl.fromTo(sel('.dm.res'), { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.34 }, t0 + 1.3);
        break;
      }
      case 'dotanimate': {
        tl.fromTo(sel('.dm[data-k="A"]'), { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.3 }, t0 + 0.5);
        tl.fromTo(sel('.dm[data-k="B"]'), { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.3 }, t0 + 0.72);
        tl.to(sel('.dmop'), { opacity: 1, duration: 0.2 }, t0 + 0.95);
        tl.fromTo(sel('.dm.res'), { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.34 }, t0 + 1.2);
        break;
      }
      case 'parallelrows': case 'macspawn': case 'blocksnap': {
        const macs = document.querySelectorAll(sel('.mac'));
        if (macs.length) {
          tl.fromTo(macs, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.2, stagger: 0.008 }, t0 + 0.5);
          const rows = Math.max(1, Math.floor(dur - 1));
          for (let r = 0; r < rows; r++) {
            const st = t0 + 1.4 + r * 0.34;
            tl.to(macs, { backgroundColor: accent(), borderColor: accent(), duration: 0.1, stagger: { each: 0.006, from: 'start' } }, st);
            tl.to(macs, { backgroundColor: '#1A1723', borderColor: '#443C52', duration: 0.14, stagger: { each: 0.006, from: 'end' } }, st + 0.18);
          }
        } else {
          const items = document.querySelectorAll(sel('.blist li'));
          tl.fromTo(items, { opacity: 0, x: -18 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.18 }, t0 + 0.5);
        }
        break;
      }
      case 'datastream': case 'systolicpump': {
        const macs = document.querySelectorAll(sel('.fv-mac'));
        const tracks = document.querySelectorAll(sel('.fv-track'));
        tl.fromTo(tracks, { opacity: 0 }, { opacity: 1, duration: 0.24 }, t0 + 0.4);
        const sweep = Math.min(3.0, dur - 1.0);
        const steps = Math.max(1, Math.round(sweep / 0.24));
        for (let k = 0; k < steps; k++) {
          const st = t0 + 0.9 + k * 0.24;
          const from = A === 'systolicpump' ? 'start' : (k % 2 === 0 ? 'start' : 'end');
          tl.to(macs, { backgroundColor: accent(), borderColor: accent(), duration: 0.1, stagger: { each: 0.02, from } }, st);
          tl.to(macs, { backgroundColor: '#1A1723', borderColor: '#443C52', duration: 0.12, stagger: { each: 0.02, from } }, st + 0.13);
        }
        break;
      }
      case 'warnpulse': {
        const wp = document.querySelector(sel('.warnpanel'));
        const items = document.querySelectorAll(sel('.warnpanel li'));
        if (wp) {
          tl.fromTo(wp, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.3 }, t0 + 0.5);
          const g = { o: 1 };
          const pulseCount = Math.max(2, Math.min(6, Math.round(dur / 1.2)));
          tl.to(g, { o: 0.55, duration: 0.5, yoyo: true, repeat: pulseCount * 2 - 1, onUpdate() { wp.style.boxShadow = `0 0 ${40 * g.o}px color-mix(in srgb, var(--tone) 30%, transparent)`; } }, t0 + 1.0);
        } else {
          tl.fromTo(items, { opacity: 0, x: -18 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.18 }, t0 + 0.5);
        }
        break;
      }
      case 'typed': {
        const lines = document.querySelectorAll(sel('.codebox .cl'));
        tl.fromTo(lines, { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.3 }, t0 + 0.5);
        const caret = document.createElement('span');
        caret.textContent = '▍';
        caret.style.color = accent();
        caret.style.marginLeft = '10px';
        const box = document.querySelector(sel('.codebox'));
        if (box && lines.length) box.appendChild(caret);
        const blinkCount = Math.max(4, Math.min(14, Math.round(dur * 2)));
        tl.to(caret, { opacity: 0, duration: 0.28, yoyo: true, repeat: blinkCount }, t0 + 0.9);
        break;
      }
      case 'summarymark': {
        const rule = document.querySelector(sel('.sumrule'));
        const items = document.querySelectorAll(sel('.blist li'));
        if (rule) tl.fromTo(rule, { width: 0 }, { width: '240px', duration: 0.5 }, t0 + 0.5);
        tl.fromTo(items, { opacity: 0, x: -18 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.2 }, t0 + 0.8);
        break;
      }
      case 'countup': case 'barfill': case 'pydrift': case 'flow5march': case 'metricsfloat': default: {
        const generic = document.querySelectorAll(sel('.hero .blist li, .hero .f5, .hero .mg, .hero .pyr'));
        if (generic.length) tl.fromTo(generic, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.36, stagger: 0.14 }, t0 + 0.5);
        break;
      }
    }
  }

  // ---- compose ----
  for (let i = 0; i < sceneEls.length; i++) {
    const t0 = starts[i];
    entrance(i, t0);
    animateScene(i, t0, SCENES[i]);
    if (i < sceneEls.length - 1) {
      const tExit = Math.min((i + 1 < TIMELINE.length ? TIMELINE[i + 1].start : D) - 0.35, D - 0.1);
      exit(i, tExit);
    }
  }

  // chrome
  const chapterEl = document.getElementById('chapter');
  const total = sceneEls.length;
  for (let i = 0; i < total; i++) {
    const label = `${String(i + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')} · ${SCENES[i].k === 'title' ? '开场' : SCENES[i].k === 'summary' ? '小结' : '讲解'}`;
    tl.call(() => { chapterEl.textContent = label; }, null, starts[i]);
  }
  tl.to('#progress-fill', { width: '100%', duration: D, ease: 'none' }, 0);
  tl.to('.bg-glow', { scale: 1.07, opacity: 0.8, duration: 24, yoyo: true, repeat: Math.max(1, Math.ceil(D / 24) - 1) }, 0);
  tl.to('.bg-grid', { y: -16, duration: 40, yoyo: true, repeat: Math.max(1, Math.ceil(D / 40) - 1) }, 0);
  tl.to('.brand-dot', { scale: 1.3, duration: 2.4, yoyo: true, repeat: Math.max(1, Math.ceil(D / 2.4) - 1) }, 0);

  window.__timelines['main'] = tl;
  tl.seek(0);
})();
