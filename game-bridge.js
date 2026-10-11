'use strict';
(() => {
  if (window.parent === window) return;
  const hostOrigin = location.origin === 'null' ? '*' : location.origin;
  let muted = false;
  function sound(){if(typeof AUDIO!=='undefined'&&AUDIO.master&&AUDIO.ctx)AUDIO.master.gain.setTargetAtTime(muted?0:.9,AUDIO.ctx.currentTime,.06);}
  function notify(){
    const game = window.__ink?.G;
    const error = document.querySelector('#loadErr')?.textContent || '';
    const ready = !!game?.renderer && document.querySelector('#loading')?.classList.contains('hidden-ui');
    let found = 0, returned = 0;
    if(game?.save?.shards)for(const n of Object.values(game.save.shards)){if(n>0)found++;if(n===2)returned++;}
    window.parent.postMessage({type:'starlink-state',ready,error,loading:document.querySelector('#loadMsg')?.textContent,mode:game?.mode||'loading',ui:game?.ui||'loading',location:typeof PL!=='undefined'?PL.planet?.title||'THE DOODLE SYSTEM':'THE DOODLE SYSTEM',found,returned,dust:game?.save?.stardust||0,ending:!!game?.save?.ending,suspended:!!window.__starlinkHostSuspended},hostOrigin);
    sound();
  }
  window.addEventListener('message',event=>{
    if(event.source!==window.parent || (location.origin!=='null'&&event.origin!==location.origin))return;
    const data=event.data;if(data?.type!=='starlink-host')return;
    if(data.command==='mute'){muted=!!data.muted;window.__starlinkHostMuted=muted;sound();}
    if(data.command==='pause'||data.command==='suspend'){
      if(typeof UI!=='undefined'&&window.__ink?.G?.ui==='play')UI.openPause();
      if(typeof releasePointer==='function')releasePointer();
      if(typeof saveGame==='function'&&window.__ink?.G?.started)saveGame();
      if(data.command==='suspend')window.__starlinkHostSuspended=true;
      if(typeof AUDIO!=='undefined'&&AUDIO.ctx)AUDIO.ctx.suspend().catch(()=>{});
    }
    if(data.command==='activate'||data.command==='resume'){
      window.__starlinkHostSuspended=false;
      if(data.command==='resume'&&typeof UI!=='undefined'&&window.__ink?.G?.ui==='pause')UI.close();
      if(typeof AUDIO!=='undefined'&&AUDIO.ctx&&!muted)AUDIO.ctx.resume().catch(()=>{});
    }
    notify();
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden){window.__starlinkHostSuspended=true;if(typeof releasePointer==='function')releasePointer();if(typeof AUDIO!=='undefined'&&AUDIO.ctx)AUDIO.ctx.suspend().catch(()=>{});}else{window.__starlinkHostSuspended=false;}});
  window.addEventListener('pagehide',()=>{if(typeof saveGame==='function'&&window.__ink?.G?.started)saveGame();});
  setInterval(notify,750);notify();
})();
