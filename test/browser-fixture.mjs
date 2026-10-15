// Creates an isolated real-browser layout fixture; does not connect to a DSH profile.
import { mkdtempSync, copyFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { pageHTML } from './harness.mjs';
const require = createRequire(import.meta.url), dir = mkdtempSync(join(tmpdir(), 'dsh-shelf-browser-'));
for (const [pkg, file] of [['react','react.production.min.js'],['react-dom','react-dom.production.min.js']]) copyFileSync(join(require.resolve(pkg + '/package.json'), '..', 'umd', file), join(dir, file));
copyFileSync(new URL('../lib/client.js', import.meta.url), join(dir, 'client.js'));
writeFileSync(join(dir, 'index.html'), `<!doctype html><html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Plugin Shelf layout verification</title><style>
:root{--dsw-alias-label-primary:#eee;--dsw-alias-label-secondary:#bbb;--dsw-alias-label-tertiary:#999;--dsw-alias-bg-layer-1:#252528;--dsw-alias-bg-layer-2:#303034;--dsw-alias-border-l2:#5558;--dsw-alias-state-business-primary:#8099ff;--dsw-alias-state-error-primary:#ef8585}
body{margin:0;padding:16px;background:#151517;color:#eee;font:14px system-ui}body *{box-sizing:border-box}button,select{color:inherit;font:inherit;background:transparent}button{border:0}#controls{margin-bottom:12px}[data-plugin-panel]{display:flex;flex-direction:column}ul{list-style:none;padding:0}[data-plugin-group]>div{display:flex;gap:8px}.host_head{display:flex}.host_main{display:flex;flex:1;flex-direction:column;min-width:0}.host_main button{text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}.host_icon{display:flex;align-items:center;justify-content:center}.host_end [role=switch]{width:36px;height:22px;border-radius:20px;background:#777}.host_end [aria-checked=true]{background:#8099ff}#settings{margin-top:20px}
</style><div id="controls"><button id="lang">中文 / English</button></div>${pageHTML}<main id="settings"></main>
<script src="react.production.min.js"></script><script src="react-dom.production.min.js"></script><script>
localStorage.setItem('liao-plugin-shelf.config',JSON.stringify({view:'minimal',density:'compact'}));localStorage.setItem('liao-plugin-shelf.pins','[]');
window.__ModuleLoader__={load(entry){window.shelf=entry.factory(()=>React)}};
window.fetch=async()=>({ok:true,json:async()=>({schema:'dsh-plugin-shelf/metadata/v1',packages:[]})});
</script><script src="client.js"></script><script>
let language='en';const listeners=new Set(), effects=[], root=ReactDOM.createRoot(document.getElementById('settings'));
shelf.apply({effect(fn){const d=fn();if(typeof d==='function')effects.push(d)},locale:{getSnapshot:()=>({active:language}),subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)},register:()=>()=>{}},slots:{inject:(_,fn)=>fn(),register(o,Component){root.render(React.createElement(Component));return()=>root.unmount()}}});
document.getElementById('lang').onclick=()=>{language=language==='en'?'zh':'en';listeners.forEach(fn=>fn())};
</script></html>`);
console.log(dir);
