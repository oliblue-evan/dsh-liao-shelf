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
    var EVENT = 'liao-plugin-shelf/config-changed';
    var DEFAULTS = {
      enabled: true,   // 卡片视图总开关
      minWidth: 300,   // 每列最小宽度 px
      accent: true,    // 社区插件左侧色带
      search: true,    // 工具条上的搜索框
    };
    function readConfig() {
      try {
        var raw = localStorage.getItem(LS_KEY);
        if (!raw) return Object.assign({}, DEFAULTS);
        var obj = JSON.parse(raw);
        return Object.assign({}, DEFAULTS, obj);
      } catch (e) { return Object.assign({}, DEFAULTS); }
    }
    function writeConfig(next) {
      try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch (e) {}
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
        'li[data-dps-off="1"]{display:none!important}',
        cfg.accent
          ? 'li[data-dps-community="1"]{border-left:3px solid color-mix(in srgb,var(--dsw-alias-state-business-primary,#4b6fff) 70%,transparent)!important}'
          : '',
        '.dps-search{border:1px solid var(--dsw-alias-border-l2,#8884);border-radius:10px;',
        'background:var(--dsw-alias-bg-layer-1,#8881);color:inherit;font:inherit;font-size:13px;',
        'padding:6px 10px;width:min(240px,40vw)}',
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

    // ───────────────────────── page enhance ─────────────────────────
    var query = '';
    function isCommunity(li) {
      return !!li.querySelector('[aria-label*="卸载"],[aria-label*="ninstall"]');
    }
    function applyToPage() {
      var cfg = readConfig();
      var lists = document.querySelectorAll('ul[class*="_cards"]');
      for (var i = 0; i < lists.length; i += 1) {
        var list = lists[i];
        if (!cfg.enabled) { list.removeAttribute('data-dps-on'); clearOff(list); continue; }
        list.setAttribute('data-dps-on', '1');
        var items = list.querySelectorAll(':scope > li');
        for (var j = 0; j < items.length; j += 1) {
          var li = items[j];
          if (cfg.accent && isCommunity(li)) li.setAttribute('data-dps-community', '1');
          else li.removeAttribute('data-dps-community');
          var q = query.trim().toLowerCase();
          if (q && (li.textContent || '').toLowerCase().indexOf(q) === -1) li.setAttribute('data-dps-off', '1');
          else li.removeAttribute('data-dps-off');
        }
      }
      syncToolbar(cfg);
    }
    function clearOff(list) {
      var items = list.querySelectorAll(':scope > li[data-dps-off]');
      for (var j = 0; j < items.length; j += 1) items[j].removeAttribute('data-dps-off');
    }
    function syncToolbar(cfg) {
      var bars = document.querySelectorAll('[class*="_toolbar"]');
      for (var i = 0; i < bars.length; i += 1) {
        var bar = bars[i];
        var input = bar.querySelector('.dps-search');
        if (!cfg.enabled || !cfg.search) { if (input) input.remove(); continue; }
        if (!input) {
          input = document.createElement('input');
          input.className = 'dps-search';
          input.type = 'search';
          input.placeholder = '搜索插件 / filter';
          input.addEventListener('input', function (event) {
            query = event.target.value || '';
            schedule();
          });
          bar.appendChild(input);
        }
        if (input.value !== query) input.value = query;
      }
    }

    var pending = false;
    function schedule() {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        syncStyle();
        applyToPage();
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
      search: '显示搜索框',
      note: '官方升级后若类名变化，本插件只会退回原列表，不影响使用。',
    };
    var en = {
      nav: 'Plugin Shelf',
      title: 'Plugin Shelf',
      intro: 'Lays the official plugins page out as a card grid. Appearance only — install, toggles and uninstall stay native.',
      enabled: 'Card view',
      minWidth: 'Min column width (px)',
      accent: 'Community accent stripe',
      search: 'Show search box',
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
        React.createElement(Field, null, t('accent'),
          React.createElement('input', { type: 'checkbox', checked: cfg.accent, onChange: function (e) { patch('accent', e.target.checked); } })),
        React.createElement(Field, null, t('search'),
          React.createElement('input', { type: 'checkbox', checked: cfg.search, onChange: function (e) { patch('search', e.target.checked); } })),
        React.createElement('p', { style: { margin: 0, fontSize: 12, opacity: 0.6 } }, t('note')),
      );
    }

    // ───────────────────────── entry ─────────────────────────
    var inject = ['slots', 'locale'];
    function apply(ctx) {
      schedule();
      ctx.effect(function () {
        var obs = new MutationObserver(schedule);
        obs.observe(document.body, { childList: true, subtree: true });
        window.addEventListener(EVENT, schedule);
        return function () { obs.disconnect(); window.removeEventListener(EVENT, schedule); };
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
