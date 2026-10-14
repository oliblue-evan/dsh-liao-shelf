# dsh-plugin-shelf（插件书架）

把 DeepSeek Harness 的官方「插件」设置页排成卡片网格，带一个过滤搜索框。只改外观：安装、启用开关、卸载全部还是官方原样，本插件不接管任何操作。

[English](README.en.md)

## 它做什么

- 插件页从一列长表变成自适应卡片网格（每列最小宽度可调）。
- 社区插件（带「卸载」按钮的卡片）左侧有一条色带，和官方一排的区分开。
- 工具条上多一个搜索框，按名称和描述即时过滤，不隐藏任何功能。
- 设置 → 插件书架：卡片视图开关、列宽、色带、搜索框，四个开关即时生效。

## 它不做什么

- 不替换官方页面，不搬运 DOM 节点，不拦截点击。
- 不做安装、启停、卸载——这些始终走官方逻辑。
- 官方升级后如果内部类名变了，本插件只会静默退回原列表，不会报错、不会卡界面。

## 安装

插件中心（装过 dsh-market 的话直接搜 `dsh-plugin-shelf`），或命令行：

```bash
dsh plugin --profile desktop add dsh-plugin-shelf
```

装完完全退出 DeepSeek Harness 再打开。

## 原理与边界

官方插件页由 `@deepseek-ai/dsh-client-ui-plugin-manager` 渲染，卡片列表是
`ul[class*="_cards"] > li`。本插件注入一段作用域受限的 CSS 把该列表切成网格，
并用属性标记（`data-dps-on / data-dps-community / data-dps-off`）实现色带和过滤。
所有选择器都用「包含匹配」，不依赖构建哈希前缀。

配置存在浏览器 `localStorage`（键 `liao-plugin-shelf.config`），跨机器不同步。

## 兼容

| DSH | 状态 |
|---|---|
| 0.2.0-rc.2 | 已验证 |

## 已知限制

- 只影响 Web 界面（桌面版同内核）；TUI 无此页面。
- 过滤是文本包含匹配，不支持正则。
- 官方页面结构大改时样式可能失效（表现为退回原列表），提 issue 即可跟进。

## License

MIT
