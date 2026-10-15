import { lstat } from 'node:fs/promises';
import { join } from 'node:path';

export const METADATA_SCHEMA = 'dsh-plugin-shelf/metadata/v1';
const PACKAGE_NAME = /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/i;

/** Read creation dates of current profile entries, not the historical first installation.
 * @param {string} profileDir Active profile supplied by DSH's profileContext.
 * @param {Array} bundles Authoritative inventory from pluginManager.listBundles().
 * @returns {Promise<Array>} Package/version/date records without local paths.
 */
export async function readInstallMetadata(profileDir, bundles) {
  return Promise.all(bundles.filter((bundle) => bundle.installed && typeof bundle.name === 'string' && PACKAGE_NAME.test(bundle.name)).map(async (bundle) => {
    let installedAt = null;
    try {
      // lstat intentionally reads the profile entry: stat on a linked source would date the repository instead.
      const info = await lstat(join(profileDir, 'node_modules', bundle.name));
      if (info.birthtimeMs > 0 && info.birthtimeMs <= Date.now() + 300000) installedAt = Math.floor(info.birthtimeMs);
    } catch { /* A missing/unreadable entry has an unknown date, never "installed now". */ }
    return { name: bundle.name, version: typeof bundle.version === 'string' ? bundle.version : null,
      installedAt, timeSource: installedAt === null ? 'unknown' : 'filesystem' };
  }));
}

/** @returns {Function} GET-only request handler. The optional admission gate is the host's own login/origin gate. */
export function createMetadataHandler({ profileDir, listBundles, admission }) {
  return async (req, res) => {
    const send = (status, body) => { res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' }); res.end(JSON.stringify({ schema: METADATA_SCHEMA, ...body })); };
    if (req.method !== 'GET') return send(405, { error: 'GET required' });
    const peer = req.socket?.remoteAddress;
    const loopbackPeer = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(peer);
    let url;
    try { url = new URL('http://' + String(req.headers.host || '')); } catch { return send(403, { error: 'Untrusted request' }); }
    const desktop = loopbackPeer && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) && req.headers.origin === 'dsh-app://app';
    if (!desktop && admission) {
      let rejection;
      try { rejection = admission(req); } catch { rejection = 403; }
      if (rejection !== undefined) return send(rejection === 401 ? 401 : 403, { error: 'DSH admission required' });
    } else if (!desktop) {
      if (!loopbackPeer || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) return send(403, { error: 'Untrusted request' });
      if (req.headers.origin) {
        try { if (new URL(req.headers.origin).host !== url.host) return send(403, { error: 'Untrusted request' }); }
        catch { return send(403, { error: 'Untrusted request' }); }
      }
    }
    if (req.headers['sec-fetch-site'] === 'cross-site' && !desktop) return send(403, { error: 'Untrusted request' });
    try { return send(200, { packages: await readInstallMetadata(profileDir, await listBundles()) }); }
    catch { return send(503, { error: 'Plugin inventory unavailable' }); }
  };
}
