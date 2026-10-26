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
| 发一条短日志 | 在 `content/notes/` 下新建一个 `.md`，只写 `date` |
| 加友链 | 改 `data/friends.yaml` |
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

### 新建一篇长文

```bash
hugo new content posts/tech/my-new-post/index.md
```

然后用编辑器打开 `content/posts/tech/my-new-post/index.md` 开始写。

图片放在**同一个文件夹**里，正文用相对路径引用：

```markdown
![图片说明](cover.png "可选的图片标题")
```

### 新建一条短日志

```bash
hugo new content notes/2026-10-26-随便写个短名.md
```

短日志只有一个 `date` 字段，正文写几行就行。**短日志里不能插图**——构建时会给出警告并忽略掉图片。

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
├─ friends.md             友链
├─ posts/                 长文，文件夹即分类
│  ├─ tech/
│  │  └─ this-blog/
│  │     ├─ index.md
│  │     └─ diagram.svg
│  └─ life/
│     └─ quiet-afternoon/
│        └─ index.md
└─ notes/                 短日志，独立于分类树
   ├─ _index.md
   └─ 2026-10-24-白底黑线.md

data/friends.yaml         友链数据（增删改只动这个文件）
hugo.yaml                 全部站点配置
layouts/                  模板
assets/css/main.css       全部样式（白底黑线设计系统）
assets/js/                少量原生 JS（复制按钮、搜索、公式）
static/vendor/katex/      自托管 KaTeX，不走 CDN
.github/workflows/deploy.yaml
```

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

`weight` 决定同级目录在树里的先后顺序。层级想嵌多深都行。

### 加一篇友链

编辑 `data/friends.yaml`：

```yaml
- name: "某某的博客"
  url: "https://example.com"
  desc: "一句话简介"
  avatar: "/images/friends/xxx.png"   # 可省略，省略时显示名字首字
```

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

### 友链区块

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

主页（`/`）显示头像、昵称、简介、邮箱、GitHub、最新文章、最近的短日志。这些文字全部来自 `hugo.yaml` 的 `params`：

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

## 六、短日志的机器可读接口

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
- Pagefind 索引只覆盖带 `data-pagefind-body` 的正文页（文章、短日志、友链），首页和列表页不参与检索。

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
| `/index.xml` | 全站（长文 + 短日志） | **主推这一个** |
| `/posts/index.xml` | 只有长文章 | 只关心长文的读者 |
| `/notes/index.xml` | 只有短日志 | 只追碎片想法 |
| `/posts/tech/index.xml` | 单个分类 | 分类很专一时才有用 |
| `/posts/life/index.xml` | 单个分类 | 同上 |

短日志没有标题，所以在 feed 里会自动用日期时间（如 `2026-10-24 23:12`）作为条目标题，不会出现空白条目。

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

