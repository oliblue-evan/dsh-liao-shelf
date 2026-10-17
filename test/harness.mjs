import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

export const configKey = 'liao-plugin-shelf.config';
export const pinsKey = 'liao-plugin-shelf.pins';
export function card(id, title, description, status, builtin = false) {
  return `<li data-plugin-${builtin ? 'item' : 'package'}="${id}"${status ? ` data-plugin-status="${status}"` : ''}><div class="host_head"><span class="host_icon"><svg></svg></span><div class="host_main"><div><button${description ? ` aria-describedby="desc-${id}"` : ''} aria-label="查看 ${title}">${title}</button></div>${description ? `<span id="desc-${id}">${description}</span>` : ''}</div>${builtin ? '' : `<div class="host_end"><button role="switch" aria-label="启用 ${title}" aria-checked="${status === 'running'}"></button></div>`}</div></li>`;
}
export const pageHTML = `<section data-plugin-panel><header><h1>插件</h1><div><button>刷新</button><button>添加插件</button></div></header><section data-plugin-group="official"><div><h3>官方</h3><span data-plugin-count="2">2</span></div><ul>${card('team', '智能体团队', '团队工具', 'running')}${card('terminal', '终端', '终端设置', null, true)}</ul></section><section data-plugin-group="bundles"><div><h3>已安装</h3><span data-plugin-count="4">4</span></div><ul>${card('dsh-github-auth', 'GitHub 授权', '管理账号权限', 'running')}${card('dsh-usage-pill', '用量与余额', '费用与 token 统计', 'disabled')}${card('broken-plugin', '异常插件', '启动失败', 'problem')}${card('empty-description', '没有描述', null, 'running')}</ul></section></section>`;

// Use the exact packaged host module loader when supplied; the DOM below is an explicit host-contract fixture.
export function readAsar(path, file) {
  const bytes = readFileSync(path), header = JSON.parse(bytes.subarray(16, 16 + bytes.readUInt32LE(12)));
  let entry = header;
  for (const key of file.split('/')) entry = entry.files[key];
  const offset = 8 + bytes.readUInt32LE(4) + Number(entry.offset);
  return bytes.subarray(offset, offset + entry.size).toString();
}
export async function fixture({ config, pins, legacyPins, legacyConfig, loaderSource, clientSource, fetcher, initialMetadata = [], sidebarEntries = [] } = {}) {
  const sidebarHTML = sidebarEntries.length ? `<nav aria-label="全局面板">${sidebarEntries.slice().sort((a, b) => (a.options.order || 0) - (b.options.order || 0)).map((entry) => `<button aria-label="${entry.options.label}">${entry.options.icon === 'masked' ? '<svg><defs><mask id="native-icon-mask"><rect width="16" height="16"></rect></mask></defs><path mask="url(#native-icon-mask)" d="M0 0"></path></svg>' : '<svg><path d="M0 0"></path></svg>'}<span>${entry.options.label}</span></button>`).join('')}</nav>` : '';
  const dom = new JSDOM(`<html lang="zh"><head></head><body>${sidebarHTML}${pageHTML}<main id="settings"></main><aside id="unrelated"><ul><li>其他页面</li></ul></aside></body></html>`, { url: 'http://localhost', pretendToBeVisual: true });
  const { window } = dom, { document } = window;
  const prior = {};
  for (const key of ['window', 'document', 'IS_REACT_ACT_ENVIRONMENT']) {
    prior[key] = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, value: key === 'window' ? window : key === 'document' ? document : true });
  }
  if (config !== undefined) window.localStorage.setItem(configKey, JSON.stringify(config));
  if (pins !== undefined) window.localStorage.setItem(pinsKey, JSON.stringify(pins));
  if (legacyPins !== undefined) window.localStorage.setItem('liaoP…ines', JSON.stringify(legacyPins));
  if (legacyConfig !== undefined) window.localStorage.setItem('liaoP…fig', JSON.stringify(legacyConfig));
  let serial = 0, frames = new Map(), frameRuns = 0;
  window.requestAnimationFrame = (fn) => { frames.set(++serial, fn); return serial; };
  window.cancelAnimationFrame = (id) => frames.delete(id);
  const requests = [];
  window.fetch = async (path, options) => {
    requests.push({ path, options });
    if (fetcher) return fetcher(path, options);
    if (path !== '/api/plugin-shelf/metadata') throw Error('Unexpected external request: ' + path);
    return { ok: true, status: 200, json: async () => ({ schema: 'dsh-plugin-shelf/metadata/v1', packages: initialMetadata }) };
  };
  const sandbox = vm.createContext({ window, document, console });
  let entry;
  window.__ModuleLoader__ = { load: (value) => { entry = value; } };
  let modules;
  if (loaderSource) {
    vm.runInContext(loaderSource, sandbox);
    const bootstrap = { id: '@deepseek-ai/dsh-client-modules', exports: entry.factory(() => { throw Error('Unexpected loader dependency'); }) };
    const target = { mode: 'queue', pendingQueue: [], load: (value) => target.pendingQueue.push(value) };
    window.__ModuleLoader__ = target;
    modules = new bootstrap.exports.ClientModuleSystem({ manifest: { modules: [] }, staticModules: { react: React }, registrationTarget: target, bootstrapModule: bootstrap });
  }
  const source = clientSource || readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8');
  vm.runInContext(source, sandbox);
  const plugin = modules ? await modules.import('dsh-plugin-shelf') : entry.factory((name) => { if (name !== 'react') throw Error(name); return React; });
  const disposers = [], slots = new Map(), localeListeners = new Set();
  let language = 'zh', root;
  function effect(fn) { const dispose = fn(); if (typeof dispose === 'function') disposers.push(dispose); }
  const context = {
    effect,
    locale: { getSnapshot: () => ({ active: language }), subscribe: (fn) => { localeListeners.add(fn); return () => localeListeners.delete(fn); }, register: () => () => {} },
    slots: { inject: (_slot, fn) => fn(), register: (options, Component) => { const key = options.name + ':' + (options.key || options.id); slots.set(key, Component); return () => slots.delete(key); }, entriesOfSlot: (name) => name === 'sidebar.panellist' ? sidebarEntries : [], subscribe: (name, fn) => { if (name === 'sidebar.panellist') return () => {}; return () => {}; } },
  };
  function start() { plugin.apply(context); }
  async function flush() {
    for (let i = 0; i < 20; i++) {
      await act(async () => { await Promise.resolve(); const pending = [...frames.values()]; frames.clear(); pending.forEach((fn) => { frameRuns++; fn(); }); await Promise.resolve(); });
      if (!frames.size) return;
    }
    throw Error('Observer/animation loop did not settle');
  }
  start(); await flush();
  return {
    dom, document, window, plugin, modules, slots, requests,
    page: () => document.querySelector('[data-plugin-panel]'),
    card: (id) => document.querySelector(`[data-plugin-package="${id}"],[data-plugin-item="${id}"]`),
    visible: () => [...document.querySelectorAll('[data-dps-card]:not([data-dps-hidden])')].map((el) => el.getAttribute('data-dps-key')),
    flush, start,
    get frameRuns() { return frameRuns; },
    async click(selector) { const el = document.querySelector(selector); if (!el) throw Error('Missing '+selector); await act(async () => el.click()); await flush(); },
    async search(value) { const input = document.querySelector('.dps-search'); input.value = value; input.dispatchEvent(new window.Event('input', { bubbles: true })); await flush(); },
    async language(value) { language = value; document.documentElement.lang = value; await act(async () => localeListeners.forEach((fn) => fn())); await flush(); },
    async settings() { root = createRoot(document.querySelector('#settings')); await act(async () => root.render(React.createElement(slots.get('plugins.bundle.config:dsh-plugin-shelf')))); },
    async dispose() { await act(async () => { if (root) { root.unmount(); root = null; } disposers.splice(0).reverse().forEach((fn) => fn()); }); await flush(); },
    async close() { await this.dispose(); dom.window.close(); for (const key of Object.keys(prior)) if (prior[key]) Object.defineProperty(globalThis, key, prior[key]); else delete globalThis[key]; }
  };
}
