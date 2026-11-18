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
