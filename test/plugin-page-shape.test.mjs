// Regression guard for the host plugin-page DOM contract.
//
// DSH 0.2.2 moved the plugin page head from a direct child of [data-plugin-panel]
// to [data-plugin-panel] > [data-plugin-body] > [data-plugin-bar] > header, and a
// direct-child <header> now exists only in the "More" view. The shelf used to bail
// out entirely when `:scope > header` was absent, so it vanished silently.
// These tests pin both host shapes plus the degraded case.
import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, card, pageHTML, pageHTMLV022 } from './harness.mjs';

async function using(options, fn) { const f = await fixture(options); try { await fn(f); } finally { await f.close(); } }

// Rows exist but neither anchor does: the shelf must stay inert instead of
// half-mounting, and it must say why once (the row guard short-circuits before
// the anchor check when there are no rows, so this case needs real rows).
const pageHtmlNoAnchor = `<section data-plugin-panel><div data-plugin-body="true"><section data-plugin-group="bundles"><div><h3>已安装</h3></div><ul>${card('dsh-github-auth', 'GitHub 授权', '管理账号权限', 'running')}</ul></section></div></section>`;

test('0.2.2 宿主结构：页头下沉到 [data-plugin-bar] 时书架仍然生效', async () => using({ pageHtml: pageHTMLV022 }, async (f) => {
  assert.ok(f.document.querySelector('[data-plugin-panel] > [data-plugin-body]'), '夹具用的是新版结构');
  assert.equal(f.document.querySelector('[data-plugin-panel] > header'), null, '新版结构没有直接子 header（除「更多」视图）');
  assert.ok(f.document.querySelector('.dps-tools'), '工具栏应挂载');
  assert.equal(f.visible().length, 6, '六张卡片都被接管');
  await f.search('github');
  assert.deepEqual(f.visible(), ['pkg:dsh-github-auth']);
  const bar = f.document.querySelector('.dps-tools');
  assert.ok(bar.previousElementSibling.matches('[data-plugin-bar]'), '工具栏应紧跟 [data-plugin-bar]');
  assert.ok(bar.closest('[data-plugin-body]'), '工具栏落在 pageBody 内，位置与旧版视觉一致');
}));

test('≤0.2.1 宿主结构：直接子 header 的旧布局继续生效（跨宿主兼容）', async () => using({ pageHtml: pageHTML }, async (f) => {
  assert.ok(f.document.querySelector('[data-plugin-panel] > header'));
  assert.ok(f.document.querySelector('.dps-tools'));
  assert.equal(f.visible().length, 6);
  assert.ok(f.document.querySelector('.dps-tools').previousElementSibling.matches('header'));
}));

test('两个锚点都缺失：不半挂载，且留下可诊断的告警', async () => {
  const warnings = [];
  const original = console.warn;
  console.warn = (...args) => { warnings.push(args.join(' ')); };
  try {
    await using({ pageHtml: pageHtmlNoAnchor }, async (f) => {
      assert.equal(f.document.querySelector('.dps-tools'), null, '不应挂载任何 UI');
      assert.equal(f.document.querySelectorAll('[data-dps-card]').length, 0);
    });
  } finally { console.warn = original; }
  assert.equal(warnings.length, 1, '只告警一次');
  assert.match(warnings[0], /dsh-liao-shelf.*anchor missing/);
  assert.match(warnings[0], /data-plugin-bar/);
});

test('随包发货的默认夹具（旧结构）不受本次改动影响', async () => using({}, async (f) => {
  assert.ok(pageHTML.includes('data-plugin-panel'));
  assert.ok(f.document.querySelector('.dps-tools'));
  assert.equal(f.visible().length, 6);
}));

// Regression: the toolbar must be idempotent across enhance() passes. Looking it up as
// `:scope > .dps-tools` while inserting it beside the nested [data-plugin-bar] made every
// pass insert one more copy — the user saw four stacked toolbars.
async function extraPasses(f, times = 4) {
  for (let i = 0; i < times; i++) {
    const target = f.card('dsh-usage-pill');
    const next = target.getAttribute('data-plugin-status') === 'running' ? 'disabled' : 'running';
    target.setAttribute('data-plugin-status', next);   // observed attribute -> schedules another enhance()
    await f.flush();
  }
}

test('0.2.2 结构：多轮增强只保留一个工具栏（重复挂载回归）', async () => using({ pageHtml: pageHTMLV022 }, async (f) => {
  const before = f.frameRuns;
  await extraPasses(f);
  assert.ok(f.frameRuns > before, '夹具确实触发了多轮增强，用例才有意义');
  assert.equal(f.document.querySelectorAll('.dps-tools').length, 1, '工具栏被重复挂载');
  assert.ok(f.document.querySelectorAll('.dps-quick').length <= 1, '常用插件入口不得重复');
  await f.search('github');
  assert.deepEqual(f.visible(), ['pkg:dsh-github-auth'], '重复挂载不得影响搜索');
}));

test('≤0.2.1 结构：多轮增强同样只保留一个工具栏', async () => using({ pageHtml: pageHTML }, async (f) => {
  await extraPasses(f);
  assert.equal(f.document.querySelectorAll('.dps-tools').length, 1);
}));

// The shortcut block lives inside [data-plugin-body], so the old `:scope > .dps-quick`
// lookup never found the copy it had just inserted: every pin toggle appended another
// 常用插件 section, and the page grew one group per click.
test('0.2.2 结构：反复置顶只保留一个常用插件分组', async () => using({ pageHtml: pageHTMLV022 }, async (f) => {
  const pin = '[data-dps-key="pkg:dsh-github-auth"] .dps-pin';
  // 交替置顶/取消五次：分组每次要么恰好一个，要么整体消失，绝不累积。
  for (let i = 0; i < 5; i++) {
    await f.click(pin);
    const expected = i % 2 === 0 ? 1 : 0;
    assert.equal(f.document.querySelectorAll('.dps-quick').length, expected, `第 ${i + 1} 次点击后分组数量不对`);
  }
  // 多个置顶项时只应有一个分组，取消到最后一个才整体移除。
  await f.click('[data-dps-key="pkg:dsh-usage-pill"] .dps-pin');
  assert.equal(f.document.querySelectorAll('.dps-quick').length, 1, '两个置顶项共用一个分组');
  await f.click(pin);
  assert.equal(f.document.querySelectorAll('.dps-quick').length, 1, '还有置顶项时分组必须保留');
  await f.click('[data-dps-key="pkg:dsh-usage-pill"] .dps-pin');
  assert.equal(f.document.querySelectorAll('.dps-quick').length, 0, '取消置顶后分组应整体移除');
  await f.click(pin);
  assert.equal(f.document.querySelectorAll('.dps-quick').length, 1, '重新置顶应恢复且只有一个分组');
}));

// The host paints its sticky plugin header with z-index 2 and the cards sit later in
// the DOM, so any card control at the same z-index paints on top of the header while
// the list scrolls — the pins and switches showed through the tabs. Card controls must
// stay strictly below the header's layer.
test('卡片控件的层级低于吸顶页头，滚动时不会盖住页头', async () => using({ pageHtml: pageHTMLV022 }, async (f) => {
  const style = f.document.querySelector('[data-dps-style]').textContent;
  const rule = (selector) => {
    const match = style.match(new RegExp(selector.replace(/[[\]=]/g, '\\$&') + '\\{([^}]*)\\}'));
    assert.ok(match, `样式表里应存在 ${selector} 规则`);
    return match[1];
  };
  const zIndexOf = (selector) => {
    const value = rule(selector).match(/z-index:(\d+)/);
    return value ? Number(value[1]) : 0;
  };
  const end = zIndexOf('[data-dps-part=end]');
  const pin = zIndexOf('.dps-pin');
  assert.ok(end < 2, `卡片右侧控件 z-index 必须低于宿主页头的 2，实际 ${end}`);
  assert.ok(pin < 2, `图钉 z-index 必须低于宿主页头的 2，实际 ${pin}`);
}));

// DSH reports four statuses, not three: besides running/disabled/problem there is
// 'not-running' — enabled, but none of the bundle's rows has a live entry. The shelf
// only knew the first three, so that state rendered the raw English token in the card
// footer and was excluded from the 异常 filter, making a failed start look healthy.
const pageHtmlNotRunning = `<section data-plugin-panel><div data-plugin-body="true"><div data-plugin-bar="true"><header class="pageHead"><h1>插件</h1></header></div><section data-plugin-group="bundles"><div><h3>已安装</h3><span data-plugin-count="2">2</span></div><ul>${card('dsh-dead', '没启动起来', '启用了但没跑起来', 'not-running')}${card('dsh-ok', '正常插件', '正常运行', 'running')}</ul></section></div></section>`;

test('not-running 状态显示本地化标签、计入异常筛选并打上角标', async () => using({ pageHtml: pageHtmlNotRunning }, async (f) => {
  const dead = f.card('dsh-dead');
  assert.equal(dead.querySelector('.dps-status').textContent, '未运行', '不能把宿主原始状态串漏到界面上');
  assert.equal(dead.querySelector('.dps-status').getAttribute('data-state'), 'problem', '未启动应按异常着色');
  assert.ok(dead.querySelector('.dps-issue'), '未启动的插件要带异常角标');

  const problem = [...f.document.querySelectorAll('[data-dps-action=filter]')].find((el) => el.getAttribute('data-filter') === 'problem');
  assert.match(problem.textContent, /1$/, '异常筛选应包含未启动的插件');
  await f.click('[data-dps-action=filter][data-filter=problem]');
  assert.deepEqual(f.visible(), ['pkg:dsh-dead']);
}));

// 0.2.2 把滚动容器下沉成 [data-plugin-body]，空状态原来 append 到 [data-plugin-panel]，
// 于是落在滚动视口之外、被推到窗口底部。它必须跟着工具栏留在滚动容器里。
test('0.2.2 结构：空搜索状态留在滚动容器内', async () => using({ pageHtml: pageHTMLV022 }, async (f) => {
  await f.search('根本不存在');
  const empty = f.document.querySelector('.dps-empty');
  assert.ok(empty, '无匹配结果时应显示空状态');
  assert.ok(empty.closest('[data-plugin-body]'), '空状态必须位于滚动容器 [data-plugin-body] 内');
  assert.equal(empty.previousElementSibling?.className, 'dps-tools', '空状态应紧跟工具栏');
  await f.click('.dps-empty button');
  assert.equal(f.document.querySelector('.dps-empty'), null, '清除筛选后空状态应移除');
}));

// 置顶卡片是重建出来的，开关必须带上 data-dps-action 与 data-dps-key 才能转发到宿主开关。
// 少了 key 时按钮看起来正常、点击却什么也不做——这类“静默失效”只能靠用例挡住。
test('置顶卡片上的开关与图钉都能驱动宿主卡片', async () => using({ pageHtml: pageHTMLV022, pins: ['pkg:dsh-usage-pill'] }, async (f) => {
  const copy = f.document.querySelector('[data-dps-shortcut-card]');
  assert.ok(copy, '置顶后应出现卡片');
  const toggle = copy.querySelector('.dps-shortcut-switch');
  assert.ok(toggle, '置顶卡片要有开关');
  assert.equal(toggle.getAttribute('data-dps-action'), 'toggle');
  assert.equal(toggle.getAttribute('data-dps-key'), 'pkg:dsh-usage-pill');

  let clicks = 0;
  const native = f.card('dsh-usage-pill').querySelector('[role=switch]');
  native.addEventListener('click', () => clicks++);
  await f.click('[data-dps-shortcut-card] .dps-shortcut-switch');
  assert.equal(clicks, 1, '点击置顶开关必须转发到宿主开关一次');

  await f.click('[data-dps-shortcut-card] .dps-unpin');
  assert.deepEqual(JSON.parse(f.window.localStorage.getItem('liao-plugin-shelf.pins')), [], '置顶卡片上的图钉应取消置顶');
}));

// 置顶区的图标是从卡片里克隆出来的内联 SVG。宿主有两类图标：一类是 <img src="data:...">，
// 另一类直接内联 SVG，并用 <defs> 里的渐变配合 fill="url(#id)" 上色。克隆时若把 id 或
// url() 属性当成不安全内容剥掉，渐变引用就断了，图形没有填充色，看起来像图标消失了。
const pageHtmlGradientIcon = `<section data-plugin-panel><div data-plugin-body="true"><div data-plugin-bar="true"><header class="pageHead"><h1>插件</h1></header></div><section data-plugin-group="bundles"><div><h3>已安装</h3><span data-plugin-count="1">1</span></div><ul><li data-plugin-package="dsh-gradient" data-plugin-status="running"><div class="host_head"><span class="host_icon"><svg viewBox="0 0 36 36" fill="none"><defs><linearGradient id="art-a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7aa2ff"/><stop offset="1" stop-color="#3355ff"/></linearGradient></defs><path d="M6 6h24v24H6z" fill="url(#art-a)"/></svg></span><div class="host_main"><div><button aria-describedby="desc-g">渐变图标插件</button></div><span id="desc-g">测试渐变克隆</span></div><div class="host_end"><button role="switch" aria-checked="true"></button></div></div></li></ul></section></div></section>`;

test('置顶快捷入口保留内联 SVG 的渐变，图标不会因克隆而变空', async () => using({ pageHtml: pageHtmlGradientIcon }, async (f) => {
  await f.click('[data-dps-key="pkg:dsh-gradient"] .dps-pin');
  const logo = f.document.querySelector('.dps-shortcuts [data-dps-part=icon]');
  assert.ok(logo, '置顶后应出现快捷入口');
  const svg = logo.querySelector('svg');
  assert.ok(svg, '图标必须是克隆的 SVG');
  const gradient = svg.querySelector('linearGradient');
  assert.ok(gradient, '渐变定义不能丢');
  const fill = svg.querySelector('path').getAttribute('fill');
  assert.match(fill, /^url\(#/, '填充仍应是 url(#…) 引用');
  assert.equal(fill, `url(#${gradient.id})`, '引用必须指向克隆后重命名的渐变 id');
  assert.notEqual(gradient.id, 'art-a', 'id 必须重命名，避免与卡片里的原始渐变冲突');
  assert.equal(f.document.querySelectorAll('#art-a').length, 1, '原始卡片的 id 保持唯一');
}));
