'use strict';
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const colors = { night:'#1c1a3c', cream:'#fbf3e0', ink:'#1b1422', peach:'#ffb06c', sage:'#8fd16a', gold:'#ffd23f' };
function rng(seed) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
function path(ctx, points, fill, stroke = colors.ink, width = 2) { ctx.beginPath(); points.forEach((p,i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.closePath(); if(fill){ctx.fillStyle=fill;ctx.fill();} if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.lineJoin='round';ctx.stroke();} }
function circle(ctx,x,y,r,fill,stroke=colors.ink,width=2){ctx.beginPath();ctx.arc(x,y,r,0,TAU);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
function star(ctx,x,y,r,color,rotation=0){ctx.save();ctx.translate(x,y);ctx.rotate(rotation);path(ctx,[[0,-r],[r*.24,-r*.24],[r,0],[r*.24,r*.24],[0,r],[-r*.24,r*.24],[-r,0],[-r*.24,-r*.24]],color,null);ctx.restore();}
function sphere(lon,lat,rotation=0){const c=Math.cos(lat);return {x:Math.sin(lon+rotation)*c,y:-Math.sin(lat),z:Math.cos(lon+rotation)*c};}
const worldData = [
 {name:'Pebble',type:'THE BIGGEST LITTLE TOWN IN SPACE',description:'Home to Pebbleton, Dot’s place, and Professor Hoot’s observatory. Find the lost Glimmers here before the Kettle can take you to the rest of the system.',traits:['Pebbleton','Lost Glimmers'],note:'Your first stop: follow the star marker to Professor Hoot.',base:'#8fd16a',light:'#b6e88a',shadow:'#57915b',patch:'#e8cf98',accent:'#74b850',biome:'town'},
 {name:'Mallow',type:'SOFT GROUND. STICKY FINGERS.',description:'Welcome to Sugarburg, a candy-colored town on a marshmallow world. Meet Squish, climb the Sky Stack, and help Chef Puff with a sprinkle emergency.',traits:['Sugarburg','The Sky Stack'],note:'Squish has a challenge for the bounciest explorer in the system.',base:'#ffb3d9',light:'#fff0dc',shadow:'#bd79ab',patch:'#fff8ec',accent:'#f7a6d0',biome:'candy'},
 {name:'Cinder',type:'MIND THE FLOOR. IT IS LAVA.',description:'Forgeport is a fiery foundry world with lava rivers, hot springs, and Gloomie trouble. Help Ember and Foreman Rivet, and keep your boots off the lava.',traits:['Forgeport','Gloomie Trouble'],note:'A warm welcome, a very warm floor, and a Star Shard to earn.',base:'#6e3a40',light:'#ae6357',shadow:'#3b2a35',patch:'#ff7a1a',accent:'#ffd23f',biome:'lava'},
 {name:'Frostbite',type:'GLACIER BAY. COOL KIDS ONLY.',description:'A snowy little village with an ice rink, slippery lakes, and an icy race. Visit Coach Flipper, take on the snowmen, and try fishing through a hole in the ice.',traits:['Glacier Bay','Ice Rink Race'],note:'Take a little momentum to the ice. It might take you a little further.',base:'#d6f0ff',light:'#f6fbff',shadow:'#86b9df',patch:'#9fdcff',accent:'#ffffff',biome:'ice'},
 {name:'Inkwell',type:'HOME OF THE GLOOM KING',description:'Gloomtown waits behind a dark barrier. Gather five Star Shards to open the way, help Lumi light the lamps, and face the Gloom King for the final shard.',traits:['Gloomtown','The Gloom King'],note:'Five shards break the barrier. One brave explorer finishes the story.',base:'#5b4a8f',light:'#8a6ad0',shadow:'#241c3e',patch:'#2f2650',accent:'#b06aff',biome:'gloom'},
 {name:'Turbo Moon',type:'THE DOODLE GRAND PRIX SPEEDWAY',description:'A small moon with a very big need for speed. Climb into a racer, hit the gold gates, and take on Zippy, Vroomba, and Turbo Tess at the Doodle Grand Prix.',traits:['Grand Prix','Rocket Racers'],note:'The finish line is calling. Shift gives you a little extra encouragement.',base:'#c9bd97',light:'#efe0b9',shadow:'#8b8290',patch:'#4a4658',accent:'#ffd23f',biome:'racing'},
 {name:'Bloom',type:'GROWS, GLOWS, AND SAYS HI',description:'The garden planet is a green little getaway where everything grows and glows. Bring your curiosity, explore its paths, and meet a softer side of the Doodle System.',traits:['Garden world','Glowing groves'],note:'Even a space adventure needs time to stop and smell the flowers.',base:'#4fd38a',light:'#a6ed98',shadow:'#369978',patch:'#83bf73',accent:'#ff9ac0',biome:'garden'},
 {name:'Jellyroll',type:'A WOBBLY WORLD OF BOING',description:'A tiny jelly world made for bouncing, gliding, and unexpected airtime. Bring your glider and see just how far a good bounce can take you.',traits:['Bouncy terrain','Bring your glider'],note:'What goes up has a very good chance of bouncing again.',base:'#9b8ce3',light:'#d1b6f1',shadow:'#675bc3',patch:'#ff9ac0',accent:'#81d6c5',biome:'jelly'}
];
const terrain=[];
for(let type=0;type<worldData.length;type++){
 const random=rng(182+type*83), patches=[],objects=[];
 for(let n=0;n<19;n++){const lon=random()*TAU,lat=(random()-.5)*2.3,rad=.12+random()*.28,points=[];for(let j=0;j<12;j++){const a=j/12*TAU,r=rad*(.65+random()*.45);points.push([lon+Math.cos(a)*r,lat+Math.sin(a)*r*.7]);}patches.push({lon,lat,points});}
 for(let n=0;n<25;n++)objects.push({lon:random()*TAU,lat:.05+random()*1.1,kind:n%7===0?'house':n%5===0?'antenna':['town','garden'].includes(worldData[type].biome)?'tree':['candy','jelly'].includes(worldData[type].biome)?'mushroom':'rock',scale:.65+random()*.7});
 terrain.push({patches,objects});
}
function drawHouse(ctx,s){ctx.save();ctx.scale(s,s);path(ctx,[[-12,0],[-12,-17],[9,-17],[13,0]],'#efdfb7');path(ctx,[[-17,-17],[-3,-31],[15,-17]],'#bd7460');path(ctx,[[9,-17],[14,-15],[14,0],[9,0]],'#b5b59a');ctx.fillStyle='#415751';ctx.fillRect(-5,-11,6,11);ctx.fillStyle='#f6c56a';ctx.fillRect(3,-12,4,5);ctx.strokeStyle=colors.ink;ctx.lineWidth=1.6;ctx.strokeRect(3,-12,4,5);ctx.beginPath();ctx.moveTo(7,-26);ctx.lineTo(7,-37);ctx.stroke();circle(ctx,7,-39,2,colors.gold,null);ctx.restore();}
function drawTree(ctx,s){ctx.save();ctx.scale(s,s);path(ctx,[[-2,1],[-2,-20],[3,-20],[3,1]],'#b6a27a');circle(ctx,-6,-22,9,'#718f70');circle(ctx,5,-24,10,'#8ba67d');circle(ctx,0,-31,9,'#a1b88a');ctx.restore();}
function drawMushroom(ctx,s){ctx.save();ctx.scale(s,s);path(ctx,[[-3,0],[-5,-23],[4,-23],[4,0]],'#e9dcc5');ctx.beginPath();ctx.moveTo(-17,-21);ctx.bezierCurveTo(-19,-47,19,-49,19,-21);ctx.quadraticCurveTo(2,-12,-17,-21);ctx.fillStyle='#d195ac';ctx.fill();ctx.lineWidth=2;ctx.strokeStyle=colors.ink;ctx.stroke();circle(ctx,-6,-29,3,'#f5e5cd',null);circle(ctx,8,-33,3,'#f5e5cd',null);ctx.beginPath();ctx.moveTo(-14,-20);ctx.quadraticCurveTo(0,-14,16,-21);ctx.stroke();ctx.restore();}
function drawAntenna(ctx,s){ctx.save();ctx.scale(s,s);ctx.strokeStyle=colors.ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-8,0);ctx.lineTo(0,-28);ctx.lineTo(8,0);ctx.moveTo(-5,-10);ctx.lineTo(5,-10);ctx.stroke();path(ctx,[[-9,-30],[10,-34],[7,-26]],'#f1e4c4');ctx.beginPath();ctx.moveTo(0,-31);ctx.lineTo(1,-40);ctx.stroke();circle(ctx,1,-41,3,colors.peach);ctx.restore();}
function drawPlanet(ctx,x,y,r,type,rotation=0,detail=true){
 const w=worldData[type];ctx.save();ctx.translate(x,y);ctx.rotate(-.11);
 const grad=ctx.createRadialGradient(-r*.38,-r*.5,r*.12,r*.3,r*.4,r*1.35);grad.addColorStop(0,w.light);grad.addColorStop(.6,w.base);grad.addColorStop(1,w.shadow);circle(ctx,0,0,r,grad,colors.ink,3.2);
 ctx.save();ctx.beginPath();ctx.arc(0,0,r-1,0,TAU);ctx.clip();
 for(const patch of terrain[type].patches){const center=sphere(patch.lon,patch.lat,rotation);if(center.z<.13)continue;const pts=patch.points.map(p=>{const q=sphere(p[0],p[1],rotation);return[q.x*r,q.y*r];});path(ctx,pts,w.patch,null);if(worldData[type].biome==='lava'){ctx.save();ctx.globalAlpha=.45;path(ctx,pts,null,'#8f5c48',1);ctx.restore();}}
 if(worldData[type].biome==='lava'){const random=rng(10);for(let i=0;i<19;i++){const p=sphere(random()*TAU,(random()-.5)*2.3,rotation);if(p.z<.15)continue;ctx.save();ctx.translate(p.x*r,p.y*r);ctx.scale(1,.5+.5*p.z);circle(ctx,0,0,(.025+random()*.03)*r,'#b5785e','#8d5b4a',1.3);ctx.beginPath();ctx.arc(0,0,r*.023,Math.PI,TAU);ctx.strokeStyle='#f0bd91';ctx.stroke();ctx.restore();}}
 if(detail){const random=rng(type+62);for(let i=0;i<60;i++){const p=sphere(random()*TAU,(random()-.5)*2.7,rotation);if(p.z<.1)continue;ctx.strokeStyle=type===0?'#627c6260':type===1?'#76504555':'#66577d55';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(p.x*r,p.y*r);ctx.lineTo(p.x*r+2,p.y*r-3);ctx.stroke();}}
 ctx.restore();
 // A small broken contour gives the worlds a hand-inked edge.
 ctx.beginPath();ctx.arc(-r*.02,-r*.015,r*.955,3.2,4.7);ctx.strokeStyle='rgba(243,239,223,.32)';ctx.lineWidth=1.7;ctx.stroke();
 if(detail){const objects=terrain[type].objects.map(o=>({...o,p:sphere(o.lon,o.lat,rotation)})).filter(o=>o.p.z>.13).sort((a,b)=>a.p.z-b.p.z);for(const o of objects){ctx.save();ctx.translate(o.p.x*r,o.p.y*r);const angle=Math.atan2(o.p.x,-o.p.y);ctx.rotate(angle*.48);const s=r/170*o.scale*(.48+.52*o.p.z);if(o.kind==='house')drawHouse(ctx,s);else if(o.kind==='antenna')drawAntenna(ctx,s);else if(o.kind==='tree')drawTree(ctx,s);else if(o.kind==='mushroom')drawMushroom(ctx,s);else path(ctx,[[-7*s,0],[-10*s,-7*s],[-3*s,-13*s],[7*s,-11*s],[10*s,-2*s]],'#b47c63',colors.ink,1.5);ctx.restore();}}
 ctx.restore();
}
function drawRocket(ctx,x,y,size,angle=0,flame=0,time=0){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(size/50,size/50);if(flame){path(ctx,[[-9,24],[0,40+Math.sin(time*14)*7+flame*10],[9,24]],colors.gold,colors.ink,2);path(ctx,[[-4,24],[0,36+flame*6],[4,24]],'#fff1c1',null);}path(ctx,[[-12,8],[-23,26],[-10,22]],'#d88e79');path(ctx,[[12,8],[23,26],[10,22]],'#d88e79');ctx.beginPath();ctx.moveTo(-12,22);ctx.bezierCurveTo(-22,-1,-13,-29,0,-42);ctx.bezierCurveTo(15,-28,22,-1,12,22);ctx.closePath();ctx.fillStyle='#f4ead2';ctx.fill();ctx.lineWidth=2.6;ctx.strokeStyle=colors.ink;ctx.stroke();path(ctx,[[-8,-29],[0,-42],[8,-29]],'#e6a383',colors.ink,1.4);circle(ctx,0,-5,9,'#718b8c',colors.ink,2.5);circle(ctx,-2,-8,3,'#c1d5ca',null);path(ctx,[[-13,14],[13,14],[11,22],[-11,22]],'#c8b992',colors.ink,1.5);ctx.strokeStyle='#374b46';ctx.lineWidth=1;for(let i=-8;i<10;i+=5){ctx.beginPath();ctx.moveTo(i,15);ctx.lineTo(i+2,21);ctx.stroke();}ctx.beginPath();ctx.moveTo(10,-18);ctx.lineTo(18,-28);ctx.stroke();circle(ctx,19,-29,2,colors.peach,colors.ink,1);ctx.restore();}
function drawLens(ctx,x,y,r,time=0,collected=false){if(collected)return;ctx.save();const glow=ctx.createRadialGradient(x,y,1,x,y,r*4);glow.addColorStop(0,'#f6d88b55');glow.addColorStop(1,'#f6d88b00');circle(ctx,x,y,r*4,glow,null);ctx.translate(x,y);ctx.rotate(Math.sin(time)*.12);path(ctx,[[0,-r],[r*.72,0],[0,r],[-r*.72,0]],'#f7d798','#e5c576',1.5);path(ctx,[[0,-r],[0,r],[-r*.72,0]],'#fff0ba',null);ctx.restore();}
function drawLighthouse(ctx,x,y,r,lit,time){ctx.save();const glow=ctx.createRadialGradient(x,y,0,x,y,r*(lit?5:2.5));glow.addColorStop(0,lit?'#f2c96770':'#aec8a318');glow.addColorStop(1,'#e8c46900');circle(ctx,x,y,r*(lit?5:2.5),glow,null);if(lit){ctx.save();ctx.translate(x,y);ctx.rotate(time*.12);ctx.strokeStyle='#f2d38220';ctx.lineWidth=1;for(let i=0;i<12;i++){ctx.rotate(TAU/12);ctx.beginPath();ctx.moveTo(0,-r*1.4);ctx.lineTo(0,-r*5);ctx.stroke();}ctx.restore();}star(ctx,x,y,r,lit?'#f1cc7b':'#6d7f6f',.15);star(ctx,x,y,r*.64,lit?'#fff0b5':'#91a58a',.15);ctx.restore();}
class CanvasScene{
 constructor(canvas,kind){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.kind=kind;this.w=0;this.h=0;this.visible=false;this.pointer={x:0,y:0};this.parallax={x:0,y:0};this.rotation=.25;this.world=0;this.chapter=0;this.time=0;this.dragging=false;this.stars=[];const random=rng(93);for(let i=0;i<65;i++)this.stars.push({x:random(),y:random(),r:random()*.9+.35,phase:random()*TAU});this.ro=new ResizeObserver(()=>this.resize());this.ro.observe(canvas);this.io=new IntersectionObserver(([entry])=>{this.visible=entry.isIntersecting;},{rootMargin:'100px'});this.io.observe(canvas);if(kind==='hero'){canvas.parentElement.addEventListener('pointermove',e=>{const rect=canvas.getBoundingClientRect();this.pointer.x=(e.clientX-rect.left)/rect.width-.5;this.pointer.y=(e.clientY-rect.top)/rect.height-.5;});canvas.parentElement.addEventListener('pointerleave',()=>{this.pointer.x=this.pointer.y=0;});}if(kind==='world'){canvas.addEventListener('pointerdown',e=>{this.dragging=true;this.lastX=e.clientX;canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(!this.dragging)return;this.rotation+=(e.clientX-this.lastX)*.012;this.lastX=e.clientX;});const end=()=>this.dragging=false;canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);}}
 resize(){const rect=this.canvas.getBoundingClientRect();this.w=rect.width;this.h=rect.height;if(!this.w||!this.h)return;const dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(this.w*dpr);this.canvas.height=Math.round(this.h*dpr);this.ctx.setTransform(dpr,0,0,dpr,0,0);}
 render(time,dt){if(!this.visible||!this.w||!this.h)return;this.time=reduceMotion.matches?0:time;const ctx=this.ctx,w=this.w,h=this.h;ctx.clearRect(0,0,w,h);for(const s of this.stars){ctx.globalAlpha=.2+(Math.sin(this.time*.7+s.phase)+1)*.16;circle(ctx,s.x*w,s.y*h,s.r,'#e8e6c9',null);}ctx.globalAlpha=1;if(this.kind==='world'){if(!this.dragging&&!reduceMotion.matches)this.rotation+=dt*.08;this.drawWorld();}else this.drawUniverse(dt);}
 drawWorld(){const ctx=this.ctx,w=this.w,h=this.h,r=Math.min(w*.31,h*.33),x=w*.5,y=h*.51;ctx.save();ctx.translate(x,y);ctx.rotate(-.32);ctx.beginPath();ctx.ellipse(0,0,r*1.38,r*.4,0,0,TAU);ctx.setLineDash([2,7]);ctx.strokeStyle='#81977955';ctx.lineWidth=1;ctx.stroke();ctx.restore();drawPlanet(ctx,x,y,r,this.world,this.rotation);star(ctx,w*.14,h*.32,7,'#e9c780');star(ctx,w*.83,h*.24,5,'#b5c7a5');star(ctx,w*.87,h*.68,4,'#e2c28f');drawRocket(ctx,w*.25,y-r*.82,23,-.45,reduceMotion.matches?0:.7,this.time);ctx.fillStyle='#789471';ctx.font='9px monospace';ctx.fillText('↟',w*.15,h*.73);}
 drawUniverse(dt){const ctx=this.ctx,w=this.w,h=this.h,t=this.time;this.parallax.x+=(this.pointer.x-this.parallax.x)*Math.min(dt*5,1);this.parallax.y+=(this.pointer.y-this.parallax.y)*Math.min(dt*5,1);ctx.save();ctx.translate(this.parallax.x*14,this.parallax.y*10);let mainType=this.kind==='tour'&&this.chapter===2?this.world:0;const mainX=w*.59,mainY=h*.58,r=Math.min(w*.265,h*.24);ctx.save();ctx.translate(w*.51,h*.51);ctx.rotate(-.47);ctx.beginPath();ctx.ellipse(0,0,w*.47,h*.235,0,0,TAU);ctx.setLineDash([2,8]);ctx.lineWidth=1;ctx.strokeStyle='#8c9e7950';ctx.stroke();ctx.setLineDash([]);ctx.restore();
 drawPlanet(ctx,w*.84,h*.25,Math.min(w*.11,h*.1),1,t*.07+.4,false);ctx.save();ctx.translate(w*.84,h*.25);ctx.rotate(-.3);ctx.beginPath();ctx.ellipse(0,0,w*.165,w*.032,0,0,Math.PI);ctx.lineWidth=5;ctx.strokeStyle='#bbadbe';ctx.stroke();ctx.lineWidth=1.3;ctx.strokeStyle='#263530';ctx.stroke();ctx.restore();
 drawPlanet(ctx,w*.19,h*.26,Math.min(w*.12,h*.12),2,t*.09-.7);drawPlanet(ctx,mainX,mainY+Math.sin(t*.65)*3,r,mainType,t*.045+.4);
 const smallR=Math.min(w*.065,h*.061);ctx.save();ctx.translate(w*.17,h*.78);ctx.rotate(-.33);circle(ctx,0,0,smallR,'#d8bd76',colors.ink,2.5);ctx.beginPath();ctx.ellipse(0,0,smallR*1.6,smallR*.32,0,0,Math.PI);ctx.strokeStyle='#d3bb7c';ctx.lineWidth=8;ctx.stroke();ctx.strokeStyle=colors.ink;ctx.lineWidth=1.5;ctx.stroke();ctx.restore();
 const flightX=w*.43+Math.sin(t*.5)*9,flightY=h*.25+Math.cos(t*.6)*7;drawRocket(ctx,flightX,flightY,Math.min(w*.086,50),.47+Math.sin(t*.5)*.06,reduceMotion.matches?0:.7,t);
 ctx.save();ctx.strokeStyle='#f1d19b55';ctx.setLineDash([1,6]);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(flightX-17,flightY+37);ctx.bezierCurveTo(w*.27,h*.51,w*.31,h*.57,w*.34,h*.66);ctx.stroke();ctx.restore();
 drawLighthouse(ctx,w*.63,h*.13,18,this.kind==='tour'&&this.chapter===3,t);star(ctx,w*.33,h*.08,5,'#f2be87',.2);star(ctx,w*.9,h*.57,7,'#c3ceb2',.2);star(ctx,w*.08,h*.53,4,'#e9c390',.2);star(ctx,w*.4,h*.83,5,'#9daf92',.2);
 if(this.kind==='tour'&&this.chapter===3){for(let i=0;i<6;i++){const a=i/6*TAU+t*.08;drawLens(ctx,w*.52+Math.cos(a)*w*.4,h*.52+Math.sin(a)*h*.35,10,t+i);}}ctx.restore();}
}
const heroScene=new CanvasScene($('#hero-canvas'),'hero');
const worldScene=new CanvasScene($('#world-canvas'),'world');
const tourScene=new CanvasScene($('#tour-canvas'),'tour');
let currentWorld=0;
function selectWorld(index,focus=false){currentWorld=(index+worldData.length)%worldData.length;const data=worldData[currentWorld];worldScene.world=currentWorld;worldScene.rotation=.25;$$('[data-world]').forEach((button,i)=>{button.setAttribute('aria-selected',i===currentWorld);button.tabIndex=i===currentWorld?0:-1;});$('#world-panel').setAttribute('aria-labelledby',`world-tab-${currentWorld}`);$('#world-type').textContent=data.type;$('#world-name').textContent=data.name;$('#world-description').textContent=data.description;$('#world-traits').replaceChildren(...data.traits.map(trait=>{const s=document.createElement('span');s.textContent=trait;return s;}));$('#world-note').textContent=data.note;$('.world-field-note>span').textContent=`FIELD NOTE / 0${currentWorld+1}`;$('#world-coordinate').textContent=`SECTOR 0${currentWorld+1} · ${data.name.toUpperCase()}`;$('#world-canvas').setAttribute('aria-label',`Interactive rotating illustration of ${data.name} planet. Drag to rotate.`);if(focus)$(`[data-world="${currentWorld}"]`).focus();}
$$('[data-world]').forEach(button=>{button.addEventListener('click',()=>selectWorld(+button.dataset.world));button.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();selectWorld(currentWorld+(e.key==='ArrowRight'?1:-1),true);}if(e.key==='Home'){e.preventDefault();selectWorld(0,true);}if(e.key==='End'){e.preventDefault();selectWorld(worldData.length-1,true);}});});
$('#next-world').addEventListener('click',()=>selectWorld(currentWorld+1));
$$('[data-world-link]').forEach(button=>button.addEventListener('click',()=>{selectWorld(+button.dataset.worldLink);$('#galaxy').scrollIntoView({behavior:reduceMotion.matches?'instant':'smooth'});}));
$$('[data-process]').forEach(button=>button.addEventListener('click',()=>{const wasOpen=button.classList.contains('active');$$('[data-process]').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-expanded','false');$('i',b).textContent='+';});if(!wasOpen){button.classList.add('active');button.setAttribute('aria-expanded','true');$('i',button).textContent='−';}}));
selectWorld(0);


// Host the supplied complete game in its own document, so its controls and UI stay intact.
const gameFrame=$('#game-frame'),gameShell=$('#game-shell');
let gameLoaded=false,gameReady=false,gamePaused=false,gameInView=false,gameSound=true,gameLoadTimer;
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('visible'),3500);}
function sendGame(command,extra={}){if(gameLoaded)gameFrame.contentWindow?.postMessage({type:'starlink-host',command,...extra},location.origin==='null'?'*':location.origin);}
function setSound(enabled){gameSound=enabled;const top=$('#sound-toggle');top.setAttribute('aria-pressed',String(enabled));top.setAttribute('aria-label',enabled?'Turn game sound off':'Turn game sound on');$('span',top).textContent=enabled?'Sound on':'Sound off';$('#game-sound').setAttribute('aria-pressed',String(enabled));$('#game-sound').textContent=enabled?'Sound on':'Sound off';sendGame('mute',{muted:!enabled});}
setSound(true);
$('#sound-toggle').addEventListener('click',()=>setSound(!gameSound));$('#game-sound').addEventListener('click',()=>setSound(!gameSound));
function launchGame(){
 if(gameLoaded){sendGame('activate');gameFrame.focus();return;}
 gameLoaded=true;gameReady=false;gamePaused=false;
 $('#game-cover').hidden=true;$('#game-loading').hidden=false;$('#retry-game').hidden=true;gameFrame.hidden=false;
 $('#game-status').textContent='INKING THE DOODLE SYSTEM';$('#game-loading-message').textContent='Waking up the townsfolk and tuning the jazz band.';
 if(window.STARLINK_GAME_DOCUMENT){const bytes=Uint8Array.from(atob(window.STARLINK_GAME_DOCUMENT),c=>c.charCodeAt(0));gameFrame.srcdoc=new TextDecoder().decode(bytes);}else gameFrame.src='game.html';
 clearTimeout(gameLoadTimer);gameLoadTimer=setTimeout(()=>{if(!gameReady){$('#game-loading-message').textContent='The game is taking longer than expected. You can try loading it again.';$('#retry-game').hidden=false;}},45000);
}
function enterGame(){const target=$('#play');target.scrollIntoView({behavior:reduceMotion.matches?'instant':'smooth'});launchGame();}
$$('[data-play]').forEach(button=>button.addEventListener('click',enterGame));$('#launch-game').addEventListener('click',launchGame);$('#try-mission').addEventListener('click',enterGame);
$('#retry-game').addEventListener('click',()=>{gameLoaded=false;gameFrame.removeAttribute('srcdoc');gameFrame.removeAttribute('src');launchGame();});
gameFrame.addEventListener('load',()=>{sendGame('mute',{muted:!gameSound});sendGame(gameInView&&!$('#presentation').open?'activate':'suspend');});
window.addEventListener('message',event=>{
 if(event.source!==gameFrame.contentWindow || (location.origin!=='null'&&event.origin!==location.origin))return;
 const state=event.data;if(state?.type!=='starlink-state')return;
 if(state.error){$('#game-loading').hidden=false;$('#game-loading-message').textContent=state.error;$('#retry-game').hidden=false;$('#game-status').textContent='LET’S TRY THAT LAUNCH AGAIN';return;}
 if(!state.ready){if(state.loading)$('#game-loading-message').textContent=state.loading;return;}
 const first=!gameReady;gameReady=true;clearTimeout(gameLoadTimer);$('#game-loading').hidden=true;$('#game-pause').hidden=false;
 gamePaused=state.ui==='pause'||state.suspended;$('#game-pause').textContent=gamePaused?'Resume game':'Pause game';
 const inMenu=state.mode==='title';$('#game-pause').hidden=inMenu;$('#game-status').textContent=inMenu?'CHOOSE NEW GAME OR CONTINUE':state.ending?'THE GREAT LANTERN SHINES AGAIN':gamePaused?'ADVENTURE PAUSED':state.ui==='dialog'?'MEET THE LOCALS':`${state.location} · EXPLORING`;
 $('#game-location').textContent=inMenu?'THE DOODLE SYSTEM':state.location;
 $('#game-progress').textContent=`${state.found} / 6 SHARDS FOUND · ${state.returned} RETURNED`;
 if(first){sendGame('mute',{muted:!gameSound});sendGame(gameInView&&!$('#presentation').open?'activate':'suspend');}
});
$('#game-pause').addEventListener('click',()=>{sendGame(gamePaused?'resume':'pause');if(gamePaused)gameFrame.focus();});
$('#game-fullscreen').addEventListener('click',async()=>{launchGame();try{if(document.fullscreenElement)await document.exitFullscreen();else if(gameShell.requestFullscreen)await gameShell.requestFullscreen();else toast('Use your browser’s fullscreen option to play.');}catch{toast('Fullscreen is unavailable here. The game still plays in the page.');}});
document.addEventListener('fullscreenchange',()=>{$('#game-fullscreen').textContent=document.fullscreenElement?'Exit fullscreen ⛶':'Fullscreen ⛶';});
new IntersectionObserver(([entry])=>{gameInView=entry.isIntersecting;if(gameLoaded&&gameReady)sendGame(gameInView&&!$('#presentation').open&&!document.hidden?'activate':'suspend');},{threshold:.15}).observe(gameShell);
document.addEventListener('visibilitychange',()=>{sendGame(document.hidden?'suspend':gameInView&&!$('#presentation').open?'activate':'suspend');lastTime=0;});
let lastTime=0;
function animate(ms){const time=ms/1000,dt=Math.min(lastTime?time-lastTime:0,.04);lastTime=time;heroScene.render(time,dt);worldScene.render(time,dt);tourScene.render(time,dt);requestAnimationFrame(animate);}
requestAnimationFrame(animate);

const chapters=[
 {label:'01 / HELLO, CURIOUS MINDS',eyebrow:'TO THE 4.0 CROWD: BRING YOUR CURIOSITY.',title:'I know you’re smart.<br><em>Now follow your curiosity.</em>',body:'You’re used to aiming high. Here’s a different kind of challenge: take one “what if?”, turn it into a universe, and invite everyone else inside. This is Starlink.',cta:'Start with a what-if',note:'A SMALL ROCKET. AN AMBITIOUS IDEA.',speaker:'Open with a smile. Ask: “Who here has ever had an idea that sounded a little too ambitious?” Give the room a moment before moving on.'},
 {label:'02 / THE WHAT-IF',eyebrow:'FROM A GOOD IDEA TO SOMETHING YOU CAN PLAY.',title:'What if your next project<br><em>was a whole universe?</em>',body:'The idea: a cartoon space adventure where tiny planets feel alive. The challenge: make movement, flight, quests, and atmosphere work together. A creative idea becomes interesting when you can actually explore it.',cta:'Meet the worlds',note:'EXPLORE → HELP → COLLECT → RESTORE',speaker:'Explain the game in one sentence: “You’re Dot, exploring tiny worlds in a rocket called the Kettle to bring the Great Lantern back to life.”'},
 {label:'03 / PICK YOUR PLANET',eyebrow:'EIGHT WORLDS. EIGHT WAYS TO WONDER.',title:'Different worlds.<br><em>Different possibilities.</em>',body:'Candy towns, lava rivers, icy lakes, and a moon built for racing. Each destination changes the mood and the challenge. Choose a planet below and watch the universe respond.',cta:'Find the mission',note:'YOUR CHOICE / PEBBLE · THE BIGGEST LITTLE TOWN IN SPACE',speaker:'Invite someone to choose a planet. Connect its atmosphere to its mechanics: icy races on Frostbite, candy challenges on Mallow, or racing on Turbo Moon.'},
 {label:'04 / A REASON TO EXPLORE',eyebrow:'SIX STAR SHARDS. ONE GREAT LANTERN.',title:'A bright idea needs<br><em>a mission you can play.</em>',body:'The Gloom has dimmed the Doodle System. Help Professor Hoot, recover the first Star Shard, and board the Kettle. Six shards lead you across the system and toward the Gloom King. Every discovery moves the story forward.',cta:'See how it’s made',note:'HELP THE LOCALS. RETURN THE SHARDS. BRING BACK THE LIGHT.',speaker:'Explain the opening: meet Professor Hoot and find three lost Glimmers on Pebble. That earns the first shard and unlocks rocket travel.'},
 {label:'05 / THE BUILDING MINDSET',eyebrow:'HUMAN IMAGINATION × AI-GENERATED CODE',title:'Smart tools.<br><em>Human taste.</em>',body:'AI helped turn the creative direction into code. The human work is choosing the world, testing the feel, and deciding what deserves another iteration. The loop: imagine, prompt, play, notice, improve.',cta:'Take the challenge',note:'CURIOSITY → A PROTOTYPE → FEEDBACK → A BETTER BUILD',speaker:'Talk through one real change you made while building. What felt wrong in a playtest, and what did you ask the AI to improve? Use your own example.'},
 {label:'06 / YOUR TURN',eyebrow:'A TWO-MINUTE CURIOSITY CHALLENGE.',title:'You’ve seen the idea.<br><em>Now step inside it.</em>',body:'Start on Pebble. Follow the star marker to Professor Hoot, then look for your first Glimmer. While you explore, ask yourself: what would I add to this universe? Your next ambitious project might start with that answer.',cta:'Play Starlink',note:'WASD TO MOVE · SPACE TO JUMP · E TO INTERACT',speaker:'Hand the controls to a volunteer. Give them two minutes to meet Hoot or find a Glimmer, then ask what they would add to the game.'}
];
let chapter=0;
const presentation=$('#presentation');
function renderChapter(){
 const c=chapters[chapter];
 $('#tour-chapter').textContent=c.label;
 $('#tour-eyebrow').textContent=c.eyebrow;
 $('#presentation-title').innerHTML=c.title;
 $('#tour-body').textContent=c.body;
 $('#tour-cta').replaceChildren(document.createTextNode(c.cta+' '),Object.assign(document.createElement('span'),{textContent:chapter===chapters.length-1?'▶':'→'}));
 $('#tour-art-note').textContent=c.note;
 $('#speaker-note').textContent=c.speaker;
 $('#tour-worlds').hidden=chapter!==2;
 tourScene.chapter=chapter;
 if(chapter===2)selectTourWorld(tourScene.world);
 $$('[data-chapter]').forEach((button,i)=>{if(i===chapter)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
 $('#tour-prev').disabled=chapter===0;
 $('#tour-next').disabled=chapter===chapters.length-1;
 const copy=$('.presentation-copy');copy.classList.remove('slide-in');void copy.offsetWidth;copy.classList.add('slide-in');
}
function selectTourWorld(index){tourScene.world=index;$$('[data-tour-world]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.tourWorld===index)));$('#tour-art-note').textContent=`YOUR CHOICE / ${worldData[index].name.toUpperCase()} · ${worldData[index].type}`;}
$$('[data-tour-world]').forEach(b=>b.addEventListener('click',()=>selectTourWorld(+b.dataset.tourWorld)));
function openPresentation(){sendGame('suspend');chapter=0;renderChapter();presentation.showModal();document.body.classList.add('modal-open');tourScene.resize();$('#tour-cta').focus({preventScroll:true});}
function closePresentation(){if(document.fullscreenElement===presentation&&document.exitFullscreen)document.exitFullscreen().catch(()=>{});presentation.close();document.body.classList.remove('modal-open');if(gameInView)sendGame('activate');}
$$('[data-present]').forEach(button=>button.addEventListener('click',openPresentation));
$('#close-presentation').addEventListener('click',closePresentation);
presentation.addEventListener('close',()=>{document.body.classList.remove('modal-open');if(gameInView)sendGame('activate');});
presentation.addEventListener('cancel',()=>{if(document.fullscreenElement===presentation&&document.exitFullscreen)document.exitFullscreen().catch(()=>{});});
$('#tour-prev').addEventListener('click',()=>{chapter=Math.max(0,chapter-1);renderChapter();});
$('#tour-next').addEventListener('click',()=>{chapter=Math.min(chapters.length-1,chapter+1);renderChapter();});
$$('[data-chapter]').forEach(button=>button.addEventListener('click',()=>{chapter=+button.dataset.chapter;renderChapter();}));
presentation.addEventListener('keydown',e=>{if((e.key==='ArrowRight'||e.key==='ArrowLeft')&&!e.target.closest('#tour-worlds')){e.preventDefault();chapter=clamp(chapter+(e.key==='ArrowRight'?1:-1),0,chapters.length-1);renderChapter();}});
$('#tour-cta').addEventListener('click',()=>{if(chapter===chapters.length-1){closePresentation();enterGame();}else{chapter++;renderChapter();}});
$('#fullscreen-button').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(presentation.requestFullscreen)await presentation.requestFullscreen();else toast('Use your browser’s fullscreen option to present.');}catch{toast('Use your browser’s fullscreen option to present.');}});
$('.presentation-top .brand').addEventListener('click',e=>{e.preventDefault();chapter=0;renderChapter();});
