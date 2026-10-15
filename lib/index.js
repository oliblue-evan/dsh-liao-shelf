import { createMetadataHandler } from './metadata.js';

export const name = 'plugin-shelf';
export const inject = ['webServer', 'profileContext', 'pluginManager'];

export function apply(ctx) {
  const connection = ctx.get('connection');
  const admission = typeof connection?.requestRejection === 'function' ? (request) => connection.requestRejection(request) : undefined;
  ctx.effect(() => ctx.webServer.register({ kind: 'exact', path: '/api/plugin-shelf/metadata',
    handler: createMetadataHandler({ profileDir: ctx.profileContext.dir, listBundles: () => ctx.pluginManager.listBundles(), admission })
  }), 'plugin-shelf: read-only installation metadata');
}
