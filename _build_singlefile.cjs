/* 把 NPU Lab 站点打包成单个自包含 HTML（离线双击可开）
   用法：node _build_singlefile.cjs [输出路径]
   默认输出到 dist/npu-lab.html */
const fs = require("fs");
const path = require("path");

const root = __dirname;
const outArg = process.argv[2];
const outPath = outArg
  ? path.resolve(process.cwd(), outArg)
  : path.join(root, "dist", "npu-lab.html");

const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

let html = read("index.html");

// 1) 外链样式 -> <style>
html = html.replace(
  /<link\s+rel="stylesheet"\s+href="styles\.css"\s*\/?>/,
  () => `<style>\n${read("styles.css")}\n</style>`
);

// 2) 外链脚本 -> 内联 <script>
//    按依赖顺序内联；内容里若出现 </script> 需要转义，否则会提前闭合
const inlineScript = (code) => code.replace(/<\/script>/gi, "<\\/script>");

for (const f of ["lectures.js", "lecture-viz.js", "app.js"]) {
  const tag = new RegExp(`<script\\s+src="${f.replace(/\./g, "\\.")}"\\s*></script>`);
  if (!tag.test(html)) {
    console.error(`找不到 <script src="${f}">，index.html 结构变了？`);
    process.exit(1);
  }
  html = html.replace(tag, () => `<script>\n${inlineScript(read(f))}\n</script>`);
}

// 3) 兜底检查：不应再有任何相对资源引用
const leftover = html.match(/<(?:script[^>]+src|link[^>]+href)="(?!#|http|data:)[^"]+"/gi);
if (leftover) {
  console.error("仍有外部资源引用：\n" + leftover.join("\n"));
  process.exit(1);
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, html, "utf8");

const kb = (Buffer.byteLength(html, "utf8") / 1024).toFixed(0);
console.log(`ok -> ${outPath} (${kb} KB)`);
