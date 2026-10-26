/* 公式自检工具
   用途：找出 Markdown 里 KaTeX 渲染不出来的公式
   用法：node tools/check-math.js content/posts/xxx/index.md
        node tools/check-math.js          （默认检查 Permutation 那篇）

   能查出的问题：
   1. 语法错误（少括号、\\begin 不配对等）
   2. 字符缺字体度量（如 Unicode 数学斜体 𝜎，会静默渲染成空白）
   3. 块公式误写成单个 $ 跨行（会被当成行内公式） */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const katex = require(path.join(root, 'static/vendor/katex/katex.min.js'));

const target = process.argv[2] || 'content/posts/algorithm/Permutation/index.md';
const md = fs.readFileSync(path.resolve(root, target), 'utf8');

// 收集 $$...$$ 与 $...$
const found = [];
for (const [re, display, kind] of [
  [/\$\$([\s\S]+?)\$\$/g, true, '$$'],
  [/(?<!\$)\$(?!\$)([\s\S]+?)(?<!\$)\$(?!\$)/g, false, '$'],
]) {
  let m;
  while ((m = re.exec(md)) !== null) {
    found.push({ kind, display, tex: m[1], index: m.index });
  }
}
found.sort((a, b) => a.index - b.index);

const origErr = process.stderr.write.bind(process.stderr);
const warnings = [];

let fail = 0;
for (const f of found) {
  const line = md.slice(0, f.index).split('\n').length;
  const preview = f.tex.replace(/\s+/g, ' ').trim().slice(0, 55);
  warnings.length = 0;
  process.stderr.write = (s) => { warnings.push(String(s)); return true; };

  let err = null;
  try {
    katex.renderToString(f.tex, { displayMode: f.display, throwOnError: true, strict: false });
  } catch (e) {
    err = e.message.split('\n')[0];
  }
  process.stderr.write = origErr;

  const noMetrics = warnings.filter(w => w.includes('No character metrics'));
  if (err || noMetrics.length) {
    fail++;
    console.log(`[行 ${line}] [${f.kind}] ${preview}`);
    if (err) console.log(`   语法错误: ${err}`);
    for (const w of noMetrics) {
      const ch = (w.match(/No character metrics for '(.)'/u) || [])[1] || '?';
      console.log(`   缺字体度量: '${ch}' U+${ch.codePointAt(0).toString(16).toUpperCase()} —— 换成 LaTeX 命令，如 \\sigma`);
    }
  }
}

// 整行只有单个 $：本意是块公式，会被当成行内公式
md.split('\n').forEach((line, i) => {
  const t = line.replace(/^\s*(>\s*)*/, '').trim();
  if (t === '$') {
    console.log(`[行 ${i + 1}] 整行只有单个 $，会被当成行内公式，块公式请用 $$`);
    fail++;
  }
});

console.log(`\n检查 ${target}：共 ${found.length} 条公式，${fail} 处需要处理`);
process.exitCode = fail ? 1 : 0;

