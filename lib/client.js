window.__ModuleLoader__ && typeof window.__ModuleLoader__.load === 'function' && window.__ModuleLoader__.load({
  id: 'dsh-plugin-shelf',
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

    var React = null;
    try { React = require('react') || null; } catch (e) { React = null; }

    // ───────────────────────── configuration ─────────────────────────
    var LS_KEY = 'liaoP…fig';
    var LS_PIN = 'liaoP…ines';
    var EVENT = 'liao-plugin-shelf/config-changed';
    var DEFAULTS = {
      enabled: true,    // 卡片视图总开关
      minWidth: 300,    // 每列最小宽度 px
      accent: true,     // 社区插件左侧色带
      search: true,     // 工具条上的搜索框
      dimOff: true,     // 停用卡片置灰
      sort: 'default',  // default | enabled | name
    };
    function readJson(key, fallback) {
      try {
        var raw = localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw);
      } catch (e) { return fallback; }
    }
    function readConfig() { return Object.assign({}, DEFAULTS, readJson(LS_KEY, {})); }
    function writeConfig(next) {
      try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch (e) {}
      window.dispatchEvent(new CustomEvent(EVENT));
    }
    function readPins() {
      var list = readJson(LS_PIN, []);
      return Array.isArray(list) ? list : [];
    }
    function togglePin(key) {
      var pins = readPins();
      var i = pins.indexOf(key);
      if (i >= 0) pins.splice(i, 1); else pins.push(key);
      try { localStorage.setItem(LS_PIN, JSON.stringify(pins)); } catch (e) {}
      window.dispatchEvent(new CustomEvent(EVENT));
    }

    // ───────────────────────── style ─────────────────────────
    var STYLE_ID = 'liao-plugin-shelf';
    // 类名来自 @deepseek-ai/dsh-client-ui-plugin-manager 构建产物（哈希前缀会变），
    // 全部用「包含匹配」：官方改名最多是不生效，不会报错。
    function buildCss(cfg) {
      return [
        'ul[class*="_cards"][data-dps-on="1"]{display:grid!important;',
        'grid-template-columns:repeat(auto-fill,minmax(' + (cfg.minWidth || 300) + 'px,1fr))!important;',
        'gap:10px!important;align-items:start!important}',
        'ul[class*="_cards"][data-dps-on="1"]>li{',
        'border:1px solid var(--dsw-alias-border-l2,rgba(128,128,128,.25))!important;',
        'background:var(--dsw-alias-bg-layer-1,rgba(128,128,128,.05))!important;',
        'border-radius:14px!important;margin:0!important}',
        'li[data-dps-hidden="1"]{display:none!important}',
        cfg.dimOff ? 'li[data-dps-disabled="1"]{opacity:.55}' : '',
        cfg.accent
          ? 'li[data-dps-community="1"]{border-left:3px solid color-mix(in srgb,var(--dsw-alias-state-business-primary,#4b6fff) 70%,transparent)!important}'
          : '',
        '.dps-search{border:1px solid var(--dsw-alias-border-l2,#8884);border-radius:10px;',
        'background:var(--dsw-alias-bg-layer-1,#8881);color:inherit;font:inherit;font-size:13px;',
        'padding:6px 10px;width:min(240px,40vw)}',
        '.dps-count{font-size:12px;opacity:.6;white-space:nowrap}',
        '.dps-pin{border:0;background:none;cursor:pointer;font-size:14px;line-height:1;',
        'color:var(--dsw-alias-label-caption,#888);padding:2px 4px;flex:none}',
        '.dps-pin:hover{color:var(--dsw-alias-label-secondary,#aaa)}',
        '.dps-pin[aria-pressed="true"]{color:#e8a33d}',
      ].join('');
    }
    function syncStyle() {
      var cfg = readConfig();
      var tag = document.getElementById(STYLE_ID);
      if (!cfg.enabled) { if (tag) tag.remove(); return; }
      if (!tag) {
        tag = document.createElement('style');
        tag.id = STYLE_ID;
        document.head.appendChild(tag);
      }
      tag.textContent = buildCss(cfg);
    }

    // ───────────────────────── i18n helpers ─────────────────────────
    function lang() {
      return ((typeof navigator !== 'undefined' && navigator.language) || 'en').toLowerCase();
    }
    var UI = {
      zh: {
        placeholder: '搜索插件，Esc 清除',
        count: function (a, b) { return a + ' / ' + b + ' 个'; },
        pinOn: '取消置顶', pinOff: '置顶',
      },
      en: {
        placeholder: 'Filter plugins, Esc to clear',
        count: function (a, b) { return a + ' / ' + b; },
        pinOn: 'Unpin', pinOff: 'Pin',
      },
    };
    function ui() { return lang().indexOf('zh') === 0 ? UI.zh : UI.en; }

    // ───────────────────────── page enhance ─────────────────────────
    var query = '';
    function isCommunity(li) {
      return !!li.querySelector('[aria-label*="卸载"],[aria-label*="ninstall"]');
    }
    function isEnabled(li) {
      var sw = li.querySelector('button[role="switch"]');
      return sw ? sw.getAttribute('aria-checked') !== 'false' : true;
    }
    function cardKey(li) {
      var btn = li.querySelector('button[class*="_cardTitle"], [class*="_cardTitle"]');
      var name = (btn && (btn.getAttribute('aria-label') || btn.textContent) || '').trim();
      return name || (li.textContent || '').slice(0, 60);
    }
    function pluginPages() {
      var lists = document.querySelectorAll('ul[class*="_cards"]');
      var pages = [];
      for (var i = 0; i < lists.length; i += 1) {
        var page = lists[i].closest('[class*="_page"]') || lists[i].parentElement;
        if (page && pages.indexOf(page) === -1) pages.push(page);
      }
      return pages;
    }
    function applyToPage() {
      var cfg = readConfig();
      var pins = readPins();
      var pages = pluginPages();
      for (var p = 0; p < pages.length; p += 1) {
        var lists = pages[p].querySelectorAll('ul[class*="_cards"]');
        for (var i = 0; i < lists.length; i += 1) {
          var list = lists[i];
          if (!cfg.enabled) {
            list.removeAttribute('data-dps-on');
            clearMarks(list);
            continue;
          }
          list.setAttribute('data-dps-on', '1');
          var items = Array.prototype.slice.call(list.querySelectorAll(':scope > li'));
          var rows = items.map(function (li, idx) {
            var key = cardKey(li);
            return {
              li: li, idx: idx, key: key,
              pinned: pins.indexOf(key) >= 0,
              enabled: isEnabled(li),
              title: key.toLowerCase(),
            };
          });
          // 标记：社区色带 / 停用置灰 / 过滤隐藏
          var q = query.trim().toLowerCase();
          var shown = 0;
          rows.forEach(function (r) {
            var li = r.li;
            if (cfg.accent && isCommunity(li)) li.setAttribute('data-dps-community', '1');
            else li.removeAttribute('data-dps-community');
            li.toggleAttribute('data-dps-disabled', cfg.dimOff ? !r.enabled : false);
            var hidden = false;
            if (q && (li.textContent || '').toLowerCase().indexOf(q) === -1) hidden = true;
            li.toggleAttribute('data-dps-hidden', hidden);
            if (!hidden) shown += 1;
            syncPinButton(li, r);
          });
          // 排序：只改 CSS order，不搬 DOM 节点（搬动会让 React 无限重渲染）
          var order = rows.slice();
          if (cfg.sort === 'enabled') order.sort(function (a, b) { return (a.enabled === b.enabled) ? a.idx - b.idx : (a.enabled ? -1 : 1); });
          else if (cfg.sort === 'name') order.sort(function (a, b) { return a.title.localeCompare(b.title); });
          order.sort(function (a, b) { return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0); }); // 稳定排序：置顶在前
          order.forEach(function (r, rank) { r.li.style.order = String(rank); });
          syncCount(pages[p], shown, rows.length, q);
        }
        syncToolbar(pages[p], cfg);
      }
    }
    function clearMarks(list) {
      var items = list.querySelectorAll(':scope > li');
      for (var j = 0; j < items.length; j += 1) {
        var li = items[j];
        li.removeAttribute('data-dps-hidden');
        li.removeAttribute('data-dps-disabled');
        li.removeAttribute('data-dps-community');
        li.style.order = '';
        var pin = li.querySelector('.dps-pin');
        if (pin) pin.remove();
      }
    }
    function syncPinButton(li, r) {
      // 有开关的卡片：星标放开关左边；没有开关的（终端等内置官方插件）：放卡片头最右。
      var host = li.querySelector('[class*="_cardEnd"]');
      var prepend = true;
      if (!host) { host = li.querySelector('[class*="_cardHead"]'); prepend = false; }
      if (!host) return;
      var btn = host.querySelector(':scope > .dps-pin');
      if (!btn) {
        btn = document.createElement('button');
        btn.className = 'dps-pin';
        btn.type = 'button';
      }
      if (prepend) { if (host.firstChild !== btn) host.insertBefore(btn, host.firstChild); }
      else if (host.lastChild !== btn) host.appendChild(btn);
      var t = ui();
      btn.setAttribute('data-dps-key', r.key);
      btn.setAttribute('aria-pressed', r.pinned ? 'true' : 'false');
      btn.setAttribute('aria-label', (r.pinned ? t.pinOn : t.pinOff) + ' ' + r.key);
      btn.title = r.pinned ? t.pinOn : t.pinOff;
      btn.textContent = r.pinned ? '★' : '☆';
    }
    function syncCount(page, shown, total, q) {
      var bar = page.querySelector('[class*="_toolbar"]');
      if (!bar) return;
      var el = bar.querySelector('.dps-count');
      if (!q) { if (el) el.remove(); return; }
      if (!el) {
        el = document.createElement('span');
        el.className = 'dps-count';
        bar.insertBefore(el, bar.firstChild);
      }
      el.textContent = ui().count(shown, total);
    }
    function syncToolbar(page, cfg) {
      var bar = page.querySelector('[class*="_toolbar"]');
      if (!bar) return;
      var input = bar.querySelector('.dps-search');
      if (!cfg.enabled || !cfg.search) { if (input) input.remove(); return; }
      if (!input) {
        input = document.createElement('input');
        input.className = 'dps-search';
        input.type = 'search';
        input.addEventListener('input', function (event) {
          query = event.target.value || '';
          schedule();
        });
        input.addEventListener('keydown', function (event) {
          if (event.key === 'Escape') { input.value = ''; query = ''; schedule(); }
        });
        bar.insertBefore(input, bar.firstChild);
      }
      var ph = ui().placeholder;
      if (input.placeholder !== ph) input.placeholder = ph;
      if (input.value !== query) input.value = query;
    }

    var pending = false;
    function schedule() {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        try {
          syncStyle();
          applyToPage();
        } catch (e) {
          try { console.error('[plugin-shelf]', e); } catch (e2) {}
        }
      });
    }

    // ───────────────────────── settings page ─────────────────────────
    var NS = 'liao-plugin-shelf';
    var zh = {
      nav: '插件书架',
      title: '插件书架',
      intro: '把官方插件页排成卡片网格。只改外观，安装、开关、卸载都是官方原样。',
      enabled: '卡片视图',
      minWidth: '每列最小宽度（px）',
      accent: '社区插件色带',
      dimOff: '停用卡片置灰',
      search: '显示搜索框',
      sort: '排序',
      sortDefault: '默认',
      sortEnabled: '启用的在前',
      sortName: '按名称',
      pinHint: '卡片右上角的 ☆ 可以置顶常用插件。',
      note: '官方升级后若类名变化，本插件只会退回原列表，不影响使用。',
    };
    var en = {
      nav: 'Plugin Shelf',
      title: 'Plugin Shelf',
      intro: 'Lays the official plugins page out as a card grid. Appearance only — install, toggles and uninstall stay native.',
      enabled: 'Card view',
      minWidth: 'Min column width (px)',
      accent: 'Community accent stripe',
      dimOff: 'Dim disabled cards',
      search: 'Show search box',
      sort: 'Sort',
      sortDefault: 'Default',
      sortEnabled: 'Enabled first',
      sortName: 'By name',
      pinHint: 'The ☆ on each card pins it to the top.',
      note: 'If a host upgrade renames internal classes, the page simply falls back to the native list.',
    };

    function Field(props) {
      return React.createElement('label', {
        style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, maxWidth: 360, fontSize: 13 },
      }, props.children);
    }

    function ShelfSettings(props) {
      var t = props.t;
      var state = React.useState(readConfig());
      var cfg = state[0], setCfg = state[1];
      React.useEffect(function () {
        var onExt = function () { setCfg(readConfig()); };
        window.addEventListener(EVENT, onExt);
        return function () { window.removeEventListener(EVENT, onExt); };
      }, []);
      function patch(key, value) {
        var next = Object.assign({}, cfg);
        next[key] = value;
        writeConfig(next);
        setCfg(next);
      }
      return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 760 } },
        React.createElement('h2', { style: { margin: 0, fontSize: 18 } }, t('title')),
        React.createElement('p', { style: { margin: 0, fontSize: 13, opacity: 0.7 } }, t('intro')),
        React.createElement(Field, null, t('enabled'),
          React.createElement('input', { type: 'checkbox', checked: cfg.enabled, onChange: function (e) { patch('enabled', e.target.checked); } })),
        React.createElement(Field, null, t('minWidth'),
          React.createElement('input', {
            type: 'number', min: 200, max: 520, step: 20, value: cfg.minWidth,
            style: { width: 90, font: 'inherit' },
            onChange: function (e) { patch('minWidth', Number(e.target.value) || 300); },
          })),
        React.createElement(Field, null, t('sort'),
          React.createElement('select', {
            value: cfg.sort, style: { font: 'inherit', background: 'transparent', color: 'inherit' },
            onChange: function (e) { patch('sort', e.target.value); },
          },
            React.createElement('option', { value: 'default' }, t('sortDefault')),
            React.createElement('option', { value: 'enabled' }, t('sortEnabled')),
            React.createElement('option', { value: 'name' }, t('sortName')))),
        React.createElement(Field, null, t('accent'),
          React.createElement('input', { type: 'checkbox', checked: cfg.accent, onChange: function (e) { patch('accent', e.target.checked); } })),
        React.createElement(Field, null, t('dimOff'),
          React.createElement('input', { type: 'checkbox', checked: cfg.dimOff, onChange: function (e) { patch('dimOff', e.target.checked); } })),
        React.createElement(Field, null, t('search'),
          React.createElement('input', { type: 'checkbox', checked: cfg.search, onChange: function (e) { patch('search', e.target.checked); } })),
        React.createElement('p', { style: { margin: 0, fontSize: 12, opacity: 0.6 } }, t('pinHint')),
        React.createElement('p', { style: { margin: 0, fontSize: 12, opacity: 0.6 } }, t('note')),
      );
    }

    // ───────────────────────── entry ─────────────────────────
    var inject = ['slots', 'locale'];
    function apply(ctx) {
      schedule();
      // 全局代理点击：按钮若被 React 重渲染换掉也不失效。
      function onClick(event) {
        var btn = event.target && event.target.closest && event.target.closest('.dps-pin');
        if (!btn) return;
        event.preventDefault();
        event.stopPropagation();
        togglePin(btn.getAttribute('data-dps-key') || '');
      }
      document.addEventListener('click', onClick, true);
      ctx.effect(function () {
        var obs = new MutationObserver(schedule);
        // 只观察会影响我们判断的变化：节点增删 + 官方开关状态。
        // 不观察 class/style —— 那是我们自己写的属性，会自触发循环。
        obs.observe(document.body, {
          childList: true, subtree: true,
          attributes: true, attributeFilter: ['aria-checked'],
        });
        window.addEventListener(EVENT, schedule);
        return function () {
          obs.disconnect();
          window.removeEventListener(EVENT, schedule);
          document.removeEventListener('click', onClick, true);
        };
      }, 'liao-plugin-shelf: page watcher');

      try {
        if (React && React.createElement && ctx.slots && ctx.locale && typeof ctx.locale.register === 'function' && typeof ctx.slots.inject === 'function') {
          ctx.effect(function () { return ctx.locale.register(NS, { zh: zh, en: en }); }, 'plugin-shelf: dictionaries');
          var t = ctx.locale.bind(NS);
          ctx.slots.inject('settings.section', function () {
            return ctx.slots.register({
              name: 'settings.section',
              id: NS,
              order: 46,
              label: function () { return t('nav'); },
              locale: NS,
              inject: function () { return { t: t }; },
            }, function () {
              return React.createElement(ShelfSettings, { ctx: ctx, t: t });
            });
          });
        }
      } catch (e) {
        try { console.error('[plugin-shelf] settings page unavailable', e); } catch (e2) {}
      }
    }

    exports.name = 'plugin-shelf';
    exports.inject = inject;
    exports.apply = apply;
    return exports;
  },
});
