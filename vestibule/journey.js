/* Vestibule mobile, travel styles. The classic page scrolls; these advance room by room.
   A  walk through doors (scroll)       B  elevator, floor by floor (scroll)       C  little unlock gestures, no scroll.
   Active only when mobile.js reports a style ('a', 'b' or 'c'). Nothing here moves except by transform and opacity.
   Written without the double ampersand, which WordPress rewrites inside HTML blocks. */
(() => {
 'use strict';
 const api=window.eeMobile;
 if(!api)return;
 if(!api.variant)return;
 const variant=api.variant,app=api.app,root=api.root,hall=api.hall;
 const ids=['m-hall','m-tarifs','m-gift','m-avis','m-faq','m-equipe','m-contact'];
 const names=['Le hall','Tarifs','Cadeaux','Avis','Questions','L’équipe','Contact'];
 const rooms=ids.map(id=>document.getElementById(id));
 const N=rooms.length,page=app.querySelector('.m-page');
 const scrolled=variant!=='c';
 function clamp(value,min,max){return Math.max(min,Math.min(max,value))}
 function smooth(value){const t=clamp(value,0,1);return t*t*(3-2*t)}
 const easeOut=api.easeOut,easeInOut=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
 root.classList.add('j-on');root.dataset.jv=variant;

 // ---------- stage ----------
 const j=document.createElement('div');j.className='j';
 const stage=document.createElement('div');stage.className='j-stage';
 const bg=document.createElement('div');bg.className='j-bg';bg.setAttribute('aria-hidden','true');
 const box=document.createElement('div');box.className='j-rooms';
 const fx=document.createElement('div');fx.className='j-fx';fx.setAttribute('aria-hidden','true');
 const hud=document.createElement('div');hud.className='j-hud';
 stage.append(bg,box,fx,hud);j.append(stage);
 rooms.forEach((room,index)=>{
  room.classList.add('j-room');room.dataset.i=String(index);
  if(room!==hall){
   const inner=document.createElement('div');inner.className='j-inner';
   [...room.children].forEach(child=>{if(!child.classList.contains('m-key'))inner.append(child)});
   room.append(inner);
  }
  room.querySelectorAll('.m-reveal').forEach(element=>element.classList.remove('m-reveal'));
  box.append(room);
 });
 if(scrolled){
  // In-flow blocks, one per room: Chrome only snaps to these (not to absolutely positioned markers). The sticky stage overlaps them.
  for(let i=0;i<N;i++){const snap=document.createElement('div');snap.className='j-snap';j.append(snap)}
 }
 page.before(j);
 const foot=page.querySelector('.m-foot');
 page.hidden=true;

 // ---------- shared pieces: next hint, style menu, info sheet, questions ----------
 const next=document.createElement('button');next.className='j-next';next.type='button';
 hud.append(next);
 const tool=document.createElement('button');tool.className='j-tool';tool.type='button';tool.setAttribute('aria-label','Changer de style de voyage');tool.setAttribute('aria-expanded','false');tool.innerHTML='<b>⇄</b><span>Style</span>';
 const menu=document.createElement('div');menu.className='j-menu';menu.hidden=true;
 const styles=[['','Classique · défilement (v13)'],['a','A · Traverser les portes'],['b','B · L’ascenseur'],['c','C · Les mécanismes']];
 menu.innerHTML='<strong>STYLE DE VOYAGE</strong>'+styles.map(item=>'<button type="button" data-style="'+item[0]+'" aria-pressed="'+String(item[0]===variant)+'">'+item[1]+'</button>').join('');
 if(foot)menu.append(foot);
 app.querySelector('.m-dock').append(tool);app.append(menu);
 tool.addEventListener('click',()=>{menu.hidden=!menu.hidden;tool.setAttribute('aria-expanded',String(!menu.hidden))});
 menu.addEventListener('click',event=>{
  const choice=event.target.closest('[data-style]');
  if(choice){api.remember('ee-variant',choice.dataset.style);api.remember('ee-skip-gate','1');location.reload();return}
  if(event.target.closest('[data-act]'))menu.hidden=true;
 });
 const sheet=document.createElement('div');sheet.className='j-sheet';sheet.hidden=true;sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');
 sheet.innerHTML='<div class="j-sheet-bg"></div><div class="j-sheet-card"><button class="j-sheet-x" type="button" aria-label="Fermer">×</button><h3></h3><div class="j-sheet-body"></div></div>';
 app.append(sheet);
 function openSheet(title,html){sheet.querySelector('h3').textContent=title;sheet.querySelector('.j-sheet-body').innerHTML=html;sheet.hidden=false;root.classList.add('m-locked');requestAnimationFrame(()=>requestAnimationFrame(()=>sheet.classList.add('is-open')));api.buzz(8)}
 function closeSheet(){sheet.classList.remove('is-open');setTimeout(()=>{sheet.hidden=true;root.classList.remove('m-locked')},api.isCalm()?60:420)}
 sheet.addEventListener('click',event=>{if(event.target.closest('.j-sheet-x,.j-sheet-bg'))closeSheet()});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'){if(!sheet.hidden)closeSheet();menu.hidden=true}});
 // Questions become a list: an answer would not fit under the others in a single screen.
 const list=document.querySelector('.ee-faq-list');
 if(list){
  const rows=document.createElement('div');rows.className='j-qs';
  [...list.querySelectorAll('details')].forEach(details=>{
   const button=document.createElement('button');button.type='button';button.className='j-q';button.setAttribute('aria-haspopup','dialog');
   button.innerHTML='<span></span><i aria-hidden="true">+</i>';button.firstChild.textContent=details.querySelector('summary').textContent;
   const answer=[...details.children].filter(node=>node.tagName!=='SUMMARY').map(node=>node.outerHTML).join('');
   button.addEventListener('click',()=>openSheet(button.firstChild.textContent,answer));
   rows.append(button);
  });
  list.before(rows);list.hidden=true;
 }
 const fold=document.querySelector('.m-fold');
 if(fold){
  const table=fold.querySelector('.ee-price-details'),button=document.createElement('button');
  button.type='button';button.className='j-q';button.setAttribute('aria-haspopup','dialog');button.innerHTML='<span>Tous les tarifs et conditions</span><i aria-hidden="true">+</i>';
  button.addEventListener('click',()=>openSheet('Tous les tarifs',table.innerHTML));
  fold.before(button);fold.hidden=true;
 }

 // ---------- the walk: common state ----------
 let p=0,current=-1,snapHeight=innerHeight,stop=0,auto=false;
 const dockLinks=api.dockLinks;
 function nameOf(index){return index===0?'RDC':String(-index)}
 function refreshNav(){
  const k=Math.round(p);
  if(k===current)return;
  current=k;
  dockLinks.forEach(link=>link.setAttribute('aria-current',String(link.dataset.dock===rooms[k].dataset.dock)));
  // The last room has nothing further: the bottom bar already leads back to the start.
  next.hidden=variant==='c'||k>=N-1;
  if(variant!=='c'){if(k<N-1)next.innerHTML='<span>Suite · '+names[k+1]+'</span><i aria-hidden="true">↓</i>'}
 }
 function showRooms(list){rooms.forEach((room,index)=>{const on=list.indexOf(index)>=0;room.style.visibility=on?'visible':'hidden';room.inert=index!==Math.round(p);if(!on){room.style.opacity='';room.style.transform=''}})}
 function place(index,opacity,transform){const room=rooms[index];room.style.opacity=opacity.toFixed(3);room.style.transform=transform||''}

 // ---------- A and C: through the doors ----------
 let tunnel=null,tunnelContext=null,door=null,bar=null,doorScale=6;
 const doorMarkup='<div class="a-door m-gate-door"><div class="m-gate-light"></div><div class="m-leaf l"></div><div class="m-leaf r"></div><svg class="m-lock" viewBox="0 0 140 140" fill="none" aria-hidden="true"><circle cx="70" cy="70" r="64"/><circle class="m-ticks" cx="70" cy="70" r="55"/><path d="M70 30 110 70 70 110 30 70Z"/><path d="M63 70h14M70 63v14"/></svg></div>';
 function initDoors(){
  tunnel=document.createElement('canvas');tunnel.className='a-tunnel';bg.append(tunnel);tunnelContext=tunnel.getContext('2d');
  fx.innerHTML=doorMarkup;door=fx.querySelector('.a-door');
  bar=document.createElement('div');bar.className='a-bar';bar.innerHTML=names.map((name,index)=>'<button type="button" class="a-seg" data-room="'+index+'" aria-label="Aller à : '+name+'"><i><b></b></i></button>').join('');hud.append(bar);
  bar.addEventListener('click',event=>{const seg=event.target.closest('.a-seg');if(seg)goStop(Number(seg.dataset.room))});
  sizeDoors();if(lite)tunnel.style.display='none';drawTunnel(0);
 }
 function sizeDoors(){
  if(!tunnel)return;
  tunnel.width=Math.round(innerWidth*.7);tunnel.height=Math.round(innerHeight*.7);
  const width=door.offsetWidth||200,height=door.offsetHeight||300;doorScale=Math.max(innerWidth/width,innerHeight/height)*1.3;
 }
 // Light mode: if the phone visibly struggles while moving, the animated tunnel is switched off for the session.
 let lite=api.recall('ee-lite-j')==='1',lastRide=0,slowFrames=0;
 function watchFrames(){
  const now=performance.now(),gap=now-lastRide;lastRide=now;
  if(gap>45)if(gap<400){slowFrames+=1;if(slowFrames>=8)if(!lite){lite=true;api.remember('ee-lite-j','1');if(tunnel)tunnel.style.display='none'}}
  if(gap<30)slowFrames=Math.max(0,slowFrames-.25);
 }
 function drawTunnel(value){
  if(lite)return;
  const ctx=tunnelContext,w=tunnel.width,h=tunnel.height,cx=w/2,cy=h*.46,x0=w*.06,x1=w*.94,y0=h*.1,y1=h*.9,u=w/innerWidth;
  ctx.clearRect(0,0,w,h);
  const glow=ctx.createRadialGradient(cx,cy,2,cx,cy,w*.7);glow.addColorStop(0,'#f2a65a33');glow.addColorStop(.5,'#1d355622');glow.addColorStop(1,'#00000000');
  ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
  for(let i=0;i<8;i++){
   const raw=(i*300-value*620)%2400,z=-(raw<0?raw+2400:raw)+200,k=650/(650-z),alpha=Math.min(1,Math.max(0,(-z+250)/450))*.9;
   if(alpha<=0)continue;
   const left=cx+(x0-cx)*k,right=cx+(x1-cx)*k,top=cy+(y0-cy)*k,bottom=cy+(y1-cy)*k,t=4*k*u;
   ctx.globalAlpha=alpha;ctx.lineWidth=t;ctx.strokeStyle='#1e3847';ctx.strokeRect(left,top,right-left,bottom-top);
   ctx.strokeStyle='#659b9c';ctx.beginPath();ctx.moveTo(left-t/2,top);ctx.lineTo(right+t/2,top);ctx.stroke();
   ctx.strokeStyle='#ae794a';ctx.beginPath();ctx.moveTo(left-t/2,bottom);ctx.lineTo(right+t/2,bottom);ctx.stroke();
   ctx.strokeStyle='#b8f6f2';ctx.lineWidth=2*k*u;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(left-3*k*u,top+(bottom-top)*.12);ctx.lineTo(left-3*k*u,bottom-(bottom-top)*.14);ctx.moveTo(right+3*k*u,top+(bottom-top)*.12);ctx.lineTo(right+3*k*u,bottom-(bottom-top)*.14);ctx.stroke();ctx.lineCap='butt';
  }
  ctx.globalAlpha=1;
 }
 function rideDoors(value){
  const index=Math.floor(value),t=value-index,to=Math.min(N-1,index+1);
  watchFrames();drawTunnel(value);
  bar.querySelectorAll('b').forEach((fill,i)=>{fill.style.transform='scaleX('+clamp(value-i,0,1).toFixed(3)+')'});
  if(t<.002){
   showRooms([index]);place(index,1,'');door.style.opacity='0';return;
  }
  showRooms([index,to]);
  const fadeOut=1-smooth(t/.26),fadeIn=smooth((t-.7)/.3);
  place(index,fadeOut,'translate3d(0,'+(-t*36).toFixed(1)+'px,0) scale('+(.92+.08*fadeOut).toFixed(3)+')');
  place(to,fadeIn,'scale('+(.9+.1*fadeIn).toFixed(3)+')');
  const appear=smooth(t/.24),open=smooth((t-.26)/.34),dolly=smooth((t-.6)/.3),fade=1-smooth((t-.9)/.1);
  door.style.opacity=(appear*fade).toFixed(3);
  door.style.transform='scale('+((.35+.65*appear)*(1+dolly*(doorScale-1))).toFixed(3)+')';
  door.querySelector('.m-leaf.l').style.transform='translate3d('+(-open*100).toFixed(1)+'%,0,0)';
  door.querySelector('.m-leaf.r').style.transform='translate3d('+(open*100).toFixed(1)+'%,0,0)';
  const lock=door.querySelector('.m-lock');lock.style.transform='rotate('+(open*210).toFixed(1)+'deg)';lock.style.opacity=(1-smooth((open-.5)/.5)).toFixed(3);
  door.querySelector('.m-gate-light').style.opacity=(.3+.7*open).toFixed(3);
 }

 // ---------- B: the elevator ----------
 let leaves=null,display=null,lastFloor=-1;
 function initElevator(){
  bg.innerHTML='<div class="b-shaft"><i class="b-streaks"></i></div>';
  fx.innerHTML='<div class="b-leaf l"><i></i></div><div class="b-leaf r"><i></i></div><div class="b-rail l"></div><div class="b-rail r"></div>';
  leaves=[fx.querySelector('.b-leaf.l'),fx.querySelector('.b-leaf.r')];
  display=document.createElement('div');display.className='b-display';display.innerHTML='<span class="b-arrow" aria-hidden="true">▼</span><b class="b-num">RDC</b><small class="b-name">Le hall</small>';hud.append(display);
 }
 function rideElevator(value){
  const k=Math.round(value),d=value-k,close=smooth((Math.abs(d)-.04)/.2);
  showRooms([k]);place(k,1,'');
  leaves[0].style.transform='translate3d('+(-(1-close)*101).toFixed(1)+'%,0,0)';leaves[1].style.transform='translate3d('+((1-close)*101).toFixed(1)+'%,0,0)';
  const streaks=bg.querySelector('.b-streaks');streaks.style.transform='translate3d(0,'+(((value*820)%240)).toFixed(1)+'px,0)';
  stage.style.transform=close>.3?'translate3d(0,'+(Math.sin(value*90)*close*1.4).toFixed(2)+'px,0)':'';
  if(k!==lastFloor){display.querySelector('.b-num').textContent=nameOf(k);display.querySelector('.b-name').textContent=names[k]}
  display.classList.toggle('moving',close>.3);
  if(Math.abs(d)<.012){if(k!==lastFloor){lastFloor=k;api.buzz(14)}}else if(close>.5){lastFloor=-1}
 }

 // ---------- C: tiny unlock gestures ----------
 const passages=['lever','dial','scan','slide','latch','hold'];
 const captions={lever:'Tirez le levier',dial:'Tournez la molette',scan:'Posez le doigt pour scanner',slide:'Glissez pour déverrouiller',latch:'Tirez le loquet',hold:'Maintenez le bouton'};
 let host=null,widgetBusy=false;
 function initMechanisms(){
  initDoors();
  host=document.createElement('div');host.className='c-host';hud.append(host);
  showPassage(0);
 }
 function setM(value){p=stop+value*.5;ride(p)}
 function rewind(value,visual){api.tween(value,0,380,easeOut,v=>{visual(v);setM(v)})}
 function complete(value,visual){
  api.buzz([16,40,28]);
  api.tween(value,1,180,easeOut,v=>{visual(v);setM(v)},()=>{
   widgetBusy=true;host.classList.add('busy');
   const from=p;
   api.tween(from,stop+1,api.isCalm()?420:980,easeInOut,v=>{p=v;ride(v)},()=>{stop+=1;p=stop;ride(p);widgetBusy=false;showPassage(stop);api.buzz(12)});
  });
 }
 function release(value,visual,moved){if(!moved||value>=.84){complete(value,visual)}else{rewind(value,visual)}}
 function drag(target,handlers){
  let active=null;
  target.addEventListener('pointerdown',event=>{if(active!==null)return;if(widgetBusy)return;active=event.pointerId;try{target.setPointerCapture(active)}catch(error){}api.tween(0,0,1,t=>t,()=>{});handlers.down(event)});
  target.addEventListener('pointermove',event=>{if(event.pointerId!==active)return;handlers.move(event)});
  const end=event=>{if(event.pointerId!==active)return;active=null;handlers.up(event)};
  target.addEventListener('pointerup',end);target.addEventListener('pointercancel',end);
 }
 const thumbSvg='<svg viewBox="0 0 28 28" width="28" height="28" fill="none" stroke="#f0a35c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3 25 14 14 25 3 14Z"/><path d="M11 14h6M14.5 11l3 3-3 3"/></svg>';
 function barWidget(kind){
  const mirror=kind==='latch',el=document.createElement('div');el.className='m-slide c-bar'+(mirror?' c-latch':'');
  el.innerHTML='<span class="m-slide-fill"></span><span class="m-slide-label">'+captions[kind]+'</span><button class="m-thumb" type="button" aria-label="'+captions[kind]+'">'+(mirror?'<i class="c-grip"></i>':thumbSvg)+'</button>';
  const thumb=el.querySelector('.m-thumb'),fill=el.querySelector('.m-slide-fill'),label=el.querySelector('.m-slide-label');
  let value=0,x0=0,v0=0,moved=false;
  const max=()=>Math.max(1,el.clientWidth-thumb.offsetWidth-12);
  function visual(v){value=v;const x=v*max();thumb.style.transform='translate3d('+(mirror?-x:x).toFixed(1)+'px,0,0)';fill.style.transform='scaleX('+clamp((x+58)/el.clientWidth,0,1).toFixed(3)+')';label.style.opacity=String(clamp(1-v*1.9,0,1))}
  drag(thumb,{down(event){x0=event.clientX;v0=value;moved=false;thumb.style.animation='none'},
   move(event){const dx=(mirror?-1:1)*(event.clientX-x0);if(Math.abs(dx)>5)moved=true;visual(clamp(v0+dx/max(),0,1));setM(value)},
   up(){release(value,visual,moved)}});
  thumb.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();complete(value,visual)}});
  return el;
 }
 function leverWidget(){
  const el=document.createElement('div');el.className='c-lever';
  el.innerHTML='<div class="c-slot"><i class="c-rod"></i><button class="c-knob" type="button" aria-label="'+captions.lever+'"></button></div><span class="c-cap">'+captions.lever+' <b aria-hidden="true">↓</b></span>';
  const slot=el.querySelector('.c-slot'),knob=el.querySelector('.c-knob'),rod=el.querySelector('.c-rod');
  let value=0,y0=0,v0=0,moved=false;
  const max=()=>Math.max(1,slot.clientHeight-knob.offsetHeight-8);
  function visual(v){value=v;knob.style.transform='translate3d(0,'+(v*max()).toFixed(1)+'px,0)';rod.style.transform='scaleY('+v.toFixed(3)+')'}
  drag(knob,{down(event){y0=event.clientY;v0=value;moved=false},move(event){const dy=event.clientY-y0;if(Math.abs(dy)>5)moved=true;visual(clamp(v0+dy/max(),0,1));setM(value)},up(){release(value,visual,moved)}});
  knob.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();complete(value,visual)}});
  return el;
 }
 function dialWidget(){
  const el=document.createElement('div');el.className='c-dial';
  el.innerHTML='<svg class="c-arc" viewBox="0 0 100 100" aria-hidden="true"><circle class="c-arc-bg" cx="50" cy="50" r="46"/><circle class="c-arc-on" cx="50" cy="50" r="46" pathLength="1"/></svg><button class="c-wheel" type="button" aria-label="'+captions.dial+'"><i></i></button><span class="c-cap">'+captions.dial+' <b aria-hidden="true">↻</b></span>';
  const wheel=el.querySelector('.c-wheel'),arc=el.querySelector('.c-arc-on'),MAX=Math.PI*1.5;
  let value=0,last=0,acc=0,moved=false,mark=0;
  function angleOf(event){const box=wheel.getBoundingClientRect();return Math.atan2(event.clientY-(box.top+box.height/2),event.clientX-(box.left+box.width/2))}
  function visual(v){value=v;acc=v*MAX;wheel.style.transform='rotate('+(acc*180/Math.PI).toFixed(1)+'deg)';arc.style.strokeDashoffset=String((1-v*.75).toFixed(3))}
  drag(wheel,{down(event){last=angleOf(event);moved=false;mark=Math.floor(acc/(Math.PI/6))},
   move(event){let a=angleOf(event),delta=a-last;if(delta>Math.PI)delta-=Math.PI*2;if(delta<-Math.PI)delta+=Math.PI*2;last=a;if(Math.abs(delta)>.01)moved=true;acc=clamp(acc+delta,0,MAX);const m=Math.floor(acc/(Math.PI/6));if(m!==mark){mark=m;api.buzz(6)}visual(acc/MAX);setM(value)},
   up(){release(value,visual,moved)}});
  wheel.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();complete(value,visual)}});
  visual(0);
  return el;
 }
 function holdWidget(kind){
  const el=document.createElement('div');el.className='c-hold c-'+kind;
  const print='<svg class="c-print" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" aria-hidden="true"><path d="M22 58a28 28 0 0 1 56 0M30 62a20 20 0 0 1 40 0v6M38 64a12 12 0 0 1 24 0v12M46 66a4 4 0 0 1 8 0v18"/></svg>';
  el.innerHTML='<button class="c-pad" type="button" aria-label="'+captions[kind]+'">'+(kind==='scan'?print+'<i class="c-sweep"></i>':'<b>MAINTENIR</b>')+'<svg class="c-ring" viewBox="0 0 100 100" aria-hidden="true"><circle class="c-ring-bg" cx="50" cy="50" r="47"/><circle class="c-ring-on" cx="50" cy="50" r="47" pathLength="1"/></svg></button><span class="c-cap">'+captions[kind]+'</span>';
  const pad=el.querySelector('.c-pad'),ringOn=el.querySelector('.c-ring-on'),sweep=el.querySelector('.c-sweep');
  let value=0,holding=false,running=false,last=0,mark=0,done=false;
  function visual(v){value=v;ringOn.style.strokeDashoffset=String((1-v).toFixed(3));if(sweep)sweep.style.transform='translate3d(0,'+(v*100).toFixed(1)+'%,0)';pad.classList.toggle('on',v>0.02)}
  function loop(now){
   if(!running)return;
   const dt=Math.min(64,now-last);last=now;
   value=clamp(value+(holding?dt/1150:-dt/380),0,1);visual(value);setM(value);
   const m=Math.floor(value*4);if(m!==mark){mark=m;if(holding)api.buzz(7)}
   if(value>=1)if(!done){done=true;running=false;holding=false;complete(1,visual);return}
   if(value<=0)if(!holding){running=false;return}
   requestAnimationFrame(loop);
  }
  function begin(){if(widgetBusy)return;if(done)return;holding=true;if(!running){running=true;last=performance.now();requestAnimationFrame(loop)}}
  pad.addEventListener('pointerdown',event=>{try{pad.setPointerCapture(event.pointerId)}catch(error){}begin()});
  const end=()=>{holding=false};
  pad.addEventListener('pointerup',end);pad.addEventListener('pointercancel',end);pad.addEventListener('lostpointercapture',end);
  pad.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();if(!done){done=true;complete(value,visual)}}});
  return el;
 }
 function showPassage(index){
  host.classList.remove('busy');host.innerHTML='';
  if(index>=N-1)return;
  const kind=passages[index];
  const widget=kind==='lever'?leverWidget():kind==='dial'?dialWidget():kind==='scan'||kind==='hold'?holdWidget(kind):barWidget(kind);
  host.append(widget);
 }
 function jumpTo(target){
  if(target===stop)if(Math.abs(p-stop)<.001)return;
  widgetBusy=true;host.classList.add('busy');
  const distance=Math.abs(target-p);
  api.tween(p,target,api.isCalm()?300:clamp(620*distance,520,1700),easeInOut,v=>{p=v;ride(v)},()=>{stop=target;p=target;ride(p);widgetBusy=false;showPassage(stop)});
 }

 // ---------- calm: plain cross-fades ----------
 function rideCalm(value){
  const index=Math.floor(value),t=value-index,to=Math.min(N-1,index+1);
  if(bar){bar.querySelectorAll('b').forEach((fill,i)=>{fill.style.transform='scaleX('+clamp(value-i,0,1).toFixed(3)+')'})}
  if(door)door.style.opacity='0';
  if(leaves){leaves[0].style.transform='translate3d(-101%,0,0)';leaves[1].style.transform='translate3d(101%,0,0)'}
  stage.style.transform='';
  if(t<.002){showRooms([index]);place(index,1,'');return}
  showRooms([index,to]);place(index,1-smooth(t),'');place(to,smooth(t),'');
  if(display){const k=Math.round(value);display.querySelector('.b-num').textContent=nameOf(k);display.querySelector('.b-name').textContent=names[k]}
 }

 // ---------- driver ----------
 function ride(value){
  refreshNav();
  if(api.isCalm()){rideCalm(value)}else if(variant==='b'){rideElevator(value)}else{rideDoors(value)}
 }
 function measure(){const probe=j.querySelector('.j-snap');snapHeight=probe?probe.getBoundingClientRect().height:innerHeight;sizeDoors()}
 function goStop(index,instant){
  const target=clamp(index,0,N-1);
  if(scrolled){scrollTo({top:target*snapHeight,behavior:api.isCalm()||instant?'auto':'smooth'})}else{jumpTo(target)}
 }
 api.setGoHook((id,instant)=>{const index=ids.indexOf(id);if(index>=0)goStop(index,instant)});
 next.addEventListener('click',()=>{if(current>=N-1){goStop(0)}else{goStop(current+1)}});
 if(variant==='b'){initElevator()}else if(variant==='c'){initMechanisms()}else{initDoors()}
 if(scrolled){
  measure();
  addEventListener('scroll',()=>{p=clamp(scrollY/snapHeight,0,N-1);ride(p)},{passive:true});
  addEventListener('resize',()=>{measure();ride(p)},{passive:true});
 }else{
  addEventListener('resize',()=>{sizeDoors();ride(p)},{passive:true});
 }
 ride(0);
 root.classList.add('j-ready');
})();
