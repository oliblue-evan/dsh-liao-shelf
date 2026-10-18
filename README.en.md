# Plugin Shelf · dsh-liao-shelf

Search, filter and pin everyday plugins in DeepSeek Harness.

[简体中文](README.md)

## Features

- Compact settings with a live preview beside common controls. Browsing preferences, pin management and backups are collapsed by default. Sorting uses the same custom menu across platforms.
- Toggle descriptions, versions and installation dates separately. Minimal view keeps only the logo, name, pin and native switch.
- Optionally remember search and filters when reopening the plugin list.
- Export/import appearance, pin order and collapsed groups as JSON. Preview before merging or replacing; undo an import. No plugin credentials or configuration are included.

- Fold official, installed and pinned groups independently; persist fold state. Search temporarily expands matching groups.
- Minimal layout shows only the logo, name, pin control and native switch.
- Current package versions and estimated installation dates; newest/oldest sorting keeps unknown dates last and pins first.

- Search names, descriptions and package IDs. All whitespace-separated keywords must match; case and full-width characters are normalized.
- Filter all, installed, official, enabled, disabled, pinned and problematic plugins, with accurate counts across groups.
- Stable package/item IDs preserve pins across renaming and language changes. Pinned shortcuts open the native configuration page.
- Grid/list/minimal layouts, three density presets and original/name/enabled-first sorting.
- Two-line descriptions and legible status labels.
- Settings in the plugin detail page: live previews, pin management, confirmed clearing and appearance reset. Resetting appearance preserves pins.
- Follow the active DSH language (Chinese/English).

Installation, switches, removal and configuration remain native DSH actions. A read-only local metadata endpoint uses Node built-ins. No third-party runtime dependencies or automatic package-manager operations. Web and desktop only; TUI is unaffected.

## Installation

Install through the plugin market, or the published GitHub source:

```sh
dsh plugin --profile desktop add github:oliblue-evan/dsh-liao-shelf
```

GitHub installs receive pushed changes only, not an unpublished local working tree.

## Preferences and compatibility

Preferences are local to the browser: `liao-plugin-shelf.config` and `liao-plugin-shelf.pins`. Existing configuration is read automatically; legacy name-based pins migrate when matching cards appear. Unmatched pins are retained for manual removal. Legacy keys remain for rollback, but new changes are not written back to them. Storage failures show a notice; session-only changes remain usable.

Current development target: **DSH 0.2.1-rc.2 Desktop**. The adapter uses semantic `data-plugin-*` attributes rather than CSS hashes or translated action labels. The new `basic`, `extensions` and `more` groups count as Official; `bundles` count as Installed. The legacy `official` group remains supported. It changes CSS ordering without moving native React nodes, and cleans up elements, observers, events and slot registrations on disposal. Unrecognized host views stay native.

Built-in configuration items with no switch are labelled built-in, rather than being counted as enabled plugins.

## Development

Node.js 24 and pnpm:

```sh
pnpm install --ignore-scripts
pnpm check
pnpm test
pnpm pack:check
```

Tests cover filtering, ID migration, native navigation, settings, storage failure and disposal. The host-loader scenario reads the desktop app archive, uses its real `ClientModuleSystem` and compares reviewed interaction records. Set `DSH_ASAR` on another platform; this check explicitly skips when the archive is unavailable.

DOM fixtures do not replace real GUI checks, or prove other host versions/browser engines. An isolated-profile cold start and consumer smoke test remain release gates.

## License

MIT

## Local installation information

Dates estimate the filesystem creation time of the current profile directory/link, not the historical first installation. Updating, reinstalling, copying or restoring backups can change them. Missing dates remain unknown. Built-in configuration items have no install date. The GET-only `/api/plugin-shelf/metadata` endpoint returns no filesystem paths. Restart DSH when upgrading from 0.3.x to activate the new server entry.

Shelf only reads locally installed versions and dates for display and sorting. It does not check remote releases or require the Market service.

## 0.5.0 interaction refinements

The toolbar combines fold actions and puts infrequent operations under More, including a shortcut to the existing plugin detail settings. Tab and Shift+Tab follow visual card order, skip hidden groups and can leave the page. More closes with Escape. Pins can move up or down; shortcuts and pinned cards share their order. Unpinning can be undone for eight seconds.

The display toggle is called Enhance plugin list, distinct from the native plugin enable switch.

## 0.5.1 toolbar proportions

Toolbar controls share a 36px height, 13px text and 8px corners. View buttons are 30px inside the 36px group, filters are 28px and menu rows are 36px. Icons are 16px, with 8px spacing within groups and 16px between groups. More uses a shorter label.

## 0.5.2 consistency and recovery

Appearance and pin writes track failures independently. Retry saving persists only pending current values; cross-window changes do not overwrite those values. Minimal density now changes actual spacing and height. The preview shares card sizing and includes read-only pin and switch controls. Minimal cards and shortcuts retain a small accessible issue badge until the plugin recovers.
