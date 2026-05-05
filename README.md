# web-booster

原生 Web Components + 设计令牌样式库，目标是为多技术栈站点提供一套统一的基础 UI。

当前首批内置内容：

- `wb-paragraph`：段落文本
- `wb-link`：段落内链接文本
- `wb-card`：卡片容器，支持标题属性和标题 slot
- `wb-button`：按钮，支持 `primary` / `secondary` 和 `sm` / `md` / `lg`
- `wb-message`：轻提示能力，支持 `info` / `success` / `warning` / `error`
- `wb-icon`：内置少量常用图标，并支持按需注册新图标
- `wb-code`：代码文本，支持一键复制
- `styles.css`：对外暴露的精简 `--wb-*` 设计令牌

视觉基线当前优先对齐 `moon-lottie` 示例站。

## 开发

安装依赖：

```bash
npm install
```

启动示例页：

```bash
npm run dev
```

默认会启动一个 Vite 开发服务器，直接调试 `index.html` 示例页。

## 构建

构建组件库：

```bash
npm run build
```

构建完成后会产出：

- `dist/web-booster.min.js`
- `dist/web-booster.esm.js`
- `dist/web-booster.css`

## 使用方式

### 通过 NPM 引入

```bash
npm install web-booster
```

```js
import 'web-booster/styles.css';
import 'web-booster';
```

示例站自己的版式样式不包含在发布产物里，按需自行补充页面层 CSS。

```html
<wb-card title="Hello">
  <wb-paragraph>
    这是一个 <wb-link href="https://example.com">可点击链接</wb-link>。
  </wb-paragraph>
</wb-card>
```

### 通过 CDN 引入

```html
<link rel="stylesheet" href="https://unpkg.com/web-booster/dist/web-booster.css" />
<script src="https://unpkg.com/web-booster/dist/web-booster.min.js"></script>
```

## 图标扩展

默认内置的图标只覆盖库内当前会用到的一小组常用图标，例如 `sparkles`、`menu`、`copy`、`check`、`code`、`info`、`triangle-alert`、`circle-x` 和 `github`。

如果业务侧需要更多图标，可以按需注册：

```js
import 'web-booster/styles.css';
import { registerWBIcons } from 'web-booster';
import { Search } from 'lucide';

registerWBIcons({
  search: Search
});
```

## 设计令牌

外部变量统一采用 `--wb-*` 前缀，例如：

```css
:root {
  --wb-text: #0f172a;
  --wb-primary: #111827;
  --wb-header-bg: #ffffffd6;
  --wb-card-border: #e5e7eb;
  --wb-button-border: #d5dde7;
}
```

## 当前取舍

- 组件先以“原生可用、跨框架接入简单”为第一目标。
- 样式先对齐 `moon-lottie`，暂时不引入更复杂的主题层。
- `wb-icon` 默认只打包少量内置图标，额外图标通过注册方式按需引入。
- 内置补了 `github` 图标别名，方便文档页和仓库入口直接使用。
- `wb-code` 优先提供复制体验，后续如果需要可以再加语法高亮插槽或适配器。

## 后续建议

- 增加表单类组件：`wb-input`、`wb-tag`、`wb-badge`
- 增加主题容器：`wb-theme-provider`
- 补充更细的导航、页脚、hero 区块组件

## 许可证

MIT