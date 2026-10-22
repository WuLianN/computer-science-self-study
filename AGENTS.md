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
- 根目录 `index.html` 用内置 `subjects` 数组渲染科目卡片；**新增科目 = 向该数组追加一项**，并在根 `README.md` 的仓库结构树与科目进度清单同步。

## 2. 样式系统（最重要）——复用 `assets/theme.css`

全站共享设计系统位于 **`assets/theme.css`**（含配色变量 `:root`、`body/.wrap` 版式、`header.hero` 结构、`.pill/.gotos/h2.section/a.inline/footer` 导航骨架，以及文档内容盒 `.card/.rule/.note/.toc/.law/.m`）。

**每个知识点页**：`<head>` 内先外链 theme，再只写**本页专属**的差异：

```html
<link rel="stylesheet" href="../../../assets/theme.css">  <!-- 相对层级按页面深度调整 -->
<style>
header.hero{background:linear-gradient(135deg,#0891b2,#4f46e5)}  /* 本章识别色渐变，页内覆盖 */
/* 仅放动画/表格/figure/专属提示框等本页独有的类，不要重复 theme 里已有的规则 */
</style>
```

强规则：
- **不要**在页内重复 `:root`、`body`、`.wrap`、`.card/.rule/.note/.toc/.law/.m` 等已在 theme 中定义的公共类——直接用这些类名。改主色/字体只改 theme.css 的 `:root` 一处。
- **分章 hero 渐变**用页内一行 `header.hero{background:linear-gradient(...)}` 覆盖（theme 用 `var(--hero, 默认紫)` 暴露），这是有意保留的章节识别色，勿上收。
- ⚠️ **同名类跨页语义可能不同**，抽公共样式前必须先确认语义一致。已知陷阱：`.ok` 在「内容页」= 绿底提示框、在「动画页(Prim/Kruskal)」= 步骤日志的绿色文字 → 因此 `.ok` **故意不进 theme**，各页自留。新增共享样式时若遇类名复用，宁可保留页内也不要盲目上收，避免属性渗漏/串色。
- 动画、`svg`/`table.*`、`.def/.thm/.ext` 等族专属样式保持**页内自包含**。

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

## 5. 改动后自检

- 纯静态、无构建：无需跑测试；改样式后用浏览器**取计算样式**核验关键类（尤其涉及同名类/新增共享规则时），确认无 404、无串色、布局无回归，再提交。
