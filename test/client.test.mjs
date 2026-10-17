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
  assert.deepEqual([...f.slots.keys()], ['plugins.bundle.config:dsh-plugin-shelf'], '只在插件详情注册设置');
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

test('侧栏更多仿照豆包：悬停浮层、点击内联展开/收起，保留原图标并在卸载时恢复', async () => {
  const clicked = { one: 0, two: 0, core: 0 };
    const sidebarEntries = [
    { options: { id: 'plugins', order: 0, label: '插件' }, registrant: '@deepseek-ai/dsh-client-ui-plugin-manager' },
    { options: { id: 'native-other', order: 15, label: '外部入口一' }, registrant: 'dyn/@deepseek-ai/dsh-client-ui-experimental' },
    { options: { id: 'third-one', order: 20, label: '外部入口一', icon: 'masked' }, registrant: 'dyn/dsh-third-one' },
    { options: { id: 'third-two', order: 10, label: '外部入口二' }, registrant: 'dsh-third-two' },
    { options: { id: 'unknown', order: 30, label: '未知来源' } }
  ];
  await using({ sidebarEntries, config: { sidebarMore: ['third-one', 'third-two'], sidebarOrder: ['third-two', 'third-one'] } }, async (f) => {
    const native = [...f.document.querySelectorAll('nav > button:not([data-dps-more-trigger])')];
    // Force the trigger template to be the first hidden, non-current native item.
    // This catches overflow/entry markers accidentally copied onto the More button.
    native.forEach((button) => button.setAttribute('aria-current', 'page'));
    native[3].removeAttribute('aria-current');
    const selectNative = (selected) => { native.forEach((button) => { button.removeAttribute('aria-current'); button.classList.remove('active'); }); selected.setAttribute('aria-current', 'page'); selected.classList.add('active'); };
    native[3].addEventListener('click', () => { clicked.one++; selectNative(native[3]); }); native[1].addEventListener('click', () => { clicked.two++; selectNative(native[1]); }); native[0].addEventListener('click', () => clicked.core++);
    await f.flush();
    assert.equal(f.document.querySelectorAll('nav > button[data-dps-sidebar-entry]').length, 4, '除插件管理入口外，其他有 ID 的侧栏入口都纳入管理');
    assert.equal(native[0].hasAttribute('data-dps-sidebar-overflow'), false, '插件管理入口固定留在更多之外');
    assert.equal(native[2].hasAttribute('data-dps-sidebar-overflow'), false, '同名入口未收纳时仍保持原位');
    assert.equal(native[3].getAttribute('data-dps-sidebar-overflow'), 'true');
    assert.equal(native[3].style.getPropertyValue('display'), 'none', '收进更多时直接隐藏原生行，不依赖宿主保留插件样式表');
    assert.equal(native[3].style.getPropertyPriority('display'), 'important');
    assert.ok(f.document.querySelector('[data-dps-more-trigger]'));
    const trigger = f.document.querySelector('[data-dps-more-trigger]');
    assert.ok(trigger.classList.contains('dps-sidebar-more'), '原生克隆入口保留书架状态样式钩子');
    assert.equal(trigger.hasAttribute('data-dps-sidebar-entry'), false, '更多按钮不继承原生插件入口身份');
    assert.equal(trigger.hasAttribute('data-dps-sidebar-overflow'), false, '更多按钮不会继承收纳隐藏标记');
    assert.equal(trigger.hasAttribute('draggable'), false, '更多按钮本身不作为可拖动入口');
    assert.notEqual(trigger.style.getPropertyValue('display'), 'none', '更多按钮克隆自已收纳入口时仍保持可见');
    assert.equal(trigger.querySelector('svg')?.getAttribute('aria-hidden'), 'true', '更多入口使用稳定的网格图标');
    assert.equal(trigger.querySelector('[data-dps-more-chevron]')?.getAttribute('aria-hidden'), 'true', '更多入口带有方向提示图标');
    assert.equal(trigger.textContent.trim(), '更多', '收起态标题不与图标重叠');
    native.forEach((button) => button.removeAttribute('aria-current')); await f.flush();
    assert.equal(trigger.getAttribute('data-dps-active'), 'false', '当前未选中更多入口时按钮不高亮');
    trigger.dispatchEvent(new f.window.MouseEvent('mouseenter'));
    assert.equal(f.document.querySelectorAll('.dps-sidebar-popover button').length, 2, '收起态悬停显示浮框');
    assert.equal(f.document.querySelector('.dps-sidebar-popover').style.width, '260px', '悬停浮框按原生侧栏行宽展示，而不是固定窄卡片');
    assert.equal(f.document.querySelector('.dps-sidebar-popover [data-dps-sidebar-entry]').style.width, '100%', '浮框条目保留原生布局并填满与侧栏等宽的容器');
    assert.notEqual(f.document.querySelector('.dps-sidebar-popover [data-dps-sidebar-entry]').style.display, 'none', '被收纳的原生行虽隐藏，浮层克隆必须恢复可见');
    const clonedIcon = f.document.querySelector('.dps-sidebar-popover button svg');
    assert.ok(clonedIcon?.querySelector('path'), '浮框保留原按钮中完整的 SVG 图标结构');
    const originalMask = native[3].querySelector('mask');
    const clonedMask = f.document.querySelector('.dps-sidebar-popover [data-dps-sidebar-entry="third-one"] mask');
    const clonedPath = f.document.querySelector('.dps-sidebar-popover [data-dps-sidebar-entry="third-one"] path');
    assert.equal(originalMask.id, 'native-icon-mask', '原生图标 ID 保持不变');
    assert.notEqual(clonedMask.id, originalMask.id, '克隆图标的 SVG ID 独立命名，避免和隐藏的原图标冲突');
    assert.equal(clonedPath.getAttribute('mask'), `url(#${clonedMask.id})`, '遮罩引用同步改写到克隆图标自己的 ID');
    trigger.dispatchEvent(new f.window.MouseEvent('mouseleave'));
    await f.click('[data-dps-more-trigger]');
    assert.equal(f.document.querySelectorAll('.dps-sidebar-menu button').length, 2);
    assert.equal(f.document.querySelector('.dps-sidebar-menu').hidden, false, '点击后在侧栏原位展开');
    const sidebarCss = [...f.document.querySelectorAll('style[data-dps-style]')].map((style) => style.textContent).join('\n');
    assert.match(sidebarCss, /\.dps-sidebar-menu\s*\{[^}]*gap:4px/, '内联展开与原生侧栏保持一致的行间距');
    assert.match(sidebarCss, /\.dps-sidebar-popover\s*\{[^}]*gap:4px/, '收起态浮层为每个入口保留清晰的行间隔');
    assert.match(sidebarCss, /\.dps-sidebar-menu \.dps-sidebar-item:hover/, '展开列表中鼠标悬停仍有高亮反馈');
    assert.ok([...f.document.querySelectorAll('.dps-sidebar-menu [data-dps-sidebar-entry]')].every((item) => item.style.display !== 'none'), '内联展开时收纳行保持可见');
    assert.equal(trigger.textContent.trim(), '收起');
    assert.equal(trigger.getAttribute('aria-expanded'), 'true');
    assert.deepEqual([...f.document.querySelectorAll('.dps-sidebar-menu button')].map((item) => item.textContent), ['外部入口二', '外部入口一']);
    selectNative(native[3]); await f.flush();
    assert.equal(f.document.querySelector('.dps-sidebar-menu [data-dps-sidebar-entry="third-one"]').getAttribute('aria-current'), 'page', '克隆入口同步当前选中状态');
    await f.click('.dps-sidebar-menu [data-dps-sidebar-entry="third-two"]');
    assert.equal(clicked.two, 1, '内联展开的入口仍会触发原生导航');
    assert.equal(f.document.querySelector('.dps-sidebar-menu [data-dps-sidebar-entry="third-one"]').hasAttribute('aria-current'), false, '切换入口后清除旧入口选中态');
    assert.equal(f.document.querySelector('.dps-sidebar-menu [data-dps-sidebar-entry="third-two"]').getAttribute('aria-current'), 'page', '切换入口后高亮新入口');
    assert.equal(f.document.querySelector('.dps-sidebar-menu [data-dps-sidebar-entry="third-two"]').classList.contains('active'), true, '宿主通过 class 标记当前项时也同步到克隆');
    assert.equal(f.document.querySelector('.dps-sidebar-menu').hidden, false, '选择内联展开的入口后保持展开，便于继续选择');
    await f.click('[data-dps-more-trigger]');
    assert.equal(f.document.querySelector('.dps-sidebar-menu').hidden, true, '再次点击收起侧栏条目');
    assert.equal(trigger.textContent.trim(), '更多', '收起后按钮可见文字同步恢复');
    assert.equal(trigger.getAttribute('data-dps-active'), 'true', '当前页面属于更多时，收起按钮保持选中高亮');
    trigger.dispatchEvent(new f.window.MouseEvent('mouseenter'));
    assert.equal(f.document.querySelectorAll('.dps-sidebar-popover button').length, 2, '收起后悬停仍能预览浮框');
    assert.equal(f.document.querySelector('.dps-sidebar-popover [data-dps-sidebar-entry="third-two"]').getAttribute('data-dps-selected'), 'true', '浮框勾选当前所选入口');
    await f.click('.dps-sidebar-popover button');
    assert.deepEqual(clicked, { one: 0, two: 2, core: 0 });
    assert.equal(f.document.querySelector('.dps-sidebar-menu').hidden, true, '从悬浮浮框选择入口后仍关闭浮框');
    selectNative(native[0]); await f.flush();
    assert.equal(trigger.getAttribute('data-dps-active'), 'false', '切到更多以外的侧栏入口后，更多按钮取消高亮');
    assert.equal(f.document.querySelector('.dps-sidebar-popover [data-dps-sidebar-entry="third-two"]').getAttribute('data-dps-selected'), 'false', '切换页面后浮框勾选同步清除');
    await f.settings();
    const sidebarSettings = [...f.document.querySelectorAll('.dps-settings details')].find((node) => node.querySelector('summary')?.textContent.includes('侧栏入口'));
    assert.equal(sidebarSettings.querySelectorAll('[role="switch"]').length, 4);
    const overflowSwitch = f.document.querySelector('[aria-label="收进更多 外部入口一"]');
    assert.equal(overflowSwitch.getAttribute('aria-checked'), 'true', '开关开启准确表示该入口已收进更多');
    await act(async () => overflowSwitch.click()); await f.flush();
    assert.equal(native[3].hasAttribute('data-dps-sidebar-overflow'), false);
    assert.equal(native[3].style.getPropertyValue('display'), '', '移出更多后恢复原生行内显示样式');
    const currentTrigger = f.document.querySelector('[data-dps-more-trigger]'), transfer = { value:'', preview:null, setData(_type, value){this.value=value;}, getData(){return this.value;}, setDragImage(node){this.preview=node;} };
    assert.ok(currentTrigger, '没有收纳项时仍保留“更多”作为收纳目标');
    const drag = (target, type, clientY = 0) => { const event = new f.window.MouseEvent(type, { bubbles:true, cancelable:true, clientY }); Object.defineProperty(event, 'dataTransfer', { value:transfer }); target.dispatchEvent(event); };
    await act(async () => { drag(native[3], 'dragstart'); });
    assert.equal(transfer.preview, native[3], '浏览器拖动预览直接取自当前可见行，避免离屏克隆变透明');
    assert.equal(f.document.querySelector('[data-dps-more-dropzone]').hidden, false, '拖动时在侧栏底部显示虚线收纳目标');
    await act(async () => { drag(currentTrigger, 'dragover'); });
    assert.equal(currentTrigger.getAttribute('data-dps-drop-target'), 'true', '拖到“更多”时目标清晰高亮');
    await act(async () => { drag(currentTrigger, 'drop'); }); await f.flush();
    assert.equal(native[3].getAttribute('data-dps-sidebar-overflow'), 'true', '拖到更多后即时折叠');
    assert.ok(JSON.parse(f.window.localStorage.getItem(configKey)).sidebarMore.includes('third-one'));
    trigger.dispatchEvent(new f.window.MouseEvent('mouseenter'));
    const flyoutEntry = f.document.querySelector('.dps-sidebar-popover [data-dps-sidebar-entry="third-one"]');
    const flyoutTarget = f.document.querySelector('.dps-sidebar-popover [data-dps-sidebar-entry="third-two"]');
    await act(async () => { drag(flyoutEntry, 'dragstart'); drag(flyoutTarget, 'dragover', 0); });
    assert.equal(flyoutTarget.getAttribute('data-dps-drop-before'), 'true', '浮框内拖动时显示明确的插入线');
    await act(async () => { drag(flyoutTarget, 'drop'); }); await f.flush();
    assert.deepEqual(JSON.parse(f.window.localStorage.getItem(configKey)).sidebarMore, ['third-one', 'third-two'], '浮框内排序仍留在“更多”分组');
    assert.deepEqual(JSON.parse(f.window.localStorage.getItem(configKey)).sidebarOrder.slice(0, 2), ['third-one', 'third-two'], '浮框目标上方放置后更新顺序');
    const cancelSource = f.document.querySelector('.dps-sidebar-popover [data-dps-sidebar-entry="third-one"]'), cancelTarget = f.document.querySelector('.dps-sidebar-popover [data-dps-sidebar-entry="third-two"]');
    await act(async () => { drag(cancelSource, 'dragstart'); drag(cancelTarget, 'dragover'); f.window.dispatchEvent(new f.window.Event('blur')); });
    assert.equal(cancelSource.hasAttribute('data-dps-sidebar-dragging'), false, '拖动时窗口失焦会清除拖动态');
    assert.equal(cancelTarget.hasAttribute('data-dps-drop-before'), false, '拖动取消会清除插入线高亮');
    assert.equal(f.document.querySelector('[data-dps-more-dropzone]').hidden, true, '拖动取消会收起临时收纳提示');
    await f.dispose();
    assert.ok(native.every((node) => node.isConnected)); assert.ok(native.every((node) => !node.hasAttribute('data-dps-sidebar-entry') && !node.hasAttribute('data-dps-sidebar-overflow')));
    assert.ok(native.every((node) => !node.hasAttribute('draggable')));
    assert.equal(native[3].style.getPropertyValue('display'), '', '停用插件后恢复原生入口的显示样式');
    assert.equal(native[1].style.order, ''); assert.equal(f.document.querySelector('[data-dps-more-trigger]'), null);
  });
});

test('侧栏入口支持快捷键和自定义网页链接', async () => {
  const clicked = { plugin:0 }, opened=[];
  const sidebarEntries=[{options:{id:'external-tool',order:10,label:'外部工具'},registrant:'sample-plugin'}];
  await using({sidebarEntries,config:{sidebarMore:['external-tool']}},async(f)=>{
    f.window.open=(url,target,features)=>opened.push({url,target,features});
    const native=f.document.querySelector('nav > button[aria-label="外部工具"]'); native.addEventListener('click',()=>clicked.plugin++);
    await f.settings();
    const shortcut=f.document.querySelector('[aria-label="快捷键 外部工具"]');
    const keydown=(input,key,mods)=>{const props=input[Object.keys(input).find(k=>k.startsWith('__reactProps'))];props.onKeyDown(Object.assign({key,currentTarget:{blur(){}},preventDefault(){}},mods));};
    await act(async()=>keydown(shortcut,'K',{ctrlKey:true,shiftKey:true}));
    assert.equal(JSON.parse(f.window.localStorage.getItem(configKey)).sidebarShortcuts['external-tool'],'Ctrl+Shift+K');
    await act(async()=>f.document.body.dispatchEvent(new f.window.KeyboardEvent('keydown',{key:'k',ctrlKey:true,shiftKey:true,bubbles:true,cancelable:true})));
    assert.equal(clicked.plugin,1,'快捷键触发原生侧栏入口');
    const links=f.document.querySelector('.dps-sidebar-links');
    await act(async()=>links.querySelector('summary').click());
    const label=links.querySelector('[aria-label="链接名称"]'), url=links.querySelector('[aria-label="网址（https://）"]');
    await act(async()=>{label[Object.keys(label).find(k=>k.startsWith('__reactProps'))].onChange({target:{value:'项目文档'}});url[Object.keys(url).find(k=>k.startsWith('__reactProps'))].onChange({target:{value:'https://example.com/docs'}});});
    await f.click('.dps-link-form button');
    assert.equal(JSON.parse(f.window.localStorage.getItem(configKey)).sidebarLinks[0].url,'https://example.com/docs');
    assert.equal(f.document.querySelectorAll('.dps-sidebar-menu .dps-sidebar-custom-link').length,1);
    const linkShortcut=f.document.querySelector('[aria-label="快捷键 项目文档"]');
    await act(async()=>keydown(linkShortcut,'L',{altKey:true,metaKey:true}));
    await act(async()=>f.document.body.dispatchEvent(new f.window.KeyboardEvent('keydown',{key:'l',altKey:true,metaKey:true,bubbles:true,cancelable:true})));
    assert.equal(opened.at(-1).url,'https://example.com/docs','自定义链接快捷键打开指定网页');
    assert.equal(opened.at(-1).target,'_blank');
  });
});

test('除插件管理入口外，DSH 内置和扩展侧栏入口都可收进更多', async () => {
  const sidebarEntries = [
    { options:{id:'plugins',order:0,label:'插件'},registrant:'@deepseek-ai/dsh-client-ui-plugin-manager' },
    { options:{id:'skills',order:10,label:'技能中心'},registrant:'@deepseek-ai/dsh-client-ui-skill-explorer' },
    { options:{id:'context',order:20,label:'上下文洞察'},registrant:'@deepseek-ai/dsh-context' },
    { options:{id:'schedule',order:30,label:'自动化任务'},registrant:'@deepseek-ai/dsh-client-ui-automation' },
    { options:{id:'ssh',order:40,label:'SSH'},registrant:'@deepseek-ai/dsh-ssh' },
    { options:{id:'ig5',order:50,label:'IG5 逆向工作台'},registrant:'@deepseek-ai/dsh-client-ui-ig5' },
    { options:{id:'plugin-market',order:60,label:'插件市场'},registrant:'@deepseek-ai/dsh-market' }
  ];
  await using({ sidebarEntries, config:{sidebarMore:['skills','context','schedule','ssh','ig5','plugin-market']} }, async (f) => {
    const home = f.document.querySelector('nav > button[aria-label="插件"]');
    assert.ok(home, '插件管理入口仍存在');
    assert.equal(home.hasAttribute('data-dps-sidebar-entry'), false, '插件管理入口不可收入更多');
    assert.notEqual(home.style.getPropertyValue('display'), 'none');
    for (const label of ['技能中心','上下文洞察','自动化任务','SSH','IG5 逆向工作台','插件市场']) {
      const entry = f.document.querySelector(`nav > button[aria-label="${label}"]`);
      assert.ok(entry, `${label} 入口存在`);
      assert.equal(entry.getAttribute('data-dps-sidebar-overflow'), 'true', `${label} 可收入更多`);
      assert.equal(entry.style.getPropertyValue('display'), 'none');
    }
    await f.click('[data-dps-more-trigger]');
    assert.deepEqual([...f.document.querySelectorAll('.dps-sidebar-menu button')].map((button) => button.getAttribute('aria-label')), ['技能中心','上下文洞察','自动化任务','SSH','IG5 逆向工作台','插件市场']);
    await f.settings();
    assert.equal(f.document.querySelectorAll('.dps-settings [aria-label^="收进更多 "]').length, 6, '所有非插件管理入口均提供收纳开关');
    const settingsRows = [...f.document.querySelectorAll('.dps-settings-section .dps-pins-list li')].slice(-6);
    const finalMoveDown = [...settingsRows.at(-1).querySelectorAll('button')].find((button) => button.getAttribute('aria-label')?.startsWith('下移 '));
    assert.equal(finalMoveDown.disabled, true, '最后一个可管理入口不能继续下移');
  });
});

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
  return { ok: true, json: async () => ({ schema: 'dsh-plugin-shelf/metadata/v1', packages: [] }) };
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
  await using({ fetcher: async () => fail ? { ok: false, status: 503 } : { ok: true, json: async () => ({ schema: 'dsh-plugin-shelf/metadata/v1', packages: [{ name: 'dsh-github-auth', version, installedAt: 1700000000000 }] }) } }, async (f) => {
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
    finish({ ok: true, json: async () => ({ schema: 'dsh-plugin-shelf/metadata/v1', packages: [] }) }); await f.flush();
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
  await using({ fetcher: async () => ({ ok: true, json: async () => ({ schema: 'dsh-plugin-shelf/metadata/v1', packages: [{ name: 'dsh-github-auth', version, installedAt: 1700000000000 }] }) }) }, async (f) => {
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
  await change(JSON.stringify({schema:'dsh-plugin-shelf/preferences/v1',config:{view:'minimal',collapsed:['bundles']},pins:['pkg:empty-description']}));
  assert.equal(JSON.parse(f.window.localStorage.getItem(pinsKey)).length,1);
  await clickText('合并置顶与折叠'); assert.equal(JSON.parse(f.window.localStorage.getItem(configKey)).view,'list'); assert.equal(JSON.parse(f.window.localStorage.getItem(pinsKey)).length,2);
  await clickText('撤销导入'); assert.deepEqual(JSON.parse(f.window.localStorage.getItem(pinsKey)),['pkg:dsh-github-auth']);
  await change(JSON.stringify({schema:'dsh-plugin-shelf/preferences/v1',config:{view:'invalid'},pins:[]})); assert.match(f.document.querySelector('.dps-settings').textContent,/备份无效/); assert.equal([...f.document.querySelectorAll('.dps-settings button')].some(b=>b.textContent==='替换全部偏好'),false);
  await change(JSON.stringify({schema:'dsh-plugin-shelf/preferences/v1',config:{view:'minimal'},pins:[]})); await clickText('替换全部偏好'); assert.equal(JSON.parse(f.window.localStorage.getItem(configKey)).view,'minimal'); await clickText('撤销导入'); assert.equal(JSON.parse(f.window.localStorage.getItem(configKey)).view,'list');
}));
