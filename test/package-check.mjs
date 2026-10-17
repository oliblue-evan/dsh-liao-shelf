import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fixture, readAsar } from './harness.mjs';

const dir = mkdtempSync(join(tmpdir(), 'dsh-shelf-pack-'));
let f;
try {
  const archive = join(dir, 'plugin.tgz');
  const pnpm = process.env.npm_execpath;
  if (pnpm && /pnpm/.test(pnpm)) execFileSync(process.execPath, [pnpm, 'pack', '--out', archive], { stdio: 'pipe' });
  else execFileSync('pnpm', ['pack', '--out', archive], { stdio: 'pipe' });
  const entries = execFileSync('tar', ['-tzf', archive], { encoding: 'utf8' }).trim().split('\n').sort();
  const expected = ['CHANGELOG.md', 'LICENSE', 'README.en.md', 'README.md', 'cordis.patch.yml', 'dsh-plugin.naming.json', 'lib/client.js', 'lib/index.js', 'lib/metadata.js', 'locale/en.json', 'locale/zh.json', 'package.json'].map((path) => 'package/' + path).sort();
  assert.deepEqual(entries, expected, 'Only reviewed runtime files and documentation belong in the artifact');
  const read = (file) => execFileSync('tar', ['-xOf', archive, 'package/' + file], { encoding: 'utf8' });
  const manifest = JSON.parse(read('package.json'));
  assert.equal(manifest.version, '0.6.1');
  assert.doesNotMatch(read('lib/client.js'), /dsh-market|checkUpdates|dps-update-tag/, 'The shipped client must not contain update integration');
  execFileSync('tar', ['-xzf', archive, '-C', dir]);
  const entry = await import(pathToFileURL(join(dir, 'package/lib/index.js')).href);
  assert.equal(entry.name, 'plugin-shelf'); assert.ok(!('default' in entry));
  const asar = process.env.DSH_ASAR || '/Applications/DeepSeek Harness.app/Contents/Resources/app.asar';
  const loaderSource = existsSync(asar) ? readAsar(asar, 'dsh/node_modules/@deepseek-ai/dsh-client-modules/lib/client.js') : undefined;
  if (loaderSource) assert.equal(JSON.parse(readAsar(asar, 'dsh/node_modules/@deepseek-ai/dsh-client-modules/package.json')).version, '0.2.1-rc.2');
  f = await fixture({ clientSource: read('lib/client.js'), loaderSource });
  await f.search('github'); assert.deepEqual(f.visible(), ['pkg:dsh-github-auth']);
  await f.click('[data-dps-key="pkg:dsh-github-auth"] .dps-pin');
  assert.ok(f.document.querySelector('.dps-shortcuts')); await f.dispose();
  assert.equal(f.document.querySelectorAll('[data-dps-style],.dps-tools,.dps-pin').length, 0);
  console.log('Pack OK: 12 reviewed files; packaged metadata import and client search, pin and disposal passed' + (loaderSource ? ' via DSH 0.2.1-rc.2 ClientModuleSystem.' : '. Host loader unavailable; transport proof skipped.'));
} finally {
  if (f) await f.close();
  rmSync(dir, { recursive: true, force: true });
}
