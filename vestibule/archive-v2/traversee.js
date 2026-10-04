(() => {
 'use strict';
 const journey=document.querySelector('.journey'),viewport=document.querySelector('.viewport'),worlds=[...document.querySelectorAll('.world')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const refs=worlds.map(w=>({w,wall:w.querySelector('.wall'),door:w.querySelector('.threshold'),copy:w.querySelector('.scene-copy'),left:w.querySelector('.leaf.left'),right:w.querySelector('.leaf.right'),lock:w.querySelector('.mechanism')}));
 const clamp=v=>Math.max(0,Math.min(1,v));const ramp=(p,a,b)=>clamp((p-a)/(b-a));const ease=t=>t*t*(3-2*t);
 let step=600,origin=0,requested=false,geometry=[],lastLabel=-1;
 const label=document.getElementById('route-label'),next=document.getElementById('route-next'),meter=document.querySelector('.route-line i'),progress=document.querySelector('.scroll-progress i');
 // Project rectangular interactive door leaves onto the illustrated opening corners.
 // Artwork reference size is 1672 x 941. Keep image and overlays on the same viewport.
 const portals=[...document.querySelectorAll('[data-portal]')];
 function roomFrame(W,H){const s=Math.min(W/1672,H/941);return {width:1672*s,height:941*s,x:(W-1672*s)/2,y:(H-941*s)/2}}
 function fitPortals(W,H){
  const frame=roomFrame(W,H);const hall=document.querySelector('.photo-hall');hall.style.setProperty('--hall-top',`${frame.y}px`);hall.style.setProperty('--hall-height',`${frame.height}px`);
  const corners={left:[[86,103],[410,197],[410,633],[86,681]],right:[[1285,198],[1586,104],[1586,682],[1285,632]]};
  portals.forEach(el=>{
   const target=corners[el.dataset.portal].map(([x,y])=>[frame.x+x*frame.width/1672,frame.y+y*frame.height/941]);
   const source=[[0,0],[360,0],[360,540],[0,540]],m=[];
   source.forEach(([x,y],i)=>{const [u,v]=target[i];m.push([x,y,1,0,0,0,-u*x,-u*y,u],[0,0,0,x,y,1,-v*x,-v*y,v])});
   for(let c=0;c<8;c++){
    let pivot=c;for(let r=c+1;r<8;r++)if(Math.abs(m[r][c])>Math.abs(m[pivot][c]))pivot=r;
    [m[c],m[pivot]]=[m[pivot],m[c]];const d=m[c][c];for(let k=c;k<9;k++)m[c][k]/=d;
    for(let r=0;r<8;r++)if(r!==c){const f=m[r][c];for(let k=c;k<9;k++)m[r][k]-=f*m[c][k]}
   }
   const [a,b,c,d,e,f,g,h]=m.map(row=>row[8]);
   el.style.transform=`matrix3d(${a},${d},0,${g},${b},${e},0,${h},0,0,1,0,${c},${f},0,1)`;
  });
 }
 function measure(){
  const W=viewport.clientWidth,H=innerHeight;step=Math.min(760,Math.max(480,H*.85));origin=journey.getBoundingClientRect().top+scrollY;
  fitPortals(W,H);
  journey.style.height=`${H+step*2}px`;
  geometry=refs.map((r,i)=>{
   if(!r.door)return null;
   const frame=i===1?roomFrame(W,H):{width:W,height:H,x:0,y:0};
   const cx=frame.x+frame.width*Number(r.w.dataset.x),cy=frame.y+frame.height*Number(r.w.dataset.y),dw=frame.width*Number(r.w.dataset.w),dh=frame.height*Number(r.w.dataset.h),x=cx-dw/2,y=cy-dh/2;
   Object.assign(r.door.style,{left:`${x}px`,top:`${y}px`,width:`${dw}px`,height:`${dh}px`});
   r.w.style.transformOrigin=`${cx}px ${cy}px`;
   // Fixed aperture cut once per resize. Only the whole wall transforms during scroll.
   r.wall.style.clipPath=`polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${x}px ${y}px, ${x+dw}px ${y}px, ${x+dw}px ${y+dh}px, ${x}px ${y+dh}px, ${x}px ${y}px)`;
   return {cx,cy,W,H,max:Math.max(W/dw,H/dh)*1.08};
  });schedule();
 }
 function draw(){
  requested=false;if(reduced.matches)return;
  const p=clamp((scrollY-origin)/(step*2))*2;
  refs.forEach((r,i)=>{
   const raw=clamp(p-i),local=i===1?ramp(raw,.28,1):raw,g=geometry[i];
   r.w.style.visibility=(i<2?p>=i+1:false)?'hidden':'visible';
   r.w.inert=i===1?(p<.99||p>1.65):false;
   const appear=i===0?1:ease(ramp(p,i-.12,i+.02));
   const fade=i===2?1:1-ease(ramp(local,.16,.59));r.copy.style.opacity=(appear*fade).toFixed(4);
   if(!g)return;
   const travel=ease(ramp(local,.27,1));
   // Perspective-like acceleration, ending only when the open aperture covers the screen.
   const scale=1/(1-travel*(1-1/g.max));
   r.w.style.transform=`translate(${((g.W/2-g.cx)*travel).toFixed(2)}px,${((g.H/2-g.cy)*travel).toFixed(2)}px) scale(${scale.toFixed(5)})`;
   const opening=ease(ramp(local,.12,.47));
   r.left.style.transform=`translateX(${-opening*101}%)`;r.right.style.transform=`translateX(${opening*101}%)`;
   r.lock.style.transform=`rotate(${ease(ramp(local,.01,.18))*90}deg)`;r.lock.style.opacity=(1-ease(ramp(local,.10,.25))).toFixed(4);
  });
  progress.style.transform=`scaleY(${p/2})`;meter.style.transform=`scaleX(${p/2})`;
  const index=Math.min(2,Math.floor(p+.005));if(index!==lastLabel){label.textContent=['L’ENTRÉE','LE HALL DES AVENTURES','PRÉPARER VOTRE VISITE'][index];next.textContent=['Faites défiler · poussez la première porte','Cliquez sur une salle · ou continuez vers la porte du fond','Tarifs, questions et cadeaux · continuez ↓'][index];lastLabel=index;}
 }
 function schedule(){if(!requested){requested=true;requestAnimationFrame(draw)}}
 function mode(){document.documentElement.classList.toggle('reduced',reduced.matches);if(reduced.matches)worlds.forEach(w=>w.inert=false);measure()}
 // Fetch each room illustration only when its portal is explored.
 function prepareRoom(button){const dialog=document.getElementById(`dialog-${button.dataset.room}`),image=dialog.querySelector('.dialog-art img');if(!image.getAttribute('src'))image.src=image.dataset.src;return dialog}
 document.querySelectorAll('[data-room]').forEach(button=>{
  button.addEventListener('pointerenter',()=>prepareRoom(button),{once:true});
  button.addEventListener('focus',()=>prepareRoom(button),{once:true});
  button.addEventListener('click',()=>prepareRoom(button).showModal());
 });
 document.querySelectorAll('.room-dialog').forEach(dialog=>{
  dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close()}});
 });
 document.querySelectorAll('[data-stop]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const n=Number(a.dataset.stop);if(reduced.matches)worlds[n].scrollIntoView({behavior:'auto'});else scrollTo({top:origin+step*(n+.025*(n>0)),behavior:'smooth'})}));
 document.querySelectorAll('a[href^="http"]').forEach(a=>{a.target='_blank';a.rel='noopener'});
 const prices={2:[75,'la session',75],3:[28,'/ personne',84],4:[24,'/ personne',96],5:[20,'/ personne',100],6:[20,'/ personne',120]};
 document.querySelectorAll('[data-players]').forEach(b=>b.addEventListener('click',()=>{const n=+b.dataset.players,p=prices[n];document.querySelector('[data-price]').textContent=p[0];document.querySelector('[data-price-unit]').textContent=p[1];document.querySelector('[data-total]').textContent=`${p[2]} € la session pour ${n} joueurs`;document.querySelectorAll('[data-players]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)))}));
 const reviews=[...document.querySelectorAll('.ee-review')];let review=0;function showReview(){reviews.forEach((r,i)=>r.hidden=i!==review);document.querySelector('.ee-review-count').textContent=`${String(review+1).padStart(2,'0')} / ${String(reviews.length).padStart(2,'0')}`}
 document.querySelector('.ee-review-controls').hidden=false;document.querySelectorAll('[data-review-step]').forEach(b=>b.addEventListener('click',()=>{review=(review+Number(b.dataset.reviewStep)+reviews.length)%reviews.length;showReview()}));showReview();
 document.documentElement.classList.add('motion');window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',measure,{passive:true});reduced.addEventListener('change',mode);mode();
})();
