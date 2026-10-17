/* Plugin Shelf 0.7.0 — native plugin actions remain owned by DSH. */
window.__ModuleLoader__ && window.__ModuleLoader__.load({
  id: 'dsh-plugin-shelf',
  factory: function (require) {
    'use strict';
    var React = require('react');
    var NS = 'liao-plugin-shelf';
    var CONFIG = NS + '.config';
    var PINS = NS + '.pins';
    var EVENT = NS + '/config-changed';
    var DEFAULTS = { enabled: true, view: 'grid', density: 'standard', search: true, dimOff: true, sort: 'default', showPinned: true, showDescription: true, showVersion: true, showDate: true, remember: false, collapsed: [], sidebarMore: [], sidebarOrder: [], sidebarShortcuts: {}, sidebarLinks: [] };
    var DICT = {
      zh: {
        nav: '插件书架', intro: '让常用插件更容易找到。搜索、筛选与置顶即时生效。',
        search: '搜索名称、描述或包名', clear: '清除搜索', all: '全部', installed: '已安装', official: '官方',
        enabled: '已启用', disabled: '已停用', pinned: '置顶', problem: '异常', builtin: '内置',
        pin: '置顶', unpin: '取消置顶', grid: '网格视图', list: '列表视图',
        sort: '排序', default: '原始顺序', name: '名称顺序', enabledFirst: '启用优先',
        results: '显示 {shown} / {total} 个插件', empty: '没有匹配的插件', emptyHint: '试试其他关键词，或清除筛选。',
        resetFilter: '清除筛选', quick: '常用插件', quickHint: '点击进入插件配置',
        display: '显示方式', enhance: '增强插件列表', enhanceHint: '只控制列表增强；关闭后恢复 DSH 原生列表，插件仍保持运行。',
        layout: '布局', density: '卡片密度', compact: '紧凑', standard: '标准', spacious: '宽松',
        preview: '效果预览', previewName: '示例插件', previewDesc: '常用功能清晰展示，点击卡片进入配置。',
        behavior: '搜索与排序', searchToggle: '显示搜索框', searchHint: '按名称、描述与包名匹配，多个关键词同时匹配。',
        dim: '弱化停用状态', dimHint: '保留文字可读性，用状态标记区分停用插件。',
        quickToggle: '显示常用插件入口', quickSettingHint: '置顶插件集中显示在列表上方。',
        favorites: '置顶管理', noPins: '还没有置顶插件', pinHint: '点击卡片上的图钉，把常用插件放到这里。',
        unavailable: '当前列表中未找到', remove: '移除', clearPins: '清空置顶', clearAsk: '清空全部置顶？插件和其他设置不受影响。',
        confirm: '确认清空', cancel: '取消', restore: '恢复显示默认值', saved: '设置即时生效 · 保存在当前设备',
        storage: '浏览器未能保存偏好，本次会话内仍可使用。', native: '安装、启停、卸载与配置由 DSH 管理。', minimal: '极简视图', collapse: '收起', expand: '展开', collapseAll: '全部收起', expandAll: '全部展开',
        'installed-new': '安装时间：新 → 旧', 'installed-old': '安装时间：旧 → 新', installedOn: '安装于 {date}（估算）', unknownDate: '安装时间未知',
        timeHint: '时间取自当前插件副本的文件创建时间，属于估算；更新或重新安装可能改变时间，未知项排在最后。',
        metadataError: '安装信息暂不可用', refreshMetadata: '刷新安装信息',
        more: '更多', shelfSettings: '书架设置', sidebar: '侧栏入口', sidebarHint: '把第三方插件入口收进“更多”，减少侧栏占用。悬停预览，点击展开或收起。可设置快捷键，也能添加网页链接。', sidebarEmpty: '当前没有可整理的第三方插件入口', sidebarEmptyHint: '安装提供侧栏入口的插件后，可在这里调整显示位置。', sidebarShow: '显示在侧栏', sidebarOverflow: '收进更多', sidebarMoveUp: '上移', sidebarMoveDown: '下移', sidebarMenuLabel: '更多插件入口', sidebarOpen: '展开更多插件入口', sidebarDropHint: '拖到这里可以将其收起', shortcut: '快捷键', shortcutHint: '聚焦后按下组合键；按 Backspace 清除。', shortcutCapture: '点击并按下快捷键', customLinks: '自定义链接', linkLabel: '链接名称', linkUrl: '网址（https://）', addLink: '添加链接', removeLink: '移除链接', linkInvalid: '请输入有效的 HTTP 或 HTTPS 网址。',
        moveUp: '上移', moveDown: '下移', pinOrderHint: '按下方顺序显示常用入口和置顶卡片。',
        removedPin: '已取消置顶：{name}', undo: '撤销', sessionOnly: '设置即时生效 · 仅本次会话有效',
        storagePins: '置顶尚未保存，当前会话仍可使用。', storageConfig: '显示设置尚未保存，当前会话仍可使用。', storageBoth: '显示设置和置顶尚未保存，当前会话仍可使用。',
        retrySave: '重试保存', pendingSave: '部分偏好尚未保存', problemHint: '插件加载异常，打开详情查看原因。', previewPin: '预览：置顶', previewSwitch: '预览：启用'
      },
      en: {
        nav: 'Plugin Shelf', intro: 'Find your everyday plugins faster. Search, filters and pins update immediately.',
        search: 'Search names, descriptions or packages', clear: 'Clear search', all: 'All', installed: 'Installed', official: 'Official',
        enabled: 'Enabled', disabled: 'Disabled', pinned: 'Pinned', problem: 'Issues', builtin: 'Built-in',
        pin: 'Pin', unpin: 'Unpin', grid: 'Grid view', list: 'List view',
        sort: 'Sort', default: 'Original order', name: 'Name', enabledFirst: 'Enabled first',
        results: 'Showing {shown} of {total} plugins', empty: 'No matching plugins', emptyHint: 'Try another keyword or clear the filters.',
        resetFilter: 'Clear filters', quick: 'Everyday plugins', quickHint: 'Open plugin configuration',
        display: 'Appearance', enhance: 'Enhance plugin list', enhanceHint: 'Controls list enhancements only. Turning it off restores the native list; the plugin stays running.',
        layout: 'Layout', density: 'Density', compact: 'Compact', standard: 'Standard', spacious: 'Spacious',
        preview: 'Preview', previewName: 'Example plugin', previewDesc: 'Everyday features at a glance. Open a card to configure.',
        behavior: 'Search and sorting', searchToggle: 'Show search', searchHint: 'Match names, descriptions and packages. All keywords must match.',
        dim: 'Subtle disabled state', dimHint: 'Keep text legible and identify disabled plugins with a status label.',
        quickToggle: 'Show pinned shortcuts', quickSettingHint: 'Pinned plugins appear together above the list.',
        favorites: 'Manage pins', noPins: 'No pinned plugins yet', pinHint: 'Use the pin on a card to keep everyday plugins here.',
        unavailable: 'Not found in the current list', remove: 'Remove', clearPins: 'Clear pins', clearAsk: 'Clear all pins? Plugins and other settings stay as they are.',
        confirm: 'Clear all pins', cancel: 'Cancel', restore: 'Restore appearance defaults', saved: 'Changes apply immediately · Saved on this device',
        storage: 'Preferences could not be saved. They still work for this session.', native: 'DSH manages installation, switches, removal and configuration.', minimal: 'Minimal view', collapse: 'Collapse', expand: 'Expand', collapseAll: 'Collapse all', expandAll: 'Expand all',
        'installed-new': 'Installed: newest first', 'installed-old': 'Installed: oldest first', installedOn: 'Installed {date} (estimated)', unknownDate: 'Installation date unknown',
        timeHint: 'Dates estimate the creation time of the current profile entry. Updates or reinstalls may change them. Unknown dates sort last.',
        metadataError: 'Installation information unavailable', refreshMetadata: 'Refresh installation information',
        more: 'More', shelfSettings: 'Shelf settings', sidebar: 'Sidebar entries', sidebarHint: 'Move third-party plugin entries into “More” to keep the sidebar tidy. Hover to preview; click to expand or collapse. Add shortcuts and web links.', sidebarEmpty: 'No third-party sidebar entries to organize', sidebarEmptyHint: 'Entries appear here when an installed plugin contributes one.', sidebarShow: 'Show in sidebar', sidebarOverflow: 'Move to More', sidebarMoveUp: 'Move up', sidebarMoveDown: 'Move down', sidebarMenuLabel: 'More plugin entries', sidebarOpen: 'Show more plugin entries', sidebarDropHint: 'Drag here to move an entry into More', shortcut: 'Shortcut', shortcutHint: 'Focus the field and press a key combination. Backspace clears it.', shortcutCapture: 'Click and press a shortcut', customLinks: 'Custom links', linkLabel: 'Link name', linkUrl: 'URL (https://)', addLink: 'Add link', removeLink: 'Remove link', linkInvalid: 'Enter a valid HTTP or HTTPS URL.',
        moveUp: 'Move up', moveDown: 'Move down', pinOrderHint: 'This order applies to shortcuts and pinned cards.',
        removedPin: 'Unpinned: {name}', undo: 'Undo', sessionOnly: 'Applied now · This session only',
        storagePins: 'Pins have not been saved. They still work for this session.', storageConfig: 'Appearance settings have not been saved. They still work for this session.', storageBoth: 'Appearance settings and pins have not been saved. They still work for this session.',
        retrySave: 'Retry saving', pendingSave: 'Some preferences are not saved', problemHint: 'Plugin failed to load. Open its details for the reason.', previewPin: 'Preview: pin', previewSwitch: 'Preview: enable'
      }
    };
    Object.assign(DICT.zh, { browse: '浏览偏好', information: '卡片信息', pluginName: '名称', showDescription: '描述', showVersion: '版本号', showDate: '安装日期', remember: '记住搜索与筛选', rememberHint: '重新打开插件页时继续上次浏览；关闭则重置为全部。', backup: '偏好备份', backupHint: '仅包含显示偏好、侧栏位置、置顶顺序和折叠记录，不包含插件配置或授权。', export: '导出 JSON', import: '导入 JSON', paste: '粘贴备份 JSON，或选择文件', merge: '合并置顶与折叠', replace: '替换全部偏好', importPreview: '待导入：{pins} 个置顶 · {groups} 个折叠分组 · {view}', mergeHint: '合并保留当前显示设置；替换会应用备份中的显示设置和全部记录。', invalidBackup: '备份无效：请选择本插件导出的 JSON（最大 128 KB）。', imported: '已导入，可撤销本次更改', undoImport: '撤销导入', exportFailed: '导出失败，请重试。', previewInfo: 'v0.7.0 · 安装于 10/12（估算）' });
    Object.assign(DICT.en, { browse: 'Browsing preferences', information: 'Card information', pluginName: 'Name', showDescription: 'Description', showVersion: 'Version', showDate: 'Installation date', remember: 'Remember search and filters', rememberHint: 'Resume your last search when reopening. Otherwise start with all plugins.', backup: 'Preference backup', backupHint: 'Appearance, sidebar placement, pin order and collapsed groups only. No plugin configuration or credentials.', export: 'Export JSON', import: 'Import JSON', paste: 'Paste backup JSON or choose a file', merge: 'Merge pins and groups', replace: 'Replace preferences', importPreview: 'Ready: {pins} pins · {groups} collapsed groups · {view}', mergeHint: 'Merge keeps current appearance. Replace applies all preferences and records from the backup.', invalidBackup: 'Invalid backup. Choose a Plugin Shelf JSON export (128 KB maximum).', imported: 'Imported. You can undo this change.', undoImport: 'Undo import', exportFailed: 'Export failed. Please retry.', previewInfo: 'v0.7.0 · Installed Oct 12 (estimated)' });
    var PATHS = {
      star: 'm12 3 2.8 5.7 6.3.9-4.5 4.4 1.1 6.2-5.7-3-5.7 3 1.1-6.2L3.2 9.6l6.3-.9Z',
      search: 'M21 21l-5-5M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z',
      grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
      list: 'M8 5h13M8 12h13M8 19h13M3 5h.01M3 12h.01M3 19h.01',
      minimal: 'M3 6h5v5H3zM12 8h9M3 14h5v5H3zM12 16h9',
      chevron: 'm8 5 7 7-7 7', fold: 'm5 8 7 7 7-7', refresh: 'M20 7v5h-5M4 17v-5h5M6 7a7 7 0 0 1 12-1l2 3M4 15l2 3a7 7 0 0 0 12-1',
      pin: 'm8 3 8 0-1 6 4 4H5l4-4zM12 13v8',
      close: 'm6 6 12 12M18 6 6 18', more: 'M5 12h.01M12 12h.01M19 12h.01', link: 'M10 13a5 5 0 0 0 7.1 0l3-3a5 5 0 0 0-7.1-7.1l-1.7 1.7M14 11a5 5 0 0 0-7.1 0l-3 3a5 5 0 0 0 7.1 7.1l1.7-1.7',
      settings: 'M4 7h16M4 17h16M8 4v6M16 14v6'
    };
    var CSS = `
.dps-tools,.dps-quick,.dps-empty,.dps-settings{box-sizing:border-box;color:var(--dsw-alias-label-primary);font-size:13px;line-height:1.5}
.dps-tools *,.dps-quick *,.dps-settings *{box-sizing:border-box}
.dps-tools{display:flex;flex-direction:column;gap:10px;padding:14px 16px;border:1px solid var(--dsw-alias-border-l2,#8883);border-radius:12px;background:transparent;--dps-control-height:36px}
.dps-top,.dps-filters,.dps-actions,.dps-quick-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.dps-top{gap:8px}.dps-search-wrap{display:flex;align-items:center;gap:8px;flex:1;min-width:min(220px,100%);height:var(--dps-control-height);border:1px solid var(--dsw-alias-border-l2,#8883);border-radius:8px;background:var(--dsw-alias-bg-layer-2,#8881);padding:0 10px}
.dps-search-wrap:focus-within{border-color:var(--dsw-alias-state-business-primary,#6683ee);box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-state-business-primary,#6683ee) 15%,transparent)}
.dps-tools input{border:0;outline:0;background:transparent;color:inherit;min-width:0;width:100%;height:100%;padding:0;font:inherit;font-size:13px;line-height:20px}.dps-tools input::placeholder{color:var(--dsw-alias-label-tertiary,#999)}
.dps-tools input::-webkit-search-cancel-button,.dps-tools input::-webkit-search-decoration{-webkit-appearance:none}
.dps-tools button,.dps-quick button,.dps-settings button,.dps-pin{font:inherit;color:inherit;cursor:pointer;border:1px solid transparent;border-radius:8px;background:transparent;padding:6px 10px;line-height:1.5}
.dps-tools button:hover,.dps-quick button:hover,.dps-settings button:hover,.dps-pin:hover{background:var(--dsw-alias-interactive-bg-hover,#8882)}
.dps-tools button:focus-visible,.dps-quick button:focus-visible,.dps-settings button:focus-visible,.dps-pin:focus-visible,.dps-settings select:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#6683ee);outline-offset:2px}
.dps-tools button[aria-pressed=true],.dps-settings button[aria-pressed=true]{color:var(--dsw-alias-state-business-primary,#8099ff);background:color-mix(in srgb,var(--dsw-alias-state-business-primary,#6683ee) 12%,transparent)}
.dps-icon{width:16px;height:16px;flex:none;vertical-align:middle}.dps-layout{display:flex;align-items:center;gap:2px;height:var(--dps-control-height);margin-left:8px;background:var(--dsw-alias-bg-layer-2,#8881);border:1px solid var(--dsw-alias-border-l2,#8883);border-radius:8px;padding:2px}.dps-layout button{display:inline-flex;align-items:center;justify-content:center;width:32px;height:30px;padding:0;line-height:20px;border-radius:5px}
.dps-filter{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}.dps-number{font-size:11px;opacity:.7;font-variant-numeric:tabular-nums}.dps-results{font-size:11px;color:var(--dsw-alias-label-tertiary,#999);margin-left:auto}.dps-settings select{font:inherit;color:inherit;border:1px solid var(--dsw-alias-border-l2,#8883);border-radius:8px;padding:7px 10px;background:var(--dsw-alias-bg-layer-2,#303135);max-width:100%}.dps-tools option,.dps-settings option{background:var(--dsw-alias-bg-layer-2,#303135)}
[data-dps-page]{gap:22px!important}
[data-dps-page],.dps-preview{--dps-gap:12px;--dps-pad:16px;--dps-icon-size:38px;--dps-col:340px;--dps-head-min:124px;--dps-head-align:flex-start;--dps-head-gap:12px;--dps-title-size:14px;--dps-mini-pad:12px;--dps-mini-min:64px;--dps-mini-icon:30px}
[data-dps-page][data-dps-density=compact],.dps-preview[data-density=compact]{--dps-gap:8px;--dps-pad:12px;--dps-icon-size:32px;--dps-col:320px;--dps-head-min:110px;--dps-mini-pad:8px;--dps-mini-min:52px;--dps-mini-icon:28px}
[data-dps-page][data-dps-density=spacious],.dps-preview[data-density=spacious]{--dps-gap:16px;--dps-pad:20px;--dps-icon-size:42px;--dps-col:390px;--dps-mini-pad:16px;--dps-mini-min:76px;--dps-mini-icon:34px}
[data-dps-page][data-dps-view=list],.dps-preview[data-view=list]{--dps-head-min:88px;--dps-head-align:center}
[data-dps-list]{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(min(100%,var(--dps-col)),1fr));gap:var(--dps-gap)!important;align-items:stretch!important}
[data-dps-page][data-dps-view=list] [data-dps-list]{grid-template-columns:1fr}
[data-dps-card]{border:1px solid var(--dsw-alias-border-l2,#8883)!important;background:var(--dsw-alias-bg-layer-1,#8881)!important;border-radius:12px!important;margin:0!important;min-width:0;position:relative;transition:border-color .15s,background .15s}
[data-dps-card]:hover{border-color:var(--dsw-alias-border-l1,#8886)!important;background:var(--dsw-alias-interactive-bg-hover,#8882)!important}
[data-dps-part=head],.dps-preview-head{display:flex;box-sizing:border-box;padding:var(--dps-pad)!important;gap:var(--dps-head-gap)!important;align-items:var(--dps-head-align)!important;min-height:var(--dps-head-min)}
[data-dps-part=icon],.dps-preview-icon{position:relative;width:var(--dps-icon-size)!important;height:var(--dps-icon-size)!important;border-radius:10px!important;flex:none!important}[data-dps-part=icon] svg,.dps-preview-icon svg{max-width:24px;max-height:24px}
[data-dps-part=main],.dps-preview-main{gap:6px!important;min-width:0}[data-dps-part=title],.dps-preview-title{line-height:21px!important;font-size:var(--dps-title-size)!important}[data-dps-part=desc],.dps-preview-desc{-webkit-line-clamp:2!important;line-height:19px!important;font-size:12px!important}
[data-dps-part=end],.dps-preview-end{display:flex!important;align-items:center;gap:8px;position:relative;z-index:2;flex:none;align-self:var(--dps-head-align)}
[data-dps-part=end] [role=switch]{margin-top:5px}[data-dps-page][data-dps-view=list] [data-dps-part=end]{align-self:center}
.dps-pin{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;flex:none;padding:4px;position:relative;z-index:2;color:var(--dsw-alias-label-tertiary,#999)}
.dps-pin[aria-pressed=true]{color:var(--dsw-alias-state-business-primary,#8099ff)}.dps-pin[aria-pressed=true] svg{fill:color-mix(in srgb,currentColor 18%,transparent)}
.dps-status{font-size:11px;color:var(--dsw-alias-label-tertiary,#999);display:inline-flex;gap:5px;align-items:center;min-height:17px}.dps-status:before{content:'';width:5px;height:5px;border-radius:50%;background:currentColor}.dps-status[data-state=running]:before{background:var(--dsw-alias-state-success-primary,#64b88b)}.dps-status[data-state=problem]{color:var(--dsw-alias-state-error-primary,#ef8585)}
[data-dps-card][data-dps-dim] [data-dps-part=icon]{opacity:.65}
[data-dps-hidden],[data-dps-group-hidden]{display:none!important}.dps-native-count{display:none!important}.dps-group-count{font-size:12px;color:var(--dsw-alias-label-tertiary,#999)}
.dps-quick{display:flex;flex-direction:column;gap:10px}.dps-quick-head{justify-content:space-between}.dps-quick h3{font-size:13px;font-weight:500;margin:0}.dps-muted{color:var(--dsw-alias-label-tertiary,#999);font-size:12px}.dps-shortcuts{display:flex;flex-wrap:wrap;gap:8px}.dps-shortcuts button{display:inline-flex;align-items:center;gap:7px;max-width:100%;padding:8px 12px;border-color:var(--dsw-alias-border-l2,#8883);background:var(--dsw-alias-bg-layer-1,#8881)}.dps-shortcuts button span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:240px}.dps-shortcuts svg{color:var(--dsw-alias-state-business-primary,#8099ff)}
.dps-empty{text-align:center;padding:44px 20px;border:1px dashed var(--dsw-alias-border-l2,#8884);border-radius:12px}.dps-empty strong{font-size:15px;font-weight:500}.dps-empty p{font-size:13px;color:var(--dsw-alias-label-tertiary,#999);margin:8px 0 16px}.dps-empty button{font:inherit;cursor:pointer;background:transparent;color:var(--dsw-alias-state-business-primary,#8099ff);padding:7px 12px;border:1px solid var(--dsw-alias-border-l2,#8883);border-radius:8px}
.dps-settings{display:flex;flex-direction:column;gap:20px;max-width:760px}.dps-settings h2{font-size:20px;line-height:28px;margin:0;font-weight:600}.dps-settings h3{font-size:14px;margin:0 0 12px;font-weight:500}.dps-settings p{margin:0}.dps-settings-section{padding:18px;border:1px solid var(--dsw-alias-border-l2,#8883);border-radius:12px;background:var(--dsw-alias-bg-layer-1,#8881)}.dps-setting-row{display:flex;justify-content:space-between;align-items:center;gap:18px;padding:10px 0}.dps-setting-copy{min-width:0}.dps-setting-copy small{display:block;margin-top:3px;font-size:12px;color:var(--dsw-alias-label-tertiary,#999)}
.dps-settings .dps-switch{width:36px;height:22px;border:0;border-radius:20px;padding:3px;background:var(--dsw-alias-interactive-bg-hover,#777);flex:none}.dps-switch span{display:block;width:16px;height:16px;border-radius:50%;background:var(--dsw-alias-label-primary,#fff);transition:transform .15s}.dps-settings .dps-switch[aria-checked=true]{background:var(--dsw-alias-state-business-primary,#6683ee)}.dps-switch[aria-checked=true] span{transform:translateX(14px)}
.dps-choice{display:flex;gap:3px;border-radius:9px;padding:3px;background:var(--dsw-alias-bg-layer-2,#8881);border:1px solid var(--dsw-alias-border-l2,#8883)}.dps-choice button{font-size:12px;padding:5px 9px}
.dps-preview{margin-top:14px;padding:14px;border-radius:10px;background:var(--dsw-alias-bg-layer-2,#8881)}.dps-preview-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,var(--dps-col)),1fr));gap:var(--dps-gap);margin-top:10px}.dps-preview[data-view=list] .dps-preview-cards{grid-template-columns:1fr}.dps-preview-card{border:1px solid var(--dsw-alias-border-l2,#8883);border-radius:12px;background:var(--dsw-alias-bg-layer-1,#8881);min-width:0}.dps-preview-icon{display:flex;align-items:center;justify-content:center;border:1px solid var(--dsw-alias-border-l2,#8883)}.dps-preview-main{display:flex;flex-direction:column;flex:1}.dps-preview-title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500}.dps-preview-desc{display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden;color:var(--dsw-alias-label-tertiary,#999)}.dps-preview .dps-footer{gap:6px}.dps-preview-end button{pointer-events:none;cursor:default}.dps-settings .dps-preview .dps-pin{width:28px;height:28px;padding:4px}.dps-settings .dps-preview .dps-switch{align-self:center}
.dps-pins-list{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}.dps-pins-list li{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid var(--dsw-alias-border-l2,#8882)}.dps-pins-list li:last-child{border:0}.dps-pins-list small{display:block;font-size:11px;overflow-wrap:anywhere;color:var(--dsw-alias-label-tertiary,#999)}.dps-settings .dps-secondary{border-color:var(--dsw-alias-border-l2,#8883)}.dps-settings .dps-confirm{padding:12px;background:var(--dsw-alias-bg-layer-2,#8881);border-radius:8px;margin-top:12px}.dps-confirm .dps-actions{margin-top:10px}.dps-settings .dps-danger{color:var(--dsw-alias-state-error-primary,#ef8585)}.dps-settings-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.dps-storage{color:var(--dsw-alias-state-error-primary,#ef8585);font-size:12px}
@media(max-width:620px){.dps-top{align-items:stretch}.dps-search-wrap{flex-basis:100%}.dps-results{margin-left:0}.dps-metadata-note{flex-basis:100%;max-width:100%;margin-left:0}.dps-layout{margin-left:0}.dps-top>[data-dps-action=toggle-all]{margin-left:0}.dps-setting-row{flex-wrap:wrap;gap:10px}.dps-preview-cards{grid-template-columns:1fr}.dps-quick-head .dps-muted{display:none}.dps-tools{padding:12px}.dps-settings-section{padding:14px}}


.dps-tools .dps-filter{display:inline-flex;align-items:center;height:28px;font-size:12px;line-height:20px;padding:0 9px;border-radius:8px}.dps-filters{gap:4px}.dps-number{min-width:12px;text-align:center}.dps-number[hidden]{display:none!important}.dps-tools button:disabled{opacity:.45;cursor:default}
.dps-tools .dps-utility{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:var(--dps-control-height);font-size:13px;line-height:20px;padding:0 10px;white-space:nowrap;color:var(--dsw-alias-label-secondary,#aaa)}
.dps-tools .dps-sort{height:var(--dps-control-height);font:inherit;font-size:13px;line-height:20px;padding:0 10px;min-width:152px;max-width:100%;border:1px solid var(--dsw-alias-border-l2,#8883);border-radius:8px;color:inherit;background:var(--dsw-alias-bg-layer-2,#8881)}
.dps-metadata-note{font-size:11px;line-height:20px;color:var(--dsw-alias-label-tertiary,#999);margin-left:auto;max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

.dps-footer{display:flex;align-items:center;gap:6px 10px;flex-wrap:wrap}.dps-metadata{font-size:10px;line-height:17px;color:var(--dsw-alias-label-tertiary,#999)}
[data-dps-pinned] .dps-pin{color:var(--dsw-alias-state-business-primary,#8099ff);background:color-mix(in srgb,currentColor 12%,transparent)}.dps-pin{border-radius:8px;transition:background .15s,color .15s}.dps-pin:hover{color:var(--dsw-alias-state-business-primary,#8099ff)}
.dps-native-heading{display:none!important}.dps-collapse{display:inline-flex;align-items:center;gap:8px;border:0;background:transparent;color:inherit;font:inherit;font-size:13px;font-weight:500;cursor:pointer;padding:4px 0;border-radius:6px}.dps-collapse .dps-icon{width:13px;height:13px;transform:rotate(90deg);transition:transform .15s}.dps-collapse[aria-expanded=false] .dps-icon{transform:none}.dps-collapse:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#6683ee);outline-offset:3px}[data-dps-collapsed]>ul{display:none!important}[data-dps-collapsed]{gap:0!important}
.dps-shortcuts{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,220px),1fr));gap:8px}.dps-shortcut{display:flex;align-items:center;gap:2px;padding:3px 5px;border:1px solid var(--dsw-alias-border-l2,#8883);border-radius:10px;background:var(--dsw-alias-bg-layer-1,#8881);min-width:0}.dps-shortcuts .dps-shortcut-open{display:flex;flex:1;align-items:center;gap:10px;padding:7px;border:0;background:transparent;min-width:0}.dps-shortcut-open>span:last-child{font-size:12px}.dps-shortcuts .dps-unpin{flex:none;border:0;padding:5px;color:var(--dsw-alias-state-business-primary,#8099ff)}.dps-shortcut-logo{display:flex;align-items:center;justify-content:center;width:26px;height:26px;flex:none;border-radius:7px}.dps-shortcut-logo img,.dps-shortcut-logo svg{width:22px;height:22px;object-fit:contain}.dps-shortcuts .dps-shortcut-logo svg{color:inherit}
[data-dps-page][data-dps-view=minimal],.dps-preview[data-view=minimal]{--dps-col:260px;--dps-pad:var(--dps-mini-pad);--dps-icon-size:var(--dps-mini-icon);--dps-head-min:var(--dps-mini-min);--dps-head-align:center;--dps-head-gap:10px;--dps-title-size:13px}
[data-dps-page][data-dps-view=minimal] [data-dps-part=icon]{border-radius:8px!important}[data-dps-page][data-dps-view=minimal] [data-dps-part=end] [role=switch]{margin:0}
[data-dps-view=minimal] [data-dps-part=desc],[data-dps-view=minimal] .dps-footer,[data-dps-view=minimal] [data-dps-part=extra],[data-dps-view=minimal] [data-dps-part=title-row]>:not([data-dps-part=title]),.dps-preview[data-view=minimal] .dps-preview-desc,.dps-preview[data-view=minimal] .dps-footer{display:none!important}
[data-dps-view=minimal] [data-dps-part=icon]{overflow:visible!important}.dps-shortcuts .dps-shortcut-logo{position:relative;overflow:visible}.dps-issue{display:none;position:absolute;top:-4px;right:-4px;width:14px;height:14px;align-items:center;justify-content:center;border-radius:50%;font-size:10px;font-weight:700;line-height:1;background:var(--dsw-alias-state-error-primary,#da4c54);color:var(--dsw-alias-bg-layer-1,#fff);box-shadow:0 0 0 2px var(--dsw-alias-bg-layer-1,#222)}[data-dps-view=minimal] .dps-issue{display:inline-flex}.dps-storage{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.dps-storage[hidden]{display:none!important}.dps-storage button{white-space:nowrap}
.dps-shortcuts[hidden],.dps-metadata[hidden],.dps-metadata-note[hidden]{display:none!important}
.dps-top>.dps-utility{border-color:var(--dsw-alias-border-l2,#8883);background:var(--dsw-alias-bg-layer-2,#8881)}.dps-top>[data-dps-action=toggle-all]{margin-left:8px}
.dps-more{position:relative;flex:none}.dps-more summary{gap:6px;list-style:none;cursor:pointer;height:var(--dps-control-height);padding:0 10px;font-size:13px;line-height:20px;white-space:nowrap;background:var(--dsw-alias-bg-layer-2,#8881);border-radius:8px;border:1px solid var(--dsw-alias-border-l2,#8883);display:flex;align-items:center}.dps-more summary::-webkit-details-marker{display:none}.dps-more summary:hover{background:var(--dsw-alias-interactive-bg-hover,#8882)}.dps-more summary:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#6683ee);outline-offset:2px}
.dps-more-menu{position:absolute;right:0;top:calc(100% + 6px);z-index:20;min-width:190px;padding:5px;border:1px solid var(--dsw-alias-border-l2,#8883);border-radius:10px;background:var(--dsw-alias-bg-layer-2,#303135);box-shadow:0 8px 28px #0003}.dps-tools .dps-more-menu button{display:flex;align-items:center;justify-content:flex-start;gap:8px;width:100%;height:36px;padding:0 10px;font-size:13px;line-height:20px;text-align:left}
.dps-undo{display:flex;align-items:center;gap:12px;justify-content:space-between;font-size:12px;color:var(--dsw-alias-label-secondary,#aaa)}.dps-undo[hidden]{display:none!important}.dps-undo button{color:var(--dsw-alias-state-business-primary,#8099ff)}.dps-settings .dps-pin-actions{display:flex;align-items:center;gap:4px;flex:none}.dps-pin-actions button:disabled{opacity:.35;cursor:default}.dps-settings .dps-pins-list small{overflow-wrap:anywhere}
.dps-tools .dps-clear{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;flex:none}.dps-tools .dps-clear[hidden],.dps-search-wrap[hidden]{display:none!important}
@media(max-width:620px){.dps-layout,.dps-top>[data-dps-action=toggle-all]{margin-left:0}}

[data-dps-page][data-dps-description=false] [data-dps-part=desc]{display:none!important}
.dps-settings{gap:12px;max-width:100%;container-type:inline-size}.dps-settings-section{padding:14px 16px}.dps-section-heading{display:flex;justify-content:space-between;align-items:center;gap:12px}.dps-section-heading h3{margin:0}.dps-settings .dps-reset{font-size:11px;padding:3px 0;color:var(--dsw-alias-label-tertiary,#999)}
.dps-appearance{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);gap:18px;align-items:center;margin-top:6px}.dps-appearance .dps-preview{margin:0;padding:10px;min-width:0}.dps-appearance .dps-preview-cards{grid-template-columns:1fr}.dps-appearance .dps-preview-head{--dps-title-size:12px;--dps-head-gap:8px}.dps-appearance .dps-preview-desc{font-size:11px!important;line-height:16px!important}.dps-appearance .dps-preview-end{gap:2px}.dps-appearance .dps-preview-card:nth-child(2){display:none}.dps-settings .dps-setting-row{padding:6px 0;gap:10px;min-height:38px}.dps-settings .dps-setting-copy{font-size:12px}.dps-common .dps-setting-row{flex-wrap:wrap}.dps-choice{padding:2px}.dps-choice button{padding:4px 8px;white-space:nowrap}.dps-toggle-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 26px;margin:6px 0}
.dps-disclosure>summary{cursor:pointer;display:flex;align-items:center;justify-content:space-between;list-style:none;min-height:24px;font-weight:500}.dps-disclosure>summary::-webkit-details-marker{display:none}.dps-disclosure>summary:after{content:'⌄';opacity:.55}.dps-disclosure[open]>summary{margin-bottom:10px}.dps-disclosure[open]>summary:after{transform:rotate(180deg)}.dps-settings textarea{font:inherit;resize:vertical;width:100%;min-height:78px;margin:10px 0;padding:8px 10px;color:inherit;border:1px solid var(--dsw-alias-border-l2,#8883);background:var(--dsw-alias-bg-layer-2,#8881);border-radius:8px}.dps-settings .dps-actions{margin-top:10px}.dps-settings .dps-pins-list li{padding:8px 0}
.dps-sort-setting{max-width:100%}.dps-sort,.dps-settings .dps-sort{display:inline-flex;align-items:center;justify-content:space-between;gap:16px;height:32px;padding:0 10px;border:1px solid var(--dsw-alias-border-l2,#8883);border-radius:8px;background:var(--dsw-alias-bg-layer-2,#8881);white-space:nowrap;font:inherit;font-size:12px;cursor:pointer;color:inherit;max-width:100%}.dps-sort-menu{position:fixed;z-index:2147483646;padding:4px;border:1px solid var(--dsw-alias-border-l2,#8885);border-radius:9px;background:var(--dsw-alias-bg-layer-3,#303135);color:var(--dsw-alias-label-primary,#eee);box-shadow:0 8px 30px #0004;font:13px/1.5 system-ui;overflow:auto;box-sizing:border-box}.dps-sort-option{display:block;width:100%;border:0;background:transparent;color:inherit;font:inherit;text-align:left;padding:7px 10px;border-radius:5px;cursor:pointer}.dps-sort-option[data-active=true]{background:var(--dsw-alias-interactive-bg-hover,#8883)}.dps-sort-option[aria-selected=true]{color:var(--dsw-alias-state-business-primary,#8099ff)}.dps-sort-option[aria-selected=true]:after{content:'✓';float:right;margin-left:12px}
[data-dps-sidebar-overflow="true"]{display:none!important}.dps-sidebar-more{display:flex!important;align-items:center;gap:10px;width:100%;text-align:left}.dps-sidebar-more[aria-expanded=true] [data-dps-more-label]{color:var(--dsw-alias-label-tertiary,#999)}.dps-sidebar-more[data-dps-active="true"][aria-expanded=false]{background:var(--dsw-alias-interactive-bg-hover,#8882)}.dps-sidebar-more .dps-sidebar-chevron{margin-left:auto;opacity:.65;transition:transform .16s ease}.dps-sidebar-more[aria-expanded=true] .dps-sidebar-chevron{transform:rotate(90deg)}
[data-dps-sidebar-overflow="true"]{display:none!important}
.dps-sidebar-menu{display:flex;flex-direction:column;gap:8px;width:100%;min-width:0;max-width:100%;max-height:min(50vh,420px);overflow-y:auto;overflow-x:hidden;padding:0;box-sizing:border-box;flex:0 0 auto}
.dps-sidebar-menu[hidden],.dps-sidebar-popover[hidden]{display:none!important}.dps-sidebar-item{width:100%;min-width:0;max-width:100%;box-sizing:border-box;cursor:pointer}[data-dps-sidebar-entry][data-dps-drop-before="true"]{box-shadow:inset 0 3px 0 var(--dsw-alias-state-business-primary,#6683ee)!important}[data-dps-sidebar-entry][data-dps-drop-after="true"]{box-shadow:inset 0 -3px 0 var(--dsw-alias-state-business-primary,#6683ee)!important}[data-dps-sidebar-entry][data-dps-drop-target="true"]{background:var(--dsw-alias-interactive-bg-hover,#8883)!important;outline:none!important}[data-dps-more-trigger][data-dps-drop-target="true"]{background:var(--dsw-alias-state-business-primary,#6683ee)!important;color:#fff!important}.dps-sidebar-dropzone{display:flex;align-items:center;justify-content:center;gap:8px;min-height:44px;margin:4px 8px;padding:6px 10px;border:1px dashed var(--dsw-alias-border-l2,#8887);border-radius:10px;color:var(--dsw-alias-label-tertiary,#999);font-size:12px;box-sizing:border-box}.dps-sidebar-dropzone[hidden]{display:none!important}.dps-sidebar-dropzone[data-dps-drop-target="true"]{border:2px dashed var(--dsw-alias-state-business-primary,#6683ee);background:color-mix(in srgb,var(--dsw-alias-state-business-primary,#6683ee) 10%,transparent);color:var(--dsw-alias-state-business-primary,#8099ff)}
.dps-sidebar-menu .dps-sidebar-item:hover,.dps-sidebar-menu .dps-sidebar-item:focus-visible,.dps-sidebar-menu .dps-sidebar-item[aria-current="page"],.dps-sidebar-menu .dps-sidebar-item[data-dps-selected="true"]{background:var(--dsw-alias-interactive-bg-hover,#8883)!important;outline:none}
.dps-sidebar-popover{position:fixed;z-index:2147483646;display:flex;flex-direction:column;gap:0;width:var(--dps-sidebar-row-width,260px);min-width:0;max-width:calc(100vw - 16px);max-height:min(60vh,480px);overflow-y:auto;overflow-x:hidden;padding:0;border:1px solid var(--dsw-alias-border-l2,#8885);border-radius:12px;background:var(--dsw-alias-bg-layer-3,#171717);color:var(--dsw-alias-label-primary,#eee);box-shadow:0 12px 34px #0005;box-sizing:border-box}
.dps-sidebar-popover .dps-sidebar-item{width:100%;min-width:0;max-width:100%;margin:0!important;box-sizing:border-box}
.dps-sidebar-popover .dps-sidebar-item:hover,.dps-sidebar-popover .dps-sidebar-item:focus-visible,.dps-sidebar-popover .dps-sidebar-item[aria-current="page"],.dps-sidebar-popover .dps-sidebar-item[data-dps-selected="true"]{background:var(--dsw-alias-interactive-bg-hover,#8883)!important;outline:none}.dps-sidebar-popover .dps-sidebar-item[data-dps-selected="true"]:after{content:'✓';margin-left:auto;color:var(--dsw-alias-state-business-primary,#8099ff);font-size:18px;line-height:1}
.dps-sidebar-shortcut{margin-left:auto;padding:1px 5px;border:1px solid var(--dsw-alias-border-l2,#8884);border-radius:5px;color:var(--dsw-alias-label-tertiary,#999);font:11px/1.4 system-ui,sans-serif;white-space:nowrap}.dps-sidebar-custom-link{display:flex;align-items:center;gap:10px;text-align:left}.dps-sidebar-custom-link>span:first-of-type{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dps-shortcut-setting{display:flex;align-items:center;gap:8px;margin-top:6px}.dps-settings .dps-shortcut-capture{width:150px;max-width:100%;height:28px;padding:3px 8px;border:1px solid var(--dsw-alias-border-l2,#8884);border-radius:6px;background:var(--dsw-alias-bg-layer-2,#8881);color:inherit;font:12px system-ui,sans-serif;text-align:center;cursor:pointer}.dps-settings .dps-shortcut-capture:focus{border-color:var(--dsw-alias-state-business-primary,#6683ee);outline:2px solid color-mix(in srgb,var(--dsw-alias-state-business-primary,#6683ee) 20%,transparent)}.dps-sidebar-links{margin-top:12px;padding-top:10px;border-top:1px solid var(--dsw-alias-border-l2,#8883)}.dps-sidebar-links>summary{cursor:pointer;font-size:13px;font-weight:500}.dps-link-form{display:grid;grid-template-columns:minmax(100px,.8fr) minmax(180px,1.5fr) auto;gap:8px;margin-top:10px}.dps-settings .dps-link-form input{min-width:0;width:100%;height:32px;padding:5px 8px;border:1px solid var(--dsw-alias-border-l2,#8884);border-radius:7px;background:var(--dsw-alias-bg-layer-2,#8881);color:inherit;font:12px system-ui,sans-serif}.dps-link-error{color:var(--dsw-alias-state-error-primary,#ef8585);font-size:12px;margin-top:6px!important}.dps-sidebar-links .dps-pins-list small{overflow-wrap:anywhere}
@container(max-width:560px){.dps-appearance{grid-template-columns:1fr;gap:10px}.dps-common .dps-setting-row{flex-wrap:nowrap}.dps-toggle-grid{column-gap:18px}}
@container(max-width:360px){.dps-toggle-grid{grid-template-columns:1fr}.dps-common .dps-setting-row{flex-wrap:wrap}}

@media(prefers-reduced-motion:reduce){.dps-collapse .dps-icon,.dps-pin{transition:none}}

@media(prefers-reduced-motion:reduce){[data-dps-card],.dps-switch span{transition:none}}
`;
    function json(key, fallback) {
      try { var raw = window.localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw); } catch (_) { return fallback; }
    }
    function normalize(value) {
      var v = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
      var out = Object.assign({}, DEFAULTS);
      ['enabled', 'search', 'dimOff', 'showPinned', 'showDescription', 'showVersion', 'showDate', 'remember'].forEach(function (k) { if (typeof v[k] === 'boolean') out[k] = v[k]; });
      if (['grid', 'list', 'minimal'].indexOf(v.view) >= 0) out.view = v.view;
      if (['compact', 'standard', 'spacious'].indexOf(v.density) >= 0) out.density = v.density;
      else if (Number.isFinite(v.minWidth)) out.density = v.minWidth < 300 ? 'compact' : v.minWidth > 380 ? 'spacious' : 'standard';
      if (['default', 'name', 'enabled', 'installed-new', 'installed-old'].indexOf(v.sort) >= 0) out.sort = v.sort;
      out.collapsed = Array.isArray(v.collapsed) ? Array.from(new Set(v.collapsed.filter(function (key) { return ['official', 'basic', 'extensions', 'bundles', 'more', 'quick'].indexOf(key) >= 0; }))) : [];
      out.sidebarMore = Array.isArray(v.sidebarMore) ? Array.from(new Set(v.sidebarMore.filter(function (key) { return typeof key === 'string' && key.length > 0 && key.length < 256; }))) : [];
      out.sidebarOrder = Array.isArray(v.sidebarOrder) ? Array.from(new Set(v.sidebarOrder.filter(function (key) { return typeof key === 'string' && key.length > 0 && key.length < 256; }))) : [];
      out.sidebarShortcuts = {};
      if (v.sidebarShortcuts && typeof v.sidebarShortcuts === 'object' && !Array.isArray(v.sidebarShortcuts)) Object.keys(v.sidebarShortcuts).slice(0, 100).forEach(function (id) { var key = v.sidebarShortcuts[id]; if (typeof key === 'string' && /^(?:(?:Ctrl|Alt|Shift|Meta)\+){1,4}(?:[A-Z0-9]|F(?:[1-9]|1[0-2])|SPACE|ENTER|ESC|TAB|BACKSPACE|DELETE)$/i.test(key)) out.sidebarShortcuts[id] = key; });
      out.sidebarLinks = Array.isArray(v.sidebarLinks) ? v.sidebarLinks.slice(0, 30).flatMap(function (link) { if (!link || typeof link !== 'object') return []; var id = typeof link.id === 'string' && /^[a-z0-9-]{1,64}$/i.test(link.id) ? link.id : ''; var label = typeof link.label === 'string' ? link.label.trim().slice(0, 60) : ''; var url = typeof link.url === 'string' ? link.url.trim().slice(0, 2048) : ''; return id && label && safeSidebarUrl(url) ? [{ id:id, label:label, url:url }] : []; }) : [];
      return out;
    }
    function safeSidebarUrl(value) { try { var url = new window.URL(value); return url.protocol === 'https:' || url.protocol === 'http:'; } catch (_) { return false; } }
    function shortcutForEvent(event) {
      var key = String(event.key || '').toUpperCase(); if (['CONTROL','ALT','SHIFT','META'].includes(key)) return '';
      var modifiers = []; if (event.ctrlKey) modifiers.push('Ctrl'); if (event.altKey) modifiers.push('Alt'); if (event.shiftKey) modifiers.push('Shift'); if (event.metaKey) modifiers.push('Meta');
      if (!modifiers.length) return '';
      var aliases = { ' ':'SPACE', 'ESCAPE':'ESC', 'ARROWDOWN':'DOWN', 'ARROWUP':'UP', 'ARROWLEFT':'LEFT', 'ARROWRIGHT':'RIGHT' };
      key = aliases[key] || key; return modifiers.join('+') + '+' + key;
    }
    function prettyShortcut(value) { return String(value || '').split('+').map(function (part) { return ({ Ctrl:'⌃', Alt:'⌥', Shift:'⇧', Meta:'⌘', SPACE:'Space', ENTER:'↵', ESC:'Esc', TAB:'Tab', BACKSPACE:'⌫', DELETE:'Del' })[part] || part; }).join(''); }
    function cleanPins(value) { return Array.isArray(value) ? Array.from(new Set(value.filter(function (x) { return typeof x === 'string' && x.length > 0; }))) : []; }
    function icon(name) {
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('class', 'dps-icon'); svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '1.7'); svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round');
      var path = document.createElementNS(svg.namespaceURI, 'path'); path.setAttribute('d', PATHS[name]); svg.appendChild(path); return svg;
    }
    function element(tag, cls, text) { var el = document.createElement(tag); if (cls) el.className = cls; if (text !== undefined) el.textContent = text; return el; }
    function text(el, value) { if (el.textContent !== value) el.textContent = value; }
    function attr(el, key, value) { if (el.getAttribute(key) !== value) el.setAttribute(key, value); }
    function mark(el, key, on) { if (on) attr(el, key, ''); else el.removeAttribute(key); }
    function button(action, label, cls) { var el = element('button', cls, label); el.type = 'button'; el.setAttribute('data-dps-action', action); return el; }

    function apply(ctx) {
      var cfg = normalize(json(CONFIG, json('liaoP…fig', {})));
      var pins = cleanPins(json(PINS, json('liaoP…ines', [])));
      var browsing = cfg.remember ? json(NS + '.browsing', {}) : {};
      var query = cfg.search && typeof browsing.query === 'string' ? browsing.query.slice(0, 2000) : '', filter = ['all','installed','official','enabled','disabled','pinned','problem'].includes(browsing.filter) ? browsing.filter : 'all', alive = true, frame = null, observer, activePage = null;
      var closeSort = null, sortSerial = 0;
      var catalog = new Map(), listeners = new Set(), storageFailed = false, failedSaves = new Set();
      var originalOrders = new Map();
      var sidebarObserver = null, sidebarEntries = [], sidebarTrigger = null, sidebarMenu = null, sidebarDropZone = null, sidebarPopover = null, sidebarPopoverTimer = null, sidebarHovering = false, sidebarExpanded = false, sidebarDraggingId = null, sidebarCloneSerial = 0, sidebarTargets = new Map(), sidebarOriginalOrders = new Map(), sidebarOriginalDraggables = new Map(), sidebarOriginalDisplays = new Map(), sidebarOverflowHidden = new Set(), sidebarDragBound = false;
      var focusCollapsed = {}, metadata = new Map(), metadataKey = null, metadataState = 'idle';
      var requests = new Set();
      var undoPin = null, undoTimer = null;
      var FILTERS = ['all', 'installed', 'official', 'enabled', 'disabled', 'pinned', 'problem'];
      function t(key, values) {
        var id = ctx.locale.getSnapshot().active;
        var value = (String(id).toLowerCase().indexOf('zh') === 0 ? DICT.zh : DICT.en)[key] || key;
        return value.replace(/\{(\w+)\}/g, function (_, name) { return values && values[name] !== undefined ? values[name] : '{' + name + '}'; });
      }
      function notify() { listeners.forEach(function (fn) { fn(); }); }
      function persist(key, value) {
        try { window.localStorage.setItem(key, JSON.stringify(value)); failedSaves.delete(key); } catch (_) { failedSaves.add(key); }
        storageFailed = failedSaves.size > 0;
        window.dispatchEvent(new window.CustomEvent(EVENT));
      }
      function storageMessage() { return t(failedSaves.size > 1 ? 'storageBoth' : failedSaves.has(PINS) ? 'storagePins' : 'storageConfig'); }
      function retrySave() {
        Array.from(failedSaves).forEach(function (key) { persist(key, key === PINS ? pins : cfg); }); notify(); schedule();
      }
      function update(next) {
        cfg = normalize(Object.assign({}, cfg, next));
        if (!cfg.search) query = '';
        persist(CONFIG, cfg); notify(); schedule(); refreshSidebar();
      }
      function savePins(next) { pins = cleanPins(next); persist(PINS, pins); notify(); schedule(); }
      function clearUndo() { if (undoTimer !== null) window.clearTimeout(undoTimer); undoTimer = null; undoPin = null; }
      function togglePin(key) {
        var index = pins.indexOf(key); clearUndo();
        if (index >= 0) {
          undoPin = { key: key, index: index, title: catalog.get(key)?.title || key.replace(/^(pkg|item):/, '') };
          undoTimer = window.setTimeout(function () { undoTimer = null; undoPin = null; notify(); schedule(); }, 8000);
        }
        savePins(index < 0 ? pins.concat(key) : pins.filter(function (x) { return x !== key; }));
      }
      function restorePin() {
        if (!undoPin) return;
        var next = pins.slice(); if (next.indexOf(undoPin.key) < 0) next.splice(Math.min(undoPin.index, next.length), 0, undoPin.key);
        clearUndo(); savePins(next);
      }
      function movePin(key, direction) {
        var index = pins.indexOf(key), target = index + direction;
        if (index < 0 || target < 0 || target >= pins.length) return;
        var next = pins.slice(); next.splice(index, 1); next.splice(target, 0, key); savePins(next);
      }
      var CORE_SIDEBAR_IDS = new Set(['plugins', 'schedule', 'context', 'skills', 'ssh', 'ig5']);
      function sidebarLabel(entry) {
        try { var label = entry.options && entry.options.label; return (typeof label === 'function' ? label() : label) || entry.options.id; }
        catch (_) { return entry.options && entry.options.id; }
      }
      function orderedSidebarEntries() {
        return cfg.sidebarOrder.map(function (id) { return sidebarEntries.find(function (entry) { return entry.movable && entry.id === id; }); }).filter(Boolean);
      }
      function movableSidebarEntries() { return sidebarEntries.filter(function (entry) { return entry.movable; }); }
      function sidebarEntriesInMore() {
        var plugins = orderedSidebarEntries().filter(function (entry) { return cfg.sidebarMore.indexOf(entry.id) >= 0 && sidebarTargets.has(entry.id); });
        return plugins.concat(cfg.sidebarLinks.map(function (link) { return Object.assign({ type:'link' }, link); }));
      }
      function sidebarEntrySelected(entry) {
        if (entry.type === 'link') return false;
        var target = sidebarTargets.get(entry.id); if (!target) return false;
        return target.getAttribute('aria-current') === 'page' || target.getAttribute('aria-selected') === 'true' || target.getAttribute('data-state') === 'active' || target.classList.contains('active') || target.classList.contains('selected') || target.classList.contains('current');
      }
      function sidebarMoreHasSelection() { return sidebarEntriesInMore().some(sidebarEntrySelected); }
      function restoreSidebarDisplay(node) {
        var original = sidebarOriginalDisplays.get(node); if (!original) return;
        if (original.value) node.style.setProperty('display', original.value, original.priority); else node.style.removeProperty('display');
      }
      function sidebarNav() {
        return Array.from(document.querySelectorAll('nav[aria-label]')).find(function (nav) { return /global panels|全局面板/i.test(nav.getAttribute('aria-label') || ''); }) || null;
      }
      function closeSidebarMenu() {
        sidebarExpanded = false;
        if (sidebarMenu) sidebarMenu.hidden = true;
        hideSidebarPopover();
        if (sidebarTrigger) attr(sidebarTrigger, 'aria-expanded', 'false');
      }
      function openSidebarMenu() {
        if (!sidebarMenu || !sidebarTrigger) return;
        sidebarExpanded = !sidebarExpanded;
        sidebarMenu.hidden = !sidebarExpanded;
        if (sidebarExpanded) hideSidebarPopover();
        else if (sidebarHovering) showSidebarPopover();
        attr(sidebarTrigger, 'aria-expanded', String(sidebarExpanded));
        updateSidebarTriggerLabel();
      }
      function updateSidebarTriggerLabel() {
        if (!sidebarTrigger) return;
        var label = sidebarTrigger.querySelector('[data-dps-more-label]');
        if (label) text(label, sidebarExpanded ? t('collapse') : t('more'));
        else {
          var textNode = Array.from(sidebarTrigger.childNodes).find(function (node) { return node.nodeType === 3 && node.nodeValue.trim(); });
          if (textNode) textNode.nodeValue = ' ' + (sidebarExpanded ? t('collapse') : t('more'));
        }
        attr(sidebarTrigger, 'aria-label', sidebarExpanded ? t('collapse') : t('sidebarOpen'));
        attr(sidebarTrigger, 'title', sidebarExpanded ? t('collapse') : t('more'));
        attr(sidebarTrigger, 'data-dps-active', String(!sidebarExpanded && sidebarMoreHasSelection()));
      }
      function namespaceCloneIds(root) {
        var nodes = [root].concat(Array.from(root.querySelectorAll('*'))), ids = new Map(), prefix = 'dps-more-' + (++sidebarCloneSerial) + '-';
        nodes.forEach(function (node) { if (node.id) ids.set(node.id, prefix + node.id); });
        nodes.forEach(function (node) {
          Array.from(node.attributes || []).forEach(function (attribute) {
            var name = attribute.name, value = attribute.value, next = value.replace(/url\(([\"']?)#([^)\"']+)\1\)/g, function (match, quote, id) { return ids.has(id) ? 'url(' + quote + '#' + ids.get(id) + quote + ')' : match; });
            if ((name === 'href' || name === 'xlink:href') && next.charAt(0) === '#' && ids.has(next.slice(1))) next = '#' + ids.get(next.slice(1));
            else if (/^aria-(labelledby|describedby|controls|owns)$/.test(name)) next = next.split(/\s+/).map(function (id) { return ids.get(id) || id; }).join(' ');
            if (next !== value) node.setAttribute(name, next);
          });
          if (node.id && ids.has(node.id)) node.id = ids.get(node.id);
        });
      }
      function copyNativeRowAppearance(source, clone) {
        var properties = ['display','align-items','justify-content','gap','flex','flex-shrink','min-width','min-height','height','padding','border','border-radius','background','background-color','color','font','font-family','font-size','font-weight','line-height','letter-spacing','text-align','white-space','box-sizing','overflow','opacity'];
        // Copy only the row's outer appearance. Descendant layout computed while
        // the native row is display:none can freeze text/icon wrappers at zero size.
        var computed = window.getComputedStyle(source);
        properties.forEach(function (property) { var value = computed.getPropertyValue(property); if (value) clone.style.setProperty(property, value); });
        // The source row is `display:none` while it lives in More. Copying that
        // computed value would also hide its flyout/expanded clone, so let the
        // native class restore its normal row display in the new container.
        clone.style.removeProperty('display');
        clone.style.setProperty('width','100%','important'); clone.style.setProperty('min-width','0','important'); clone.style.setProperty('max-width','100%','important'); clone.style.setProperty('box-sizing','border-box','important'); clone.style.setProperty('flex','0 0 auto','important'); clone.style.setProperty('margin','0','important');
      }
      function populateSidebarItems(container, entries) {
        var sameTargets = Array.isArray(container._targets) && container._targets.length === entries.length && entries.every(function (entry, index) { return container._targets[index] === (entry.type === 'link' ? null : sidebarTargets.get(entry.id)); });
        var signature = entries.map(function (entry) { var target = entry.type === 'link' ? null : sidebarTargets.get(entry.id); return [entry.id, entry.label, entry.url || '', cfg.sidebarShortcuts[entry.id] || '', entry.type === 'link' ? 'link' : (target.getAttribute('aria-current') || ''), entry.type === 'link' ? '' : target.className, String(sidebarEntrySelected(entry))].join(':'); }).join('|');
        if (sameTargets && container.getAttribute('data-signature') === signature) return;
        container.replaceChildren();
        entries.forEach(function (entry) {
          var target = entry.type === 'link' ? null : sidebarTargets.get(entry.id); if (entry.type !== 'link' && !target) return;
          // Keep the complete native button DOM. Host icons may depend on wrappers, images or inherited CSS.
          var item;
          if (entry.type === 'link') {
            item = element('button', 'dps-sidebar-item dps-sidebar-custom-link'); item.type = 'button'; item.setAttribute('aria-label', entry.label);
            item.appendChild(icon('link')); item.appendChild(element('span', '', entry.label));
            item.addEventListener('click', function () { if (!sidebarExpanded) closeSidebarMenu(); window.open(entry.url, '_blank', 'noopener,noreferrer'); });
          } else {
            item = target.cloneNode(true); item.removeAttribute('id'); item.classList.add('dps-sidebar-item');
            item.removeAttribute('data-dps-sidebar-overflow'); item.setAttribute('data-dps-sidebar-entry', entry.id); item.draggable = true;
            attr(item, 'data-dps-selected', String(sidebarEntrySelected(entry)));
            copyNativeRowAppearance(target, item);
            // Inline SVGs can reference masks and gradients by ID; duplicate IDs resolve
            // unpredictably against the hidden native entry, so namespace IDs and refs.
            namespaceCloneIds(item);
            item.addEventListener('click', function (event) { event.preventDefault(); if (!sidebarExpanded) closeSidebarMenu(); target.click(); });
          }
          var shortcut = cfg.sidebarShortcuts[entry.id];
          if (shortcut) item.appendChild(element('span', 'dps-sidebar-shortcut', prettyShortcut(shortcut)));
          container.appendChild(item);
        });
        container._targets = entries.map(function (entry) { return entry.type === 'link' ? null : sidebarTargets.get(entry.id); });
        container.setAttribute('data-signature', signature);
      }
      function showSidebarPopover() {
        if (sidebarExpanded || !sidebarTrigger || !sidebarMenu || !sidebarMenu.childElementCount) return;
        if (sidebarPopoverTimer) { window.clearTimeout(sidebarPopoverTimer); sidebarPopoverTimer = null; }
        if (!sidebarPopover) {
          sidebarPopover = element('div', 'dps-sidebar-popover'); sidebarPopover.setAttribute('data-plugin', 'dsh-plugin-shelf');
          attr(sidebarPopover, 'role', 'group'); attr(sidebarPopover, 'aria-label', t('sidebarMenuLabel'));
          sidebarPopover.addEventListener('mouseenter', function () { sidebarHovering = true; if (sidebarPopoverTimer) window.clearTimeout(sidebarPopoverTimer); sidebarPopoverTimer = null; });
          sidebarPopover.addEventListener('mouseleave', function () { sidebarHovering = false; hideSidebarPopoverSoon(); });
        }
        populateSidebarItems(sidebarPopover, sidebarEntriesInMore());
        if (!sidebarPopover.isConnected) document.body.appendChild(sidebarPopover);
        sidebarPopover.hidden = false;
        var rect = sidebarTrigger.getBoundingClientRect(), width = Math.max(180, Math.min(rect.width || 260, window.innerWidth - 16));
        sidebarPopover.style.setProperty('--dps-sidebar-row-width', width + 'px'); sidebarPopover.style.width = width + 'px';
        var left = rect.right + 8;
        if (left + width > window.innerWidth - 8) left = Math.max(8, rect.left - width - 8);
        var height = sidebarPopover.getBoundingClientRect().height;
        sidebarPopover.style.left = Math.max(8, Math.min(left, window.innerWidth - width - 8)) + 'px';
        sidebarPopover.style.top = Math.max(8, Math.min(rect.top, window.innerHeight - height - 8)) + 'px';
      }
      function hideSidebarPopover() {
        if (sidebarPopoverTimer) { window.clearTimeout(sidebarPopoverTimer); sidebarPopoverTimer = null; }
        if (sidebarPopover) { sidebarPopover.remove(); sidebarPopover = null; }
      }
      function hideSidebarPopoverSoon() {
        if (sidebarPopoverTimer) window.clearTimeout(sidebarPopoverTimer);
        sidebarPopoverTimer = window.setTimeout(function () { sidebarPopoverTimer = null; if (!sidebarHovering) hideSidebarPopover(); }, 140);
      }
      function renderSidebarMenu(entries) {
        if (!sidebarMenu) {
          sidebarMenu = element('div', 'dps-sidebar-menu'); sidebarMenu.setAttribute('data-plugin', 'dsh-plugin-shelf');
          attr(sidebarMenu, 'role', 'group'); attr(sidebarMenu, 'aria-label', t('sidebarMenuLabel')); sidebarMenu.hidden = true;
        }
        populateSidebarItems(sidebarMenu, sidebarEntriesInMore()); sidebarMenu.hidden = !sidebarExpanded;
        if (!sidebarDropZone) { sidebarDropZone = element('div','dps-sidebar-dropzone'); sidebarDropZone.setAttribute('data-dps-more-dropzone',''); sidebarDropZone.appendChild(icon('grid')); sidebarDropZone.appendChild(element('span','',t('sidebarDropHint'))); }
        if (sidebarExpanded) {
          if (sidebarDropZone.parentNode !== sidebarMenu || sidebarMenu.lastElementChild !== sidebarDropZone) sidebarMenu.appendChild(sidebarDropZone);
          sidebarDropZone.hidden = !!sidebarEntriesInMore().length && !sidebarDraggingId;
        } else {
          var nav = sidebarNav();
          if (nav && sidebarTrigger) { sidebarDropZone.style.order = String(Number(sidebarTrigger.style.order || 100) + 1); if (sidebarDropZone.parentNode !== nav) nav.appendChild(sidebarDropZone); }
          sidebarDropZone.hidden = !sidebarDraggingId;
        }
        if (sidebarTrigger) attr(sidebarTrigger, 'aria-expanded', String(sidebarExpanded));
        if (sidebarTrigger) sidebarMenu.style.order = sidebarTrigger.style.order;
        if (sidebarTrigger && sidebarTrigger.nextElementSibling !== sidebarMenu) sidebarTrigger.after(sidebarMenu);
        updateSidebarTriggerLabel();
        if (sidebarHovering && !sidebarExpanded) showSidebarPopover();
      }
      function refreshSidebar() {
        if (!alive) return;
        var nav = sidebarNav();
        if (!nav) { closeSidebarMenu(); if (sidebarMenu) sidebarMenu.remove(); sidebarMenu = null; sidebarTargets.clear(); return; }
        var byLabel = new Map();
        sidebarEntries.forEach(function (entry) { var matches = byLabel.get(entry.label) || []; matches.push(entry); byLabel.set(entry.label, matches); });
        var buttons = Array.from(nav.querySelectorAll('button[aria-label]')).filter(function (button) { return !button.hasAttribute('data-dps-more-trigger') && !button.closest('.dps-sidebar-menu'); });
        sidebarTargets.clear();
        buttons.forEach(function (button) {
          var label = button.getAttribute('aria-label') || button.textContent.trim(), matches = byLabel.get(label);
          if (matches && matches.length) { var entry = matches.shift(); if (entry.movable) sidebarTargets.set(entry.id, button); }
        });
        var entries = orderedSidebarEntries().filter(function (entry) { return sidebarTargets.has(entry.id); });
        bindSidebarDrag(nav);
        entries.forEach(function (entry, index) {
          var target = sidebarTargets.get(entry.id);
          if (!sidebarOriginalOrders.has(target)) sidebarOriginalOrders.set(target, target.style.order);
          if (!sidebarOriginalDraggables.has(target)) sidebarOriginalDraggables.set(target, target.getAttribute('draggable'));
          if (!sidebarOriginalDisplays.has(target)) sidebarOriginalDisplays.set(target, { value: target.style.getPropertyValue('display'), priority: target.style.getPropertyPriority('display') });
          target.setAttribute('draggable', 'true');
          attr(target, 'data-dps-sidebar-entry', entry.id); target.style.order = String(100 + index);
          if (cfg.sidebarMore.indexOf(entry.id) >= 0) { attr(target, 'data-dps-sidebar-overflow', 'true'); target.style.setProperty('display', 'none', 'important'); sidebarOverflowHidden.add(target); }
          else { target.removeAttribute('data-dps-sidebar-overflow'); if (sidebarOverflowHidden.has(target)) { restoreSidebarDisplay(target); sidebarOverflowHidden.delete(target); } }
        });
        var hidden = entries.filter(function (entry) { return cfg.sidebarMore.indexOf(entry.id) >= 0; });
        var trigger = nav.querySelector('[data-dps-more-trigger]');
        if (!entries.length && !cfg.sidebarLinks.length) { closeSidebarMenu(); if (trigger) trigger.remove(); if (sidebarMenu) sidebarMenu.remove(); sidebarMenu = null; sidebarTrigger = null; return; }
        if (!trigger) {
          var template = buttons.find(function (button) { return !button.hasAttribute('aria-current'); }) || buttons[0];
          trigger = template ? template.cloneNode(true) : element('button');
          // The native More trigger can be cloned from a row currently hidden in
          // More. Restore that row's original inline display so the trigger itself
          // never inherits the overflow's defensive `display:none!important`.
          if (template && sidebarOriginalDisplays.has(template)) { var triggerDisplay = sidebarOriginalDisplays.get(template); if (triggerDisplay.value) trigger.style.setProperty('display', triggerDisplay.value, triggerDisplay.priority); else trigger.style.removeProperty('display'); }
          trigger.className = (template && template.className) || ''; trigger.classList.add('dps-sidebar-more'); trigger.type = 'button';
          // A copied native entry may itself be hidden in More. Strip its identity
          // and overflow state so the More trigger remains visible and isn't treated
          // as a draggable plugin entry. Also avoid duplicate IDs from copied icons.
          trigger.removeAttribute('id'); trigger.removeAttribute('aria-current');
          trigger.removeAttribute('data-dps-sidebar-entry'); trigger.removeAttribute('data-dps-sidebar-overflow');
          trigger.removeAttribute('data-dps-sidebar-dragging'); trigger.removeAttribute('draggable');
          namespaceCloneIds(trigger);
          trigger.setAttribute('data-dps-more-trigger', ''); trigger.setAttribute('data-plugin', 'dsh-plugin-shelf');
          var nativeIcon = trigger.querySelector('svg');
          if (nativeIcon) nativeIcon.replaceWith(icon('grid'));
          var walker = document.createTreeWalker(trigger, 4), labelNode;
          while ((labelNode = walker.nextNode())) if (labelNode.nodeValue.trim()) break;
          var moreLabel = element('span', '', t('more')); moreLabel.setAttribute('data-dps-more-label', '');
          if (labelNode && labelNode.parentNode) labelNode.parentNode.replaceChild(moreLabel, labelNode); else trigger.appendChild(moreLabel);
          var chevron = icon('chevron'); chevron.classList.add('dps-sidebar-chevron'); chevron.setAttribute('data-dps-more-chevron', ''); trigger.appendChild(chevron);
          attr(trigger, 'aria-label', t('sidebarOpen')); attr(trigger, 'title', t('more')); attr(trigger, 'aria-expanded', 'false');
          trigger.addEventListener('click', openSidebarMenu);
          trigger.addEventListener('mouseenter', function () { sidebarHovering = true; if (!sidebarExpanded) showSidebarPopover(); });
          trigger.addEventListener('mouseleave', function () { sidebarHovering = false; if (!sidebarExpanded) hideSidebarPopoverSoon(); });
          trigger.addEventListener('focus', function () { if (!sidebarExpanded) showSidebarPopover(); });
          trigger.addEventListener('blur', function () { if (!sidebarExpanded) hideSidebarPopoverSoon(); });
          nav.appendChild(trigger);
        }
        sidebarTrigger = trigger;
        if (trigger) { trigger.hidden = false; trigger.style.order = String(100 + entries.length); updateSidebarTriggerLabel(); }
        renderSidebarMenu(hidden);
      }
      function syncSidebarEntries() {
        var raw = [];
        try { raw = ctx.slots.entriesOfSlot('sidebar.panellist') || []; } catch (_) {}
        sidebarEntries = raw.map(function (entry) {
          var options = entry.options || {};
          var registrant = String(entry.registrant || '').replace(/^dyn\//, '');
          return { id: options.id, label: sidebarLabel(entry), order: Number.isFinite(options.order) ? options.order : 0, registrant: registrant, movable: !!options.id && !!registrant && !CORE_SIDEBAR_IDS.has(options.id) && !/^@deepseek-ai\//.test(registrant) && !/^dsh-client(?:-|$)/.test(registrant) };
        }).filter(function (entry) { return !!entry.id; }).sort(function (a, b) { return a.order - b.order; });
        var eligible = movableSidebarEntries();
        var ids = eligible.map(function (entry) { return entry.id; }), order = cfg.sidebarOrder.filter(function (id) { return ids.indexOf(id) >= 0; });
        eligible.forEach(function (entry) { if (order.indexOf(entry.id) < 0) order.push(entry.id); });
        var more = cfg.sidebarMore.filter(function (id) { return ids.indexOf(id) >= 0; });
        if (JSON.stringify(order) !== JSON.stringify(cfg.sidebarOrder) || JSON.stringify(more) !== JSON.stringify(cfg.sidebarMore)) {
          cfg = normalize(Object.assign({}, cfg, { sidebarOrder: order, sidebarMore: more })); persist(CONFIG, cfg);
        }
        notify(); refreshSidebar();
      }
      function moveSidebarEntry(id, direction) {
        var order = cfg.sidebarOrder.slice(), index = order.indexOf(id), target = index + direction;
        if (index < 0 || target < 0 || target >= order.length) return;
        order.splice(index, 1); order.splice(target, 0, id); update({ sidebarOrder: order });
      }
      function toggleSidebarOverflow(id) {
        var more = cfg.sidebarMore.slice(), index = more.indexOf(id);
        if (index < 0) more.push(id); else more.splice(index, 1);
        update({ sidebarMore: more });
      }
      function updateSidebarShortcut(id, value) {
        var next = Object.assign({}, cfg.sidebarShortcuts);
        if (!value) delete next[id]; else next[id] = value;
        update({ sidebarShortcuts: next });
      }
      function runSidebarEntry(id) {
        var link = cfg.sidebarLinks.find(function (item) { return item.id === id; });
        if (link) { window.open(link.url, '_blank', 'noopener,noreferrer'); return; }
        var target = sidebarTargets.get(id); if (target) target.click();
      }
      function sidebarShortcutKeydown(event) {
        if (event.defaultPrevented || event.isComposing || event.repeat) return;
        var target = event.target;
        if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName || ''))) return;
        var shortcut = shortcutForEvent(event); if (!shortcut) return;
        var id = Object.keys(cfg.sidebarShortcuts).find(function (key) { return cfg.sidebarShortcuts[key].toLowerCase() === shortcut.toLowerCase(); });
        if (!id) return;
        if (!sidebarTargets.has(id) && !cfg.sidebarLinks.some(function (link) { return link.id === id; })) return;
        event.preventDefault(); event.stopPropagation(); runSidebarEntry(id);
      }
      function sidebarShortcutInput(event, id) {
        if (event.key === 'Escape') { event.preventDefault(); event.currentTarget.blur(); return; }
        if (event.key === 'Backspace' || event.key === 'Delete') { event.preventDefault(); updateSidebarShortcut(id, ''); return; }
        var value = shortcutForEvent(event); if (!value) return;
        if (!/^(?:(?:Ctrl|Alt|Shift|Meta)\+){1,4}(?:[A-Z0-9]|F(?:[1-9]|1[0-2])|SPACE|ENTER|ESC|TAB|BACKSPACE|DELETE)$/i.test(value)) return;
        event.preventDefault(); updateSidebarShortcut(id, value); event.currentTarget.blur();
      }
      function sidebarDragStart(event) {
        var node = event.target.closest && event.target.closest('[data-dps-sidebar-entry]'), id = node && node.getAttribute('data-dps-sidebar-entry');
        if (!id || !event.dataTransfer) return;
        sidebarDraggingId = id; event.dataTransfer.setData('text/plain', id); event.dataTransfer.effectAllowed = 'move'; attr(node, 'data-dps-sidebar-dragging', 'true'); renderSidebarMenu(sidebarEntriesInMore());
        // Snapshot the visible row itself. Browsers require a custom drag image
        // element to be rendered in the viewport; cloning it off-screen can turn
        // the preview transparent in Chromium/Electron.
        if (typeof event.dataTransfer.setDragImage === 'function') { var rect = node.getBoundingClientRect(); try { event.dataTransfer.setDragImage(node, 24, Math.max(12, Math.min(24, (rect.height || 40) / 2))); } catch (_) {} }
      }
      function sidebarDragEnd(event) {
        var node = event.target && event.target.closest && event.target.closest('[data-dps-sidebar-entry]'); if (node) node.removeAttribute('data-dps-sidebar-dragging');
        document.querySelectorAll('[data-dps-sidebar-dragging],[data-dps-drop-target],[data-dps-drop-before],[data-dps-drop-after]').forEach(function (target) { target.removeAttribute('data-dps-sidebar-dragging'); target.removeAttribute('data-dps-drop-target'); target.removeAttribute('data-dps-drop-before'); target.removeAttribute('data-dps-drop-after'); });
        sidebarDraggingId = null; if (sidebarMenu) renderSidebarMenu(sidebarEntriesInMore());
      }
      function sidebarDragCancel() { if (sidebarDraggingId) sidebarDragEnd({ target: null }); }
      function sidebarDragOver(event) {
        var target = event.target.closest && event.target.closest('[data-dps-more-dropzone],[data-dps-more-trigger],[data-dps-sidebar-entry]');
        if (!target) return;
        event.preventDefault(); if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
        document.querySelectorAll('[data-dps-drop-target],[data-dps-drop-before],[data-dps-drop-after]').forEach(function (node) { node.removeAttribute('data-dps-drop-target'); node.removeAttribute('data-dps-drop-before'); node.removeAttribute('data-dps-drop-after'); });
        if (target.hasAttribute('data-dps-more-trigger') || target.hasAttribute('data-dps-more-dropzone')) { attr(target, 'data-dps-drop-target', 'true'); return; }
        var rect = target.getBoundingClientRect(), after = rect.height > 0 && event.clientY >= rect.top + rect.height / 2;
        attr(target, after ? 'data-dps-drop-after' : 'data-dps-drop-before', 'true');
      }
      function sidebarDrop(event) {
        var target = event.target.closest && event.target.closest('[data-dps-more-dropzone],[data-dps-more-trigger],[data-dps-sidebar-entry]');
        if (!target || !event.dataTransfer) return;
        event.preventDefault(); var id = event.dataTransfer.getData('text/plain'), targetId = target.getAttribute('data-dps-sidebar-entry');
        if (!id || !cfg.sidebarOrder.includes(id)) return;
        if (target.hasAttribute('data-dps-more-trigger') || target.hasAttribute('data-dps-more-dropzone')) { if (!cfg.sidebarMore.includes(id)) toggleSidebarOverflow(id); }
        else if (targetId && targetId !== id) {
          var order = cfg.sidebarOrder.filter(function (item) { return item !== id; }), index = order.indexOf(targetId);
          if (index < 0) index = order.length; else if (target.hasAttribute('data-dps-drop-after')) index++;
          order.splice(index, 0, id);
          var more = cfg.sidebarMore.slice(), inMore = !!target.closest('.dps-sidebar-menu,.dps-sidebar-popover') || target.getAttribute('data-dps-sidebar-overflow') === 'true';
          more = more.filter(function (item) { return item !== id; }); if (inMore) { var targetMoreIndex = more.indexOf(targetId); more.splice(targetMoreIndex < 0 ? more.length : (target.hasAttribute('data-dps-drop-after') ? targetMoreIndex + 1 : targetMoreIndex), 0, id); }
          update({ sidebarOrder: order, sidebarMore: more });
        }
        sidebarDragEnd(event);
      }
      function bindSidebarDrag(nav) {
        if (sidebarDragBound || !nav) return;
        sidebarDragBound = true;
        // The collapsed-state flyout is mounted under document.body, outside the
        // native navigation tree. Delegate at document level so its rows remain
        // valid drag sources and insertion targets too.
        document.addEventListener('dragstart', sidebarDragStart); document.addEventListener('dragend', sidebarDragEnd); document.addEventListener('dragover', sidebarDragOver); document.addEventListener('drop', sidebarDrop);
        window.addEventListener('blur', sidebarDragCancel); document.addEventListener('visibilitychange', sidebarDragCancel);
      }
      function matches(row, which) {
        if (which === 'installed') return row.group === 'installed';
        if (which === 'official') return row.group === 'official';
        if (which === 'enabled') return row.state === 'running';
        if (which === 'disabled') return row.state === 'disabled';
        if (which === 'problem') return row.state === 'problem';
        if (which === 'pinned') return pins.indexOf(row.key) >= 0;
        return true;
      }
      function searchMatches(row) {
        var hay = (row.title + ' ' + row.description + ' ' + row.id).normalize('NFKC').toLowerCase();
        return query.normalize('NFKC').trim().toLowerCase().split(/\s+/).every(function (word) { return hay.indexOf(word) >= 0; });
      }
      function rowsFor(page) {
        return Array.from(page.querySelectorAll('[data-plugin-group] > ul > li[data-plugin-package], [data-plugin-group] > ul > li[data-plugin-item]')).flatMap(function (li, index) {
          var title = li.querySelector('button:not([role=switch]):not(.dps-pin)');
          var head = li.firstElementChild, desc = title && document.getElementById(title.getAttribute('aria-describedby'));
          if (!title || !head || (desc && !li.contains(desc))) return [];
          var group = li.closest('[data-plugin-group]'), id = li.getAttribute('data-plugin-package') || li.getAttribute('data-plugin-item');
          var key = (li.hasAttribute('data-plugin-package') ? 'pkg:' : 'item:') + id;
          var sw = li.querySelector('[role=switch]');
          var state = li.getAttribute('data-plugin-status') || (sw ? sw.getAttribute('aria-checked') === 'true' ? 'running' : 'disabled' : 'builtin');
          return [{ li: li, head: head, titleNode: title, desc: desc, id: id, key: key, title: title.textContent.trim(), description: desc ? desc.textContent.trim() : '', installedAt: metadata.get(id)?.installedAt ?? null,
            groupNode: group, group: ['basic', 'extensions', 'more', 'official'].indexOf(group.getAttribute('data-plugin-group')) >= 0 ? 'official' : group.getAttribute('data-plugin-group') === 'bundles' ? 'installed' : group.getAttribute('data-plugin-group'), state: state, index: index }];
        });
      }

      function dateText(timestamp) {
        return new Intl.DateTimeFormat(ctx.locale.getSnapshot().active, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(timestamp);
      }
      function isCollapsed(group) {
        var collapsed = query.trim() || filter !== 'all' ? focusCollapsed : cfg.collapsed;
        var has = function (key) { return Array.isArray(collapsed) ? collapsed.indexOf(key) >= 0 : collapsed[key] === true; };
        if (has(group)) return true;
        if (group === 'basic' || group === 'extensions' || group === 'more') return has('official');
        if (group === 'official') return has('basic') || has('extensions') || has('more');
        return false;
      }
      function setGroupCollapsed(group, closed) {
        var next = cfg.collapsed.slice();
        if (group === 'basic' || group === 'extensions' || group === 'more') {
          var legacyOfficial = next.indexOf('official') >= 0;
          next = next.filter(function (key) { return key !== 'official'; });
          var other = group === 'basic' ? 'extensions' : group === 'extensions' ? 'basic' : null;
          if (legacyOfficial && other && next.indexOf(other) < 0) next.push(other);
          next = next.filter(function (key) { return key !== group; });
          if (closed) next.push(group);
        } else if (group === 'official') {
          next = next.filter(function (key) { return key !== 'basic' && key !== 'extensions' && key !== 'more' && key !== 'official'; });
          if (closed) next.push(group);
        } else {
          next = next.filter(function (key) { return key !== group; });
          if (closed) next.push(group);
        }
        return Array.from(new Set(next));
      }
      function foldGroup(group) {
        var key = group.getAttribute('data-plugin-group'), heading = group.querySelector(':scope > div > h3');
        if (!heading) { mark(group, 'data-dps-collapsed', isCollapsed(key)); return; }
        heading.classList.add('dps-native-heading');
        var fold = heading.parentElement.querySelector('.dps-collapse');
        if (!fold) { fold = button('collapse', undefined, 'dps-collapse'); fold.appendChild(icon('chevron')); fold.appendChild(element('span')); heading.before(fold); }
        attr(fold, 'data-group', key); attr(fold, 'aria-expanded', String(!isCollapsed(key))); attr(fold, 'aria-label', t(isCollapsed(key) ? 'expand' : 'collapse') + ' ' + heading.textContent);
        text(fold.querySelector('span'), heading.textContent); mark(group, 'data-dps-collapsed', isCollapsed(key));
      }
      function apiPath(path) { var url = new window.URL(path.replace(/^\/+/, ''), document.baseURI); return url.pathname + url.search; }
      async function getJson(path, controller) {
        if (controller.signal.aborted || !alive) throw new Error('Request cancelled');
        var response = await window.fetch(apiPath(path), { method: 'GET', credentials: 'same-origin', cache: 'no-store', signal: controller.signal });
        if (!response.ok) { var error = new Error('HTTP ' + response.status); error.status = response.status; throw error; }
        return response.json();
      }
      async function ensureMetadata(key) {
        if (metadataKey === key || metadataState === 'loading') return;
        metadataKey = key; metadataState = 'loading'; var controller = new window.AbortController(); requests.add(controller);
        var timer = window.setTimeout(function () { controller.abort(); }, 10000);
        try {
          var data = await getJson('/api/plugin-shelf/metadata', controller);
          if (data.schema !== 'dsh-plugin-shelf/metadata/v1' || !Array.isArray(data.packages)) throw new Error('Unknown metadata contract');
          var next = new Map(); data.packages.forEach(function (item) { if (typeof item.name !== 'string') return; next.set(item.name, { version: typeof item.version === 'string' ? item.version : null, installedAt: Number.isSafeInteger(item.installedAt) && item.installedAt > 0 && item.installedAt <= Date.now() + 300000 ? item.installedAt : null }); });
          if (alive) { metadata = next; metadataState = 'ready'; }
        } catch (_) { if (alive) { metadata = new Map(); metadataState = 'error'; } }
        finally { window.clearTimeout(timer); requests.delete(controller); if (alive) schedule(); }
      }
      function migratePins(rows) {
        var next = pins.map(function (key) {
          if (/^(pkg|item):/.test(key)) return key;
          var found = rows.find(function (row) { return key === row.title || key === '查看 ' + row.title || key === 'Open ' + row.title || key === row.titleNode.getAttribute('aria-label'); });
          return found ? found.key : key;
        });
        next = cleanPins(next);
        if (JSON.stringify(next) !== JSON.stringify(pins)) savePins(next);
      }
      function issueMarker(container, state) {
        if (!container) return;
        var badge = container.querySelector('.dps-issue');
        if (state !== 'problem') { if (badge) badge.remove(); return; }
        if (!badge) { badge = element('span', 'dps-issue', '!'); attr(badge, 'role', 'img'); container.appendChild(badge); }
        attr(badge, 'title', t('problemHint')); attr(badge, 'aria-label', t('problemHint'));
      }
      function decorate(row, rank) {
        var li = row.li, head = row.head, title = row.titleNode, main = row.desc ? row.desc.parentElement : title.parentElement.parentElement;
        if (!originalOrders.has(li)) originalOrders.set(li, li.style.order);
        mark(li, 'data-dps-card', true); attr(li, 'data-dps-key', row.key);
        if (li.style.order !== String(rank)) li.style.order = String(rank);
        mark(li, 'data-dps-hidden', !matches(row, filter) || !searchMatches(row));
        mark(li, 'data-dps-dim', cfg.dimOff && row.state === 'disabled'); mark(li, 'data-dps-pinned', pins.indexOf(row.key) >= 0);
        attr(head, 'data-dps-part', 'head'); attr(main, 'data-dps-part', 'main'); attr(title, 'data-dps-part', 'title'); attr(title.parentElement, 'data-dps-part', 'title-row');
        Array.from(li.children).slice(1).forEach(function (el) { attr(el, 'data-dps-part', 'extra'); }); if (row.desc) attr(row.desc, 'data-dps-part', 'desc');
        if (head.firstElementChild !== main) attr(head.firstElementChild, 'data-dps-part', 'icon');
        issueMarker(head.querySelector('[data-dps-part=icon]'), row.state);
        var end = Array.from(head.children).find(function (child) { return child.querySelector('[role=switch]'); });
        if (!end) { end = head.querySelector('.dps-end'); if (!end) { end = element('div', 'dps-end'); head.appendChild(end); } }
        attr(end, 'data-dps-part', 'end');
        var pin = end.querySelector('.dps-pin');
        if (!pin) { pin = button('pin', undefined, 'dps-pin'); pin.appendChild(icon('pin')); end.insertBefore(pin, end.firstChild); }
        var pinned = pins.indexOf(row.key) >= 0;
        attr(pin, 'data-dps-key', row.key); attr(pin, 'aria-pressed', String(pinned));
        attr(pin, 'aria-label', t(pinned ? 'unpin' : 'pin') + ' ' + row.title); attr(pin, 'title', t(pinned ? 'unpin' : 'pin'));
        var footer = main.querySelector('.dps-footer');
        if (!footer) { footer = element('div', 'dps-footer'); main.appendChild(footer); footer.appendChild(element('span', 'dps-status')); footer.appendChild(element('span', 'dps-metadata')); }
        var status = footer.querySelector('.dps-status');
        attr(status, 'data-state', row.state); text(status, t(row.state === 'running' ? 'enabled' : row.state));
        var meta = footer.querySelector('.dps-metadata'), info = metadata.get(row.id);
        meta.hidden = row.group !== 'installed' || (!cfg.showVersion && !cfg.showDate);
        text(meta, [cfg.showVersion && info?.version ? 'v' + info.version : '', cfg.showDate ? (row.installedAt ? t('installedOn', { date: dateText(row.installedAt) }) : t('unknownDate')) : ''].filter(Boolean).join(' · '));
        attr(meta, 'title', t('timeHint') + (row.installedAt ? '\n' + new Date(row.installedAt).toLocaleString(ctx.locale.getSnapshot().active) : ''));

      }
      function toolbar(page, rows) {
        var lang = ctx.locale.getSnapshot().active;
        var bar = page.querySelector(':scope > .dps-tools');
        if (bar && bar.getAttribute('data-language') !== lang) { if (closeSort) closeSort(); bar.remove(); bar = null; }
        var header = page.querySelector(':scope > header');
        if (!header) return;
        if (!bar) {
          bar = element('div', 'dps-tools'); attr(bar, 'data-language', lang); attr(bar, 'role', 'region'); attr(bar, 'aria-label', t('nav'));
          var top = element('div', 'dps-top'); var wrap = element('div', 'dps-search-wrap');
          wrap.appendChild(icon('search')); var input = element('input', 'dps-search'); input.type = 'search'; input.placeholder = t('search'); input.setAttribute('aria-label', t('search'));
          wrap.appendChild(input); var clear = button('clear', undefined, 'dps-clear'); clear.setAttribute('aria-label', t('clear')); clear.appendChild(icon('close')); wrap.appendChild(clear); top.appendChild(wrap);
          var sort = sortControl(); top.appendChild(sort);
          var layout = element('div', 'dps-layout'); layout.setAttribute('role', 'group'); layout.setAttribute('aria-label', t('layout'));
          ['grid', 'list', 'minimal'].forEach(function (view) { var btn = button('view', undefined); attr(btn, 'data-view', view); attr(btn, 'aria-label', t(view)); attr(btn, 'title', t(view)); btn.appendChild(icon(view)); layout.appendChild(btn); }); top.appendChild(layout); bar.appendChild(top);
          var fold = button('toggle-all', undefined, 'dps-utility'); fold.appendChild(icon('fold')); fold.appendChild(element('span')); top.appendChild(fold);
          var more = element('details', 'dps-more'), summary = element('summary'); summary.appendChild(icon('more')); summary.appendChild(element('span', '', t('more'))); attr(summary, 'aria-label', t('more')); attr(summary, 'title', t('more')); more.appendChild(summary);
          var menu = element('div', 'dps-more-menu');
          [['metadata', 'refreshMetadata', 'refresh'], ['reset', 'resetFilter', 'close'], ['open-settings', 'shelfSettings', 'settings']].forEach(function (entry) { var btn = button(entry[0], undefined, 'dps-utility'); btn.appendChild(icon(entry[2])); btn.appendChild(element('span', '', t(entry[1]))); menu.appendChild(btn); });
          more.appendChild(menu); top.appendChild(more);
          var undo = element('div', 'dps-undo'); attr(undo, 'role', 'status'); attr(undo, 'aria-live', 'polite'); undo.appendChild(element('span')); undo.appendChild(button('undo-pin', t('undo'))); bar.appendChild(undo);
          var metadataNote = element('div', 'dps-metadata-note'); attr(metadataNote, 'role', 'status'); attr(metadataNote, 'aria-live', 'polite');
          var bottom = element('div', 'dps-filters'); bottom.setAttribute('role', 'group'); bottom.setAttribute('aria-label', t('resetFilter'));
          FILTERS.forEach(function (key) { var btn = button('filter', undefined, 'dps-filter'); attr(btn, 'data-filter', key); btn.appendChild(element('span', '', t(key))); btn.appendChild(element('span', 'dps-number')); bottom.appendChild(btn); });
          bottom.appendChild(metadataNote);
          var result = element('span', 'dps-results'); attr(result, 'role', 'status'); attr(result, 'aria-live', 'polite'); bottom.appendChild(result); bar.appendChild(bottom);
          var note = element('div', 'dps-storage'); note.setAttribute('role', 'status'); note.appendChild(element('span')); note.appendChild(button('retry-save', t('retrySave'))); bar.appendChild(note);
        }
        // DSH reuses the plugin panel when entering/leaving the "More" list,
        // replacing its direct header while keeping this toolbar mounted.
        // Re-anchor on every pass so the toolbar follows the active view.
        if (header.nextElementSibling !== bar) header.after(bar);
        bar.querySelector('.dps-search-wrap').hidden = !cfg.search;
        var input = bar.querySelector('input'); if (input.value !== query) input.value = query;
        bar.querySelector('.dps-clear').hidden = !query;
        bar.querySelector('.dps-sort').sync();
        bar.querySelectorAll('[data-view]').forEach(function (btn) { attr(btn, 'aria-pressed', String(btn.getAttribute('data-view') === cfg.view)); });
        bar.querySelectorAll('[data-filter]').forEach(function (btn) {
          var key = btn.getAttribute('data-filter'); attr(btn, 'aria-pressed', String(key === filter));
          text(btn.querySelector('.dps-number'), String(rows.filter(function (row) { return matches(row, key) && searchMatches(row); }).length));
        });
        text(bar.querySelector('.dps-results'), t('results', { shown: rows.filter(function (row) { return matches(row, filter) && searchMatches(row); }).length, total: rows.length }));
        var note = bar.querySelector('.dps-storage'); note.hidden = !storageFailed; text(note.querySelector('span'), storageMessage());
        var refresh = bar.querySelector('[data-dps-action=metadata]'); refresh.disabled = metadataState === 'loading';
        var fold = bar.querySelector('[data-dps-action=toggle-all]');
        var groupKeys = Array.from(new Set(rows.map(function (row) { return row.groupNode.getAttribute('data-plugin-group'); })));
        var allClosed = groupKeys.every(isCollapsed) && (!pins.length || !cfg.showPinned || isCollapsed('quick'));
        attr(fold, 'data-close', String(!allClosed)); attr(fold, 'aria-label', t(allClosed ? 'expandAll' : 'collapseAll')); text(fold.querySelector('span'), t(allClosed ? 'expandAll' : 'collapseAll'));
        var undo = bar.querySelector('.dps-undo'); undo.hidden = !undoPin; text(undo.querySelector('span'), undoPin ? t('removedPin', { name: undoPin.title }) : '');
        var metadataNote = bar.querySelector('.dps-metadata-note'); metadataNote.hidden = metadataState !== 'error'; text(metadataNote, t('metadataError'));

      }
      function shortcuts(page, rows) {
        var box = page.querySelector(':scope > .dps-quick');
        var active = document.activeElement, focused = box && box.contains(active) ? { action: active.getAttribute('data-dps-action'), key: active.getAttribute('data-dps-key') } : null;
        var selected = pins.map(function (key) { return rows.find(function (row) { return row.key === key; }); }).filter(function (row) { return row && searchMatches(row) && matches(row, filter); });
        if (!cfg.showPinned || !selected.length) { if (box) box.remove(); if (focused) page.querySelector('[data-dps-action=toggle-all]')?.focus(); return; }
        var collapsed = isCollapsed('quick');
        var fingerprint = JSON.stringify([ctx.locale.getSnapshot().active, collapsed, selected.map(function (row) { return [row.key, row.title, row.state]; })]);
        if (box && box.getAttribute('data-fingerprint') === fingerprint) return;
        if (!box) { box = element('section', 'dps-quick'); page.querySelector('.dps-tools').after(box); }
        box.replaceChildren(); attr(box, 'data-fingerprint', fingerprint); attr(box, 'aria-label', t('quick'));
        var head = element('div', 'dps-quick-head'); var fold = button('collapse', undefined, 'dps-collapse'); attr(fold, 'data-group', 'quick'); attr(fold, 'aria-expanded', String(!collapsed)); fold.appendChild(icon('chevron')); fold.appendChild(element('span', '', t('quick'))); fold.appendChild(element('span', 'dps-number', String(selected.length))); head.appendChild(fold); head.appendChild(element('span', 'dps-muted', t('quickHint'))); box.appendChild(head);
        var list = element('div', 'dps-shortcuts'); list.hidden = collapsed;
        selected.forEach(function (row) {
          var item = element('div', 'dps-shortcut'), btn = button('open', undefined, 'dps-shortcut-open'); attr(btn, 'data-dps-key', row.key); attr(btn, 'title', row.id);
          var logo = element('span', 'dps-shortcut-logo'); var image = row.head.firstElementChild.querySelector('img');
          if (image) { var clone = element('img'); clone.src = image.src; clone.alt = ''; logo.appendChild(clone); }
          else { var original = row.head.firstElementChild.querySelector('svg'); var svg = original ? original.cloneNode(true) : icon('grid');
            svg.querySelectorAll('script,style,foreignObject').forEach(function (node) { node.remove(); });
            [svg].concat(Array.from(svg.querySelectorAll('*'))).forEach(function (node) { Array.from(node.attributes).forEach(function (a) { if (a.name === 'id' || /^on/i.test(a.name) || /url\(/i.test(a.value) || a.name === 'href' || a.name === 'xlink:href') node.removeAttribute(a.name); }); });
            svg.setAttribute('aria-hidden', 'true'); logo.appendChild(svg); }
          issueMarker(logo, row.state); btn.appendChild(logo); btn.appendChild(element('span', '', row.title)); item.appendChild(btn);
          var remove = button('pin', undefined, 'dps-unpin'); attr(remove, 'data-dps-key', row.key); attr(remove, 'aria-label', t('unpin') + ' ' + row.title); attr(remove, 'title', t('unpin')); remove.appendChild(icon('pin')); item.appendChild(remove); list.appendChild(item);
        }); box.appendChild(list);
        if (focused) {
          var next = Array.from(box.querySelectorAll('[data-dps-action]')).find(function (node) { return node.getAttribute('data-dps-action') === focused.action && node.getAttribute('data-dps-key') === focused.key && canFocus(node); });
          (next || (undoPin ? page.querySelector('[data-dps-action=undo-pin]') : null) || box.querySelector('.dps-collapse')).focus();
        }
      }
      function cleanup(page) {
        if (closeSort) closeSort();
        if (!page.hasAttribute('data-dps-page') && !page.querySelector(':scope > .dps-tools')) return;
        page.querySelectorAll(':scope > .dps-tools,:scope > .dps-quick,:scope > .dps-empty,[data-dps-card] .dps-pin,[data-dps-card] .dps-end,[data-dps-card] .dps-footer,[data-dps-card] .dps-issue,.dps-group-count,.dps-collapse').forEach(function (el) { el.remove(); });
        page.querySelectorAll('.dps-native-heading').forEach(function (el) { el.classList.remove('dps-native-heading'); });
        page.querySelectorAll('.dps-native-count').forEach(function (el) { el.classList.remove('dps-native-count'); });
        [page].concat(Array.from(page.querySelectorAll('*'))).forEach(function (el) {
          Array.from(el.attributes).forEach(function (a) { if (a.name.indexOf('data-dps-') === 0) el.removeAttribute(a.name); });
          if (originalOrders.has(el)) { el.style.order = originalOrders.get(el); originalOrders.delete(el); }
        });
      }
      function enhance() {
        if (!alive) return;
        observer.disconnect();
        try {
          var pages = document.querySelectorAll('[data-plugin-panel]');
          if (!pages.length) activePage = null;
          if (closeSort && !document.querySelector('.dps-sort[aria-expanded=true]')) closeSort();
          pages.forEach(function (page) {
            if (activePage !== page) { activePage = page; if (!cfg.remember) { query = ''; filter = 'all'; focusCollapsed = {}; } }
            var rows = rowsFor(page);
            if (!cfg.enabled || !rows.length || !page.querySelector(':scope > header')) { cleanup(page); return; }
            var nextKey = rows.map(function (row) { return row.key; }).sort().join('|');
            ensureMetadata(nextKey);
            migratePins(rows);
            var currentKeys = new Set(rows.map(function (row) { return row.key; }));
            catalog.forEach(function (_, key) { if (!currentKeys.has(key)) catalog.delete(key); });
            var changed = false; rows.forEach(function (row) {
              var previous = catalog.get(row.key); if (!previous || previous.title !== row.title || previous.state !== row.state) changed = true;
              catalog.set(row.key, { title: row.title, id: row.id, state: row.state });
            });
            mark(page, 'data-dps-page', true); attr(page, 'data-dps-view', cfg.view); attr(page, 'data-dps-density', cfg.density); attr(page, 'data-dps-description', String(cfg.showDescription));
            toolbar(page, rows); shortcuts(page, rows);
            var sorted = rows.slice().sort(function (a, b) {
              var aPin = pins.indexOf(a.key), bPin = pins.indexOf(b.key);
              var pinOrder = Number(bPin >= 0) - Number(aPin >= 0);
              if (pinOrder) return pinOrder;
              if (aPin >= 0 && bPin >= 0) return aPin - bPin;
              if (cfg.sort === 'installed-new' || cfg.sort === 'installed-old') {
                if (a.installedAt === null && b.installedAt !== null) return 1; if (b.installedAt === null && a.installedAt !== null) return -1;
                if (a.installedAt !== b.installedAt) return (a.installedAt - b.installedAt) * (cfg.sort === 'installed-new' ? -1 : 1);
              }
              if (cfg.sort === 'name') return a.title.localeCompare(b.title, ctx.locale.getSnapshot().active) || a.index - b.index;
              if (cfg.sort === 'enabled') return Number(b.state === 'running') - Number(a.state === 'running') || a.index - b.index;
              return a.index - b.index;
            });
            sorted.forEach(decorate);
            page.querySelectorAll('[data-plugin-group]').forEach(function (group) {
              var list = group.querySelector(':scope > ul'); if (!list) return;
              mark(list, 'data-dps-list', true);
              var subset = rows.filter(function (row) { return row.groupNode === group; });
              var shown = subset.filter(function (row) { return !row.li.hasAttribute('data-dps-hidden'); }).length;
              mark(group, 'data-dps-group-hidden', shown === 0);
              foldGroup(group);
              var nativeCount = group.querySelector('[data-plugin-count]'); if (nativeCount) {
                nativeCount.classList.add('dps-native-count'); var count = nativeCount.parentElement.querySelector('.dps-group-count');
                if (!count) { count = element('span', 'dps-group-count'); nativeCount.after(count); }
                text(count, shown === subset.length ? String(shown) : shown + ' / ' + subset.length);
              }
            });
            var empty = page.querySelector(':scope > .dps-empty');
            if (!rows.some(function (row) { return !row.li.hasAttribute('data-dps-hidden'); })) {
              if (!empty) { empty = element('div', 'dps-empty'); page.appendChild(empty); }
              if (empty.getAttribute('data-language') !== ctx.locale.getSnapshot().active) {
                empty.replaceChildren(element('strong', '', t('empty')), element('p', '', t('emptyHint')), button('reset', t('resetFilter'))); attr(empty, 'data-language', ctx.locale.getSnapshot().active);
              }
            } else if (empty) empty.remove();
            var active = document.activeElement;
            if (page.contains(active) && active.matches(FOCUSABLE) && !canFocus(active)) {
              var nextFocus = undoPin ? page.querySelector('[data-dps-action=undo-pin]') : visualFocusOrder(page)[0];
              if (nextFocus) nextFocus.focus();
            }
            if (changed) notify();
          });
          originalOrders.forEach(function (_, el) { if (!el.isConnected) originalOrders.delete(el); });
        } finally { if (alive) observe(); }
      }
      function schedule() {
        if (!alive || frame !== null) return;
        try { if (cfg.remember) window.localStorage.setItem(NS + '.browsing', JSON.stringify({query: query, filter: filter})); else window.localStorage.removeItem(NS + '.browsing'); } catch (_) {}
        frame = window.requestAnimationFrame(function () { frame = null; enhance(); });
      }
      function observe() { observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-checked', 'data-plugin-status'] }); }
      function click(event) {
        var el = event.target.closest && event.target.closest('[data-dps-action]');
        if (!el || !el.closest('[data-plugin-panel]')) {
          if (event.target.closest && event.target.closest('[data-dps-page]>header button')) { metadataKey = null; schedule(); }
          document.querySelectorAll('.dps-more[open]').forEach(function (more) { if (!more.contains(event.target)) more.open = false; });
          return;
        }
        event.preventDefault(); event.stopPropagation();
        var action = el.getAttribute('data-dps-action');
        var more = el.closest('.dps-more'); if (more) { more.open = false; more.querySelector('summary').focus(); }
        if (action === 'pin') togglePin(el.getAttribute('data-dps-key'));
        if (action === 'undo-pin') restorePin();
        if (action === 'retry-save') retrySave();
        if (action === 'filter') { filter = el.getAttribute('data-filter'); focusCollapsed = {}; schedule(); }
        if (action === 'collapse') { var group = el.getAttribute('data-group'), closed = !isCollapsed(group); if (query.trim() || filter !== 'all') { focusCollapsed[group] = closed; schedule(); } else update({ collapsed: setGroupCollapsed(group, closed) }); }
        if (action === 'toggle-all') {
          var close = el.getAttribute('data-close') === 'true';
          var groupKeys = Array.from(new Set(rowsFor(el.closest('[data-plugin-panel]')).map(function (row) { return row.groupNode.getAttribute('data-plugin-group'); })));
          if (pins.length && cfg.showPinned) groupKeys.push('quick');
          focusCollapsed = close ? groupKeys.reduce(function (all, key) { all[key] = true; return all; }, {}) : {};
          update({ collapsed: close ? groupKeys : [] });
        }
        if (action === 'metadata') { metadataKey = null; schedule(); }
        if (action === 'view') update({ view: el.getAttribute('data-view') });
        if (action === 'clear' || action === 'reset') { query = ''; focusCollapsed = {}; if (action === 'reset') filter = 'all'; schedule(); }
        if (action === 'open') {
          var row = rowsFor(el.closest('[data-plugin-panel]')).find(function (r) { return r.key === el.getAttribute('data-dps-key'); });
          if (row) row.titleNode.click();
        }
        if (action === 'open-settings') {
          var settings = rowsFor(el.closest('[data-plugin-panel]')).find(function (row) { return row.id === 'dsh-plugin-shelf'; });
          if (settings) settings.titleNode.click();
        }
      }
      function input(event) {
        if (event.target.matches('.dps-search')) { query = event.target.value; focusCollapsed = {}; schedule(); }

      }
      var FOCUSABLE = 'a[href],button,input,select,textarea,summary,[tabindex],[contenteditable=true]';
      function canFocus(node) {
        if (!node.matches(FOCUSABLE) || node.disabled || node.tabIndex < 0 || node.closest('[inert]')) return false;
        var details = node.closest('details:not([open])'); if (details && node !== details.querySelector(':scope > summary')) return false;
        for (var el = node; el; el = el.parentElement) {
          if (el.hidden) return false;
          var style = window.getComputedStyle(el); if (style.display === 'none' || style.visibility === 'hidden') return false;
        }
        return true;
      }
      function visualFocusOrder(page) {
        var out = [];
        function visit(node) {
          if (canFocus(node)) out.push(node);
          var children = Array.from(node.children);
          if (node.hasAttribute('data-dps-list')) children.sort(function (a, b) { return Number(a.style.order || 0) - Number(b.style.order || 0); });
          children.forEach(visit);
        }
        visit(page); return out;
      }
      function keydown(event) {
        var page = event.target.closest && event.target.closest('[data-dps-page]');
        if (event.key === 'Escape') {
          var more = event.target.closest && event.target.closest('.dps-more[open]');
          if (more) { event.preventDefault(); event.stopPropagation(); more.open = false; more.querySelector('summary').focus(); return; }
          if (event.target.matches('.dps-search') && query) { event.preventDefault(); event.stopPropagation(); query = ''; focusCollapsed = {}; event.target.value = ''; schedule(); }
          return;
        }
        if (event.key !== 'Tab' || !page || event.altKey || event.ctrlKey || event.metaKey) return;
        var nodes = visualFocusOrder(page), index = nodes.indexOf(event.target);
        if (index < 0) return;
        var next = nodes[index + (event.shiftKey ? -1 : 1)];
        if (!next) {
          var outside = Array.from(document.querySelectorAll(FOCUSABLE)).filter(function (node) { return !page.contains(node) && canFocus(node); });
          var candidates = outside.filter(function (node) { return page.compareDocumentPosition(node) & (event.shiftKey ? 2 : 4); });
          next = event.shiftKey ? candidates[candidates.length - 1] : candidates[0];
          if (!next) next = event.shiftKey ? outside[outside.length - 1] || nodes[nodes.length - 1] : outside[0] || nodes[0];
        }
        if (next) { event.preventDefault(); event.stopPropagation(); next.focus(); }
      }
      function storage(event) {
        if (event.key !== null && event.key !== CONFIG && event.key !== PINS) return;
        if (event.key === null || event.key === PINS) clearUndo();
        if ((event.key === null || event.key === CONFIG) && !failedSaves.has(CONFIG)) cfg = normalize(json(CONFIG, DEFAULTS));
        if ((event.key === null || event.key === PINS) && !failedSaves.has(PINS)) pins = cleanPins(json(PINS, []));
        if (!cfg.search) query = ''; notify(); schedule(); refreshSidebar();
      }
      var h = React.createElement;
      function reactIcon(name) { return h('svg', { className: 'dps-icon', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }, h('path', { d: PATHS[name] })); }
      function sortControl() {
        var trigger = element('button', 'dps-sort'); trigger.type = 'button';
        attr(trigger, 'role', 'combobox'); attr(trigger, 'aria-haspopup', 'listbox'); attr(trigger, 'aria-label', t('sort')); attr(trigger, 'aria-expanded', 'false');
        trigger.sync = function () { text(trigger, t(cfg.sort === 'enabled' ? 'enabledFirst' : cfg.sort) + ' ⌄'); };
        function open(initial) {
          if (closeSort) closeSort();
          var values = ['default', 'name', 'enabled', 'installed-new', 'installed-old'], index = initial === 'last' ? values.length - 1 : values.indexOf(cfg.sort), prefix = '', stamp = 0;
          var menu = element('div', 'dps-sort-menu'); attr(menu, 'data-plugin', 'dsh-plugin-shelf'); attr(menu, 'role', 'listbox'); attr(menu, 'aria-label', t('sort')); menu.id = 'dps-sort-' + (++sortSerial);
          attr(trigger, 'aria-controls', menu.id); attr(trigger, 'aria-expanded', 'true');
          var options = values.map(function (value, i) { var option = element('button', 'dps-sort-option', t(value === 'enabled' ? 'enabledFirst' : value)); option.type = 'button'; option.tabIndex = -1; option.id = menu.id + '-' + i; attr(option, 'role', 'option'); attr(option, 'aria-selected', String(cfg.sort === value));
            option.addEventListener('pointermove', function () { index = i; highlight(); });
            option.addEventListener('mousedown', function (event) { event.preventDefault(); });
            option.addEventListener('click', function () { choose(i); }); menu.appendChild(option); return option; });
          function highlight() { options.forEach(function (option, i) { attr(option, 'data-active', String(i === index)); }); attr(trigger, 'aria-activedescendant', options[index].id); options[index].scrollIntoView?.({block:'nearest'}); }
          function position() { if (!trigger.isConnected || trigger.closest('details:not([open])')) { close(); return; } var r = trigger.getBoundingClientRect(), width = Math.min(Math.max(r.width, 210), window.innerWidth - 16); menu.style.width = width + 'px'; menu.style.maxHeight = Math.max(80, Math.min(240, Math.max(window.innerHeight-r.bottom-16,r.top-16))) + 'px'; var height = menu.getBoundingClientRect().height; menu.style.left = Math.max(8,Math.min(r.left,window.innerWidth-width-8))+'px'; menu.style.top = Math.max(8,r.bottom+6+height <= window.innerHeight-8 ? r.bottom+6 : r.top-height-6)+'px'; }
          function choose(i) { update({sort:values[i]}); close(); trigger.sync(); trigger.focus(); }
          function outside(event) { if (event.target?.nodeType && !trigger.contains(event.target) && !menu.contains(event.target)) close(); }
          function key(event) {
            if (event.key === 'Tab') { close(); return; }
            if (['ArrowDown','ArrowUp','Home','End','Enter',' ','Escape'].includes(event.key)) { event.preventDefault(); event.stopImmediatePropagation();
              if (event.key === 'Escape') { close(); return; } if (event.key === 'Enter' || event.key === ' ') { choose(index); return; }
              index = event.key === 'Home' ? 0 : event.key === 'End' ? values.length-1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + values.length) % values.length; highlight();
            } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) { var now = Date.now(); prefix = now-stamp > 700 ? event.key : prefix+event.key; stamp = now; var found = options.findIndex(function (option) { return option.textContent.toLocaleLowerCase().startsWith(prefix.toLocaleLowerCase()); }); if (found >= 0) { event.preventDefault(); index=found; highlight(); } }
          }
          function close() { menu.remove(); attr(trigger,'aria-expanded','false'); trigger.removeAttribute('aria-controls'); trigger.removeAttribute('aria-activedescendant'); document.removeEventListener('keydown',key,true); document.removeEventListener('pointerdown',outside,true); document.removeEventListener('focusin',outside,true); document.removeEventListener('toggle',position,true); window.removeEventListener('resize',position); window.removeEventListener('scroll',position,true); if (closeSort === close) closeSort=null; }
          closeSort=close; document.body.appendChild(menu); position(); highlight(); document.addEventListener('keydown',key,true); document.addEventListener('pointerdown',outside,true); document.addEventListener('focusin',outside,true); document.addEventListener('toggle',position,true); window.addEventListener('resize',position); window.addEventListener('scroll',position,true);
        }
        trigger.addEventListener('click', function () { if (trigger.getAttribute('aria-expanded') === 'true') closeSort(); else open(); });
        trigger.addEventListener('keydown',function (event) { if (['ArrowDown','ArrowUp','Home','End'].includes(event.key) && trigger.getAttribute('aria-expanded') !== 'true') { event.preventDefault(); event.stopPropagation(); open(event.key === 'End' ? 'last' : undefined); } });
        trigger.sync(); return trigger;
      }
      function SortSetting() {
        var ref = React.useRef(null);
        React.useLayoutEffect(function () { var node=sortControl(); ref.current.appendChild(node); return function () { if(node.getAttribute('aria-expanded')==='true' && closeSort) closeSort(); node.remove(); }; }, []);
        React.useLayoutEffect(function () { ref.current.firstChild?.sync(); });
        return h('div', {ref:ref,className:'dps-sort-setting'});
      }
      function parseBackup(raw) {
        if (typeof raw !== 'string' || new window.Blob([raw]).size > 131072) throw Error(t('invalidBackup'));
        var data=JSON.parse(raw);
        if (!data || data.schema !== 'dsh-plugin-shelf/preferences/v1' || !data.config || Array.isArray(data.config) || !Array.isArray(data.pins) || data.pins.length > 1000 || data.pins.some(function (pin) { return typeof pin !== 'string' || !/^(pkg|item):.{1,240}$/.test(pin); })) throw Error(t('invalidBackup'));
        var normalized=normalize(data.config);
        Object.keys(DEFAULTS).forEach(function(key) { if (key in data.config && JSON.stringify(normalized[key]) !== JSON.stringify(data.config[key])) throw Error(t('invalidBackup')); });
        return {config:normalized,pins:cleanPins(data.pins)};
      }
      function BackupSettings() {
        var state=React.useState(''), raw=state[0], setRaw=state[1], status=React.useState(''), message=status[0], setMessage=status[1], undo=React.useState(null), previous=undo[0], setPrevious=undo[1], inputRef=React.useRef(null), parsed=null;
        try { if(raw) parsed=parseBackup(raw); } catch (_) {}
        function load(value) { setRaw(value); setMessage(''); }
        function applyImport(replace) { if(!parsed) return; setPrevious({config:cfg,pins:pins.slice()}); clearUndo(); savePins(replace ? parsed.pins : cleanPins(pins.concat(parsed.pins))); update(replace ? parsed.config : {collapsed:Array.from(new Set(cfg.collapsed.concat(parsed.config.collapsed)))}); setMessage(t('imported')); setRaw(''); }
        function download() { try { var blob=new window.Blob([JSON.stringify({schema:'dsh-plugin-shelf/preferences/v1',config:cfg,pins:pins},null,2)],{type:'application/json'}), url=window.URL.createObjectURL(blob), a=element('a'); a.href=url; a.download='dsh-plugin-shelf-preferences.json'; a.click(); window.setTimeout(function(){window.URL.revokeObjectURL(url);},1000); setMessage(''); } catch (_) { setMessage(t('exportFailed')); } }
        return h('details',{className:'dps-settings-section dps-disclosure'},h('summary',null,t('backup')),h('p',{className:'dps-muted'},t('backupHint')),
          h('div',{className:'dps-actions'},h('button',{type:'button',className:'dps-secondary',onClick:download},t('export')),h('button',{type:'button',className:'dps-secondary',onClick:function(){inputRef.current.click();}},t('import')),h('input',{ref:inputRef,type:'file',accept:'.json,application/json',hidden:true,onChange:async function(e){var file=e.target.files?.[0]; e.target.value=''; if(!file)return; try { if(file.size>131072) throw Error(); load(await file.text()); } catch(_){setMessage(t('invalidBackup'));}}})),
          h('textarea',{'aria-label':t('paste'),placeholder:t('paste'),value:raw,maxLength:131073,onChange:function(e){load(e.target.value);}}),
          raw ? h('p',{role:'status',className:'dps-muted'},parsed ? t('importPreview',{pins:parsed.pins.length,groups:parsed.config.collapsed.length,view:t(parsed.config.view)}) : t('invalidBackup')) : null,
          parsed ? h('div',null,h('p',{className:'dps-muted'},t('mergeHint')),h('div',{className:'dps-actions'},h('button',{type:'button',className:'dps-secondary',onClick:function(){applyImport(false);}},t('merge')),h('button',{type:'button',className:'dps-secondary',onClick:function(){applyImport(true);}},t('replace')))) : null,
          message ? h('p',{role:'status'},message) : null, previous ? h('button',{type:'button',onClick:function(){clearUndo(); savePins(previous.pins); update(previous.config); setPrevious(null);setMessage('');}},t('undoImport')) : null);
      }
      function Settings() {
        var force = React.useState(0)[1]; var confirmState = React.useState(false), confirming = confirmState[0], setConfirm = confirmState[1];
        var nameState = React.useState(''), linkName = nameState[0], setLinkName = nameState[1];
        var urlState = React.useState(''), linkUrl = urlState[0], setLinkUrl = urlState[1];
        var linkErrorState = React.useState(false), linkError = linkErrorState[0], setLinkError = linkErrorState[1];
        React.useEffect(function () { var rerender = function () { force(function (x) { return x + 1; }); }; listeners.add(rerender); return function () { listeners.delete(rerender); }; }, []);
        function row(label, hint, control) { return h('div', { className: 'dps-setting-row' }, h('div', { className: 'dps-setting-copy' }, label, hint ? h('small', null, hint) : null), control); }
        function toggle(key, label, hint) { return row(t(label), t(hint), h('button', { type: 'button', role: 'switch', className: 'dps-switch', 'aria-label': t(label), 'aria-checked': cfg[key], onClick: function () { var next = {}; next[key] = !cfg[key]; update(next); } }, h('span'))); }
        function choices(key, values, labels) {
          return h('div', { className: 'dps-choice', role: 'group', 'aria-label': t(key === 'view' ? 'layout' : key) }, values.map(function (value, i) {
            return h('button', { type: 'button', key: value, 'aria-pressed': cfg[key] === value, onClick: function () { var next = {}; next[key] = value; update(next); } }, t(labels ? labels[i] : value));
          }));
        }
        function shortcutField(id, label) { return h('input', { type:'text', readOnly:true, className:'dps-shortcut-capture', value:prettyShortcut(cfg.sidebarShortcuts[id] || ''), placeholder:t('shortcutCapture'), title:t('shortcutHint'), 'aria-label':t('shortcut')+' '+label, onKeyDown:function(event){sidebarShortcutInput(event,id);} }); }
        function addSidebarLink() {
          var label = linkName.trim(), url = linkUrl.trim();
          if (!label || !safeSidebarUrl(url)) { setLinkError(true); return; }
          var id = 'link-' + Math.random().toString(36).slice(2, 11);
          update({ sidebarLinks:cfg.sidebarLinks.concat([{id:id,label:label,url:url}]) }); setLinkName(''); setLinkUrl(''); setLinkError(false);
        }
        return h('div', { className: 'dps-settings' },
          h('section', { className:'dps-settings-section' },
            h('div',{className:'dps-section-heading'},h('h3',null,t('display')),h('button',{type:'button',className:'dps-reset',onClick:function(){update(Object.assign({},DEFAULTS,{collapsed:cfg.collapsed,sidebarMore:cfg.sidebarMore,sidebarOrder:cfg.sidebarOrder,sidebarShortcuts:cfg.sidebarShortcuts,sidebarLinks:cfg.sidebarLinks}));}},t('restore'))),
            toggle('enabled','enhance',''),
            cfg.enabled ? h('div',{className:'dps-appearance'},
              h('div',{className:'dps-preview','data-view':cfg.view,'data-density':cfg.density,'data-description':String(cfg.showDescription),'aria-label':t('preview')},h('span',{className:'dps-muted'},t('preview')),h('div',{className:'dps-preview-cards'},[true,false].map(function(running,i){return h('div',{key:i,className:'dps-preview-card'},h('div',{className:'dps-preview-head'},h('span',{className:'dps-preview-icon'},reactIcon('grid')),h('div',{className:'dps-preview-main'},h('strong',{className:'dps-preview-title'},t('previewName')+' '+(i+1)),cfg.showDescription ? h('p',{className:'dps-preview-desc'},t('previewDesc')) : null,h('div',{className:'dps-footer'},h('span',{className:'dps-status','data-state':running?'running':'disabled'},t(running?'enabled':'disabled')),h('span',{className:'dps-metadata'},[cfg.showVersion?'v0.7.0':'',cfg.showDate?t('installedOn',{date:'10/12'}):''].filter(Boolean).join(' · ')))),h('div',{className:'dps-preview-end'},h('button',{className:'dps-pin',type:'button',disabled:true,'aria-label':t('previewPin'),'aria-pressed':i===0},reactIcon('pin')),h('button',{className:'dps-switch',type:'button',role:'switch',disabled:true,'aria-label':t('previewSwitch'),'aria-checked':running},h('span')))));}))),
              h('div',{className:'dps-common'},row(t('layout'),null,choices('view',['grid','list','minimal'])),row(t('density'),null,choices('density',['compact','standard','spacious'])),row(t('sort'),null,h(SortSetting)))) : h('p',{className:'dps-muted'},t('enhanceHint'))),
          cfg.enabled ? h('details',{className:'dps-settings-section dps-disclosure'},h('summary',null,t('browse')),
            h('div',{className:'dps-toggle-grid'},toggle('search','searchToggle',''),toggle('dimOff','dim',''),toggle('showPinned','quickToggle',''),toggle('remember','remember','')),
            h('p',{className:'dps-muted'},t('rememberHint')),
            h('h3',{style:{marginTop:12}},t('information')),
            h('div',{className:'dps-toggle-grid'},['showDescription','showVersion','showDate'].map(function(key){return h('div',{key:key},toggle(key,key,''));})),
            h('p',{className:'dps-muted'},cfg.view==='minimal' ? t('minimal')+' · Logo / '+t('pluginName')+' / '+t('pin')+' / '+t('enabled') : t('timeHint'))) : null,
          h('details', { className:'dps-settings-section dps-disclosure' },h('summary',null,t('favorites')+' · '+pins.length),
            h('p', { className: 'dps-muted' }, t('pinOrderHint')),
            pins.length ? h('ul', { className: 'dps-pins-list' }, pins.map(function (key, index) { var item = catalog.get(key), label = item ? item.title : key.replace(/^(pkg|item):/, ''); return h('li', { key: key }, h('div', null, label, h('small', null, item ? item.id : t('unavailable'))), h('div', { className: 'dps-pin-actions' },
              h('button', { type: 'button', disabled: index === 0, 'aria-label': t('moveUp') + ' ' + label, onClick: function () { movePin(key, -1); } }, t('moveUp')),
              h('button', { type: 'button', disabled: index === pins.length - 1, 'aria-label': t('moveDown') + ' ' + label, onClick: function () { movePin(key, 1); } }, t('moveDown')),
              h('button', { type: 'button', 'aria-label': t('remove') + ' ' + label, onClick: function () { togglePin(key); } }, t('remove')))); })) : h('div', null, h('p', null, t('noPins')), h('p', { className: 'dps-muted', style: { marginTop: 6 } }, t('pinHint'))),
            undoPin ? h('div', { className: 'dps-undo', role: 'status' }, h('span', null, t('removedPin', { name: undoPin.title })), h('button', { type: 'button', onClick: restorePin }, t('undo'))) : null,
            pins.length && !confirming ? h('button', { type: 'button', className: 'dps-secondary', style: { marginTop: 12 }, onClick: function () { setConfirm(true); } }, t('clearPins')) : null,
            pins.length && confirming ? h('div', { className: 'dps-confirm' }, h('p', null, t('clearAsk')), h('div', { className: 'dps-actions' }, h('button', { type: 'button', className: 'dps-secondary dps-danger', onClick: function () { clearUndo(); savePins([]); setConfirm(false); } }, t('confirm')), h('button', { type: 'button', onClick: function () { setConfirm(false); } }, t('cancel')))) : null),
          h('details', { className:'dps-settings-section dps-disclosure' }, h('summary', null, t('sidebar') + ' · ' + movableSidebarEntries().length),
            h('p', { className:'dps-muted' }, t('sidebarHint')),
            movableSidebarEntries().length ? h('ul', { className:'dps-pins-list' }, orderedSidebarEntries().map(function (entry, index) {
              var inMore = cfg.sidebarMore.indexOf(entry.id) >= 0;
              return h('li', { key:entry.id }, h('div', null, entry.label, h('small', null, entry.registrant), h('div',{className:'dps-shortcut-setting'},h('span',{className:'dps-muted'},t('shortcut')),shortcutField(entry.id,entry.label))), h('div', { className:'dps-pin-actions' },
                h('button', { type:'button', role:'switch', className:'dps-switch', 'aria-label':t('sidebarOverflow') + ' ' + entry.label, 'aria-checked':inMore, onClick:function(){ toggleSidebarOverflow(entry.id); } }, h('span')),
                h('button', { type:'button', disabled:index===0, 'aria-label':t('sidebarMoveUp')+' '+entry.label, onClick:function(){ moveSidebarEntry(entry.id,-1); } }, t('sidebarMoveUp')),
                h('button', { type:'button', disabled:index===sidebarEntries.length-1, 'aria-label':t('sidebarMoveDown')+' '+entry.label, onClick:function(){ moveSidebarEntry(entry.id,1); } }, t('sidebarMoveDown'))));
            })) : h('div', null, h('p', null, t('sidebarEmpty')), h('p', { className:'dps-muted' }, t('sidebarEmptyHint'))),
            h('details',{className:'dps-sidebar-links'},h('summary',null,t('customLinks')+' · '+cfg.sidebarLinks.length),
              h('div',{className:'dps-link-form'},h('input',{type:'text',maxLength:60,value:linkName,placeholder:t('linkLabel'), 'aria-label':t('linkLabel'),onChange:function(e){setLinkName(e.target.value);setLinkError(false);}}),h('input',{type:'url',maxLength:2048,value:linkUrl,placeholder:t('linkUrl'),'aria-label':t('linkUrl'),onChange:function(e){setLinkUrl(e.target.value);setLinkError(false);}}),h('button',{type:'button',className:'dps-secondary',disabled:!linkName.trim()||!safeSidebarUrl(linkUrl.trim()),onClick:addSidebarLink},t('addLink'))),
              linkError ? h('p',{className:'dps-link-error',role:'alert'},t('linkInvalid')) : null,
              cfg.sidebarLinks.length ? h('ul',{className:'dps-pins-list'},cfg.sidebarLinks.map(function(link){return h('li',{key:link.id},h('div',null,link.label,h('small',null,link.url),h('div',{className:'dps-shortcut-setting'},h('span',{className:'dps-muted'},t('shortcut')),shortcutField(link.id,link.label))),h('button',{type:'button','aria-label':t('removeLink')+' '+link.label,onClick:function(){update({sidebarLinks:cfg.sidebarLinks.filter(function(item){return item.id!==link.id;})});}},t('removeLink')));})) : h('p',{className:'dps-muted'},t('sidebarEmptyHint')))),
          storageFailed ? h('div', { className: 'dps-storage', role: 'status' }, h('span', null, storageMessage()), h('button', { type: 'button', onClick: retrySave }, t('retrySave'))) : null,
          h(BackupSettings), h('div',{className:'dps-settings-footer'},h('span',{className:'dps-muted'},t(storageFailed?'pendingSave':'saved'))),
          h('p', { className: 'dps-muted' }, t('native')));
      }
      ctx.effect(function () {
        // The host claims every unowned style when another module materializes.
        // Tag apply-time styles too, so a foreign refresh cannot remove them.
        var tag = element('style'); tag.setAttribute('data-plugin', 'dsh-plugin-shelf'); tag.setAttribute('data-dps-style', '0.7.0'); tag.textContent = CSS; document.head.appendChild(tag);
        return function () { tag.remove(); };
      }, 'plugin-shelf: scoped styles');
      ctx.effect(function () {
        document.addEventListener('keydown', sidebarShortcutKeydown, true);
        observer = new window.MutationObserver(function (records) {
          var relevant = records.some(function (record) {
            if (record.target.closest && record.target.closest('[data-plugin-panel]')) return true;
            return Array.from(record.addedNodes).concat(Array.from(record.removedNodes)).some(function (node) { return node.nodeType === 1 && (node.matches('[data-plugin-panel]') || node.querySelector('[data-plugin-panel]')); });
          });
          if (records.some(function (record) {
            if (record.type !== 'childList' || (record.target.closest && record.target.closest('.dps-settings,.dps-tools,.dps-quick,.dps-empty'))) return false;
            if (record.target.closest && record.target.closest('[data-plugin-panel]')) return true;
            return Array.from(record.addedNodes).concat(Array.from(record.removedNodes)).some(function (node) { return node.nodeType === 1 && (node.matches('[data-plugin-panel]') || node.querySelector('[data-plugin-panel]')); });
          })) metadataKey = null;
          if (relevant) schedule();
        });
        observe(); document.addEventListener('click', click, true); document.addEventListener('input', input); document.addEventListener('change', input); document.addEventListener('keydown', keydown, true);
        window.addEventListener('storage', storage); window.addEventListener(EVENT, schedule); schedule();
        return function () {
          alive = false; if (closeSort) closeSort(); clearUndo(); requests.forEach(function (controller) { controller.abort(); }); requests.clear(); observer.disconnect(); if (frame !== null) window.cancelAnimationFrame(frame); frame = null;
          document.removeEventListener('click', click, true); document.removeEventListener('input', input); document.removeEventListener('change', input); document.removeEventListener('keydown', keydown, true);
          window.removeEventListener('storage', storage); window.removeEventListener(EVENT, schedule);
          document.querySelectorAll('[data-plugin-panel]').forEach(cleanup); originalOrders.clear(); listeners.clear();
        };
      }, 'plugin-shelf: native page adapter');
      ctx.effect(function () {
        sidebarObserver = new window.MutationObserver(function (records) {
          var nav = sidebarNav(), relevant = !nav && records.some(function (record) { return Array.from(record.addedNodes).some(function (node) { return node.nodeType === 1 && (node.matches('nav[aria-label]') || node.querySelector('nav[aria-label]')); }); });
          if (nav) relevant = records.some(function (record) { return record.target === nav || nav.contains(record.target) || Array.from(record.addedNodes).concat(Array.from(record.removedNodes)).some(function (node) { return node.nodeType === 1 && (node === nav || node.contains(nav)); }); });
          if (relevant) refreshSidebar();
        });
        sidebarObserver.observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:['aria-current','class'] });
        syncSidebarEntries();
        return function () {
          document.removeEventListener('keydown', sidebarShortcutKeydown, true); closeSidebarMenu(); if (sidebarObserver) sidebarObserver.disconnect(); sidebarObserver = null;
          if (sidebarDragBound) { document.removeEventListener('dragstart', sidebarDragStart); document.removeEventListener('dragend', sidebarDragEnd); document.removeEventListener('dragover', sidebarDragOver); document.removeEventListener('drop', sidebarDrop); window.removeEventListener('blur', sidebarDragCancel); document.removeEventListener('visibilitychange', sidebarDragCancel); sidebarDragBound = false; }
          document.querySelectorAll('[data-dps-sidebar-entry]').forEach(function (node) { node.removeAttribute('data-dps-sidebar-entry'); node.removeAttribute('data-dps-sidebar-overflow'); });
          document.querySelectorAll('[data-dps-drop-target],[data-dps-drop-before],[data-dps-drop-after],[data-dps-sidebar-dragging]').forEach(function (node) { node.removeAttribute('data-dps-drop-target'); node.removeAttribute('data-dps-drop-before'); node.removeAttribute('data-dps-drop-after'); node.removeAttribute('data-dps-sidebar-dragging'); });
          document.querySelectorAll('[data-dps-more-trigger]').forEach(function (node) { node.remove(); });
          if (sidebarMenu) sidebarMenu.remove(); sidebarMenu = null; if (sidebarDropZone) sidebarDropZone.remove(); sidebarDropZone = null;
          sidebarOriginalOrders.forEach(function (value, node) { if (node.isConnected) node.style.order = value; }); sidebarOriginalOrders.clear(); sidebarTargets.clear(); sidebarTrigger = null;
          sidebarOriginalDisplays.forEach(function (_, node) { if (node.isConnected) restoreSidebarDisplay(node); }); sidebarOriginalDisplays.clear(); sidebarOverflowHidden.clear();
          sidebarOriginalDraggables.forEach(function (value, node) { if (node.isConnected) { if (value === null) node.removeAttribute('draggable'); else node.setAttribute('draggable', value); } }); sidebarOriginalDraggables.clear();
        };
      }, 'plugin-shelf: sidebar organizer');
      ctx.effect(function () { return typeof ctx.slots.subscribe === 'function' ? ctx.slots.subscribe('sidebar.panellist', syncSidebarEntries) : undefined; }, 'plugin-shelf: sidebar entries');
      ctx.effect(function () { return ctx.locale.subscribe(function () { notify(); schedule(); closeSidebarMenu(); refreshSidebar(); }); }, 'plugin-shelf: active language');
      ctx.effect(function () { return ctx.locale.register(NS, DICT); }, 'plugin-shelf: dictionaries');
      ctx.effect(function () { return ctx.slots.inject('plugins.bundle.config', function () { return ctx.slots.register({ name: 'plugins.bundle.config', key: 'dsh-plugin-shelf', locale: NS }, Settings); }); }, 'plugin-shelf: plugin configuration');
    }
    return { name: 'plugin-shelf', inject: ['slots', 'locale'], apply: apply };
  }
});
