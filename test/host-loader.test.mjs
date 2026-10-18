import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fixture, readAsar } from './harness.mjs';

const asar = process.env.DSH_ASAR || '/Applications/DeepSeek Harness.app/Contents/Resources/app.asar';
const available = existsSync(asar);
test('动态加载并移除其他插件时，真实宿主不得认领或删除书架的样式', { skip: available ? false : 'Set DSH_ASAR to the exact desktop app.asar' }, async () => {
  const f = await fixture({ loaderSource: readAsar(asar, 'dsh/node_modules/@deepseek-ai/dsh-client-modules/lib/client.js') });
  try {
    const style = f.document.querySelector('style[data-dps-style]');
    assert.ok(style);
    for (let cycle = 0; cycle < 2; cycle++) {
      const id = `style-owner-probe-${cycle}`;
      f.modules.updateManifest({ modules: [{ id, rev: '1', url: `/??${id}/client.js&rev=1`, external: [], inject: [] }], plugins: [] }, []);
      f.modules.register({ id, factory() {
        const other = f.document.createElement('style');
        other.setAttribute('data-plugin', id);
        other.textContent = '.foreign-probe { display: block; }';
        f.document.head.append(other);
        return { apply() {} };
      } });
      await f.modules.import(id);
      const claimedBy = style.getAttribute('data-plugin');
      f.modules.updateManifest({ modules: [], plugins: [] }, []);
      f.modules.prune(['dsh-liao-shelf']);
      assert.equal(style.isConnected, true, `Foreign module ${id} claimed the shelf style as ${claimedBy}, then removed it`);
      assert.equal(claimedBy, 'dsh-liao-shelf');
      assert.equal(f.document.querySelector(`style[data-plugin="${id}"]`), null);
      await f.flush();
      assert.equal(f.window.getComputedStyle(f.document.querySelector('.dps-tools')).display, 'flex');
    }
    await f.dispose();
    assert.equal(style.isConnected, false, 'Shelf unload must still remove its own stylesheet');
  } finally { await f.close(); }
});
test('DSH 0.2.1-rc.2 实际模块加载器加载发布入口；交互场景记录', { skip: available ? false : 'Set DSH_ASAR to the exact 0.2.1-rc.2 desktop app.asar' }, async () => {
  const root = 'dsh/node_modules/@deepseek-ai/';
  const version = JSON.parse(readAsar(asar, root + 'dsh-client-ui-plugin-manager/package.json')).version;
  assert.equal(version, '0.2.1-rc.2', 'Target drift requires a new host-contract review');
  const f = await fixture({ loaderSource: readAsar(asar, root + 'dsh-client-modules/lib/client.js') });
  const transcript = [];
  function record(step) {
    transcript.push({ step, visible: f.visible(), count: f.document.querySelector('.dps-results')?.textContent,
      view: f.page().getAttribute('data-dps-view'), shortcuts: [...f.document.querySelectorAll('.dps-shortcuts [data-dps-action=open]')].map((x) => x.getAttribute('data-dps-key')) });
  }
  try {
    assert.ok(f.modules.loadCache.has('dsh-liao-shelf'));
    record('open'); await f.search('github'); record('search');
    await f.click('[data-dps-key="pkg:dsh-github-auth"] .dps-pin'); record('pin');
    await f.click('[data-dps-action=clear]'); await f.click('[data-filter=pinned]'); record('pinned filter');
    await f.click('[data-dps-action=view][data-view=list]'); record('list view');
    await f.click('[data-dps-action=view][data-view=minimal]'); record('minimal view');
    await f.click('[data-dps-action=toggle-all]');
    transcript.push({ step: 'collapse', groups: [...f.document.querySelectorAll('[data-dps-collapsed]')].map((node) => node.getAttribute('data-plugin-group')), shortcutsCollapsed: f.document.querySelector('.dps-shortcuts').hidden });
    await f.click('[data-dps-action=toggle-all]'); await f.click('[data-filter=all]');
    await f.click('[data-dps-key="pkg:dsh-usage-pill"] .dps-pin'); await f.settings();
    await f.click('.dps-settings [aria-label="上移 用量与余额"]'); record('pin order');
    await f.click('.dps-unpin[data-dps-key="pkg:dsh-usage-pill"]'); record('unpin');
    await f.click('[data-dps-action=undo-pin]'); record('undo');
    f.document.querySelector('[data-group=bundles]').focus();
    f.document.activeElement.dispatchEvent(new f.window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    transcript.push({ step: 'keyboard', focusedPackage: f.document.activeElement.closest('[data-plugin-package]').getAttribute('data-plugin-package') });
    const more = f.document.querySelector('.dps-more'); more.open = true; more.querySelector('button').focus();
    f.document.activeElement.dispatchEvent(new f.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    transcript.push({ step: 'more menu', closed: !more.open, focusedSummary: f.document.activeElement === more.querySelector('summary') });
    transcript.push({ step: 'preview and issues', previewPins: f.document.querySelectorAll('.dps-preview .dps-pin').length,
      previewSwitches: f.document.querySelectorAll('.dps-preview [role=switch]').length,
      previewReadOnly: [...f.document.querySelectorAll('.dps-preview button')].every((node) => node.disabled),
      issueText: f.card('broken-plugin').querySelector('.dps-issue').getAttribute('aria-label') });
    await f.dispose(); transcript.push({ step: 'dispose', slots: f.slots.size, injectedElements: f.document.querySelectorAll('[data-dps-page],.dps-tools,.dps-pin,[data-dps-style]').length });
    assert.deepEqual(transcript, JSON.parse(readFileSync(new URL('./snapshots/shelf.json', import.meta.url))));
  } finally { await f.close(); }
});
