(() => {
 'use strict';
 const journey=document.querySelector('.journey'),viewport=document.querySelector('.viewport'),worlds=[...document.querySelectorAll('.world')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const refs=worlds.map(w=>({w,wall:w.querySelector('.wall'),door:w.querySelector('.threshold'),copy:w.querySelector('.scene-copy'),left:w.querySelector('.leaf.left'),right:w.querySelector('.leaf.right'),lock:w.querySelector('.mechanism')}));
 const clamp=v=>Math.max(0,Math.min(1,v));const ramp=(p,a,b)=>clamp((p-a)/(b-a));const ease=t=>t*t*(3-2*t);
 let step=600,origin=0,requested=false,geometry=[],lastLabel=-1;
 const label=document.getElementById('route-label'),next=document.getElementById('route-next'),meter=document.querySelector('.route-line i'),progress=document.querySelector('.scroll-progress i');
 function measure(){
  const W=viewport.clientWidth,H=innerHeight;step=Math.min(760,Math.max(480,H*.85));origin=journey.getBoundingClientRect().top+scrollY;
  journey.style.height=`${H+step*2}px`;
  geometry=refs.map((r,i)=>{
   if(!r.door)return null;
   const cx=W*Number(r.w.dataset.x),cy=H*Number(r.w.dataset.y),dw=W*Number(r.w.dataset.w),dh=H*Number(r.w.dataset.h),x=cx-dw/2,y=cy-dh/2;
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
   r.w.style.visibility=(i<2&&p>=i+1)?'hidden':'visible';
   r.w.inert=i===1&&(p<.99||p>1.65);
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
 document.querySelectorAll('[data-room]').forEach(button=>button.addEventListener('click',()=>{
  const dialog=document.getElementById(`dialog-${button.dataset.room}`);
  dialog.showModal();
 }));
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
