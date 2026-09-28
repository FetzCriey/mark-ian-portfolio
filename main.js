document.documentElement.classList.add('js');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

const header = document.querySelector('.site-header');
const nav = document.querySelector('.site-nav');
const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
const railLinks = [...document.querySelectorAll('.section-rail a[href^="#"]')];
const progress = document.querySelector('.progress i');
const cursorCross = document.querySelector('.cursor-cross');


/* Navigation, progress, and reveal effects. */
(function initInterface(){
  const allSectionLinks=[...navLinks,...railLinks];
  const sections=[...document.querySelectorAll('main section[id]')];
  const clock=document.getElementById('local-time');

  let scrollFrame=0;
  const updateScrollUI=()=>{
    const y=window.scrollY;
    header?.classList.toggle('scrolled',y>18);
    if(progress){
      const max=Math.max(document.documentElement.scrollHeight-window.innerHeight,1);
      progress.style.transform=`scaleX(${Math.min(Math.max(y/max,0),1)})`;
    }
    scrollFrame=0;
  };
  const requestScrollUI=()=>{
    if(!scrollFrame) scrollFrame=requestAnimationFrame(updateScrollUI);
  };
  updateScrollUI();
  window.addEventListener('scroll',requestScrollUI,{passive:true});
  window.addEventListener('resize',requestScrollUI,{passive:true});

  if(cursorCross&&!coarsePointer&&!reducedMotion){
    let x=0;
    let y=0;
    let frame=0;
    const paint=()=>{
      cursorCross.style.left=`${x}px`;
      cursorCross.style.top=`${y}px`;
      frame=0;
    };
    window.addEventListener('pointermove',event=>{
      x=event.clientX;
      y=event.clientY;
      document.body.classList.add('pointer-active');
      if(!frame) frame=requestAnimationFrame(paint);
    },{passive:true});
    document.documentElement.addEventListener('mouseleave',()=>{
      document.body.classList.remove('pointer-active');
    });
  }

  if(clock){
    const formatter=new Intl.DateTimeFormat('en-PH',{
      timeZone:'Asia/Manila',
      hour:'2-digit',
      minute:'2-digit',
      hour12:true
    });
    const updateClock=()=>{clock.textContent=`${formatter.format(new Date())} PHT`;};
    updateClock();
    setInterval(updateClock,30000);
  }

  const revealItems=[...document.querySelectorAll('.reveal')];
  if(reducedMotion||!('IntersectionObserver' in window)){
    revealItems.forEach(item=>item.classList.add('is-visible'));
  }else{
    const fold=window.innerHeight*.92;
    revealItems.forEach(item=>{
      if(item.getBoundingClientRect().top<=fold) item.classList.add('is-visible');
      else item.classList.add('reveal-pending');
    });

    const revealObserver=new IntersectionObserver((entries,observer)=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },{rootMargin:'0px 0px -7% 0px',threshold:.06});

    revealItems
      .filter(item=>item.classList.contains('reveal-pending'))
      .forEach(item=>revealObserver.observe(item));
  }

  const setCurrent=id=>{
    allSectionLinks.forEach(link=>{
      const active=link.getAttribute('href')===`#${id}`;
      if(active) link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    });
  };

  if('IntersectionObserver' in window&&sections.length){
    const sectionObserver=new IntersectionObserver(entries=>{
      const visible=entries
        .filter(entry=>entry.isIntersecting)
        .sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(visible) setCurrent(visible.target.id);
    },{rootMargin:'-22% 0px -64% 0px',threshold:[.01,.12,.35]});

    sections.forEach(section=>sectionObserver.observe(section));
  }else if(sections[0]){
    setCurrent(sections[0].id);
  }
})();


/* Lightweight scroll-linked 3D scenes for Experience.
   Uses transforms only, runs through requestAnimationFrame, and is disabled
   when the user requests reduced motion. */
(function initExperienceScenes(){
  const rows=[...document.querySelectorAll('.experience-3d')];
  if(!rows.length) return;

  if(reducedMotion){
    rows.forEach(row=>row.classList.add('is-scene-active'));
    return;
  }

  let frame=0;
  const paint=()=>{
    const viewport=window.innerHeight||1;
    rows.forEach((row,index)=>{
      const rect=row.getBoundingClientRect();
      const center=rect.top+rect.height/2;
      const normalized=Math.max(-1,Math.min(1,(center-viewport/2)/(viewport*.72)));
      const object=row.querySelector('.experience-object');
      if(!object) return;
      const direction=index%2===0?1:-1;
      const ry=26+(normalized*42*direction);
      const rx=-16+(normalized*16);
      const rz=-4+(normalized*7*direction);
      object.style.setProperty('--rx',rx.toFixed(2)+'deg');
      object.style.setProperty('--ry',ry.toFixed(2)+'deg');
      object.style.setProperty('--rz',rz.toFixed(2)+'deg');
      row.classList.toggle('is-scene-active',Math.abs(normalized)<.72);
    });
    frame=0;
  };
  const requestPaint=()=>{if(!frame) frame=requestAnimationFrame(paint);};
  paint();
  window.addEventListener('scroll',requestPaint,{passive:true});
  window.addEventListener('resize',requestPaint,{passive:true});
})();
