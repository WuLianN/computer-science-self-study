# AGENTS.md — 给 AI 助手的项目约定

本仓库是「自考本科·计算机科学与技术」的**纯静态学习笔记站**（HTML/CSS/SVG），GitHub Pages 托管，**无框架、无构建步骤、无包管理器**。修改/新增页面时请遵守以下约定，保持一致性与可维护性。

---

## 1. 目录结构约定

- 每个科目一个顶层目录，命名 `英文名-课程代码`：
  - `discrete-mathematics-02324/`（离散数学）、`advanced-mathematics-00023/`（高等数学工本）…
- 科目目录下：
  - `知识点/` —— 每个知识点一页 HTML，按章分子目录（如 `数理逻辑/`、`图论/`、`集合论/`）。`知识点/index.html` 是该科目知识点导航页。
  - `全国YYYY年M月自考CODE《名称》真题/` —— 放该考期真题：原卷图片 `1.png 2.png 3.png`、`试卷.html`、`真题详解.html`（+ 个别题目配图）。
  - `真题/index.html` —— 历年真题导航。
- 根目录 `index.html` 用内置 `subjects` 数组渲染科目卡片；**新增科目 = 向该数组追加一项**，并同步根 `README.md` 的仓库结构树。`README.md` 的「✅ 考试科目进度」是考试通过状态、由用户维护，不要因新增目录就勾选。

## 2. 样式系统（最重要）——复用 `assets/theme.css`

全站共享设计系统位于 **`assets/theme.css`**（配色变量 `:root`、`body/.wrap` 版式、`header.hero` 结构、`.pill/.gotos/h2.section/a.inline/footer` 导航骨架、文档内容盒 `.card/.rule/.note/.toc/.law/.m`，以及已上收的 `.opts/.toggle/.tscroll/.dock/.hero-toggle/.fig .cap small`、`a.qref/a.tag`、`button/summary/sub/sup` 与全部窄屏兜底）。**不要在页内重复定义这些类**；新增可复用样式优先上收本文件。

**每个知识点页**：`<head>` 内先外链 theme（**必须带 `?v=版本号`**），再只写**本页专属**的差异；viewport 必须含 `viewport-fit=cover`：

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<link rel="stylesheet" href="../../../assets/theme.css?v=版本号">  <!-- 相对层级按页面深度调整 -->
<style>
header.hero{background:linear-gradient(135deg,#0891b2,#4f46e5)}  /* 本章识别色渐变，页内覆盖 */
/* 仅放动画/表格/figure/专属提示框等本页独有的类，不要重复 theme 里已有的规则 */
</style>
```

强规则：
- **不要**在页内重复 `:root`、`body`、`.wrap`、`.card/.rule/.note/.toc/.law/.m` 等已在 theme 中定义的公共类——直接用这些类名。改主色/字体只改 theme.css 的 `:root` 一处。
- **分章 hero 渐变**用页内一行 `header.hero{background:linear-gradient(...)}` 覆盖（theme 用 `var(--hero, 默认紫)` 暴露），这是有意保留的章节识别色，勿上收。
- ⚠️ **同名类跨页语义可能不同**，抽公共样式前必须先确认语义一致。已知陷阱：`.ok` 在「内容页」= 绿底提示框、在「动画页(Prim/Kruskal)」= 步骤日志的绿色文字 → 因此 `.ok` **故意不进 theme**，各页自留。新增共享样式时若遇类名复用，宁可保留页内也不要盲目上收，避免属性渗漏/串色（完整清单见 2.2）。
- ⚠️ **`.gotos` 只能裸用在 `header.hero` 深底内**：theme 里它写死 `color:#fff`+半透明白底，放到正文/页尾的浅底上会变白字不可见（已两次踩坑）。浅底场景一律加修饰符写成 **`.gotos plain`**（theme 已提供，只换配色不换布局）；新页若含页尾 `.gotos` 导航，自检时全局搜 `class="gotos"` 确认无遗漏。
- 动画、`svg`/`table.*`、`.def/.thm/.ext` 等族专属样式保持**页内自包含**。

### 2.1 页内导航统一走「停靠胶囊」`.dock`（右下角）

全站浮动导航已收敛为**单一组件**：右下角**竖排**两枚独立圆钮（🏠返回首页 + ↑回到顶部），**仅窄屏(≤640px)显示、桌面隐藏**。🏠 常驻角落；↑ 默认透明隐藏、滚过阈值才淡入浮现于 🏠 上方（由 dock.js 监听 scroll 切换 `nav.dock` 的 `.show-top` 类实现自动显隐）。**根 `index.html` 前缀为空时脚本自动省略 🏠、只建 ↑**（首页不需要「返回首页」）。
- **启用方式**：`</body>` 前放一行 `<script src="{相对前缀}assets/dock.js?v=版本号" defer></script>` 即可（样式在 theme.css 的 `.dock`）。**不要再手写** `<a class="totop">` 或页尾"回到顶部"链接。
- **首页链接自适应深度**：`dock.js` 读自身 `<script>` 的 `src`（回退到 theme.css 的 `link`）算出仓库根相对前缀，因此任意目录层级、`file://` 双击、GitHub Pages 都能拼出正确的 `index.html`，**无需按页手写 `../`**。
- **单一真源**：想改导航动作/样式/加按钮，只改 `assets/dock.js` + theme.css 的 `.dock`，**不动那 105 个外链页**。`dock.js` 现还承载第二个互不依赖的 IIFE：**hero 首屏折叠**（窄屏描述 clamp 2 行 / pill 留前 3 枚 / 导航链留前 4 条，其余收进「展开全文 +N」；零信息丢失、可展开、净收益 <4px 自动撤销、桌面与打印均不折叠）。改这个文件前先看清两个 IIFE 的分工。
- **例外**：根 `index.html` 与 4 个 `试卷.html` 是**刻意不外链 theme.css 的自包含页**，加组件须自带内联样式、勿依赖 theme。4 个 `试卷.html` 保持纯净、无 `.dock`；**根 `index.html` 已引入 `dock.js` + 内联 `.dock` 样式**（页面约 4500px 长，需要 ↑ 回顶），并自带 `@media print` 隐藏规则。
- **版本联动**：theme.css 或 dock.js 有改动就全站把 `theme.css?v=` 与 `dock.js?v=` 同步成新日期串破缓存（脚本见 4.1）。

### 2.2 CSS 覆盖顺序与窄屏口径（最易「静默失效」）

- **页内 `<style>` 在 theme 之后**：同特异性下页内胜。想在 `theme.css` 新增规则去压过页内已有规则，必须**提高特异性**（加祖先限定或属性选择器），否则规则写了却完全不生效、也不报错。实证：页内 `.links a` (0,1,1) 顶掉 theme 同名规则 → 最终用 `.wrap .links a` (0,2,1)；13009 真题详解页内 `.fig svg{min-width:560px}` 顶掉 theme → 最终改用 `.wrap svg[viewBox^="0 0 6"]`（及 7/8/9）这类属性选择器把特异性提到 (0,2,1) 才解决。
- **窄屏改动一律进 `@media (max-width:640px)`**，桌面(>640px) 必须零回归；全站断点统一 640px，不要另设。改完用 768/1200 比对关键计算样式。
- **`theme.css` 里的 `!important` 是刻意的**：用于压过页内样式与动画页残留（`.gotos`/`.gotos a`、`.hero-extra`、`.toggle::after`、`@media print .dock`、reduced-motion）。**别以「清理技术债」为由删**，删前先 grep 页内同选择器。
- **同名类先全局 grep 语义再上收**。已知不能上收：`.ok`（内容页绿底提示框 / Prim·Kruskal 动画页步骤日志绿字）、`.tip`（根首页提示条 / 试卷页 / 真题详解提示卡 / `.extbar` 灰字，14 个文件有定义）、`.m`（根首页 `.entry .txt .m` 是元信息、不是公式）、`.tag`（`a.tag` 真题详解考点链 vs `span.tag` 考前抢分标签）。
- **屏幕 / 打印分离**：可折叠、可隐藏的交互样式放 `@media screen and (max-width:640px)`，保证 `Ctrl+P` / 存 PDF 内容完整；`@media print` 额外隐藏 `.dock`。根 `index.html` 自带内联 `.dock` 样式副本，**改 `.dock` 须 theme.css 与根首页两处同步**。
- **新页 viewport 必须带 `viewport-fit=cover`**，否则 iOS 不注入 `env(safe-area-inset-*)`，`.dock` 与 `body` 安全区留白失效（全站 110 页现已齐）。

### 2.3 表格与 SVG 的既定兜底（别重复造轮子）

- **多列表格**包一层 `.tscroll`（或放 `.rule`/`.card` 内）；theme 已给 `table.law{width:max-content;min-width:100%;max-width:900px}` + 横滑，360px 下短文本竖排 971→226。单元格 `td,th{overflow-wrap:break-word}` 是刻意的：正文长串仍保留 `overflow-wrap:anywhere`，**不要全局把 `anywhere` 改成 `break-word`**，否则长公式重新顶出横向溢出。父容器子选择器限定 `.tscroll/.rule/.card` 是故意绕开 `.ok`。
- **宽 SVG（`viewBox` 以 `0 0 6`/`7`/`8`/`9` 开头，宽约 600–999）**由 `.wrap svg[viewBox^="0 0 6"]`（另有 `7`/`8`/`9` 前缀共 4 条）统一设 `min-width:760px` 还原比例、超宽交给祖先横滑；等效字号 = 图内 `font-size × 渲染宽 / viewBox 宽`（最小 3→7.3px）。**不要改图内 `font-size` 或删这条 `min-width`**；新增宽图无需额外处理，但祖先要有横滑兜底（`.fig` 等）。viewBox 380 的小图不在此列。
- **宽 SVG 必须放在专用图容器内**（`.fig`，theme 在窄屏给它 `overflow-x:auto`），别直接塞进 `.rule`/`.card` 等内容盒：内容盒虽也有 `overflow-x:auto`、不会撑破页面，但会让**同容器里的表格与正文一起横滑**、文字被裁得错乱（13009 数据库概论的 `.er` E-R 图踩过，现已改为 SVG 外包一层 `.fig`）。全站 37 张宽图应 37/37 直接父为 `.fig`。
- 图注补充说明 `<small>` 窄屏统一 12px（`.fig .cap small`）。

## 3. 内容规范

- **引用真题须标注年份与题型**（如「2025.10 真题·第X题」）。
- **考点 ↔ 知识点双向跳转**：知识点页配锚点，真题详解用可跳转的考点标签链回对应小节。
- 图论 SVG **高亮顶点用 `class="hot"`**（而非 `class="v hot"`），以规避 CSS 优先级问题。
- 解题步骤**分行展示**（`ol.steps` 圆形数字徽章）；公式占位符用中性字母 `p/q/r`；逻辑符号命名以 02324 教材为准。
- 每个知识点页设「本章目录」锚点卡（`.toc`）。

## 4. 本地预览与工具坑（Windows / PowerShell）

- 预览：`python -m http.server 8000`（在仓库根），浏览器访问 `http://127.0.0.1:8000/`。
- **Write 工具无法创建空文件**：需要占位文件（如 `.gitkeep`）时要么写非空说明文本，要么别建空目录占位。
- **提交信息中文**：Git 对象里存的是正确 UTF-8，但本机 PowerShell 控制台常按 GBK 解码，`git log` 回显会显示成乱码（如「知识点」→「鐭ヨ瘑鐐」）——**这是显示假象，不是真写坏**，别据此去 `--amend`「修复」。要确认真实字节用 hexdump，或看 GitHub 网页端。
- 用 `git --no-pager` 或设 `$env:GIT_PAGER="cat"`，避免管道 `| cat` 在 PowerShell 下报错。

### 4.1 批量版本联动（可直接复制）

`theme.css` 或 `dock.js` 一改，就把 **105 个外链页**的 `theme.css?v=` 与 `dock.js?v=` 同时换成新日期串（如 `20261105g → 20261105h`，共 210 处），根 `index.html` 的 `dock.js?v=` 也同步；4 个 `试卷.html` 无外链、不动。历史脚本只在临时目录、**不在仓库**，粘贴这段即可：

```powershell
$root='d:/文档/try/自考本科-计算机科学与技术'; $enc=New-Object System.Text.UTF8Encoding($false)
$oldV='20261105g'; $newV='20261105h'
foreach($f in Get-ChildItem -LiteralPath $root -Filter '*.html' -Recurse -File){
  $t=[System.IO.File]::ReadAllText($f.FullName,[System.Text.Encoding]::UTF8); $o=$t
  $t=$t.Replace('theme.css?v='+$oldV,'theme.css?v='+$newV).Replace('dock.js?v='+$oldV,'dock.js?v='+$newV)
  if($t -ne $o){[System.IO.File]::WriteAllText($f.FullName,$t,$enc)} }
```

- **所有文本文件 UTF-8 无 BOM**：批量写回必须 `UTF8Encoding($false)`，校验首字节非 `EF BB BF`。
- **中文提交信息**用 `git -c i18n.commitEncoding=UTF-8 commit -F <utf8文件>`，别在 PowerShell 命令行内联中文。
- 提交前 `git --no-pager diff --unified=0 -- '*.html'` 应只有版本号行，`git diff --check` 为 0。

## 5. 改动后自检

- 纯静态、无构建：无需跑测试；改样式后用浏览器**取计算样式**核验关键类（尤其涉及同名类/新增共享规则时），确认无 404、无串色、布局无回归，再提交。四轮走查形成的固定口径，改 `theme.css`/`dock.js` 后照此复核：
  - **五视口** 360 / 400 / 640 / 768 / 1200 × 全站 110 页：`document.documentElement.scrollWidth - clientWidth` 为 0、404 为 0；窄屏可点元素高度 ≥28px（桌面鼠标环境不适用此阈值）。
  - **桌面零回归**：768/1200 下注入 `git show HEAD:assets/theme.css` 前后比对关键选择器计算样式与 hero/目录高度，应完全一致。
  - **折叠/精简类改动**：验证折叠 → 展开 → 收起可逆、零信息丢失、每页净收益为正；用 `page.emulateMedia({media:'print'})` 确认打印不折叠、不印 `.dock`。
  - **表格/SVG 回归哨兵**：最宽 `table.law` ≤900px；400/640/768/1200 下等效字号 <8px 的 SVG 为 0；每张宽 SVG 的**直接父**应是 `.fig`（或自带 `overflow-x:auto` 的图容器），扫祖先链确认兜底者不是 `.rule`/`.card` 内容盒。
  - **提交前**：HTML diff 只含版本号、`git diff --check` 0、全站无 BOM、`read_lints` 无新增错误。
- ⚠️ **根 `index.html` 页脚的 `Last updated · YYYY-MM-DD` 是手工维护的静态文本**：AI 不会自动推断或刷新它，容易停在旧日期误导读者。只要改动了根 `index.html`（首页内容、`subjects` 数组、内联样式/脚本都算），就把日期显式同步成**当天日期、精确到日**（不要只写年月）；纯改科目页或 `assets/` 而没碰首页时可不改。
