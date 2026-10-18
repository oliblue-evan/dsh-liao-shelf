import test from 'node:test';
import assert from 'node:assert/strict';
import { act } from 'react';
import { fixture, configKey, pinsKey, card, pageHTML } from './harness.mjs';

async function using(options, fn) { const f = await fixture(options); try { await fn(f); } finally { await f.close(); } }

test('搜索过滤名称、描述与包名；跨官方和已安装分组合计；无描述卡片仍参与', async () => using({}, async (f) => {
  assert.equal(f.visible().length, 6);
  await f.search('github'); assert.deepEqual(f.visible(), ['pkg:dsh-github-auth']);
  assert.equal(f.document.querySelector('.dps-results').textContent, '显示 1 / 6 个插件');
  assert.equal(f.window.getComputedStyle(f.card('dsh-usage-pill')).display, 'none');
  assert.ok(f.document.querySelector('[data-plugin-group=official]').hasAttribute('data-dps-group-hidden'));
  await f.search('ＴＯＫＥＮ 费用'); assert.deepEqual(f.visible(), ['pkg:dsh-usage-pill']);
  await f.search('empty-description'); assert.deepEqual(f.visible(), ['pkg:empty-description']);
  await f.search('根本不存在'); assert.ok(f.document.querySelector('.dps-empty'));
  await f.click('.dps-empty button'); assert.equal(f.visible().length, 6);
  await f.search('github'); f.document.querySelector('.dps-search').dispatchEvent(new f.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await f.flush();
  assert.equal(f.visible().length, 6);
}));

test('筛选依据真实分组和运行状态，内置配置项不冒充已启用', async () => using({}, async (f) => {
  for (const [filter, count] of [['installed', 4], ['official', 2], ['enabled', 3], ['disabled', 1], ['problem', 1], ['pinned', 0], ['all', 6]]) {
    await f.click(`[data-filter=${filter}]`); assert.equal(f.visible().length, count, filter);
  }
  const off = f.card('dsh-usage-pill'); off.setAttribute('data-plugin-status', 'running'); off.querySelector('[role=switch]').setAttribute('aria-checked', 'true'); await f.flush();
  await f.click('[data-filter=enabled]'); assert.equal(f.visible().length, 4);
  assert.equal(f.card('dsh-usage-pill').querySelector('.dps-status').textContent, '已启用');
  assert.ok(!f.card('dsh-usage-pill').hasAttribute('data-dps-dim'));
}));

test('旧收藏迁移为稳定 ID，改名和切换语言保留置顶；入口复用原生配置按钮', async () => using({ legacyPins: ['查看 GitHub 授权', 'Open 终端'] }, async (f) => {
  assert.deepEqual(JSON.parse(f.window.localStorage.getItem(pinsKey)), ['pkg:dsh-github-auth', 'item:terminal']);
  let opened = 0; const native = f.card('dsh-github-auth').querySelector('[aria-describedby]'); native.addEventListener('click', () => opened++);
  await f.click('.dps-shortcuts button[data-dps-key="pkg:dsh-github-auth"]');
  await f.click('.dps-shortcuts button[data-dps-key="pkg:dsh-github-auth"]'); assert.equal(opened, 2);
  native.textContent = 'Account tools'; native.setAttribute('aria-label', 'Open Account tools'); await f.flush(); await f.language('en');
  assert.equal(f.document.querySelector('.dps-search').placeholder, 'Search names, descriptions or packages');
  assert.equal(f.card('dsh-github-auth').querySelector('.dps-pin').getAttribute('aria-pressed'), 'true');
  assert.match(f.document.querySelector('.dps-shortcuts').textContent, /Account tools/);
  await f.click('[data-filter=pinned]'); assert.equal(f.visible().length, 2);
  await f.click('[data-dps-key="pkg:dsh-github-auth"] .dps-pin'); assert.equal(f.visible().length, 1);
  assert.equal(opened, 2, '星标没有误触发详情');
}));

test('排序不搬动宿主节点；置顶优先；停用清理恢复原始内联顺序', async () => using({}, async (f) => {
  const list = f.card('dsh-github-auth').parentElement; const nodes = [...list.children];
  await f.click('[data-dps-key="pkg:dsh-usage-pill"] .dps-pin');
  assert.deepEqual([...list.children], nodes); assert.ok(Number(f.card('dsh-usage-pill').style.order) < Number(f.card('dsh-github-auth').style.order));
  f.window.localStorage.setItem(configKey, JSON.stringify({ enabled: false })); f.window.dispatchEvent(new f.window.StorageEvent('storage', { key: configKey })); await f.flush();
  assert.equal(f.document.querySelectorAll('[data-dps-card],.dps-pin,.dps-tools').length, 0);
  assert.equal(f.card('dsh-github-auth').style.order, '');
  assert.equal(f.document.querySelector('[data-plugin-count]').textContent, '2');
}));

test('卸载取消待处理任务、清理样式和槽位；重新加载不重复增强', async () => using({}, async (f) => {
  const nativeTitles = [...f.document.querySelectorAll('li > div > div > div > button')];
  await f.search('github');
  f.card('team').querySelector('[role=switch]').setAttribute('aria-checked', 'false');
  await f.dispose();
  assert.equal(f.document.querySelectorAll('[data-dps-style],[data-dps-page],.dps-tools,.dps-status,.dps-pin,.dps-group-count').length, 0);
  assert.equal(f.slots.size, 0); assert.ok(nativeTitles.every((el) => el.isConnected));
  assert.equal(f.window.getComputedStyle(f.card('dsh-usage-pill')).display, 'list-item');
  f.start(); await f.flush(); assert.equal(f.document.querySelectorAll('.dps-tools').length, 1); assert.equal(f.document.querySelectorAll('.dps-pin').length, 6);
}));

test('页面切换和宿主重渲染仍可置顶；观察器不会持续自触发或响应其他页面', async () => using({}, async (f) => {
  const before = f.frameRuns; await f.flush(); assert.equal(f.frameRuns, before);
  f.document.querySelector('#unrelated').appendChild(f.document.createElement('p')); await f.flush(); assert.equal(f.frameRuns, before);
  f.card('dsh-github-auth').outerHTML = card('dsh-github-auth', 'GitHub 新名称', '账号', 'running'); await f.flush();
  await f.click('[data-dps-key="pkg:dsh-github-auth"] .dps-pin'); assert.equal(f.card('dsh-github-auth').querySelector('.dps-pin').getAttribute('aria-pressed'), 'true');
  f.page().remove(); await f.flush(); f.document.body.insertAdjacentHTML('afterbegin', pageHTML); await f.flush();
  assert.equal(f.document.querySelectorAll('.dps-tools').length, 1); assert.equal(f.card('dsh-github-auth').querySelector('.dps-pin').getAttribute('aria-pressed'), 'true');
}));

test('设置预览即时更新；恢复默认保留收藏；清空收藏先确认', async () => using({ pins: ['pkg:dsh-github-auth'] }, async (f) => {
  assert.deepEqual([...f.slots.keys()], ['plugins.bundle.config:dsh-liao-shelf'], '只在插件详情注册设置');
  await f.settings();
  const clickText = async (text) => { const node = [...f.document.querySelectorAll('.dps-settings button')].find((el) => el.textContent === text); assert.ok(node, text); await act(async () => node.click()); await f.flush(); };
  await clickText('紧凑'); assert.equal(f.page().getAttribute('data-dps-density'), 'compact'); assert.equal(f.document.querySelector('.dps-preview').getAttribute('data-density'), 'compact');
  await clickText('列表视图'); assert.equal(f.page().getAttribute('data-dps-view'), 'list');
  await clickText('恢复显示默认值'); assert.equal(f.page().getAttribute('data-dps-view'), 'grid'); assert.equal(JSON.parse(f.window.localStorage.getItem(pinsKey)).length, 1);
  await clickText('清空置顶'); assert.equal(JSON.parse(f.window.localStorage.getItem(pinsKey)).length, 1);
  await clickText('取消'); assert.ok(!f.document.querySelector('.dps-confirm'));
  await clickText('清空置顶'); await clickText('确认清空'); assert.deepEqual(JSON.parse(f.window.localStorage.getItem(pinsKey)), []);
  await f.language('en'); assert.equal(f.document.querySelector('.dps-settings h2'), null); assert.equal(f.document.querySelector('.dps-settings h3').textContent, 'Appearance');
}));

test('配置类型验证与旧列宽迁移；储存失败仍能在本次会话使用', async () => {
  await using({ config: { view: 'bogus', density: '1px;background:red', enabled: 'false', sort: 'bad' } }, async (f) => { assert.equal(f.page().getAttribute('data-dps-view'), 'grid'); assert.equal(f.page().getAttribute('data-dps-density'), 'standard'); });
  await using({ legacyConfig: { minWidth: 420 } }, async (f) => {
    assert.equal(f.page().getAttribute('data-dps-density'), 'spacious');
    const proto = Object.getPrototypeOf(f.window.localStorage), original = proto.setItem; proto.setItem = () => { throw Error('quota'); };
    try { await f.click('[data-dps-key="pkg:dsh-github-auth"] .dps-pin'); assert.ok(f.document.querySelector('.dps-shortcuts')); assert.equal(f.document.querySelector('.dps-storage').hidden, false); } finally { proto.setItem = original; }
  });
});

test('跨窗口更新收藏与配置；原生其他页面不受影响', async () => using({}, async (f) => {
  const other = f.document.querySelector('#unrelated').innerHTML;
  f.window.localStorage.setItem(pinsKey, JSON.stringify(['pkg:dsh-usage-pill'])); f.window.dispatchEvent(new f.window.StorageEvent('storage', { key: pinsKey })); await f.flush();
  assert.equal(f.card('dsh-usage-pill').querySelector('.dps-pin').getAttribute('aria-pressed'), 'true');
  await f.search('github'); f.window.localStorage.setItem(configKey, JSON.stringify({ search: false, view: 'list' })); f.window.dispatchEvent(new f.window.StorageEvent('storage', { key: configKey })); await f.flush();
  assert.equal(f.visible().length, 6); assert.equal(f.document.querySelector('.dps-search-wrap').hidden, true);
  assert.equal(f.page().getAttribute('data-dps-view'), 'list'); assert.equal(f.document.querySelector('#unrelated').innerHTML, other);
}));

test('原生详情复用列表根节点时，清理不会移除 React 设置预览中的状态节点', async () => using({}, async (f) => {
  const page = f.page(); page.replaceChildren(f.document.querySelector('#settings'));
  await f.settings(); await f.flush();
  assert.equal(f.document.querySelectorAll('.dps-preview .dps-status').length, 2);
  const spacious = [...f.document.querySelectorAll('.dps-choice button')].find((el) => el.textContent === '宽松');
  await act(async () => spacious.click()); await f.flush();
  assert.equal(f.document.querySelectorAll('.dps-preview .dps-status').length, 2);
  assert.equal(f.document.querySelector('.dps-preview').getAttribute('data-density'), 'spacious');
}));

test('分组折叠保存偏好；搜索临时展开且允许手动收起；清除搜索恢复折叠', async () => using({}, async (f) => {
  const group = f.document.querySelector('[data-plugin-group=bundles]');
  await f.click('[data-dps-action=collapse][data-group=bundles]');
  assert.ok(group.hasAttribute('data-dps-collapsed'));
  assert.equal(f.window.getComputedStyle(group.querySelector('ul')).display, 'none');
  assert.deepEqual(JSON.parse(f.window.localStorage.getItem(configKey)).collapsed, ['bundles']);
  await f.search('github'); assert.ok(!group.hasAttribute('data-dps-collapsed'));
  await f.click('[data-dps-action=collapse][data-group=bundles]'); assert.ok(group.hasAttribute('data-dps-collapsed'));
  await f.click('[data-dps-action=clear]'); assert.ok(group.hasAttribute('data-dps-collapsed'));
  await f.click('[data-dps-action=toggle-all]'); assert.equal(f.document.querySelectorAll('[data-dps-collapsed]').length, 2);
  assert.equal(f.document.querySelector('[data-dps-action=toggle-all]').getAttribute('aria-label'), '全部展开');
  await f.click('[data-dps-action=toggle-all]'); assert.equal(f.document.querySelectorAll('[data-dps-collapsed]').length, 0);
  await f.click('[data-dps-action=toggle-all]');
  f.page().remove(); f.document.body.insertAdjacentHTML('afterbegin', pageHTML); await f.flush();
  assert.equal(f.document.querySelectorAll('[data-dps-collapsed]').length, 2);
}));

test('安装时间排序使用来源记录，未知项总在最后，置顶仍优先', async () => using({ initialMetadata: [
  { name: 'dsh-github-auth', version: '0.3.0', installedAt: 1600000000000 }, { name: 'dsh-usage-pill', version: '1.0.0', installedAt: 1700000000000 }
] }, async (f) => {
  const sorted = () => [...f.document.querySelectorAll('[data-plugin-group=bundles] > ul > li')].sort((a, b) => Number(a.style.order) - Number(b.style.order)).map((x) => x.getAttribute('data-plugin-package'));
  await f.click('.dps-sort'); await f.click('.dps-sort-option:nth-child(4)');
  assert.deepEqual(sorted(), ['dsh-usage-pill', 'dsh-github-auth', 'broken-plugin', 'empty-description']);
  await f.click('.dps-sort'); await f.click('.dps-sort-option:nth-child(5)');
  assert.deepEqual(sorted(), ['dsh-github-auth', 'dsh-usage-pill', 'broken-plugin', 'empty-description']);
  assert.match(f.card('dsh-github-auth').querySelector('.dps-metadata').textContent, /v0.3.0.*估算/);
  assert.equal(f.card('broken-plugin').querySelector('.dps-metadata').textContent, '安装时间未知');
  await f.click('[data-dps-key="pkg:empty-description"] .dps-pin'); assert.equal(sorted()[0], 'empty-description');
}));

test('极简视图隐藏描述、状态、日期和标签，保留原生名称、图标与开关；设置预览对应切换', async () => using({}, async (f) => {
  await f.click('[data-dps-action=view][data-view=minimal]');
  const node = f.card('dsh-github-auth');
  assert.equal(f.page().getAttribute('data-dps-view'), 'minimal');
  assert.equal(f.window.getComputedStyle(node.querySelector('[data-dps-part=desc]')).display, 'none');
  assert.equal(f.window.getComputedStyle(node.querySelector('.dps-footer')).display, 'none');
  assert.notEqual(f.window.getComputedStyle(node.querySelector('.dps-pin')).display, 'none');
  assert.ok(node.querySelector('[role=switch]'));
  await f.settings(); assert.equal(f.document.querySelector('.dps-preview').getAttribute('data-view'), 'minimal');
  await f.click('[data-dps-action=view][data-view=grid]');
  assert.notEqual(f.window.getComputedStyle(node.querySelector('.dps-footer')).display, 'none');
}));

test('书架仅读取本地安装信息，无更新入口或市场请求', async () => using({ fetcher: async (path, options) => {
  assert.equal(path, '/api/plugin-shelf/metadata'); assert.equal(options.method, 'GET');
  return { ok: true, json: async () => ({ schema: 'dsh-liao-shelf/metadata/v1', packages: [] }) };
} }, async (f) => {
  assert.equal(f.document.querySelectorAll('[data-dps-action=check-updates],[data-filter=updates],.dps-update-tag,.dps-update-note').length, 0);
  await f.search('github'); await f.search('');
  await f.click('[data-dps-action=view][data-view=minimal]');
  await f.click('[data-dps-key="pkg:dsh-github-auth"] .dps-pin');
  await f.click('[data-dps-action=toggle-all]'); await f.click('[data-dps-action=toggle-all]');
  await f.click('[data-dps-action=metadata]'); await f.settings();
  assert.doesNotMatch(f.document.querySelector('.dps-settings').textContent, /插件市场|检查更新|可更新/);
  assert.deepEqual([...new Set(f.requests.map((x) => x.path))], ['/api/plugin-shelf/metadata']);
}));

test('本地安装信息可刷新，故障提示和重试仍独立可用', async () => {
  let version = '1.0.0', fail = false;
  await using({ fetcher: async () => fail ? { ok: false, status: 503 } : { ok: true, json: async () => ({ schema: 'dsh-liao-shelf/metadata/v1', packages: [{ name: 'dsh-github-auth', version, installedAt: 1700000000000 }] }) } }, async (f) => {
    version = '2.0.0'; f.card('dsh-github-auth').querySelector('[aria-describedby]').textContent = 'GitHub 授权新版'; await f.flush();
    assert.match(f.card('dsh-github-auth').querySelector('.dps-metadata').textContent, /v2.0.0/);
    fail = true; await f.click('[data-dps-action=metadata]');
    assert.equal(f.document.querySelector('.dps-metadata-note').hidden, false);
    assert.match(f.document.querySelector('.dps-metadata-note').textContent, /安装信息暂不可用/);
    fail = false; await f.click('[data-dps-action=metadata]');
    assert.equal(f.document.querySelector('.dps-metadata-note').hidden, true);
    assert.match(f.card('dsh-github-auth').querySelector('.dps-metadata').textContent, /v2.0.0/);
  });
});

test('停用中断在途本地信息请求，迟到响应不恢复已清理界面', async () => {
  let finish;
  await using({ fetcher: async () => new Promise((resolve) => { finish = resolve; }) }, async (f) => {
    const signal = f.requests[0].options.signal; await f.dispose(); assert.equal(signal.aborted, true);
    finish({ ok: true, json: async () => ({ schema: 'dsh-liao-shelf/metadata/v1', packages: [] }) }); await f.flush();
    assert.equal(f.document.querySelectorAll('.dps-tools,[data-dps-style],.dps-collapse,.dps-footer').length, 0);
  });
});

test('更多操作支持 Esc；折叠按钮合并且恢复所有组', async () => using({}, async (f) => {
  assert.equal(f.document.querySelector('.dps-utilities'), null);
  const more = f.document.querySelector('.dps-more'); more.open = true;
  const refresh = more.querySelector('[data-dps-action=metadata]'); refresh.focus();
  refresh.dispatchEvent(new f.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
  assert.equal(more.open, false); assert.equal(f.document.activeElement, more.querySelector('summary'));
  await f.click('[data-dps-action=toggle-all]'); assert.equal(f.document.querySelectorAll('[data-dps-collapsed]').length, 2);
  await f.click('[data-dps-action=toggle-all]'); assert.equal(f.document.querySelectorAll('[data-dps-collapsed]').length, 0);
}));

test('置顶管理排序同步卡片与入口；取消后撤销恢复原位置', async () => using({ pins: ['pkg:dsh-github-auth', 'pkg:dsh-usage-pill'] }, async (f) => {
  await f.settings();
  const clickLabel = async (label) => { const node = [...f.document.querySelectorAll('.dps-settings button')].find((x) => x.getAttribute('aria-label') === label); assert.ok(node, label); await act(async () => node.click()); await f.flush(); };
  await clickLabel('上移 用量与余额');
  assert.deepEqual(JSON.parse(f.window.localStorage.getItem(pinsKey)), ['pkg:dsh-usage-pill', 'pkg:dsh-github-auth']);
  assert.deepEqual([...f.document.querySelectorAll('.dps-shortcut-open')].map((x) => x.dataset.dpsKey), ['pkg:dsh-usage-pill', 'pkg:dsh-github-auth']);
  assert.ok(Number(f.card('dsh-usage-pill').style.order) < Number(f.card('dsh-github-auth').style.order));
  await clickLabel('移除 用量与余额');
  assert.deepEqual(JSON.parse(f.window.localStorage.getItem(pinsKey)), ['pkg:dsh-github-auth']);
  await act(async () => f.document.querySelector('.dps-settings .dps-undo button').click()); await f.flush();
  assert.deepEqual(JSON.parse(f.window.localStorage.getItem(pinsKey)), ['pkg:dsh-usage-pill', 'pkg:dsh-github-auth']);
  const unpin = f.document.querySelector('.dps-unpin[data-dps-key="pkg:dsh-usage-pill"]'); unpin.focus(); await f.click('.dps-unpin[data-dps-key="pkg:dsh-usage-pill"]');
  assert.equal(f.document.activeElement.getAttribute('data-dps-action'), 'undo-pin');
  await f.click('[data-dps-action=undo-pin]'); assert.equal(f.document.querySelector('.dps-undo').hidden, true);
}));

test('Tab 按视觉排序导航，跳过折叠与隐藏项，Shift+Tab 可返回工具栏或退出', async () => using({ pins: ['pkg:dsh-usage-pill'] }, async (f) => {
  const outside = f.document.createElement('button'); outside.textContent = '返回侧边栏'; f.page().before(outside); await f.flush();
  const key = (shiftKey = false) => f.document.activeElement.dispatchEvent(new f.window.KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true }));
  const lastOfficial = f.card('terminal').querySelector('.dps-pin'); lastOfficial.focus(); key();
  assert.equal(f.document.activeElement.getAttribute('data-group'), 'bundles'); key();
  assert.equal(f.document.activeElement, f.card('dsh-usage-pill').querySelector('[aria-describedby]'));
  key(); assert.equal(f.document.activeElement, f.card('dsh-usage-pill').querySelector('.dps-pin'));
  key(); assert.equal(f.document.activeElement, f.card('dsh-usage-pill').querySelector('[role=switch]'));
  key(); assert.equal(f.document.activeElement, f.card('dsh-github-auth').querySelector('[aria-describedby]'));
  key(true); assert.equal(f.document.activeElement, f.card('dsh-usage-pill').querySelector('[role=switch]'));
  await f.search('github');
  const heading = f.document.querySelector('[data-group=bundles]'); heading.focus(); key();
  assert.equal(f.document.activeElement, f.card('dsh-github-auth').querySelector('[aria-describedby]'));
  await f.click('[data-dps-action=toggle-all]'); heading.focus(); key();
  assert.ok(!f.document.activeElement.closest('[data-dps-card]'), '折叠卡片不能获得焦点');
  const header = f.page().querySelector('header button'); header.focus(); key(true);
  assert.ok(!f.document.activeElement.closest('[data-dps-page]'), '允许退出书架，不构成焦点陷阱');
}));

test('离开页面期间更新同名插件，重新进入后读取新版本', async () => {
  let version = '1.0.0';
  await using({ fetcher: async () => ({ ok: true, json: async () => ({ schema: 'dsh-liao-shelf/metadata/v1', packages: [{ name: 'dsh-github-auth', version, installedAt: 1700000000000 }] }) }) }, async (f) => {
    f.page().remove(); await f.flush(); version = '2.0.0';
    f.document.body.insertAdjacentHTML('afterbegin', pageHTML); await f.flush();
    assert.match(f.card('dsh-github-auth').querySelector('.dps-metadata').textContent, /v2.0.0/);
    const calls = f.requests.length; await f.flush(); assert.equal(f.requests.length, calls, '页面增强不循环获取元数据');
  });
});

test('显示设置与置顶分别记录保存失败，重试只保存尚未落盘的当前值', async () => using({}, async (f) => {
  const proto = f.window.Storage.prototype, original = proto.setItem; let blocked = new Set([pinsKey]);
  proto.setItem = function (key, value) { if (blocked.has(key)) throw Error('quota'); return original.call(this, key, value); };
  try {
    await f.click('[data-dps-key="pkg:dsh-github-auth"] .dps-pin');
    await f.click('[data-dps-action=view][data-view=list]');
    assert.equal(f.document.querySelector('.dps-storage').hidden, false);
    assert.match(f.document.querySelector('.dps-storage').textContent, /置顶尚未保存/);
    assert.equal(f.window.localStorage.getItem(pinsKey), null);
    f.window.dispatchEvent(new f.window.StorageEvent('storage', { key: configKey })); await f.flush();
    assert.equal(f.card('dsh-github-auth').querySelector('.dps-pin').getAttribute('aria-pressed'), 'true', '其他窗口的设置变化不丢弃未保存的置顶');
    await f.settings(); assert.match(f.document.querySelector('.dps-settings-footer').textContent, /部分偏好尚未保存/);
    blocked.clear(); await f.click('[data-dps-action=retry-save]');
    assert.deepEqual(JSON.parse(f.window.localStorage.getItem(pinsKey)), ['pkg:dsh-github-auth']);
    assert.equal(f.document.querySelector('.dps-storage').hidden, true);
    blocked.add(configKey); await f.click('[data-dps-action=view][data-view=minimal]');
    await f.click('[data-dps-key="pkg:dsh-usage-pill"] .dps-pin');
    assert.match(f.document.querySelector('.dps-storage').textContent, /显示设置尚未保存/);
    blocked.clear(); await f.click('[data-dps-action=retry-save]');
    assert.equal(JSON.parse(f.window.localStorage.getItem(configKey)).view, 'minimal');
  } finally { proto.setItem = original; }
}));

test('极简异常标记可识别，恢复运行后移除；预览包含只读置顶和开关', async () => using({ config: { view: 'minimal' }, pins: ['pkg:broken-plugin'] }, async (f) => {
  const badge = f.card('broken-plugin').querySelector('.dps-issue'); assert.ok(badge);
  assert.equal(f.window.getComputedStyle(badge).display, 'inline-flex'); assert.match(badge.getAttribute('aria-label'), /加载异常/);
  assert.ok(f.document.querySelector('.dps-shortcut .dps-issue'));
  await f.settings();
  assert.equal(f.document.querySelectorAll('.dps-preview .dps-pin').length, 2);
  assert.equal(f.document.querySelectorAll('.dps-preview [role=switch]').length, 2);
  const before = f.window.localStorage.getItem(pinsKey);
  assert.ok([...f.document.querySelectorAll('.dps-preview button')].every((el) => el.disabled));
  await f.click('.dps-preview .dps-pin'); assert.equal(f.window.localStorage.getItem(pinsKey), before);
  await f.language('en'); assert.match(f.card('broken-plugin').querySelector('.dps-issue').title, /failed to load/);
  f.card('broken-plugin').setAttribute('data-plugin-status', 'running'); await f.flush();
  assert.equal(f.document.querySelectorAll('.dps-issue').length, 0);
  f.card('broken-plugin').setAttribute('data-plugin-status', 'problem'); await f.flush(); await f.dispose();
  assert.equal(f.document.querySelectorAll('.dps-issue').length, 0, '停用后不残留标记');
}));


test('排序菜单共用组件，键盘取消不提交，选项生效，卸载清理浮层', async () => using({}, async f => {
  await f.settings(); assert.equal(f.document.querySelectorAll('select').length, 0);
  await f.click('.dps-sort'); const trigger=f.document.querySelector('.dps-sort');
  assert.equal(trigger.getAttribute('aria-expanded'),'true');
  trigger.dispatchEvent(new f.window.KeyboardEvent('keydown',{key:'End',bubbles:true,cancelable:true}));
  trigger.dispatchEvent(new f.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
  assert.equal(f.document.querySelector('.dps-sort-menu'), null); assert.equal(JSON.parse(f.window.localStorage.getItem(configKey)||'{}').sort,undefined);
  await f.click('.dps-sort'); trigger.dispatchEvent(new f.window.KeyboardEvent('keydown',{key:'End',bubbles:true,cancelable:true})); trigger.dispatchEvent(new f.window.KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true})); await f.flush();
  assert.equal(JSON.parse(f.window.localStorage.getItem(configKey)).sort,'installed-old'); assert.match(f.document.querySelector('.dps-settings .dps-sort').textContent,/旧 → 新/);
  await f.click('.dps-settings .dps-sort'); assert.equal(f.document.querySelectorAll('.dps-sort-menu').length,1);
  await f.dispose(); assert.equal(f.document.querySelectorAll('.dps-sort-menu').length,0);
}));

test('卡片信息可独立关闭；极简保持精简，停用增强后还原描述', async () => using({config:{showDescription:false,showVersion:false,showDate:true},initialMetadata:[{name:'dsh-github-auth',version:'1.2.3',installedAt:1600000000000}]},async f=>{
  const meta=f.card('dsh-github-auth').querySelector('.dps-metadata'); assert.doesNotMatch(meta.textContent,/1.2.3/); assert.match(meta.textContent,/估算/);
  assert.equal(f.window.getComputedStyle(f.card('dsh-github-auth').querySelector('[data-dps-part=desc]')).display,'none');
  await f.dispose(); assert.notEqual(f.window.getComputedStyle(f.card('dsh-github-auth').querySelector('[id^=desc]')).display,'none');
}));

test('重新打开可重置或记住搜索与筛选',async()=>{
  for(const remember of [false,true]) await using({config:{remember}},async f=>{
    await f.search('github'); await f.click('[data-filter=installed]'); f.page().remove(); await f.flush(); f.document.body.insertAdjacentHTML('afterbegin',pageHTML); await f.flush();
    assert.equal(f.document.querySelector('.dps-search').value,remember?'github':''); assert.equal(f.document.querySelector('[data-filter=installed]').getAttribute('aria-pressed'),String(remember));
  });
});

test('备份导入先预览、严格校验、合并保留外观、替换和撤销恢复记录',async()=>using({config:{view:'list'},pins:['pkg:dsh-github-auth']},async f=>{
  await f.settings(); const input=f.document.querySelector('.dps-settings textarea');
  // React DOM in this harness is imported before JSDOM, so use its registered onChange property.
  const change=async raw=>{await act(async()=>{const props=input[Object.keys(input).find(k=>k.startsWith('__reactProps'))];props.onChange({target:{value:raw}});});await f.flush();};
  const clickText=async label=>{const b=[...f.document.querySelectorAll('.dps-settings button')].find(b=>b.textContent===label);assert.ok(b,label);await act(async()=>b.click());await f.flush();};
  await change(JSON.stringify({schema:'dsh-liao-shelf/preferences/v1',config:{view:'minimal',collapsed:['bundles']},pins:['pkg:empty-description']}));
  assert.equal(JSON.parse(f.window.localStorage.getItem(pinsKey)).length,1);
  await clickText('合并置顶与折叠'); assert.equal(JSON.parse(f.window.localStorage.getItem(configKey)).view,'list'); assert.equal(JSON.parse(f.window.localStorage.getItem(pinsKey)).length,2);
  await clickText('撤销导入'); assert.deepEqual(JSON.parse(f.window.localStorage.getItem(pinsKey)),['pkg:dsh-github-auth']);
  await change(JSON.stringify({schema:'dsh-liao-shelf/preferences/v1',config:{view:'invalid'},pins:[]})); assert.match(f.document.querySelector('.dps-settings').textContent,/备份无效/); assert.equal([...f.document.querySelectorAll('.dps-settings button')].some(b=>b.textContent==='替换全部偏好'),false);
  await change(JSON.stringify({schema:'dsh-liao-shelf/preferences/v1',config:{view:'minimal'},pins:[]})); await clickText('替换全部偏好'); assert.equal(JSON.parse(f.window.localStorage.getItem(configKey)).view,'minimal'); await clickText('撤销导入'); assert.equal(JSON.parse(f.window.localStorage.getItem(configKey)).view,'list');
}));
