// Animated scene renderer v2 — real motion diagrams, not static cards.
const fs = require('fs');
const SCENES = require('./scenes.js');
const P = { void:'#0B0A12', panel:'#12111A', line:'#2C2839', ink:'#EDE8F5', muted:'#918AA3', copper:'#D4895A', ok:'#5BBF9A', flux:'#E85D7A' };
const LV = { L1:{name:'零基础',color:P.ok}, L2:{name:'硬件原理',color:P.copper}, L3:{name:'实战部署',color:P.flux} };
const TONE = { ok:P.ok, flux:P.flux, copper:P.copper };

function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function escCode(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

// ---- layout renderers: return inner HTML of the hero ----
function hero(spec, ep, A) {
  const kick = `<div class="kicker" id="${A.id}-kick">${esc(ep.id)} · ${esc(A.L.name)}</div>`;
  const H = `<h1 class="h" id="${A.id}-h">${esc(spec.h)}</h1>`;
  const S = `<div class="s" id="${A.id}-s">${esc(spec.s)}</div>`;
  return { kick, H, S };
}

function render(spec, idx, ep, O) {
  const A = { id:`v${idx}`, L: LV[ep.level], accent: LV[ep.level].color, id:`v${idx}` };
  const { kick, H, S } = hero(spec, ep, A);
  let mid = '';

  switch (spec.k) {
    case 'title': {
      mid = `${kick}${H.replace('class="h"','class="h big"')}${S}
        <div class="chips" id="${A.id}-chips">${(spec.chips||[]).map((c,i)=>`<span class="chip" data-i="${i}">${esc(c)}</span>`).join('')}</div>`;
      break;
    }
    case 'bits': {
      mid = `${kick}${H}${S}
        <div class="bits" id="${A.id}-bits">${Array.from({length:8},(_,i)=>`<div class="bitcell" data-i="${i}">${i}</div>`).join('')}</div>
        <div class="bitrow" id="${A.id}-row"></div>
        <div class="eq" id="${A.id}-eq">1 byte &nbsp;=&nbsp; 8 bit &nbsp;=&nbsp; <b>256</b> 种状态</div>`;
      break;
    }
    case 'int8': {
      const neg = ['1','0','1','1','1','1','1','1'], pos=['0','1','1','1','1','1','1','1'];
      mid = `${kick}${H}${S}
        <div class="tworow">
          <div class="trow" id="${A.id}-neg">${neg.map((b,i)=>`<span class="b">${b}</span>`).join('')}<em>−128</em></div>
          <div class="trow" id="${A.id}-pos">${pos.map((b,i)=>`<span class="b">${b}</span>`).join('')}<em>+127</em></div>
        </div>
        <div class="eq">有符号 INT8 · 256 个编码点 · 正数一侧只有 127</div>`;
      break;
    }
    case 'quantize': case 'dequant': {
      const isQ = spec.k === 'quantize';
      const w = ['0.62','−1.28','0.45','−0.09'], q = ['62','−127','45','−9'];
      mid = `${kick}${H}${S}
        <div class="qgrid" id="${A.id}-grid">
          ${w.map((v,i)=>`<div class="qrow" data-i="${i}"><span class="qw">${v}</span><span class="qop">${isQ?'÷ s':'× s'}</span><span class="qi">${isQ?'round':'q'}</span><span class="qo">${isQ?q[i]:v}</span><span class="qbar"><i style="--w:${18+i*20}%"></i></span></div>`).join('')}
        </div>
        <div class="eq">${isQ?'s = max|w| / 127 = 1.28 / 127 ≈ 0.01008':'误差 ≤ s / 2 ≈ 0.005'}</div>`;
      break;
    }
    case 'money1': case 'money2': case 'money3': {
      const cid = A.id+'-mc';
      mid = `${kick}${H}${S}
        <div class="moneyset">
          <div class="money" id="${cid}">
            <div class="mbox" data-k="fp"><span>FP32</span><i style="--w:100%"></i></div>
            <div class="mbox" data-k="int"><span>INT8</span><i style="--w:25%"></i></div>
          </div>
          <ul class="blist" id="${A.id}-items">${(spec.items||[]).map((t,i)=>`<li data-i="${i}">${esc(t)}</li>`).join('')}</ul>
        </div>`;
      break;
    }
    case 'ladder': {
      mid = `${kick}${H}${S}
        <div class="ladder" id="${A.id}-lad">
          ${[{n:'标量',d:'一个数 · 5',w:22},{n:'向量',d:'一排数 · [1,2,3]',w:44},{n:'矩阵',d:'一张数字表',w:68},{n:'张量',d:'多维数字表',w:92}]
          .map((x,i)=>`<div class="lrow" data-i="${i}" style="--w:${x.w}%"><b>${esc(x.n)}</b><span>${esc(x.d)}</span></div>`).join('')}
        </div>`;
      break;
    }
    case 'shape': {
      mid = `${kick}${H}${S}
        <div class="shapewrap">
          <div class="tensor" id="${A.id}-t">
            <div class="tlab" data-i="0">N · 1</div>
            <div class="tgrid" id="${A.id}-tg">
              ${Array.from({length:12},(_,i)=>`<span data-i="${i}"></span>`).join('')}
            </div>
            <div class="taxis">C = 3</div>
          </div>
          <div class="shapeinfo">
            <div class="codebox" id="${A.id}-code">${(spec.code||[]).map((c,i)=>`<div class="cl" data-i="${i}">${escCode(c)}</div>`).join('')}</div>
            <div class="eq" id="${A.id}-note">${esc(spec.note||'')}</div>
          </div>
        </div>`;
      break;
    }
    case 'mulrule': {
      const A2=['1','2'], B2=['5','6','7','8'];
      mid = `${kick}${H}${S}
        <div class="mulscene" id="${A.id}-mul">
          <div class="mgrid" id="${A.id}-ga">${A2.map((v,i)=>`<span class="mc2" data-r="${i}">${v}</span>`).join('')}</div>
          <div class="mop">×</div>
          <div class="mgrid col" id="${A.id}-gb">${B2.map((v,i)=>`<span class="mc2" data-c="${i}">${v}</span>`).join('')}</div>
          <div class="mop">=</div>
          <div class="mres" id="${A.id}-res"></div>
        </div>
        <div class="eq">左矩阵的<b>行</b> × 右矩阵的<b>列</b> → 对应相乘再相加</div>`;
      break;
    }
    case 'dims': case 'layer': {
      mid = `${kick}${H}${S}
        <div class="dimwrap" id="${A.id}-dim">
          <div class="dm" data-k="A"><span>A</span><i>4×3</i></div>
          <div class="dmop">×</div>
          <div class="dm" data-k="B"><span>B</span><i>3×1</i></div>
          <div class="dmop">=</div>
          <div class="dm res" data-k="C"><span>C</span><i>4×1</i></div>
        </div>
        <div class="eq" id="${A.id}-eq">${esc(spec.note||'')}</div>`;
      break;
    }
    case 'why': case 'fix': case 'debug': {
      const tone = spec.tone ? (TONE[spec.tone]||A.accent) : A.accent;
      mid = `${kick}${H}${S}
        <ul class="blist big" id="${A.id}-items" style="--tone:${tone}">${(spec.items||[]).map((t,i)=>`<li data-i="${i}">${esc(t)}</li>`).join('')}</ul>`;
      break;
    }
    case 'bullets': case 'warn': {
      const tone = spec.tone ? (TONE[spec.tone]||P.flux) : A.accent;
      const metric = spec.metric ? `<div class="metric" id="${A.id}-metric"><div class="ml">${esc(spec.metric.label)}</div><div class="mv" id="${A.id}-mv">${esc(spec.metric.v)}</div><div class="mu">${esc(spec.metric.u)}</div></div>` : '';
      const items = spec.items||spec.bullets||[];
      if (spec.k==='warn') {
        mid = `${kick}<div class="kicker warnk" style="color:${tone}">${esc(ep.id)} · 提醒</div>${H}${S}
          <div class="warnpanel" id="${A.id}-wp" style="--tone:${tone}"><ul>${items.map((t,i)=>`<li data-i="${i}">${esc(t)}</li>`).join('')}</ul></div>`;
      } else {
        mid = `${kick}${H}${S}
          <div class="split">
            <ul class="blist big" id="${A.id}-items" style="--tone:${tone}">${items.map((t,i)=>`<li data-i="${i}">${esc(t)}</li>`).join('')}</ul>
            ${metric}
          </div>`;
      }
      break;
    }
    case 'formula': case 'code': {
      mid = `${kick}${H}${S}
        <div class="codebox ${spec.k==='code'?'tall':''}" id="${A.id}-cb">
          ${(spec.code||[]).map((c,i)=>`<div class="cl" data-i="${i}"><span class="ln">${i+1}</span>${escCode(c)}</div>`).join('')}
        </div>
        ${spec.note?`<div class="eq" id="${A.id}-note">${esc(spec.note)}</div>`:''}`;
      break;
    }
    case 'core': {
      let cells=''; for(let r=0;r<8;r++)for(let c=0;c<8;c++)cells+=`<div class="mac" data-i="${r*8+c}"></div>`;
      mid = `${kick}${H}${S}
        <div class="corewrap">
          <div class="macgrid" id="${A.id}-mac">${cells}</div>
          <div class="coreinfo">
            <div class="note" id="${A.id}-cn">${esc(spec.note||'')}</div>
            <div class="legend"><span><i class="sw"></i>空闲</span><span><i class="sw on"></i>计算中</span></div>
          </div>
        </div>`;
      break;
    }
    case 'flow': {
      const labels=['权重固定','输出固定','行固定','脉动阵列'];
      mid = `${kick}${H}${S}
        <div class="flowtabs" id="${A.id}-tabs">${labels.map((l,i)=>`<span class="ftab${i===(spec.state||0)?' on':''}" data-i="${i}" style="--tone:${A.accent}">${esc(l)}</span>`).join('')}</div>
        <div class="flowviz" id="${A.id}-fv" data-state="${spec.state||0}">
          <div class="fv-row"><span class="fv-lab">W</span><div class="fv-track" id="${A.id}-wtrack"></div></div>
          <div class="fv-array">${Array.from({length:32},(_,i)=>`<span class="fv-mac" data-i="${i}"></span>`).join('')}</div>
          <div class="fv-row"><span class="fv-lab">X</span><div class="fv-track" id="${A.id}-xtrack"></div></div>
          <div class="fv-row"><span class="fv-lab">P</span><div class="fv-track" id="${A.id}-ptrack"></div></div>
        </div>
        <ul class="blist" id="${A.id}-items" style="--tone:${A.accent}">${(spec.items||[]).map((t,i)=>`<li data-i="${i}">${esc(t)}</li>`).join('')}</ul>`;
      break;
    }
    case 'pyramid': {
      mid = `${kick}${H}${S}
        <div class="pyramid" id="${A.id}-py">
          <div class="pyr" data-i="0" style="--w:40%;--c:${P.copper}">DDR · GB 级 · ~34 GB/s</div>
          <div class="pyr" data-i="1" style="--w:56%;--c:${P.ok}">SoC SRAM · 1 MB</div>
          <div class="pyr" data-i="2" style="--w:72%;--c:#7E8FB8">片上缓冲 · ~384 KB</div>
          <div class="pyr" data-i="3" style="--w:88%;--c:#B08BC0">MAC 累加器 · TB/s</div>
        </div>`;
      break;
    }
    case 'flow5': {
      mid = `${kick}${H}${S}
        <div class="flow5" id="${A.id}-f5">${(spec.items||[]).map((t,i)=>`
          <div class="f5" data-i="${i}"><div class="f5n">${i+1}</div><div class="f5t">${esc(t)}</div></div>${i<spec.items.length-1?'<div class="f5a">→</div>':''}`).join('')}</div>`;
      break;
    }
    case 'pipeline': {
      const all = O.pipelineScenes;
      mid = `${kick}${H}${S}
        <div class="pipetrack" id="${A.id}-pt">
          ${all.map((s2,i)=>`<div class="pnode${i<=O.step?' on':''}" data-i="${i}" style="--tone:${A.accent}"><div class="pn">${i+1}</div><div class="pt">${esc(s2.h.replace(/^第 \\d+ 步：/,''))}</div></div>${i<all.length-1?'<div class="plink" data-i="${i}"><i></i></div>':''}`).join('')}
        </div>
        <div class="eq" id="${A.id}-pn">${esc(spec.note||'')}</div>`;
      break;
    }
    case 'metrics': {
      mid = `${kick}${H}${S}
        <div class="mgrid2" id="${A.id}-mg">
          <div class="mg" data-i="0"><div class="mgt">准确率</div><div class="mgs">对不对</div><div class="mgv" style="color:${A.accent}">%</div></div>
          <div class="mg" data-i="1"><div class="mgt">帧率</div><div class="mgs">快不快</div><div class="mgv" style="color:${A.accent}">FPS</div></div>
          <div class="mg" data-i="2"><div class="mgt">延迟</div><div class="mgs">一帧多久</div><div class="mgv" style="color:${A.accent}">ms</div></div>
          <div class="mg" data-i="3"><div class="mgt">能效</div><div class="mgs">每瓦做多少</div><div class="mgv" style="color:${P.ok}">FPS/W</div></div>
        </div>`;
      break;
    }
    case 'trio': {
      mid = `${kick}${H}${S}
        <div class="trio" id="${A.id}-trio">${(spec.items||[]).map((t,i)=>`<div class="tc" data-i="${i}"><div class="tcn" style="color:${A.accent}">${String(i+1).padStart(2,'0')}</div><div class="tct">${esc(t)}</div></div>`).join('')}</div>`;
      break;
    }
    case 'summary': {
      mid = `${kick}<div class="h big" id="${A.id}-h">${esc(spec.h)}</div>
        <div class="s" id="${A.id}-s">${esc(spec.s)}</div>
        <div class="sumrule" id="${A.id}-sr"></div>
        <ul class="blist" id="${A.id}-items" style="--tone:${A.accent}">${(spec.items||[]).map((t,i)=>`<li data-i="${i}">${esc(t)}</li>`).join('')}</ul>`;
      break;
    }
    default: {
      mid = `${kick}${H}${S}`;
    }
  }
  return `<section class="scene" id="sc-${idx}"><div class="hero" id="${A.id}-hero">${mid}</div>
    <div class="caption" id="cap-${idx}">${esc(ep.narration[idx])}</div></section>`;
}

function css(accent) {
  return `
@font-face{font-family:"Segoe UI";src:local("Segoe UI")}
@font-face{font-family:"Microsoft YaHei";src:local("Microsoft YaHei")}
@font-face{font-family:"Bahnschrift";src:local("Bahnschrift")}
@font-face{font-family:"Cascadia Code";src:local("Cascadia Code")}
*{margin:0;padding:0;box-sizing:border-box}
html,body{margin:0;width:1920px;height:1080px;overflow:hidden;background:${P.void}}
#root{position:relative;width:100%;height:100%;overflow:hidden;font-family:"Segoe UI","Microsoft YaHei",sans-serif;color:${P.ink}}
.bg-grid{position:absolute;inset:0;opacity:.4;background-image:linear-gradient(rgba(44,40,57,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(44,40,57,.6) 1px,transparent 1px);background-size:64px 64px}
.bg-glow{position:absolute;width:1600px;height:900px;left:50%;top:50%;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(ellipse,color-mix(in srgb,${accent} 13%,transparent),transparent 66%)}
.bg-dots{position:absolute;inset:0;opacity:.28;background-image:radial-gradient(rgba(91,191,154,.14) 1.5px,transparent 1.5px);background-size:26px 26px}
.chrome{position:absolute;inset:30px 44px;z-index:60;pointer-events:none}
.brand{position:absolute;left:0;top:0;display:flex;gap:14px;align-items:center;font-family:Bahnschrift;font-size:18px;letter-spacing:.18em;color:${P.muted}}
.brand-dot{width:10px;height:10px;background:${accent};border-radius:50%;box-shadow:0 0 18px color-mix(in srgb,${accent} 70%,transparent)}
.chapter{position:absolute;right:0;top:0;font-family:Bahnschrift,monospace;font-size:18px;color:${P.muted};letter-spacing:.12em}
.progress{position:absolute;left:0;right:0;bottom:0;height:4px;background:#1A1723}
.progress-fill{height:100%;width:0;background:${accent};box-shadow:0 0 16px color-mix(in srgb,${accent} 65%,transparent)}
.scene{position:absolute;inset:0;opacity:0;pointer-events:none}
.hero{position:absolute;inset:86px 84px 96px;display:flex;flex-direction:column;justify-content:center}
.kicker{font-family:Bahnschrift;font-size:21px;letter-spacing:.26em;color:${accent};text-transform:uppercase;margin-bottom:18px}
.warnk{letter-spacing:.26em;margin-bottom:14px;font-size:20px}
.h{font-size:70px;line-height:1.08;font-weight:800;letter-spacing:-.03em}
.h.big{font-size:96px}
.s{margin-top:18px;font-size:28px;line-height:1.45;color:${P.muted};max-width:1200px}
.chips{display:flex;gap:14px;margin-top:40px}
.chip{border:1px solid ${P.line};background:rgba(18,17,26,.8);padding:12px 22px;font-family:"Cascadia Code",monospace;font-size:19px}
.eq{margin-top:24px;font-size:23px;color:${P.muted}}
.eq b{color:${accent}}
.blist{list-style:none;display:flex;flex-direction:column;gap:20px}
.blist li{position:relative;padding-left:34px;font-size:28px;line-height:1.4;color:${P.ink}}
.blist li::before{content:'';position:absolute;left:0;top:14px;width:14px;height:3px;background:var(--tone,${accent})}
.blist.big li{font-size:30px}
.blist.big{gap:26px;margin-top:38px;max-width:1150px}
.split{display:flex;gap:70px;align-items:flex-start;margin-top:40px}
.metric{border:1px solid ${P.line};background:rgba(18,17,26,.85);padding:26px 32px;min-width:280px;text-align:center}
.ml{font-family:Bahnschrift,monospace;font-size:16px;letter-spacing:.2em;color:${P.muted}}
.mv{font-family:Bahnschrift,monospace;font-size:62px;color:${accent};margin:12px 0 6px}
.mu{font-family:"Cascadia Code",monospace;font-size:16px;color:${P.muted}}
.warnpanel{margin-top:38px;border:1px solid var(--tone);background:color-mix(in srgb,var(--tone) 9%,transparent);padding:30px 36px;max-width:1200px}
.warnpanel ul{list-style:none;display:flex;flex-direction:column;gap:20px}
.warnpanel li{position:relative;padding-left:34px;font-size:29px;line-height:1.4}
.warnpanel li::before{content:'';position:absolute;left:0;top:14px;width:14px;height:3px;background:var(--tone)}
.codebox{margin-top:38px;border-left:3px solid ${accent};background:rgba(18,17,26,.9);padding:24px 30px;max-width:1240px}
.codebox.tall{max-width:1420px}
.cl{font-family:"Cascadia Code",monospace;font-size:24px;line-height:1.6;color:${P.ink};display:flex;gap:16px;opacity:0}
.cl .ln{color:${P.muted};min-width:24px}
/* bits */
.bits{display:flex;gap:12px;margin-top:48px}
.bitcell{width:92px;height:100px;border:1px solid ${P.line};background:rgba(18,17,26,.85);display:flex;align-items:center;justify-content:center;font-family:Bahnschrift,monospace;font-size:34px;color:${P.muted}}
.bitrow{margin-top:14px;font-family:"Cascadia Code",monospace;font-size:40px;letter-spacing:18px;color:${accent};height:50px}
/* int8 */
.tworow{display:flex;flex-direction:column;gap:20px;margin-top:48px}
.trow{display:flex;gap:10px;align-items:center}
.trow .b{width:66px;height:66px;border:1px solid ${P.line};background:rgba(18,17,26,.85);display:flex;align-items:center;justify-content:center;font-family:"Cascadia Code",monospace;font-size:28px}
.trow em{font-family:Bahnschrift,monospace;font-size:26px;color:${accent};font-style:normal;margin-left:16px}
/* quant */
.qgrid{display:flex;flex-direction:column;gap:14px;margin-top:40px;max-width:1300px}
.qrow{display:flex;align-items:center;gap:20px;font-family:"Cascadia Code",monospace;font-size:24px}
.qw{min-width:130px;color:${P.ink}}
.qop{color:${P.muted};min-width:80px}
.qi{color:${P.muted};min-width:80px}
.qo{min-width:90px;color:${accent}}
.qbar{flex:1;height:16px;background:#191622;border:1px solid ${P.line};position:relative}
.qbar i{position:absolute;left:0;top:0;bottom:0;width:0;background:${accent};opacity:.55}
/* money */
.moneyset{display:flex;gap:80px;align-items:center;margin-top:56px}
.money{display:flex;flex-direction:column;gap:26px}
.mbox{position:relative;border:1px solid ${P.line};background:rgba(18,17,26,.85);padding:20px 26px;min-width:300px}
.mbox span{font-family:Bahnschrift,monospace;font-size:24px}
.mbox i{position:absolute;left:26px;right:26px;bottom:14px;height:12px;width:0;background:${accent};opacity:.7}
/* ladder */
.ladder{display:flex;flex-direction:column;gap:18px;margin-top:46px;max-width:1050px}
.lrow{border:1px solid ${P.line};background:rgba(18,17,26,.85);padding:20px 26px;display:flex;align-items:center;gap:26px;width:0}
.lrow b{font-size:28px;min-width:140px}
.lrow span{font-family:"Cascadia Code",monospace;font-size:20px;color:${P.muted}}
/* tensor */
.shapewrap{display:flex;gap:70px;align-items:center;margin-top:44px}
.tensor{position:relative;width:520px;height:330px}
.tlab{position:absolute;left:0;top:-30px;font-family:"Cascadia Code",monospace;font-size:20px;color:${accent}}
.tgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:34px}
.tgrid span{width:96px;height:52px;border:1px solid ${P.line};background:rgba(18,17,26,.85)}
.taxis{font-family:"Cascadia Code",monospace;font-size:20px;color:${P.muted};margin-top:14px}
.shapeinfo{flex:1}
/* mul */
.mulscene{display:flex;align-items:center;gap:34px;margin-top:52px}
.mgrid{display:grid;grid-template-columns:repeat(2,86px);gap:10px}
.mgrid.col{grid-template-columns:86px}
.mc2{width:86px;height:66px;border:1px solid ${P.line};background:rgba(18,17,26,.85);display:flex;align-items:center;justify-content:center;font-family:"Cascadia Code",monospace;font-size:26px}
.mop{font-family:Bahnschrift,monospace;font-size:36px;color:${accent}}
.mres{display:grid;grid-template-columns:86px;gap:10px}
.mres .rv{width:86px;height:66px;border:1px solid ${accent};background:color-mix(in srgb,${accent} 16%,transparent);display:flex;align-items:center;justify-content:center;font-family:"Cascadia Code",monospace;font-size:26px;color:${accent}}
/* dim */
.dimwrap{display:flex;align-items:center;gap:28px;margin-top:52px}
.dm{border:1px solid ${P.line};background:rgba(18,17,26,.85);padding:26px 32px;min-width:170px;text-align:center}
.dm span{display:block;font-family:Bahnschrift,monospace;font-size:22px;color:${P.muted}}
.dm i{font-family:"Cascadia Code",monospace;font-size:30px;font-style:normal}
.dm.res{border-color:${accent}}
.dm.res i{color:${accent}}
.dmop{font-family:Bahnschrift,monospace;font-size:34px;color:${accent}}
/* core */
.corewrap{display:flex;gap:70px;align-items:center;margin-top:44px}
.macgrid{display:grid;grid-template-columns:repeat(8,52px);gap:8px}
.mac{width:52px;height:52px;border:1px solid #443C52;background:#1A1723}
.coreinfo{max-width:640px}
.note{font-size:26px;color:${P.muted};line-height:1.5}
.legend{display:flex;gap:26px;margin-top:24px;font-size:19px;color:${P.muted}}
.legend .sw{display:inline-block;width:20px;height:20px;border:1px solid #443C52;background:#1A1723;margin-right:8px;vertical-align:-3px}
.legend .sw.on{border-color:${accent};background:${accent}}
/* flow */
.flowtabs{display:flex;gap:14px;margin-top:36px}
.ftab{border:1px solid ${P.line};padding:12px 20px;font-size:21px;color:${P.muted}}
.ftab.on{border-color:var(--tone);color:var(--tone);background:rgba(18,17,26,.85)}
.flowviz{margin-top:34px;border:1px solid ${P.line};background:rgba(18,17,26,.6);padding:26px 30px}
.fv-row{display:flex;align-items:center;gap:20px;margin:10px 0}
.fv-lab{font-family:Bahnschrift,monospace;font-size:20px;color:${P.muted};width:28px}
.fv-track{flex:1;height:26px;border:1px solid ${P.line};position:relative;overflow:hidden}
.fv-array{display:grid;grid-template-columns:repeat(16,1fr);gap:6px;margin:16px 0}
.fv-mac{height:26px;border:1px solid #443C52;background:#1A1723}
.fv-mac.on{background:${accent};border-color:${accent};box-shadow:0 0 10px color-mix(in srgb,${accent} 60%,transparent)}
/* pyramid */
.pyramid{display:flex;flex-direction:column;align-items:center;gap:16px;margin-top:50px}
.pyr{width:var(--w);border:1px solid var(--c);background:color-mix(in srgb,var(--c) 12%,transparent);padding:22px 30px;text-align:center;font-size:25px}
/* flow5 */
.flow5{display:flex;align-items:center;gap:18px;margin-top:54px;flex-wrap:wrap}
.f5{border:1px solid ${P.line};background:rgba(18,17,26,.85);padding:26px 30px;min-width:190px;text-align:center;opacity:0}
.f5n{font-family:Bahnschrift,monospace;font-size:32px;color:${accent}}
.f5t{margin-top:10px;font-size:24px}
.f5a{color:${accent};font-size:30px;font-family:Bahnschrift,monospace}
/* pipeline */
.pipetrack{display:flex;align-items:center;margin-top:56px;max-width:1560px}
.pnode{border:1px solid ${P.line};background:rgba(18,17,26,.85);padding:22px 22px;text-align:center;min-width:165px;opacity:.4}
.pnode.on{opacity:1;border-color:var(--tone)}
.pn{font-family:Bahnschrift,monospace;font-size:28px;color:var(--tone)}
.pt{margin-top:8px;font-size:20px;line-height:1.3}
.plink{width:26px;height:2px;background:${P.line};position:relative;flex:0 0 auto}
.plink i{position:absolute;left:0;top:-3px;width:8px;height:8px;border-radius:50%;background:${accent}}
/* metrics */
.mgrid2{display:flex;gap:28px;margin-top:56px}
.mg{border:1px solid ${P.line};background:rgba(18,17,26,.85);padding:34px 38px;min-width:290px;text-align:center;opacity:0}
.mgt{font-size:29px}
.mgs{margin-top:10px;font-size:20px;color:${P.muted}}
.mgv{margin-top:20px;font-family:Bahnschrift,monospace;font-size:50px}
/* trio */
.trio{display:flex;gap:28px;margin-top:56px}
.tc{border:1px solid ${P.line};background:rgba(18,17,26,.85);padding:32px 30px;min-width:290px;text-align:center;opacity:0}
.tcn{font-family:Bahnschrift,monospace;font-size:44px}
.tct{margin-top:12px;font-size:25px;line-height:1.4}
/* summary */
.sumrule{width:0;height:3px;background:${accent};margin:34px 0}
.caption{position:absolute;left:0;right:0;bottom:36px;text-align:center;z-index:40;font-size:26px;color:#DCD5E8;text-shadow:0 2px 14px rgba(0,0,0,.9);max-width:1700px;margin:0 auto;padding:0 90px;line-height:1.4}
`;
}

function buildIndexHtml(ep, opts) {
  const scenes = SCENES[ep.id];
  const L = LV[ep.level];
  const accent = L.color;
  const timeline = opts.timeline || [];
  const duration = opts.duration || 60;
  const pipelineScenes = scenes.filter(s => s.k === 'pipeline');
  const html = scenes.map((s, i) => {
    const O = { step: s.k==='pipeline' ? pipelineScenes.indexOf(s) : 0, pipelineScenes };
    return render(s, i, ep, O);
  }).join('\n');

  const audios = [];
  if (opts.hasOverride) {
    audios.push(`<audio id="master-audio" data-start="0" data-duration="${duration}" data-track-index="1" src="audio/mix.wav" data-volume="1"></audio>`);
  } else {
    timeline.forEach(t => audios.push(`<audio id="narration-${t.id}" data-start="${t.start}" data-duration="${t.dur}" data-track-index="1" src="${t.file}" data-volume="1"></audio>`));
  }

  const animScript = require('fs').readFileSync(require('path').join(__dirname, 'anim.js'), 'utf8');
  const scenesJson = JSON.stringify(scenes.map(s => ({ k: s.k, anim: s.anim || '', state: s.state ?? null, codeLen: (s.code||[]).length, chipLen:(s.chips||[]).length, itemsLen:(s.items||s.bullets||[]).length })));
  const timelineJson = JSON.stringify(timeline);

  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=1920, height=1080">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>${css(accent)}</style></head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${duration}" data-width="1920" data-height="1080">
  <div class="bg-grid" data-layout-ignore></div>
  <div class="bg-glow" data-layout-ignore></div>
  <div class="bg-dots" data-layout-ignore></div>
  <div class="chrome">
    <div class="brand"><span class="brand-dot"></span>NPU LAB · ${esc(ep.id)} · ${esc(L.name)}</div>
    <div class="chapter" id="chapter">01 / ${String(scenes.length).padStart(2,'0')} · ${esc(L.name)}</div>
    <div class="progress"><div class="progress-fill" id="progress-fill"></div></div>
  </div>
  ${html}
  <div id="audio" style="position:absolute;width:0;height:0;overflow:hidden;opacity:0">${audios.join('\n')}</div>
  <script>
    window.__timelines = window.__timelines || {};
    const SCENES = ${scenesJson};
    const TIMELINE = ${timelineJson};
    ${animScript}
  </script>
</div></body></html>`;
}

module.exports = { buildIndexHtml, LV, P };
