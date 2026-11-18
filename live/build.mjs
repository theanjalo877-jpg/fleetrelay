import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const [sourceRoot,output] = process.argv.slice(2);
if(!sourceRoot||!output)throw new Error('Usage: node live/build.mjs <source root> <worker destination>');
let worker=await readFile(resolve(sourceRoot,'live/worker.mjs'),'utf8');
for(const [marker,path] of Object.entries({
 FLEET_LIVE_HTML:'live/pilot.html',FLEET_DEMO_HTML:'fleetrelay.html',FLEET_MAP_JSON:'al_ain_map.json'
})){
 const asset=await readFile(resolve(sourceRoot,path),'utf8');
 worker=worker.replace("'<!--"+marker+"-->'",()=>JSON.stringify(asset));
}
await mkdir(resolve(output,'..'),{recursive:true});
await writeFile(output,worker);
