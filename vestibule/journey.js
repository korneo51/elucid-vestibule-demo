/* Vestibule mobile, travel styles. The classic page scrolls; these advance room by room.
   A  walk through doors (scroll)       B  elevator, floor by floor (scroll)       C  little unlock gestures, no scroll.
   Active only when mobile.js reports a style ('a', 'b' or 'c'). Nothing here moves except by transform and opacity.
   Written without the double ampersand, which WordPress rewrites inside HTML blocks. */
(() => {
 'use strict';
 const api=window.eeMobile;
 if(!api)return;
 if(!api.variant)return;
 if(api.variant==='d')return;
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
  current=k;root.dataset.room=String(k);
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
 function initBar(){
  bar=document.createElement('div');bar.className='a-bar';bar.innerHTML=names.map((name,index)=>'<button type="button" class="a-seg" data-room="'+index+'" aria-label="Aller à : '+name+'"><i><b></b></i></button>').join('');hud.append(bar);
  bar.addEventListener('click',event=>{const seg=event.target.closest('.a-seg');if(seg)goStop(Number(seg.dataset.room))});
 }
 function initDoors(){
  tunnel=document.createElement('canvas');tunnel.className='a-tunnel';bg.append(tunnel);tunnelContext=tunnel.getContext('2d');
  fx.innerHTML=doorMarkup;door=fx.querySelector('.a-door');
  initBar();
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

 // ---------- C: mechanisms ----------
 // Six small tactile objects, one between each pair of rooms: a lever to swing, a key to slide, a wheel to turn, a chain to pull,
 // a plug to connect, a bolt to draw. Using one opens its own gateway (door, box, vault, shutter, airlock, gate) and the view dives through.
 const kinds=['lever','key','wheel','chain','plug','bolt'];
 const captions={lever:'Actionnez le levier',key:'Glissez la clé dans la serrure',wheel:'Tournez la roue',chain:'Tirez la chaîne',plug:'Branchez la prise',bolt:'Tirez le verrou'};
 const hints={lever:'→',key:'→',wheel:'↻',chain:'↓',plug:'→',bolt:'←'};
 const gateOf={lever:'door',key:'box',wheel:'vault',chain:'shutter',plug:'blast',bolt:'wood'};
 let host=null,widgetBusy=false,glow=null,gate=null,gateName='';
 const bowSvg='<svg viewBox="0 0 84 56" aria-hidden="true"><path d="M42 30C26 4 4 8 6 24c2 16 26 10 36 6Z" fill="#f4c964" stroke="#a8741c" stroke-width="2"/><path d="M42 30C58 4 80 8 78 24c-2 16-26 10-36 6Z" fill="#f4c964" stroke="#a8741c" stroke-width="2"/><path d="M42 30 22 52M42 30l20 22" stroke="#d9a441" stroke-width="7" stroke-linecap="round"/><circle cx="42" cy="30" r="8" fill="#e6b24c" stroke="#a8741c" stroke-width="2"/></svg>';
 const gateBuilders={
  door(){
   const el=document.createElement('div');el.className='m-gate-door g g-door';
   el.innerHTML='<div class="m-gate-light"></div><div class="m-leaf l"></div><div class="m-leaf r"></div><svg class="m-lock" viewBox="0 0 140 140" fill="none" aria-hidden="true"><circle cx="70" cy="70" r="64"/><circle class="m-ticks" cx="70" cy="70" r="55"/><path d="M70 30 110 70 70 110 30 70Z"/><path d="M63 70h14M70 63v14"/></svg>';
   const left=el.querySelector('.l'),right=el.querySelector('.r'),lock=el.querySelector('.m-lock'),light=el.querySelector('.m-gate-light');
   return{el,dive:()=>Math.max(innerWidth/el.offsetWidth,innerHeight/el.offsetHeight)*1.3,update(open){
    left.style.transform='translate3d('+(-open*100).toFixed(1)+'%,0,0)';right.style.transform='translate3d('+(open*100).toFixed(1)+'%,0,0)';
    lock.style.transform='rotate('+(open*210).toFixed(1)+'deg)';lock.style.opacity=(1-smooth((open-.5)/.5)).toFixed(3);light.style.opacity=(.3+.7*open).toFixed(3);
   }};
  },
  box(){
   const el=document.createElement('div');el.className='g g-box';
   el.innerHTML='<i class="gb-beam"></i><div class="gb-scene"><i class="gb-f gb-floor"></i><i class="gb-f gb-back"></i><i class="gb-f gb-left"></i><i class="gb-f gb-right"></i><i class="gb-f gb-front"><u></u></i>'
    +'<div class="gb-lid"><i class="gb-f gb-top"><u></u>'+bowSvg+'</i><i class="gb-f gb-lip"></i><i class="gb-f gb-lip r"></i><i class="gb-f gb-lip l"></i></div></div>';
   const lid=el.querySelector('.gb-lid'),beam=el.querySelector('.gb-beam');
   el.style.transformOrigin='50% 46%';
   return{el,dive:()=>Math.max(innerWidth,innerHeight)/95*1.15,update(open){
    lid.style.transform='translateZ(-65px) rotateX('+(open*114).toFixed(1)+'deg)';beam.style.opacity=smooth((open-.15)/.5).toFixed(3);
   }};
  },
  vault(){
   const el=document.createElement('div');el.className='g g-vault';
   const bolts=Array.from({length:16},(item,i)=>'<circle cx="125" cy="13" r="5.5" transform="rotate('+(i*22.5)+' 125 125)"/>').join('');
   const lugs=Array.from({length:12},(item,i)=>'<rect x="94" y="3" width="8" height="15" rx="2" transform="rotate('+(i*30+15)+' 98 98)"/>').join('');
   el.innerHTML='<svg class="gv-frame" viewBox="0 0 250 250" aria-hidden="true"><circle cx="125" cy="125" r="123" fill="#3b4652"/><circle cx="125" cy="125" r="118" fill="#7d8996"/><circle cx="125" cy="125" r="104" fill="#27303a"/><circle cx="125" cy="125" r="100" fill="#050810"/><g fill="#d4dbe2" stroke="#1b222b" stroke-width="1.5">'+bolts+'</g></svg><i class="gv-hole"></i>'
    +'<div class="gv-door"><svg viewBox="0 0 196 196" aria-hidden="true"><circle cx="98" cy="98" r="97" fill="#8f9ba7"/><circle cx="98" cy="98" r="90" fill="#5b6672"/><circle cx="98" cy="98" r="78" fill="#7f8b97"/><circle cx="98" cy="98" r="76" fill="none" stroke="#2c353f" stroke-width="2"/><circle cx="98" cy="98" r="56" fill="none" stroke="#2c353f" stroke-width="2"/><circle cx="98" cy="98" r="54" fill="#6a7683"/><g fill="#39434e">'+lugs+'</g><circle cx="98" cy="98" r="30" fill="#2a343e" stroke="#e8832a" stroke-width="3"/></svg>'
    +'<svg class="gv-wheel" viewBox="0 0 196 196" aria-hidden="true"><g stroke="#aeb9c4" stroke-linecap="round" fill="#aeb9c4"><path d="M98 52V144M52 98H144" stroke-width="9"/><circle cx="98" cy="50" r="8"/><circle cx="98" cy="146" r="8"/><circle cx="50" cy="98" r="8"/><circle cx="146" cy="98" r="8"/></g><circle cx="98" cy="98" r="13" fill="#e8832a"/></svg></div>';
   const door=el.querySelector('.gv-door'),wheel=el.querySelector('.gv-wheel'),hole=el.querySelector('.gv-hole');
   return{el,dive:()=>Math.max(innerWidth,innerHeight)/160*1.25,update(open){
    const turn=smooth(open/.45),swing=smooth((open-.4)/.6);
    wheel.style.transform='rotate('+(-turn*200).toFixed(1)+'deg)';door.style.transform='perspective(900px) rotateY('+(-swing*108).toFixed(1)+'deg)';hole.style.opacity=(.35+.65*swing).toFixed(3);
   }};
  },
  shutter(){
   const el=document.createElement('div');el.className='g g-shut';
   el.innerHTML='<div class="gs-view"><i class="gs-light"></i><div class="gs-slats"><i class="gs-bar"></i></div></div><i class="gs-roll"></i>';
   const slats=el.querySelector('.gs-slats'),light=el.querySelector('.gs-light');
   return{el,dive:()=>Math.max(innerWidth/210,innerHeight/250)*1.25,update(open){
    slats.style.transform='translate3d(0,'+(-open*101).toFixed(1)+'%,0)';light.style.opacity=(.4+.6*open).toFixed(3);
   }};
  },
  blast(){
   const el=document.createElement('div');el.className='g g-blast';
   el.innerHTML='<div class="gx-view"><i class="gx-light"></i><div class="gx-leaf l"><i></i></div><div class="gx-leaf r"><i></i></div></div><i class="gx-led a"></i><i class="gx-led b"></i><i class="gx-led c"></i>';
   const left=el.querySelector('.gx-leaf.l'),right=el.querySelector('.gx-leaf.r'),light=el.querySelector('.gx-light'),leds=[...el.querySelectorAll('.gx-led')];
   return{el,dive:()=>Math.max(innerWidth/220,innerHeight/270)*1.3,update(open){
    left.style.transform='translate3d('+(-open*100).toFixed(1)+'%,0,0)';right.style.transform='translate3d('+(open*100).toFixed(1)+'%,0,0)';light.style.opacity=(.35+.65*open).toFixed(3);
    leds.forEach((led,i)=>{led.style.opacity=(open>i*.28?1:.25).toFixed(2)});
   }};
  },
  wood(){
   const el=document.createElement('div');el.className='g g-wood';
   el.innerHTML='<div class="gw-view"><i class="gw-light"></i><div class="gw-leaf l"><i></i></div><div class="gw-leaf r"><i></i></div></div>';
   const left=el.querySelector('.gw-leaf.l'),right=el.querySelector('.gw-leaf.r'),light=el.querySelector('.gw-light');
   return{el,dive:()=>Math.max(innerWidth/200,innerHeight/250)*1.3,update(open){
    left.style.transform='rotateY('+(open*84).toFixed(1)+'deg)';right.style.transform='rotateY('+(-open*84).toFixed(1)+'deg)';light.style.opacity=(.4+.6*open).toFixed(3);
   }};
  }
 };
 function ensureGate(index){
  const name=gateOf[kinds[Math.min(index,kinds.length-1)]];
  if(name===gateName)return;
  if(gate)gate.el.remove();
  gate=gateBuilders[name]();gateName=name;gate.el.style.opacity='0';
  fx.insertBefore(gate.el,glow);glow.classList.toggle('cy',name==='blast');gate.scale=gate.dive();
 }
 function rideGateway(value){
  const index=Math.floor(value),t=value-index,to=Math.min(N-1,index+1);
  bar.querySelectorAll('b').forEach((fill,i)=>{fill.style.transform='scaleX('+clamp(value-i,0,1).toFixed(3)+')'});
  if(t<.002){
   showRooms([index]);place(index,1,'');
   if(gate)gate.el.style.opacity='0';
   glow.style.opacity='0';return;
  }
  ensureGate(index);showRooms([index,to]);
  const fadeOut=1-smooth(t/.2),fadeIn=smooth((t-.76)/.24);
  place(index,fadeOut,'translate3d(0,'+(-t*30).toFixed(1)+'px,0) scale('+(.95+.05*fadeOut).toFixed(3)+')');
  place(to,fadeIn,'scale('+(.93+.07*fadeIn).toFixed(3)+')');
  const appear=smooth(t/.18),open=smooth((t-.22)/.36),dolly=smooth((t-.56)/.3),fade=1-smooth((t-.9)/.1);
  gate.el.style.opacity=(appear*fade).toFixed(3);
  gate.el.style.transform='scale('+((.6+.4*appear)*(1+dolly*(gate.scale-1))).toFixed(3)+')';
  gate.update(open);
  glow.style.opacity=(smooth((t-.6)/.22)*(1-smooth((t-.86)/.14))).toFixed(3);
 }
 function initMechanisms(){
  initBar();
  glow=document.createElement('div');glow.className='g-glow';fx.append(glow);
  host=document.createElement('div');host.className='c-host';hud.append(host);
  fitHost();showPassage(0);
 }
 // The control panel is drawn at 340 x 148 and scaled down on narrow or short screens.
 function fitHost(){
  const k=Math.min(1,(innerWidth-24)/340,innerHeight<700?.84:1);
  host.style.setProperty('--ck',k.toFixed(3));host.style.height=Math.round(148*k+30)+'px';
 }
 function setM(value){p=stop+value*.4;ride(p)}
 function rewind(value,visual){api.tween(value,0,380,easeOut,v=>{visual(v);setM(v)})}
 function complete(value,visual,duration){
  api.buzz([16,40,28]);
  api.tween(value,1,duration||180,easeOut,v=>{visual(v);setM(v)},()=>{
   widgetBusy=true;host.classList.add('busy');
   api.tween(p,stop+1,api.isCalm()?420:1150,easeInOut,v=>{p=v;ride(v)},()=>{stop+=1;p=stop;ride(p);widgetBusy=false;showPassage(stop);api.buzz(12)});
  });
 }
 // A tap with no movement plays the gesture by itself, so the passage never depends on dexterity.
 function release(value,visual,moved){if(!moved){complete(value,visual,560)}else if(value>=.84){complete(value,visual)}else{rewind(value,visual)}}
 function drag(target,handlers){
  let active=null;
  target.addEventListener('pointerdown',event=>{if(active!==null)return;if(widgetBusy)return;active=event.pointerId;try{target.setPointerCapture(active)}catch(error){}api.tween(0,0,1,t=>t,()=>{});handlers.down(event)});
  target.addEventListener('pointermove',event=>{if(event.pointerId!==active)return;handlers.move(event)});
  const end=event=>{if(event.pointerId!==active)return;active=null;handlers.up(event)};
  target.addEventListener('pointerup',end);target.addEventListener('pointercancel',end);
 }
 function unit(el){return el.offsetWidth?el.getBoundingClientRect().width/el.offsetWidth:1}
 function panel(kind){const el=document.createElement('div');el.className='c-panel p-'+kind;return el}
 function keys(target,value,visual){target.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();complete(value(),visual,560)}})}

 function leverWidget(){
  const el=panel('lever');
  el.innerHTML='<svg class="c-art" viewBox="0 0 340 148" aria-hidden="true"><path d="M93 87A87 87 0 0 1 247 87" fill="none" stroke="#04070b" stroke-width="26" stroke-linecap="round"/><path d="M93 87A87 87 0 0 1 247 87" fill="none" stroke="#1b2838" stroke-width="18" stroke-linecap="round"/><path d="M93 87A87 87 0 0 1 247 87" fill="none" stroke="#e8832a" stroke-width="2" stroke-dasharray="1 9" stroke-linecap="round" opacity=".75"/><circle cx="170" cy="128" r="23" fill="#2a3340" stroke="#0a0f15" stroke-width="3"/><circle cx="170" cy="128" r="17" fill="#c9a05a"/><circle cx="170" cy="128" r="17" fill="none" stroke="#fff4d6" stroke-opacity=".5" stroke-width="2" stroke-dasharray="26 80"/></svg>'
   +'<i class="c-lamp r"></i><i class="c-lamp g"></i><div class="c-lv"><div class="c-arm"><i class="c-stalk"></i><button class="c-ball" type="button" aria-label="'+captions.lever+'"></button></div><i class="c-hub"></i></div>';
  const arm=el.querySelector('.c-arm'),ball=el.querySelector('.c-ball'),pivot=el.querySelector('.c-lv'),MIN=-62,MAX=62;
  let value=0,off=0,moved=false,mark=0;
  const pointer=event=>{const box=pivot.getBoundingClientRect();return Math.atan2(event.clientX-box.left,box.top-event.clientY)*180/Math.PI};
  function visual(v){value=v;el.style.setProperty('--v',v.toFixed(3));arm.style.transform='rotate('+(MIN+v*(MAX-MIN)).toFixed(1)+'deg)'}
  drag(ball,{down(event){off=pointer(event)-(MIN+value*(MAX-MIN));moved=false;ball.classList.add('on')},
   move(event){const angle=clamp(pointer(event)-off,MIN,MAX);if(Math.abs(angle-(MIN+value*(MAX-MIN)))>.4)moved=true;const m=Math.floor(angle/12);if(m!==mark){mark=m;api.buzz(5)}visual((angle-MIN)/(MAX-MIN));setM(value)},
   up(){ball.classList.remove('on');release(value,visual,moved)}});
  keys(ball,()=>value,visual);visual(0);
  return el;
 }
 function keyWidget(){
  const el=panel('key'),RANGE=112,FINGER=140;
  el.innerHTML='<svg class="c-lock" viewBox="0 0 120 112" aria-hidden="true"><defs><linearGradient id="ck-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0d08a"/><stop offset=".55" stop-color="#c9953a"/><stop offset="1" stop-color="#7c5320"/></linearGradient></defs>'
   +'<g class="c-shackle"><path d="M34 52V32a26 26 0 0 1 52 0V52" fill="none" stroke="#0d1218" stroke-width="15" stroke-linecap="round"/><path d="M34 52V32a26 26 0 0 1 52 0V52" fill="none" stroke="#c2cbd4" stroke-width="10" stroke-linecap="round"/><path d="M38 50V33a22 22 0 0 1 22-22" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2.5" stroke-linecap="round"/></g>'
   +'<rect x="8" y="50" width="104" height="58" rx="11" fill="url(#ck-b)" stroke="#4d3510" stroke-width="2"/><rect x="14" y="56" width="92" height="46" rx="8" fill="none" stroke="#fff4d0" stroke-opacity=".35" stroke-width="2"/><rect x="8" y="68" width="30" height="16" rx="5" fill="#0a0d12"/><rect x="11" y="72" width="26" height="8" rx="3" fill="#2a1f10"/><circle cx="82" cy="79" r="9" fill="#a9772a" stroke="#4d3510" stroke-width="2"/></svg>'
   +'<button class="c-keyb" type="button" aria-label="'+captions.key+'"><svg viewBox="0 0 128 44" aria-hidden="true"><defs><linearGradient id="ck-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0bd"/><stop offset=".5" stop-color="#e0aa4a"/><stop offset="1" stop-color="#8a5a1c"/></linearGradient></defs><circle cx="22" cy="22" r="17" fill="none" stroke="url(#ck-g)" stroke-width="8"/><rect x="36" y="18" width="88" height="9" rx="3" fill="url(#ck-g)"/><path d="M96 27h8v10h-8zM110 27h8v7h-8z" fill="#c4902f"/><circle cx="22" cy="22" r="6" fill="#05080d" opacity=".55"/></svg></button>'
   +'<i class="c-lamp r"></i><i class="c-lamp g"></i>';
  const key=el.querySelector('.c-keyb'),keySvg=key.firstChild,shackle=el.querySelector('.c-shackle');
  let value=0,x0=0,v0=0,moved=false,scale=1;
  function visual(v){
   value=v;el.style.setProperty('--v',v.toFixed(3));
   const twist=smooth((v-.8)/.2);
   key.style.transform='translate3d('+(Math.min(1,v/.8)*RANGE).toFixed(1)+'px,0,0)';keySvg.style.transform='scaleY('+(1-2*twist).toFixed(3)+')';
   shackle.style.transform='translate('+(-2*twist).toFixed(1)+'px,'+(-13*twist).toFixed(1)+'px) rotate('+(-28*twist).toFixed(1)+'deg)';
  }
  drag(key,{down(event){x0=event.clientX;v0=value;moved=false;scale=unit(el)},
   move(event){const dx=(event.clientX-x0)/scale;if(Math.abs(dx)>4)moved=true;visual(clamp(v0+dx/FINGER,0,1));setM(value)},
   up(){release(value,visual,moved)}});
  keys(key,()=>value,visual);visual(0);
  return el;
 }
 function wheelWidget(){
  const el=panel('wheel'),MAX=Math.PI*2;
  const leds=Array.from({length:8},(item,i)=>'<i class="c-led" style="--a:'+(-157.5+i*45)+'deg"></i>').join('');
  el.innerHTML='<i class="c-bezel"></i>'+leds+'<button class="c-wheel" type="button" aria-label="'+captions.wheel+'"><svg viewBox="-8 -8 156 156" aria-hidden="true"><g fill="none" stroke-linecap="round"><circle cx="70" cy="70" r="49" stroke="#0b1016" stroke-width="14"/><circle cx="70" cy="70" r="49" stroke="#a5b1bd" stroke-width="10"/><circle cx="70" cy="70" r="53" stroke="#f1f5f8" stroke-opacity=".55" stroke-width="1.5"/><path d="M70 22V118M22 70H118" stroke="#0b1016" stroke-width="13"/><path d="M70 22V118M22 70H118" stroke="#a5b1bd" stroke-width="9"/></g><g fill="#c7d1db" stroke="#0b1016" stroke-width="2"><circle cx="70" cy="10" r="9"/><circle cx="70" cy="130" r="9"/><circle cx="10" cy="70" r="9"/><circle cx="130" cy="70" r="9"/></g><circle cx="70" cy="70" r="17" fill="#1f2832" stroke="#e8832a" stroke-width="3"/><circle cx="70" cy="70" r="6" fill="#e8832a"/><path d="M70 10l0 1" stroke="#e8832a" stroke-width="5" stroke-linecap="round"/></svg></button>';
  const wheel=el.querySelector('.c-wheel'),lights=[...el.querySelectorAll('.c-led')];
  let value=0,last=0,acc=0,moved=false,mark=0;
  function angleOf(event){const box=wheel.getBoundingClientRect();return Math.atan2(event.clientY-(box.top+box.height/2),event.clientX-(box.left+box.width/2))}
  function visual(v){value=v;acc=v*MAX;wheel.style.transform='rotate('+(acc*180/Math.PI).toFixed(1)+'deg)';const count=Math.floor(v*8.001);lights.forEach((led,i)=>led.classList.toggle('on',i<count));el.style.setProperty('--v',v.toFixed(3))}
  drag(wheel,{down(event){last=angleOf(event);moved=false;mark=Math.floor(acc/(Math.PI/4))},
   move(event){let a=angleOf(event),delta=a-last;if(delta>Math.PI)delta-=Math.PI*2;if(delta<-Math.PI)delta+=Math.PI*2;last=a;if(Math.abs(delta)>.01)moved=true;acc=clamp(acc+delta,0,MAX);const m=Math.floor(acc/(Math.PI/4));if(m!==mark){mark=m;api.buzz(6)}visual(acc/MAX);setM(value)},
   up(){release(value,visual,moved)}});
  keys(wheel,()=>value,visual);visual(0);
  return el;
 }
 function chainWidget(){
  const el=panel('chain'),RANGE=50;
  const bars=side=>'<span class="c-gauge '+side+'">'+Array.from({length:5},()=>'<i></i>').join('')+'</span>';
  el.innerHTML='<i class="c-bracket"></i>'+bars('l')+bars('r')+'<div class="c-cord"><i class="c-chain"></i><button class="c-pull" type="button" aria-label="'+captions.chain+'"><i></i></button></div>';
  const cord=el.querySelector('.c-cord'),pull=el.querySelector('.c-pull'),cells=[...el.querySelectorAll('.c-gauge i')];
  let value=0,y0=0,v0=0,moved=false,scale=1,mark=0;
  function visual(v){value=v;cord.style.transform='translate3d(0,'+(v*RANGE).toFixed(1)+'px,0)';const count=Math.floor(v*5.001);cells.forEach((cell,i)=>cell.classList.toggle('on',i%5<count));el.style.setProperty('--v',v.toFixed(3))}
  drag(pull,{down(event){y0=event.clientY;v0=value;moved=false;scale=unit(el)},
   move(event){const dy=(event.clientY-y0)/scale;if(Math.abs(dy)>4)moved=true;const next=clamp(v0+dy/RANGE,0,1),m=Math.floor(next*8);if(m!==mark){mark=m;api.buzz(5)}visual(next);setM(value)},
   up(){release(value,visual,moved)}});
  keys(pull,()=>value,visual);visual(0);
  return el;
 }
 function plugWidget(){
  const el=panel('plug'),T0={x:122,y:100},S={x:266,y:72},D0=Math.hypot(S.x-T0.x,S.y-T0.y);
  el.innerHTML='<svg class="c-art" viewBox="0 0 340 148" aria-hidden="true"><path class="c-wire-a" fill="none" stroke="#04070b" stroke-width="11" stroke-linecap="round"/><path class="c-wire-b" fill="none" stroke="#2b6f88" stroke-width="3.5" stroke-linecap="round"/></svg>'
   +'<div class="c-socket"><i class="c-hole a"></i><i class="c-hole b"></i><i class="c-lamp r"></i><i class="c-lamp g"></i></div><div class="c-pa"><div class="c-plug"><i class="c-prong"></i><i class="c-prong b"></i><button class="c-pbody" type="button" aria-label="'+captions.plug+'"><i></i><i></i><i></i></button></div></div><i class="c-spark"></i>';
  const pa=el.querySelector('.c-pa'),wireA=el.querySelector('.c-wire-a'),wireB=el.querySelector('.c-wire-b'),body=el.querySelector('.c-pbody'),spark=el.querySelector('.c-spark');
  let value=0,pos={x:T0.x,y:T0.y},grab={x:0,y:0},moved=false,scale=1,sparked=false;
  function put(x,y){
   pos={x:x,y:y};
   const aim=clamp(Math.atan2(S.y-y,S.x-x)*180/Math.PI,-35,35),bx=x-72,slack=18*(1-Math.min(1,Math.max(0,(x-80)/190)));
   pa.style.transform='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0) rotate('+aim.toFixed(1)+'deg)';
   const d='M-8 124C'+(bx*.5).toFixed(1)+' '+(128+slack).toFixed(1)+','+(bx-50).toFixed(1)+' '+(y+slack*.4).toFixed(1)+','+bx.toFixed(1)+' '+y.toFixed(1);
   wireA.setAttribute('d',d);wireB.setAttribute('d',d);
  }
  function visual(v){value=v;el.style.setProperty('--v',v.toFixed(3));put(T0.x+(S.x-T0.x)*v,T0.y+(S.y-T0.y)*v);if(v>.995)if(!sparked){sparked=true;spark.classList.remove('go');void spark.offsetWidth;spark.classList.add('go')}if(v<.9)sparked=false}
  const local=event=>{const box=el.getBoundingClientRect();return{x:(event.clientX-box.left)/scale,y:(event.clientY-box.top)/scale}};
  drag(body,{down(event){scale=unit(el);const at=local(event);grab={x:at.x-pos.x,y:at.y-pos.y};moved=false},
   move(event){const at=local(event),x=clamp(at.x-grab.x,90,S.x),y=clamp(at.y-grab.y,36,128);if(Math.hypot(x-pos.x,y-pos.y)>1.5)moved=true;
    const next=clamp(1-Math.hypot(S.x-x,S.y-y)/D0,0,1);value=next;el.style.setProperty('--v',next.toFixed(3));put(x,y);setM(next)},
   up(){release(value,visual,moved)}});
  keys(body,()=>value,visual);visual(0);
  return el;
 }
 function boltWidget(){
  const el=panel('bolt'),RANGE=120;
  el.innerHTML='<svg class="c-art" viewBox="0 0 340 148" aria-hidden="true"><rect x="20" y="58" width="300" height="32" rx="16" fill="#05080d"/><rect x="24" y="62" width="292" height="24" rx="12" fill="#10181f"/></svg>'
   +'<i class="c-lamp r"></i><i class="c-lamp g"></i><div class="c-bolt"><i class="c-shaft"></i><button class="c-grip2" type="button" aria-label="'+captions.bolt+'"><i></i></button></div><i class="c-keeper"></i>';
  const bolt=el.querySelector('.c-bolt');
  let value=0,x0=0,v0=0,moved=false,scale=1,mark=0;
  function visual(v){value=v;el.style.setProperty('--v',v.toFixed(3));bolt.style.transform='translate3d('+(-v*RANGE).toFixed(1)+'px,0,0)'}
  const grip=el.querySelector('.c-grip2');
  drag(grip,{down(event){x0=event.clientX;v0=value;moved=false;scale=unit(el)},
   move(event){const dx=(x0-event.clientX)/scale;if(Math.abs(dx)>4)moved=true;const next=clamp(v0+dx/RANGE,0,1),m=Math.floor(next*8);if(m!==mark){mark=m;api.buzz(5)}visual(next);setM(value)},
   up(){release(value,visual,moved)}});
  keys(grip,()=>value,visual);visual(0);
  return el;
 }
 function showPassage(index){
  host.classList.remove('busy');host.innerHTML='';
  if(index>=N-1)return;
  const kind=kinds[index];
  const widget=kind==='lever'?leverWidget():kind==='key'?keyWidget():kind==='wheel'?wheelWidget():kind==='chain'?chainWidget():kind==='plug'?plugWidget():boltWidget();
  const wrap=document.createElement('div');wrap.className='c-wrap';
  wrap.append(widget);
  const caption=document.createElement('span');caption.className='c-cap';caption.innerHTML=captions[kind]+' <b aria-hidden="true">'+hints[kind]+'</b>';wrap.append(caption);
  host.append(wrap);
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
  if(gate)gate.el.style.opacity='0';
  if(glow)glow.style.opacity='0';
  if(leaves){leaves[0].style.transform='translate3d(-101%,0,0)';leaves[1].style.transform='translate3d(101%,0,0)'}
  stage.style.transform='';
  if(t<.002){showRooms([index]);place(index,1,'');return}
  showRooms([index,to]);place(index,1-smooth(t),'');place(to,smooth(t),'');
  if(display){const k=Math.round(value);display.querySelector('.b-num').textContent=nameOf(k);display.querySelector('.b-name').textContent=names[k]}
 }

 // ---------- driver ----------
 function ride(value){
  refreshNav();
  if(api.isCalm()){rideCalm(value)}else if(variant==='b'){rideElevator(value)}else if(variant==='c'){rideGateway(value)}else{rideDoors(value)}
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
  addEventListener('resize',()=>{fitHost();if(gate)gate.scale=gate.dive();ride(p)},{passive:true});
 }
 ride(0);
 root.classList.add('j-ready');
})();
