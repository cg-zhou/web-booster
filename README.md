# web-booster

原生 Web Components + 设计令牌样式库，目标是为多技术栈站点提供一套统一的基础 UI。

当前内置内容：

- `wb-paragraph`：段落文本
- `wb-link`：段落内链接文本
- `wb-card`：卡片容器，支持标题属性和标题 slot
- `wb-button`：按钮，支持 `primary` / `secondary` 和 `sm` / `md` / `lg`
- `wb-number`：数值调节，支持拖动 slider、直接输入和上下微调
- `wb-message`：轻提示能力，支持 `info` / `success` / `warning` / `error`
- `wb-switch`：开关，功能类似 checkbox，支持 `checked` / `disabled`
- `wb-icon`：内置少量常用图标，并支持按需注册新图标
- `wb-code`：代码文本，支持一键复制
- `wb-input`：输入框，支持 label、placeholder、disabled、readonly、error 状态
- `wb-file-picker`：通用文件选择器，支持点击/拖拽、文件类型校验；图片会自动显示等比预览
- `wb-tag`：标签，支持 `default` / `primary` / `success` / `warning` / `error` 变体，可关闭
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

执行 `npm pack` / `npm publish` 前会自动触发一次 `npm run build`，避免发布旧的 `dist` 产物。

## 自动发布到 npm

推送 `vX.Y.Z` 标签后，GitHub Actions 会安装依赖、构建、检查发布包内容，再通过 npm Trusted Publishing（OIDC）发布。普通推送到 `main` 不会发布，不需要保存 `NPM_TOKEN` 或每次执行 `npm login`。

### 首次配置（只需一次）

先将 `.github/workflows/publish.yml` 推送到 GitHub，再进入 npm 的 `web-booster` 包设置，在 Trusted Publisher 中选择 GitHub Actions：

| 字段 | 值 |
| --- | --- |
| Organization or user | `cg-zhou` |
| Repository | `web-booster` |
| Workflow filename | `publish.yml` |
| Environment name | 留空（工作流未使用 environment） |
| Allowed actions | 允许直接发布 `npm publish` |

保存配置可能需要登录和 2FA；之后工作流使用临时身份凭据自动发布。无需创建 npm Token，也无需添加 GitHub Secrets。

参考 [npm Trusted Publishing 官方文档](https://docs.npmjs.com/trusted-publishers/)。

### 每次发版

确认代码已提交、验证通过，且本地 `main` 已同步远端：

```bash
git switch main
git pull --ff-only

# 修复用 patch；新增功能用 minor；破坏性变更按项目版本策略选择版本
npm version patch

# 将本次版本提交和新建的标签推送到 GitHub
# 将下面的 vX.Y.Z 替换为 npm version 输出的实际标签
git push origin main
git push origin vX.Y.Z
```

`npm version` 会同步更新 `package.json` 和 `package-lock.json`，创建版本提交及标签。
工作流仅接受与 `package.json` 一致的正式版本标签；预发布版本需要另行配置 npm dist-tag。

在 [GitHub Actions](https://github.com/cg-zhou/web-booster/actions/workflows/publish.yml) 查看结果。若首次发布因授权配置失败，修正 npm 设置后可重跑失败的任务；若版本已成功发布，后续修改需要使用新版本号。

本地预检可执行 `npm pack --dry-run`，它会通过 `prepack` 自动构建库，不会发布到 npm。

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

<wb-number label="Rotate" min="0" max="360" step="1" value="90"></wb-number>

<wb-switch label="Enable shadows" checked></wb-switch>

<wb-input label="Name" placeholder="Enter your name"></wb-input>

<wb-file-picker
  accept="image/*"
  label="点击选择或拖拽图片"
  hint="PNG · JPG · WebP"
  change-label="点击此处更换图片"
></wb-file-picker>

<wb-tag variant="primary">Tag</wb-tag>
<wb-tag variant="success" closable>Closable</wb-tag>
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

- 增加主题容器：`wb-theme-provider`
- 补充更细的导航、页脚、hero 区块组件

## 许可证

MIT

## 文件选择器 API

`wb-file-picker` 支持单文件选择、拖拽、类型校验，以及图片缩略图。`size="sm"` 使用紧凑布局，默认是标准布局。

- `file` / `image`：当前文件和已解码图片（只读，无图片时为 `null`）。
- `loadFile(file)`：加载外部 `File`，成功接受返回 `true`；禁用或类型不符返回 `false`。
- `clear()`：清空文件和预览，禁用时仍可由页面调用。
- `change`：文件被接受或清空时立即触发，`event.detail` 为 `{ file, image: null }`。
- `preview`：图片解码完成时触发，`event.detail` 为 `{ file, image }`；预览失败时 `image` 为 `null`，文件仍可使用。

图片预览异步完成，不阻塞文件选择。需要解码图片的调用方应监听 `preview`，不要依赖 `change` 中的 `image`。
组件不自动参与 `FormData`，提交时通过 `formData.set('file', picker.file)` 加入文件；表单重置时调用 `picker.clear()`。

粘贴由页面监听并选择目标组件，调用 `picker.loadFile(file)`；组件不注册全局粘贴监听，避免多个实例争抢文件。普通文字粘贴、输入焦点和页面忙碌状态由页面处理。
