# dsh-plugin-shelf

Lays the official DeepSeek Harness **Plugins** settings page out as a card grid, with a filter box. Appearance only — install, enable/disable and uninstall all stay native; this plugin never intercepts actions.

[简体中文](README.md)

## What it does

- Turns the single-column plugin list into a responsive card grid (min column width configurable).
- Adds an accent stripe on community cards (those with an Uninstall button), so they read differently from the official group.
- Adds a filter input to the toolbar; matches name and description, hides nothing else.
- Settings → Plugin Shelf: card view, column width, accent stripe, search box — live toggles.

## What it does not do

- It never replaces the official page, moves DOM nodes, or intercepts clicks.
- No install / toggle / uninstall logic — everything goes through the host.
- If a host upgrade renames internal classes, the page simply falls back to the native list. No errors, no hangs.

## Install

```bash
dsh plugin --profile desktop add dsh-plugin-shelf
```

Fully quit and reopen DeepSeek Harness afterwards.

## How it works

The official page is rendered by `@deepseek-ai/dsh-client-ui-plugin-manager`; the card list is `ul[class*="_cards"] > li`. This plugin injects scoped CSS to grid that list and marks rows with attributes (`data-dps-on / data-dps-community / data-dps-off`) for the stripe and the filter. All selectors use substring matching, never the build-hash prefix.

Configuration lives in browser `localStorage` (key `liao-plugin-shelf.config`).

## Compatibility

| DSH | Status |
|---|---|
| 0.2.0-rc.2 | verified |

## License

MIT
