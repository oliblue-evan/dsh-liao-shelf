import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, symlink, lstat, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:http';
import { createMetadataHandler, readInstallMetadata } from '../lib/metadata.js';
import { apply } from '../lib/index.js';

test('安装信息读取当前 Profile 链接创建时间；缺失项未知，不返回路径或读取非插件', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'shelf-meta-'));
  try {
    await mkdir(join(dir, 'node_modules')); await mkdir(join(dir, 'source')); await symlink(join(dir, 'source'), join(dir, 'node_modules', 'linked'));
    const result = await readInstallMetadata(dir, [{ name: 'linked', installed: true, version: '1.0.0' }, { name: 'missing', installed: true }, { name: '../source', installed: true }, { name: 'official', installed: false }]);
    assert.equal(result.length, 2); assert.equal(result[0].installedAt, Math.floor((await lstat(join(dir, 'node_modules', 'linked'))).birthtimeMs));
    assert.equal(result[0].timeSource, 'filesystem'); assert.equal(result[1].installedAt, null); assert.equal(result[1].timeSource, 'unknown');
    assert.ok(!JSON.stringify(result).includes(dir));
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('元数据接口只支持 GET；继承宿主登录与来源拒绝，异常不暴露内部路径', async () => {
  const handler = createMetadataHandler({ profileDir: '/not-exposed', listBundles: async () => [], admission: (req) => req.headers['x-test-login'] === 'yes' ? undefined : 401 });
  const server = createServer(handler); await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const url = 'http://127.0.0.1:' + server.address().port + '/api/plugin-shelf/metadata';
  try {
    assert.equal((await fetch(url)).status, 401);
    assert.equal((await fetch(url, { method: 'POST' })).status, 405);
    const response = await fetch(url, { headers: { 'x-test-login': 'yes' } }); assert.equal(response.status, 200); assert.deepEqual((await response.json()).packages, []);
    assert.equal((await fetch(url, { headers: { 'x-test-login': 'yes', 'sec-fetch-site': 'cross-site' } })).status, 403);
  } finally { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); }
});

test('服务注册由 effect 持有；停用移除只读路由', () => {
  const effects = [], routes = new Map();
  apply({ get: () => undefined, profileContext: { dir: '/test' }, pluginManager: { listBundles: async () => [] },
    effect: (fn) => effects.push(fn()), webServer: { register: (route) => { routes.set(route.path, route); return () => routes.delete(route.path); } } });
  assert.equal(routes.size, 1); effects.reverse().forEach((dispose) => dispose()); assert.equal(routes.size, 0);
});
