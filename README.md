# electron-app-updater

用于 Electron 主进程的轻量更新工具。它从版本接口获取最新版本信息；检测到版本变化时，下载新的构建脚本、记录版本号，并重启应用。

## 安装

```bash
pnpm add @sellerartifact/electron-app-updater
```

## 使用

在 Electron 的主进程中创建更新器，并在合适的时机调用 `checkVersion()`。传入的 `app` 与 `dialog` 通常来自 `electron` 包。

```ts
import { app, dialog } from 'electron';
import { ElectronAppUpdater } from '@sellerartifact/electron-app-updater';

const updater = new ElectronAppUpdater({
  checkVersionUrl: 'https://example.com/api/app-version',
  app,
  dialog,
});

app.whenReady().then(async () => {
  const isLatest = await updater.checkVersion();

  if (isLatest) {
    console.log('当前已是最新版本');
  }
});
```

`checkVersion()` 在远端版本与本地版本一致时返回 `true`。检测到新版本时，它会执行更新和重启流程，并返回 `false`。

## 版本接口

`checkVersionUrl` 指向的接口需要返回以下结构，其中 `url` 是可直接下载的 JavaScript 文件地址：

```json
{
  "result": {
    "version": 2,
    "url": "https://example.com/releases/build.js"
  }
}
```

版本号使用严格不等比较，因此接口应始终返回稳定、可比较的版本值，例如递增数字。

## 配置

| 参数                 | 必填 | 默认值        | 说明                                                |
| -------------------- | ---- | ------------- | --------------------------------------------------- |
| `checkVersionUrl`    | 是   | -             | 版本接口地址。                                      |
| `app`                | 是   | -             | Electron 的 `app` 实例，用于重启和退出应用。        |
| `dialog`             | 是   | -             | Electron 的 `dialog` 实例，用于显示发现更新的提示。 |
| `configJSONFileName` | 否   | `config.json` | 本地版本记录文件名。                                |
| `buildJSFileName`    | 否   | `build.js`    | 下载后写入的构建脚本文件名。                        |

当前版本信息和构建脚本固定存放在 `./resources/app/src/main`：

```text
resources/app/src/main/
	config.json
	build.js
```

更新时会先将远端版本写入 `config.json`，再用下载内容覆盖 `build.js`，约 1.2 秒后调用 `app.relaunch()` 和 `app.exit(0)`。请确保该目录存在且应用对其有写入权限。

## 开发

```bash
pnpm install
pnpm build
```

监听构建：

```bash
pnpm dev
```
