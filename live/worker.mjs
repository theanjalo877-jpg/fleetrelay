const staleAfter = 45000;
const hour = 3600000;
const json = (value, status = 200, headers = {}) => new Response(JSON.stringify(value), {
  status, headers: {'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}
});
const problem = (message,status) => json({error:message},status);
const hash = async value => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))), b=>b.toString(16).padStart(2,'0')).join('');
const random = () => Array.from(crypto.getRandomValues(new Uint8Array(24)),b=>b.toString(16).padStart(2,'0')).join('');
const sessionCookie = value => `__Host-fleet_driver=${value}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${value?86400:0}`;
const fields = 'id,school,route,vehicle,driver,active,lat,lng,accuracy,updated_at,phone,report_due,reported_at,speed,speed_limit,camera_url';
const tokenPattern = /^[a-f0-9]{48}$/;
const clientHTML = '<!--FLEET_LIVE_HTML-->';
const demoHTML = '<!--FLEET_DEMO_HTML-->';
const mapJSON = '<!--FLEET_MAP_JSON-->';
function asset(value,type) {
  return new Response(value, {headers:{'content-type':type,'x-content-type-options':'nosniff',
    'cache-control':type.includes('json')?'public, max-age=86400':'no-store',
    'referrer-policy':'strict-origin-when-cross-origin'}});
}
async function bodyOf(request){
  const reader=request.body?.getReader();
  if(!reader)throw new Error('Missing request');
  const decoder=new TextDecoder();
  let length=0, string='';
  for(;;){
    const {value,done}=await reader.read();
    if(done)break;
    length+=value.length;
    if(length>4096){await reader.cancel();throw new Error('Request too large');}
    string+=decoder.decode(value,{stream:true});
  }
  const result=JSON.parse(string+decoder.decode());
  if(!result||typeof result!=='object'||Array.isArray(result))throw new Error('Invalid body');
  return result;
}
async function api(request,env,path){
  const user=request.headers.get('oai-authenticated-user-id');
  if(!user)return problem('Sign in with ChatGPT to open FleetRelay.',401);
  const write=request.method==='POST';
  if(write&&(request.headers.get('origin')!==new URL(request.url).origin||
      !request.headers.get('content-type')?.startsWith('application/json')))return problem('Invalid request origin.',403);
  if(!write&&request.method!=='GET')return problem('Method unavailable.',405);
  const db=env.DB;
  if(!db)return problem('FleetRelay storage is unavailable.',503);
  const now=Date.now();
  const query=(sql,...params)=>db.prepare(sql).bind(...params);
  let body={};
  if(write){
    try{body=await bodyOf(request);}catch{return problem('Invalid request data.',400);}
  }
  if(path.startsWith('/api/manage/')){
    const manager=await query('SELECT user_id FROM fleet_manager WHERE singleton=1').first();
    if(path==='/api/manage/setup'&&write&&!manager){
      await query('INSERT OR IGNORE INTO fleet_manager (singleton,user_id) VALUES (1,?)',user).run();
      const assigned=await query('SELECT user_id FROM fleet_manager WHERE singleton=1').first();
      return assigned?.user_id===user?json({ok:true}):problem('Management access required.',403);
    }
    if(!manager)return path==='/api/manage/runs'&&!write?json({setup:true}):problem('Set up management first.',403);
    if(manager.user_id!==user)return problem('Management access required.',403);
    if(path==='/api/manage/recovery'&&!write){
      return json({contacts:(await query('SELECT id,name,phone FROM recovery_contacts ORDER BY name LIMIT 100').all()).results});
    }
    if(path==='/api/manage/recovery'&&write){
      const name=typeof body.name==='string'?body.name.trim():'';
      const phone=typeof body.phone==='string'?body.phone.replace(/[\s()-]/g,''):'';
      if(!name||name.length>80||!/^\+[1-9]\d{7,14}$/.test(phone))return problem('Enter a provider and an international number, e.g. +971…',400);
      await query('INSERT INTO recovery_contacts (id,name,phone) VALUES (?,?,?) ON CONFLICT(phone) DO UPDATE SET name=excluded.name',
        crypto.randomUUID(),name,phone).run();
      return json({ok:true});
    }
    if(path==='/api/manage/recovery/remove'&&write){
      await query('DELETE FROM recovery_contacts WHERE id=?',typeof body.id==='string'?body.id:'').run();
      return json({ok:true});
    }
    if(path==='/api/manage/runs'&&!write){
      const runs=(await query(`SELECT ${fields} FROM fleet_runs ORDER BY created_at DESC LIMIT 200`).all()).results;
      return json({runs,now,staleAfter});
    }
    if(path==='/api/manage/runs'&&write){
      const input=['school','route','vehicle','driver'].map(key=>typeof body[key]==='string'?body[key].trim():'');
      if(input.some(value=>!value||value.length>80))return problem('Enter a school, route, vehicle and driver (up to 80 characters each).',400);
      const phone=typeof body.phone==='string'?body.phone.replace(/[\s()-]/g,''):'';
      if(phone&&!/^\+[1-9]\d{7,14}$/.test(phone))return problem('Use an international phone number, e.g. +971…',400);
      const due=typeof body.reportDue==='string'&&body.reportDue?Date.parse(body.reportDue+'+04:00'):null;
      if(due!==null&&!Number.isFinite(due))return problem('Enter a valid Dubai report time.',400);
      const speedLimit=body.speedLimit?Number(body.speedLimit):null;
      if(speedLimit!==null&&(!Number.isInteger(speedLimit)||speedLimit<10||speedLimit>120))return problem('Enter a speed alert threshold from 10 to 120 km/h.',400);
      let camera=null;
      if(body.cameraUrl){
       try{
        const parsed=new URL(body.cameraUrl);
        if(parsed.protocol!=='https:'||parsed.username||parsed.password||parsed.href.length>500||parsed.search||parsed.hash)throw new Error();
        camera=parsed.href;
       }catch{return problem('Use the secure vendor portal URL without credentials, query parameters, or a fragment.',400);}
      }
      const id=crypto.randomUUID();
      const token=random();
      await query('INSERT INTO fleet_runs (id,school,route,vehicle,driver,created_at,invite_hash,invite_expiry,phone,report_due,speed_limit,camera_url) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
        id,...input,now,await hash(token),now+hour*2,phone||null,due,speedLimit,camera).run();
      return json({id,link:'/driver#'+token},201);
    }
    if(path==='/api/manage/invite'&&write){
      const token=random();
      const result=await query(`UPDATE fleet_runs SET invite_hash=?,invite_expiry=?,session_hash=NULL,driver_user=NULL,
        session_expiry=NULL,active=0,lat=NULL,lng=NULL,accuracy=NULL,updated_at=NULL,started_at=NULL,speed=NULL WHERE id=?`,
        await hash(token),now+hour*2,typeof body.id==='string'?body.id:'').run();
      return result.meta.changes?json({link:'/driver#'+token}):problem('Run not found.',404);
    }
    if(path==='/api/manage/remove'&&write){
      await query('DELETE FROM fleet_runs WHERE id=?',typeof body.id==='string'?body.id:'').run();
      return json({ok:true});
    }
  }
  if(path==='/api/driver/pair'&&write){
    if(typeof body.token!=='string'||!tokenPattern.test(body.token))return problem('Use a driver invite from management.',400);
    const token=random();
    const result=await query(`UPDATE fleet_runs SET invite_hash=NULL,invite_expiry=NULL,session_hash=?,driver_user=?,session_expiry=?
      WHERE invite_hash=? AND invite_expiry>=?`,await hash(token),user,now+24*hour,await hash(body.token),now).run();
    return result.meta.changes?json({ok:true},200,{'set-cookie':sessionCookie(token)}):problem('This invite is expired or already used. Ask management for a new link.',410);
  }
  if(path.startsWith('/api/driver/')){
    const token=request.headers.get('cookie')?.match(/(?:^|;\s*)__Host-fleet_driver=([a-f0-9]{48})(?:;|$)/)?.[1];
    if(!token)return problem('Open your assignment link from management.',401);
    const key=await hash(token);
    const run=await query(`SELECT id,school,route,vehicle,driver,active FROM fleet_runs
      WHERE session_hash=? AND driver_user=? AND session_expiry>=?`,key,user,now).first();
    if(!run)return problem('This driver session expired. Ask management for a new link.',401);
    if(path==='/api/driver/run'&&!write)return json({run});
    if(path==='/api/driver/start'&&write){
      await query('UPDATE fleet_runs SET active=1,started_at=?,reported_at=COALESCE(reported_at,?) WHERE id=? AND session_hash=? AND active=0',now,now,run.id,key).run();
      return json({ok:true});
    }
    if(path==='/api/driver/stop'&&write){
      await query('UPDATE fleet_runs SET active=0,lat=NULL,lng=NULL,accuracy=NULL,updated_at=NULL,started_at=NULL,speed=NULL WHERE id=? AND session_hash=?',run.id,key).run();
      return json({ok:true});
    }
    if(path==='/api/driver/location'&&write){
      const {lat,lng,accuracy,capturedAt}=body;
      const speed=Number.isFinite(body.speedMps)&&body.speedMps>=0&&body.speedMps<70?body.speedMps*3.6:null;
      if(![lat,lng,accuracy,capturedAt].every(Number.isFinite)||Math.abs(lat)>90||Math.abs(lng)>180||
         accuracy<0||accuracy>100000||capturedAt<now-45000||capturedAt>now+10000)return problem('Waiting for a fresh GPS fix.',422);
      const result=await query(`UPDATE fleet_runs SET lat=?,lng=?,accuracy=?,updated_at=?,speed=?
        WHERE id=? AND session_hash=? AND active=1 AND started_at<=? AND (updated_at IS NULL OR updated_at<?)`,
        lat,lng,accuracy,Math.min(now,capturedAt),speed,run.id,key,capturedAt+10000,capturedAt).run();
      return result.meta.changes?json({ok:true}):problem('Location no longer current for this run.',409);
    }
  }
  return problem('Endpoint unavailable.',404);
}
export default {async fetch(request,env){
  const path=new URL(request.url).pathname;
  if(path.startsWith('/api/')){
    try{return await api(request,env,path);}catch(error){
      console.error('FleetRelay database request failed:',error.message);
      return problem('FleetRelay could not update this request. Try again shortly.',503);
    }
  }
  if(path==='/live'||path==='/driver')return asset(clientHTML,'text/html; charset=utf-8');
  if(path==='/al_ain_map.json')return asset(mapJSON,'application/json; charset=utf-8');
  if(path==='/'||path==='/demo')return asset(demoHTML,'text/html; charset=utf-8');
  return new Response('Page not found',{status:404});
}};
