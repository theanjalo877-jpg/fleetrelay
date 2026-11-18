const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/fleetrelay.html','utf8');
const src=html.split('/* ENGINE_START */')[1].split('/* ENGINE_END */')[0];
const E=vm.runInNewContext(src+'; FleetEngine');
let tests=0;function check(fn){fn();tests++;}
check(()=>{const s=E.initial();assert.equal(E.recommend(s).id,'B07');assert.equal(E.act(s,'send'),false);});
check(()=>{const s=E.initial();assert.equal(E.eligible(E.candidates[2],s),false);assert.equal(E.eligible(E.candidates[3],s),false);});
check(()=>{const s=E.initial();E.act(s,'start');s.selected='B03';assert.equal(E.act(s,'send'),false);});
check(()=>{const s=E.initial();E.act(s,'start');E.act(s,'send');assert.equal(E.act(s,'send'),false);assert.equal(E.act(s,'transfer'),false);E.act(s,'acceptBus');E.tick(s,27);assert.equal(s.bus,'enroute');E.tick(s,2);assert.equal(s.bus,'arrived');assert.equal(E.act(s,'transfer'),true);});
check(()=>{const s=E.initial();E.act(s,'start');E.act(s,'send');E.act(s,'declineBus');assert.equal(s.selected,'B09');E.act(s,'send');E.act(s,'declineBus');assert.equal(E.recommend(s),null);assert.equal(E.act(s,'send'),false);});
check(()=>{const s=E.initial();E.act(s,'start');E.act(s,'sendTow');E.act(s,'acceptTow');E.tick(s,39);assert.equal(s.tow,'arrived');assert.equal(E.act(s,'recover'),false);E.act(s,'send');E.act(s,'acceptBus');E.tick(s,29);E.act(s,'transfer');assert.equal(E.act(s,'recover'),true);assert.equal(E.act(s,'recover'),false);});
check(()=>{const s=E.initial();E.act(s,'start');E.act(s,'sendTow');E.act(s,'declineTow');assert.equal(s.tow,'unavailable');assert.equal(E.act(s,'retryTow'),true);assert.equal(s.tow,'offered');});
check(()=>{const s=E.initial();E.act(s,'start');E.act(s,'send');E.tick(s,100);assert.equal(s.bus,'offered');assert.equal(s.busProgress,0);});
check(()=>{
 const s=E.initial('full');
 E.act(s,'start');
 assert.equal(s.incidentId,'B09');
 const near=E.candidatesFor(s).find(c=>c.id==='B07');
 assert.equal(E.freeSeats(near),0);
 assert.equal(E.eligible(near,s),false);
 s.selected='B07';
 assert.equal(E.act(s,'send'),false);
 assert.equal(E.recommend(s).id,'B12');
 assert.equal(E.freeSeats(E.recommend(s))-s.passengers,7);
});
check(()=>{
 const s=E.initial('full');
 const bus={id:'B22',seats:35,passengers:8,available:true,eta:4,next:100};
 assert.equal(E.eligible(bus,s),false);
 assert.equal(E.eligible({...bus,passengers:7},s),true);
 assert.equal(E.eligible({...bus,passengers:7,next:38},s),false);
 assert.equal(E.eligible({...bus,passengers:7,available:false},s),false);
});
console.log(`${tests} workflow checks passed`);
