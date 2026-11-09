# BeefTV-DSH

DeepSeek Harness 中的 AI 视频创作工作台。左侧使用 BeefTV 的画布、项目、素材、技能和模型设置，右侧常驻 **BeefTV Agent**，支持创作、素材整理和生态自定义。

## 下载与安装

首版支持 **macOS Apple Silicon（M1 / M2 / M3 / M4 等 arm64）**，需要已安装 **DeepSeek Harness 0.2.2 系列**。插件版本 `0.1.0`，内置 BeefTV 运行时 `2.1.6`。

1. 从 [Releases](https://github.com/glanderness/BeefTV-DSH/releases/latest) 下载 `beeftv-dsh-0.1.0-darwin-arm64.tgz`。
2. 打开终端，执行以下命令。若文件下载到了其他位置，请替换最后的路径。

```sh
"/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh" plugin --profile desktop add "$HOME/Downloads/beeftv-dsh-0.1.0-darwin-arm64.tgz"
```

3. 完全退出并重新打开 DeepSeek Harness，在侧栏打开 **BeefTV**。
4. 首次打开时选择一种工作区。

| 方式 | 使用场景 |
| --- | --- |
| 使用独立工作区 | 首次使用，无需另外安装 BeefTV 桌面端。使用随包运行时创建独立本地工作区。 |
| 连接本机 BeefTV | 使用已安装的 `/Applications/BeefTV.app`，直接访问同一套项目、素材和账户配置。需要 BeefTV 2.2.0 或更高版本；版本较低时不会连接，工作台会提示升级。 |

独立工作区位于 Harness profile 对应 DSH home 的 `storages/beeftv/workspace`。安装插件后，模型渠道和账户需要由你自行配置或授权。AI 模型及视频生成费用由配置的渠道收取。

右侧 Agent 可以拖动调整宽度，最小宽度 320px。收起 Harness 侧栏时仅顶部控件避让，下方画布继续铺满。生成提交通过 Harness 审批和 BeefTV 任务流程执行。

## 更新与卸载

更新时下载新版本的 `.tgz`，使用同一条安装命令替换文件路径，并重新启动 Harness。

```sh
"/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh" plugin --profile desktop remove dsh-beeftv
```

安装包包含运行程序与资源。项目、账户和模型配置写入用户本机工作区。卸载命令移除插件，历史工作区由 Harness profile 保留。

## 常见问题

- **看不到 BeefTV 入口** — 完全退出 Harness 后重新打开，确认安装命令使用 `--profile desktop`。
- **无法连接本机 BeefTV** — 确认桌面端为 2.2.0 或更高版本，打开桌面端并等待启动完成，再重试连接。独立工作区始终使用内置运行时，不受桌面端版本影响。
- **macOS 阻止运行** — 首版运行时采用本地签名，尚未经过 Apple 公证。请在系统“隐私与安全性”中核对来源并按提示处理。
- **项目暂时无法读取** — 先点“重试加载”。本版本包含批量项目状态更新修复。若仍出现，请在设置中导出问题记录并提交 Issue，注意移除私人信息。

## 开发与重新打包

```sh
bun install
bun run test
bunx playwright install chromium
bun run test:browser
```

本仓库保存插件源码，二进制运行时随 GitHub Release 分发。重新打包需要安装已构建好的 BeefTV 桌面版。

```sh
# 默认从 /Applications/BeefTV.app 复制程序与资源
bun run package:release
# 可通过 BEEFTV_APP_PATH 指定其他已构建安装位置
```

`release/` 中会生成可直接安装的 `.tgz`、构建说明及 SHA-256 校验文件。检查安装包的校验值。

```sh
shasum -a 256 beeftv-dsh-0.1.0-darwin-arm64.tgz
```

## 源码与许可

BeefTV 上游源码位于 [glanderness/BeefTV](https://github.com/glanderness/BeefTV)。本次运行时对应的完整源码快照和 FFmpeg/ffprobe 源码随同版本 Release 提供。构建版本、源代码基线和运行时校验值见发布说明中的构建清单。

本项目沿用 BeefTV 的分区许可，详见 [LICENSE](LICENSE) 和 [NOTICE](NOTICE)。历史 MIT 部分及第三方组件保留各自许可。公开仓库的可见性不改变这些许可条件。
