# ybnybny's Blog

基于 Hugo 的纯静态个人博客。白底黑线、无后端、无评论、无第三方运行时依赖。

- 站点：<https://ybnybny.github.io/>
- 邮箱：<u202642417@xs.ustb.edu.cn>

---

## 零、三分钟上手

日常只有三个动作，记住这三个就够用。

> **发布不需要你运行 Hugo。** 改完 `.md` 直接 `git push`，Hugo 是在 GitHub 的服务器上由 Actions 自动执行的。本地跑 `hugo server` 只是为了边写边看效果，属于可选项，看完关掉即可。
> 换句话说：**你只需要装 git，不需要装 Hugo 也能写博客。**

```bash
# 1. 本地预览（写文章时一直开着）
hugo server -D

# 2. 新建文章
hugo new content posts/tech/文章名/index.md

# 3. 发布
git add -A && git commit -m "post: 文章名" && git push
```

写作时只需要记住四件事：

| 想做的事 | 怎么做 |
| --- | --- |
| 加一个新分类 | 在 `content/posts/` 下新建文件夹 + `_index.md` |
| 发一条随记 | 在 `content/notes/` 下新建一个 `.md`，只写 `date` |
| 加一个链接 | 改 `data/friends.yaml` |
| 插 B 站视频 | 正文里写 `{{< bilibili BV号 >}}` |

其余细节按需往下查。**本文档可以长期当参考手册用。**

---

## 一、本地环境

只需要一个可执行文件：Hugo（extended 版，版本 **0.168.0**）。

```powershell
# 本机已装在用户目录，不污染系统环境
& "$env:USERPROFILE\hugo\bin\hugo.exe" version
```

建议把它加进 PATH，之后可以直接用 `hugo` 命令：

```powershell
[Environment]::SetEnvironmentVariable(
  "Path",
  $env:Path + ";$env:USERPROFILE\hugo\bin",
  "User"
)
```

---

## 二、日常写作

### 预览

```bash
hugo server -D
```

打开 <http://localhost:1313/>，改文件会自动刷新，`-D` 表示连草稿也显示。

> 本地预览下**站内搜索不可用**（索引由 CI 生成），这是正常现象，线上没问题。

**两个常踩的坑：**

1. **预览开着的时候，改不了文件夹名字**。表现是「拒绝访问」或「重命名失败」。这不是权限问题，是 `hugo server` 正占用着那个目录。想重命名文件夹，先停掉预览（`Ctrl+C`，或 `Stop-Process -Name hugo`）。只改文件的**标题**不受影响——标题在 `_index.md` 的 `title` 里，跟文件夹名无关。
2. **打不开 `localhost:1313`**。如果挂着代理，代理可能把 `localhost` 也塞进隧道。三个解法：改用 `127.0.0.1:1313`；在代理软件里把 `localhost` / `127.0.0.1` 加进直连名单；或干脆写文章时切到直连模式。

### 新建一篇长文

```bash
hugo new content posts/tech/my-new-post/index.md
```

然后用编辑器打开 `content/posts/tech/my-new-post/index.md` 开始写。

图片放在**同一个文件夹**里，正文用相对路径引用：

```markdown
![图片说明](cover.png "可选的图片标题")
```

### 新建一条随记

```bash
hugo new content notes/2026-10-26-随便写个短名.md
```

随记只有一个 `date` 字段，正文写几行就行。**随记里不能插图**——构建时会给出警告并忽略掉图片。

> 用 `hugo new` 建文件时，**文件名里的日期和正文里的 `date` 会自动一致**。手动新建文件容易不一致：Hugo 用**文件名**生成网址、用**正文 `date`** 决定排序和显示，两者对不上就会出现「网址写着 10-16、页面上显示 10-26」的情况。改文件名要连正文一起改。

### 发布

```bash
git add -A
git commit -m "post: 文章标题"
git push
```

推送到 `main` 后 GitHub Actions 会自动构建、生成搜索索引、部署，大约 1 分钟。

---

## 三、目录结构

```text
content/
├─ _index.md              主页（个人简介，内容在 hugo.yaml 的 params 里）
├─ friends.md             链接页（页面标题是「链接」，文件名保持 friends 是历史原因）
├─ message.md             (・ω・) 页（Claude 写的那一页，可直接删）
├─ posts/                 长文，文件夹即分类
│  ├─ tech/
│  │  └─ this-blog/
│  │     ├─ index.md
│  │     └─ diagram.svg
│  └─ painting/           涂鸦（文件夹改了英文名，标题仍是「涂鸦」）
│     ├─ 2026-10-26-水族馆/
│     │  ├─ index.md
│     │  └─ aquarium.jpg
│     └─ quiet-afternoon/
│        └─ index.md
└─ notes/                 随记，独立于分类树
   ├─ _index.md
   └─ 2026-10-26-Hello.md

content/source.md         Source 专供订阅源的载体（只产出 xml，没有网页）
data/source.yaml          Source 投递清单（决定哪几篇进 /source/index.xml）
data/friends.yaml         链接页数据（增删改只动这个文件）
hugo.yaml                 全部站点配置（含顶部导航）
layouts/                  模板
assets/css/main.css       全部样式（白底黑线设计系统）
assets/js/                少量原生 JS（复制按钮、搜索、公式）
static/vendor/katex/      自托管 KaTeX，不走 CDN
.github/workflows/deploy.yaml
```

> 顶部导航的文字写在 `hugo.yaml` 的 `menus` 里。改页面标题（`_index.md` 的 `title`）**不会**自动改导航，两处都要动。

### 加一个新分类

新建文件夹 + `_index.md` 即可，目录树自动递归：

```text
content/posts/reading/_index.md
```

```markdown
---
title: "读书"
weight: 30
---
```

`weight` 决定同级目录在树里的先后顺序。层级想嵌多深都行（实测过 6 层没问题）。

### 多层嵌套：分类下面再分类

`content/posts/` 下面的**文件夹层级 = 目录树层级**，模板是递归的，想嵌几层嵌几层。

比如想做成 `技术 / 前端 / CSS` 这样的三层：

```text
content/posts/tech/
├─ _index.md                    技术
├─ web/                         前端
│  ├─ _index.md                 ← 这一层也要有，否则不会成为目录节点
│  └─ css/                      CSS
│     ├─ _index.md
│     └─ grid-layout/
│        └─ index.md            ← 文章（真正的文件）
└─ this-blog/
   └─ index.md
```

每一层的 `_index.md`：

```markdown
---
title: "前端"     # 树里显示的名字
weight: 10        # 同级排序，越小越靠前
---
一句话说明，会显示在该分类页顶部。
```

**会自动生效的行为**（不需要额外配置）：

| 行为 | 说明 |
| --- | --- |
| 目录树递归 | 几层都行，自动缩进、自动展开当前路径并高亮当前文章 |
| 文章计数 | 每层显示「该目录下所有文章（含所有子目录）」的数量 |
| 分类页列表 | 打开 `/posts/tech/` 会列出 tech 下**所有层级**的文章，不只是第一层 |
| 分类路径标注 | 文章列表和文章页显示完整路径，如 `技术 / 前端 / CSS` |
| 空目录自动隐藏 | 递归后一篇文章都没有的目录，不出现在树里 |
| 空分类页 | 直接访问会显示「这个分类下还没有文章。」 |

**四个注意点**：

1. **每一层都要有 `_index.md`**。只有文件夹没有 `_index.md`，Hugo 仍会生成路径，但树里不会成为可点击的目录节点。建文件夹就顺手建 `_index.md`。
2. **别把 `index.md` 和子目录混在同一个文件夹**。`index.md` 是文章，`子目录/index.md` 是子分类。混用能跑，但你自己会分不清。
3. **层级别太深**。两层（`技术/前端/文章`）最舒服，三层还能接受。超过四层读者点进点出会很烦，通常说明该用标签而不是目录了。
4. **`weight` 只影响同级顺序**，不影响层级；不写时按标题排序。

### 加一个链接

页面标题叫「链接」，但文件路径仍然是 `content/friends.md`、数据仍然在 `data/friends.yaml`（历史原因，改路径会让旧地址 404，所以保留）。

编辑 `data/friends.yaml`，往对应分组的 `items` 下面加一条：

```yaml
groups:
  - name: "朋友们"
    desc: "非常好人类，也可能有非人类"
    items:
      - name: "某某的博客"
        url: "https://example.com"
        desc: "一句话简介"
        avatar: "/images/friends/xxx.png"   # 可省略，省略时显示名字首字
```

**分组完全由你自己定**，`name` 就是页面上那个小标题，想叫什么叫什么，想要几组就几组。当前是两组：

| 分组 | 放什么 |
| --- | --- |
| 朋友们 | 认识的人 |
| Source of USTB | 社团相关 |

**加一个新分组**：在 `groups:` 下面复制一整段（`- name:` 到 `items:` 下的条目），改掉 `name` 和 `desc` 即可，模板自动渲染。

**调整分组顺序**：直接挪动整段。

**本站信息卡**（页面顶部那块「本站信息 · 欢迎取用」，方便别人复制去加你）需要你在文件最上面加一段 `site:`：

```yaml
site:
  name: "ybnybny"
  url: "https://ybnybny.github.io/"
  desc: "写点代码，记点想法。"
  avatar: "/images/ybnybny.png"
```

不加就完全不显示那块，现在是没加的。

**旧的平铺格式仍然可用**：如果 `data/friends.yaml` 顶层直接是一个 `- name: ...` 的列表（没有 `groups:`），模板会自动识别，只是没有分组标题。

> 关于分类的取舍：`友链` 严格指「对等的、互相认识的个人博客」，工具站、文档站塞进去会让想交换友链的人困惑。既然这页已经改叫「链接」，这个顾虑就没了——你可以放心把任何想看的东西放进去。如果还想区分「人」和「东西」，用分组就行。

---

## 四、写作速查

### 数学公式

```markdown
行内：$\mathcal{O}(n \log n)$

行间：
$$
T(n) = 2T\left(\frac{n}{2}\right) + \mathcal{O}(n)
$$
```

只在**真的用到公式的页面**才加载 KaTeX，其他页面零额外请求。

**四条必须遵守的规则**（都踩过）：

| 规则 | 原因 |
| --- | --- |
| 行内用单个 `$...$`，块公式用 `$$...$$` | 单 `$` 写成三行会被当成**行内**公式，`\begin{pmatrix}` 会挤成一小坨 |
| **不要**用 Unicode 数学字符，用命令：`\sigma` 不是 `𝜎`，`\times` 不是 `×`，`\cdots` 不是 `⋯` | KaTeX 字体里没有 `𝜎`（U+1D70E）的字形度量，会**静默渲染成空白**，构建和页面都不报错 |
| 块引用里的 `$$` 必须写成**一行** | `>` 前缀会被卷进公式内容，渲染出多余的 `>` 符号 |
| `date` 别写成未来的时间 | Hugo 默认不构建未来页面，**静默消失、无任何报错** |

排查公式问题时，用自带的检查脚本（需要 Node）：

```bash
node tools/check-math.js content/posts/algorithm/Permutation/index.md
node tools/check-math.js        # 不写路径时默认检查 Permutation 那篇
```

它会逐条渲染并报告：语法错误、缺字体度量的字符、把块公式写成单 `$` 的地方。**构建是查不出这些问题的**（KaTeX 在前端运行，`throwOnError: false` 会静默吞掉），所以写完公式跑一遍这个脚本最省事。

### 页面只剩一堆 `$$`（公式完全不渲染）

这是另一类故障：公式文本原样留在页面上，一个都没转换。

**根因**：`assets/js/katex-init.js` 是调用 KaTeX 的那段胶水代码，它在 `assets/` 目录里。**Hugo 不发布 `assets/`**，必须经过 `resources.Get ... | minify | fingerprint` 才会输出到 `public/`。如果图省事写成 `{{ "js/katex-init.js" | relURL }}`，那个地址会 404，页面于是原样显示 `$$...$$`。

**这条规则适用于所有脚本和样式**：

| 文件位置 | 引用方式 |
| --- | --- |
| `assets/` | 必须 `resources.Get "..." \| ...`，用 `.RelPermalink` |
| `static/` | 可以直接 `"路径" \| relURL` |

判断方法：构建后看 `public/` 里到底有没有那个文件。

```powershell
Test-Path public/js/katex-init.min.<hash>.js
```

**怎么确认线上真的渲染了**：不要只看 HTML 里有没有 `$$`，要看有没有 KaTeX 生成的节点。用无头浏览器渲染后再检查：

```powershell
hugo server --port 13139 --bind 127.0.0.1
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
& $edge --headless=new --disable-gpu --no-proxy-server --virtual-time-budget=10000 `
  --dump-dom "http://127.0.0.1:13139/posts/algorithm/permutation/" |
  Out-File "$env:TEMP\rendered.html" -Encoding utf8
```

然后在 `rendered.html` 里搜 `class="katex"`。搜到 = 真的渲染了；只搜到 `$$` = 链路断了。

> 这次的教训：前一轮只验证了「HTML 里有 `$$`」「KaTeX 已加载」，这两条都成立但页面依然是坏的，因为**负责调用它们的脚本 404 了**。验证要一路做到「渲染结果」这一步。

### 代码块

````markdown
```go
func main() {}
```
````

高亮在构建期完成，页面不跑任何高亮脚本。右上角有复制按钮。

### B 站视频

```markdown
{{< bilibili BV1GJ411x7h7 >}}
{{< bilibili "https://www.bilibili.com/video/BV1GJ411x7h7" >}}
{{< bilibili BV1GJ411x7h7 page="2" danmaku="1" >}}
```

视频在站内以 16:9 播放，下方固定附一个「在 B 站打开」的链接兜底。

### 链接区块

在任意 Markdown 里插一行：

```markdown
{{< friends >}}
```

### 脚注

```markdown
正文里有句话[^1]。

[^1]: 这是脚注内容。
```

---

## 五、首页与个人信息

主页（`/`）显示头像、昵称、简介、邮箱、GitHub、最新文章、最近的随记。这些文字全部来自 `hugo.yaml` 的 `params`：

```yaml
params:
  author: "ybnybny"
  email: "u202642417@xs.ustb.edu.cn"
  avatar: "/images/ybnybny.png"
  tagline: "一句话签名"
  bio:
    - "第一段自我介绍"
    - "第二段"
  github: "https://github.com/ybnybny"
```

头像文件在 `static/images/ybnybny.png`，想换直接覆盖。

---

## 六、随记的机器可读接口

构建时会额外生成 `public/notes/index.json`：

```json
[
  {
    "date": "2026-10-24T23:12:00+08:00",
    "text": "把博客的样式全部推倒重写了一遍……",
    "url": "/notes/2026-10-24-白底黑线/"
  }
]
```

`text` 是去掉 Markdown 标记的**纯文本**，可以直接拿去朗读或显示。留给以后的主页桌宠之类的组件用，前端 `fetch('/notes/index.json')` 即可，不需要任何后端。

---

## 七、部署

GitHub Pages，用户站形式：仓库名必须是 `ybnybny.github.io`，站点根路径为 `/`。

首次配置：

1. 新建公开仓库 `ybnybny.github.io`
2. 把本仓库内容推上去（`main` 分支）
3. 仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**
4. 推送后等 Actions 跑完，打开 <https://ybnybny.github.io/>

如果换成项目站（仓库叫 `blog` 之类），站点会在子路径下，必须把 `hugo.yaml` 里的 `baseURL` 改成 `https://ybnybny.github.io/blog/`，否则 CSS/JS 会 404。

### 关于版本锁定

`.github/workflows/deploy.yaml` 里写死了 Hugo `0.168.0` 和 Pagefind `1.5.2`。**升级前务必先在本地跑一遍**：

```bash
hugo --gc --minify
```

确认没有 WARN/ERROR 再改 CI 里的版本号。这是这个站最容易被忽略、也最容易把站点搞坏的地方。

---

## 八、设计约定

改样式时请守住这几条，否则视觉会散：

| 项 | 约定 |
| --- | --- |
| 颜色 | 只有黑（`#111`）和白（`#fff`），灰阶用来区分层次，**不加任何彩色** |
| 线条 | 一律 `1px solid #e5e5e5`，强调用 `#111` |
| 圆角 | 最大 `3px`，多数为 `0` 或 `2px` |
| 阴影 | 不用 |
| 动画 | 只做 0.15s 的颜色/边框过渡，不做位移和缩放 |
| 字体 | 系统字体栈，**不加载中文 Web 字体**（几 MB，拖慢首屏） |
| 宽度 | 正文 760px，整体 1120px |

---

## 九、已知边界

- 站内搜索的中文分词基于 Pagefind 的内置方案，不做词干化，长句搜不到时建议换成关键词。
- 图片没有做自动压缩和响应式尺寸，图片多的时候手动压一下（建议 > 1000px 宽的先缩到 1000px 以内）。
- Pagefind 索引只覆盖带 `data-pagefind-body` 的正文页（文章、随记、链接），首页和列表页不参与检索。

---

## 十、RSS 订阅地址

### 什么是 RSS

RSS 是一个**自动生成的 XML 文件**，里面按时间倒序列出你最近发布的文章：标题、链接、发布日期、正文。

它解决一个问题：**读者不用来你的网站，也能知道你有没有更新。**

传统方式是「读者自己记着来你的站看看有没有新文章」——实际上没人会这么做，所以文章写出来就没下文了。RSS 相当于给你的站开了一个「更新通知接口」，读者用任意一个订阅工具订阅一次，之后你每次 `git push`，新文章会自动推进他的收件箱。

**它和公众号/推送的区别**：不需要注册账号、不需要手机号、不需要平台审核，也没有算法决定谁能看到。读者订阅的是这个网址本身，你随时可以换托管平台而订阅不失效。

### 你的站现在有哪些 feed

Hugo 在每次构建时自动生成，你什么都不用做：

| 地址 | 包含内容 | 建议用途 |
| --- | --- | --- |
| `/index.xml` | 全站（长文 + 随记） | **主推这一个** |
| `/posts/index.xml` | 只有长文章 | 只关心长文的读者 |
| `/notes/index.xml` | 只有随记 | 只追碎片想法 |
| `/source/index.xml` | **你挑选的**，投给科协 Source | 见下一节 |
| `/posts/tech/index.xml` | 单个分类 | 分类很专一时才有用 |
| `/posts/painting/index.xml` | 单个分类 | 同上 |

**所有 feed 的 `<description>` 都是纯文本简介，不是整篇正文。** 长文取 `description` 字段，没写就取自动摘要；随记取全文（随记本来就很短）。简介上限 300 字，超了截断加省略号。之前是整篇 `{{ .Content }}` 塞进去，长文在阅读器和集体博客里会铺满好几屏，现在不会了。

随记没有标题，所以在 feed 里会自动用日期时间（如 `2026-10-24 23:12`）作为条目标题，不会出现空白条目。

### 给科协 Source 的专供订阅源

地址：<https://ybnybny.github.io/source/index.xml>

它和全站 feed 的区别：**内容由你挑选**，没写进清单的一律不出现。

**怎么选**：只改 `data/source.yaml` 一个文件。不用碰文章本身，也不用给文章加任何字段。

```yaml
items:
  - /posts/algorithm/permutation/
  - /notes/2026-10-26-重置/
```

路径就是网址，**结尾斜杠带不带都行，大小写不敏感**；中文路径直接写中文，不用转成 `%E6%B0%B4...` 那种：

```yaml
  - /posts/painting/2026-10-26-水族馆/
```

想给某一篇单独换个标题或简介（比如投给集体博客时用更正式的说法）：

```yaml
items:
  - path: /notes/2026-10-26-claude/
    title: "关于这个站的一点说明"
    blurb: "一两句话的简介，会替代自动摘要"
```

排序按**发布时间倒序**，和清单里写的顺序无关。

**写错了会怎样**：不会静默少一条。构建时在 Actions 日志里直接报 WARN，并告诉你第几项：

```text
WARN  source: 找不到页面 "/posts/inexistent-page/"（data/source.yaml 第 6 项），已跳过
WARN  source: "/posts/algorithm/permutation" 重复出现（data/source.yaml 第 3 项），已忽略后一条
WARN  source: "/friends/" 没有 date，无法按时间排序，已跳过（data/source.yaml 第 5 项）
```

看到 `source:` 开头的 WARN，就去 `data/source.yaml` 改对应那一行。**有 WARN 没处理，就说明清单和实际内容对不上。**

**几点要知道的**：

- 清单为空时 feed 仍然正常生成，只是没有条目，同时报一条 WARN 提醒你。
- 纯图片帖（正文没有文字）会得到一句兜底简介，不会出现空条目。
- `/source/` 本身**没有网页**，只有 `index.xml`，直接访问是 404。这是故意的——把 XML 地址填给科协就行。
- 这个 feed 不出现在站点导航、sitemap 和站内搜索里，读者不会误入。
### 怎么订阅（你自己验证一下）

1. 打开 <https://ybnybny.github.io/index.xml> —— 会看到一堆 XML 代码，这是正常的，它是给机器读的
2. 把这个网址粘贴到任意 RSS 阅读器里：
   - 网页版：[Feedly](https://feedly.com)、[Inoreader](https://www.inoreader.com)
   - 电脑客户端：NetNewsWire（Mac）、Fluent Reader（Windows）
   - 手机：Reeder、Feedly App
3. 订阅成功后，你发新文章，阅读器里就会出现未读条目

> 想自己验收的话：订阅你自己的站，然后发一篇测试文章 push 上去，等 CI 跑完在阅读器里刷新，能收到就说明一切正常。

### 给读者的入口

站内已经放好了，不用额外做什么：

- 页脚有 「RSS」
- 主页联系方式里有 「RSS ↗」
- 每页 `<head>` 里有 `<link rel="alternate" type="application/rss+xml">`，浏览器和阅读器能自动发现

### 没有评论系统时，RSS 其实是唯一的回流渠道

你的站不开放评论、不发邮件通知、不上算法推荐，那么「读者怎么第二次回来」这个问题，答案基本只有 RSS。它零维护、零成本、不需要任何第三方服务，这也是纯静态博客很值得保留的一个能力。

