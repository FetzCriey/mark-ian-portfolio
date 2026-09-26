document.documentElement.classList.add('js');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.primary-nav');
const navLinks = [...document.querySelectorAll('.primary-nav a[href^="#"]')];
const progress = document.querySelector('.page-progress i');
const pointerAura = document.querySelector('.pointer-aura');

function closeMenu(restoreFocus=false){
  if(!nav?.classList.contains('open')) return;
  nav.classList.remove('open');
  menuButton?.setAttribute('aria-expanded','false');
  document.body.classList.remove('menu-open');
  if(restoreFocus) menuButton?.focus();
}

function openMenu(){
  if(!nav||!menuButton) return;
  nav.classList.add('open');
  menuButton.setAttribute('aria-expanded','true');
  document.body.classList.add('menu-open');
  navLinks[0]?.focus();
}

menuButton?.addEventListener('click',()=>nav?.classList.contains('open')?closeMenu():openMenu());
navLinks.forEach(link=>link.addEventListener('click',()=>closeMenu()));
document.addEventListener('pointerdown',event=>{
  if(nav?.classList.contains('open')&&!header?.contains(event.target)) closeMenu();
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){closeMenu(true);return}
  if(event.key!=='Tab'||!nav?.classList.contains('open')) return;
  const focusables=[menuButton,...navLinks].filter(Boolean);
  const first=focusables[0],last=focusables[focusables.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
});

let scrollFrame=0;
function updateScrollUI(){
  const y=window.scrollY;
  header?.classList.toggle('scrolled',y>18);
  if(progress){
    const max=Math.max(document.documentElement.scrollHeight-window.innerHeight,1);
    progress.style.transform=`scaleX(${Math.min(y/max,1)})`;
  }
  scrollFrame=0;
}
function requestScrollUI(){if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScrollUI)}
updateScrollUI();
window.addEventListener('scroll',requestScrollUI,{passive:true});
window.addEventListener('resize',requestScrollUI,{passive:true});

if(pointerAura&&!coarsePointer&&!reducedMotion){
  let x=0,y=0,frame=0;
  const paint=()=>{
    pointerAura.style.left=`${x}px`;
    pointerAura.style.top=`${y}px`;
    frame=0;
  };
  window.addEventListener('pointermove',event=>{
    x=event.clientX;y=event.clientY;
    document.body.classList.add('pointer-active');
    if(!frame)frame=requestAnimationFrame(paint);
  },{passive:true});
  document.documentElement.addEventListener('mouseleave',()=>document.body.classList.remove('pointer-active'));
}

const clock=document.getElementById('local-time');
const timeFormatter=new Intl.DateTimeFormat('en-PH',{timeZone:'Asia/Manila',hour:'2-digit',minute:'2-digit',hour12:true});
function updateClock(){if(clock)clock.textContent=`${timeFormatter.format(new Date())} PHT`}
updateClock();
setInterval(updateClock,30000);

const revealItems=[...document.querySelectorAll('.reveal')];
if(reducedMotion||!('IntersectionObserver'in window)){
  revealItems.forEach(item=>item.classList.add('is-visible'));
}else{
  const fold=window.innerHeight*.92;
  revealItems.forEach(item=>{
    if(item.getBoundingClientRect().top<=fold)item.classList.add('is-visible');
    else item.classList.add('reveal-pending');
  });
  const revealObserver=new IntersectionObserver((entries,observer)=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  },{rootMargin:'0px 0px -7% 0px',threshold:.06});
  revealItems.filter(item=>item.classList.contains('reveal-pending')).forEach(item=>revealObserver.observe(item));
}

const sections=[...document.querySelectorAll('main section[id]')];
if('IntersectionObserver'in window&&sections.length){
  const sectionObserver=new IntersectionObserver(entries=>{
    const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(!visible)return;
    navLinks.forEach(link=>{
      const active=link.getAttribute('href')===`#${visible.target.id}`;
      active?link.setAttribute('aria-current','page'):link.removeAttribute('aria-current');
    });
  },{rootMargin:'-24% 0px -62% 0px',threshold:[.01,.15,.35]});
  sections.forEach(section=>sectionObserver.observe(section));
}

if(!coarsePointer&&!reducedMotion){
  document.querySelectorAll('[data-tilt]').forEach(card=>{
    let frame=0;
    card.addEventListener('pointermove',event=>{
      const rect=card.getBoundingClientRect();
      const px=(event.clientX-rect.left)/rect.width-.5;
      const py=(event.clientY-rect.top)/rect.height-.5;
      if(frame)cancelAnimationFrame(frame);
      frame=requestAnimationFrame(()=>{
        card.style.setProperty('--mx',`${px*8}px`);
        card.style.setProperty('--my',`${py*8}px`);
      });
    });
    card.addEventListener('pointerleave',()=>{
      card.style.setProperty('--mx','0px');
      card.style.setProperty('--my','0px');
    });
  });
}