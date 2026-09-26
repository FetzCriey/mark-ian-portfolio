document.documentElement.classList.add('js');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
const railLinks = [...document.querySelectorAll('.section-rail a[href^="#"]')];
const progress = document.querySelector('.progress i');
const cursorCross = document.querySelector('.cursor-cross');


/* ─────────────────────────────────────────────────────────────
   INTERACTIVE 3D ANIME PORTRAIT / IMAGE-DERIVED DEPTH MESH
   Pointer reacts without click. Scroll adds depth + rotation.
   ───────────────────────────────────────────────────────────── */
(async function initPortraitDepthMesh(){
  const hero=document.querySelector('.hero-portrait');
  const shell=document.getElementById('portrait-shell');
  const stage=document.getElementById('portrait-stage');
  const canvas=document.getElementById('portrait-canvas');
  const fallback=document.getElementById('portrait-fallback');
  const loading=document.getElementById('portrait-loading');

  if(!hero||!shell||!stage||!canvas||!fallback) return;

  const portraitUrl='/assets/markian-anime.webp';

  const state={
    pointerX:0,
    pointerY:0,
    scroll:0,
    currentX:0,
    currentY:0,
    currentScroll:0,
    visible:true
  };

  const clamp=(n,min,max)=>Math.min(Math.max(n,min),max);

  function loadImage(url){
    return new Promise((resolve,reject)=>{
      const image=new Image();
      image.decoding='async';
      image.onload=()=>resolve(image);
      image.onerror=()=>reject(new Error('Image decode failed'));
      image.src=url;
    });
  }

  try{
    fallback.src=portraitUrl;
    await fallback.decode().catch(()=>{});
    stage.classList.add('is-fallback');

    const forceMotion=new URLSearchParams(window.location.search).has('motion');
    if(reducedMotion&&!forceMotion){
      loading?.classList.add('is-done');
      stage.dataset.renderMode='reduced-motion-fallback';
      return;
    }


    const [portraitImage,THREE]=await Promise.all([
      loadImage(portraitUrl),
      import('https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js')
    ]);

    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(26,1,.1,100);
    camera.position.set(0,.05,14.7);

    const renderer=new THREE.WebGLRenderer({
      canvas,
      alpha:true,
      antialias:!coarsePointer,
      powerPreference:'high-performance',
      failIfMajorPerformanceCaveat:false
    });
    renderer.setClearColor(0x000000,0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,coarsePointer?1.35:1.8));
    renderer.outputColorSpace=THREE.SRGBColorSpace;

    const sampleCanvas=document.createElement('canvas');
    sampleCanvas.width=portraitImage.naturalWidth;
    sampleCanvas.height=portraitImage.naturalHeight;
    const sampleContext=sampleCanvas.getContext('2d',{willReadFrequently:true});
    sampleContext.drawImage(portraitImage,0,0);
    const sampleData=sampleContext.getImageData(0,0,sampleCanvas.width,sampleCanvas.height).data;

    const aspect=portraitImage.naturalWidth/portraitImage.naturalHeight;
    const planeHeight=6.35;
    const planeWidth=planeHeight*aspect;
    const segmentsX=coarsePointer?28:44;
    const segmentsY=coarsePointer?66:104;
    const geometry=new THREE.PlaneGeometry(planeWidth,planeHeight,segmentsX,segmentsY);

    const positions=geometry.attributes.position;
    const uvs=geometry.attributes.uv;

    for(let i=0;i<positions.count;i++){
      const u=clamp(uvs.getX(i),0,1);
      const v=clamp(uvs.getY(i),0,1);
      const px=Math.min(sampleCanvas.width-1,Math.round(u*(sampleCanvas.width-1)));
      const py=Math.min(sampleCanvas.height-1,Math.round((1-v)*(sampleCanvas.height-1)));
      const index=(py*sampleCanvas.width+px)*4;
      const alpha=sampleData[index+3]/255;
      const luminance=(sampleData[index]*.2126+sampleData[index+1]*.7152+sampleData[index+2]*.0722)/255;
      const dx=(u-.5)*2;
      const dy=(v-.52)*2;
      const radial=Math.max(0,1-Math.sqrt(dx*dx+dy*dy)*.66);
      const depth=alpha*(.22+radial*.68+luminance*.10);
      positions.setZ(i,depth*.72);
    }
    positions.needsUpdate=true;
    geometry.computeVertexNormals();

    const portraitTexture=new THREE.Texture(portraitImage);
    portraitTexture.colorSpace=THREE.SRGBColorSpace;
    portraitTexture.needsUpdate=true;
    portraitTexture.minFilter=THREE.LinearFilter;
    portraitTexture.magFilter=THREE.LinearFilter;

    const portraitMaterial=new THREE.MeshBasicMaterial({
      map:portraitTexture,
      transparent:true,
      alphaTest:.035,
      side:THREE.DoubleSide,
      depthWrite:true
    });

    const glowMaterial=new THREE.ShaderMaterial({
      uniforms:{
        uMap:{value:portraitTexture},
        uColor:{value:new THREE.Color(0xff6d2d)}
      },
      vertexShader:`
        varying vec2 vUv;
        void main(){
          vUv=uv;
          gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
        }
      `,
      fragmentShader:`
        uniform sampler2D uMap;
        uniform vec3 uColor;
        varying vec2 vUv;
        void main(){
          float a=texture2D(uMap,vUv).a;
          if(a<0.025) discard;
          gl_FragColor=vec4(uColor,a*0.14);
        }
      `,
      transparent:true,
      depthWrite:false,
      blending:THREE.AdditiveBlending
    });

    const group=new THREE.Group();
    scene.add(group);

    const glowMesh=new THREE.Mesh(geometry.clone(),glowMaterial);
    glowMesh.scale.setScalar(1.035);
    glowMesh.position.z=-.12;
    group.add(glowMesh);

    const portraitMesh=new THREE.Mesh(geometry,portraitMaterial);
    group.add(portraitMesh);

    const ringMaterial=new THREE.MeshBasicMaterial({
      color:0xff6d2d,
      transparent:true,
      opacity:.13,
      side:THREE.DoubleSide,
      depthWrite:false
    });

    const ringA=new THREE.Mesh(new THREE.TorusGeometry(2.0,.008,6,120),ringMaterial);
    ringA.position.z=-.38;
    ringA.rotation.x=.18;
    ringA.rotation.y=.12;
    group.add(ringA);

    const ringB=new THREE.Mesh(
      new THREE.TorusGeometry(2.55,.006,6,120),
      ringMaterial.clone()
    );
    ringB.material.opacity=.07;
    ringB.position.z=-.48;
    ringB.rotation.x=-.11;
    ringB.rotation.y=-.18;
    group.add(ringB);

    group.position.y=-.06;

    function resize(){
      const rect=stage.getBoundingClientRect();
      const width=Math.max(1,rect.width);
      const height=Math.max(1,rect.height);
      renderer.setSize(width,height,false);
      camera.aspect=width/height;
      camera.updateProjectionMatrix();

      const mobile=width<520;
      const portraitScale=mobile?1.07:1.12;
      group.scale.setScalar(portraitScale);
    }

    let resizeFrame=0;
    const requestResize=()=>{
      if(resizeFrame) return;
      resizeFrame=requestAnimationFrame(()=>{
        resizeFrame=0;
        resize();
      });
    };
    resize();
    window.addEventListener('resize',requestResize,{passive:true});

    const updatePointer=(clientX,clientY)=>{
      const rect=hero.getBoundingClientRect();
      if(rect.bottom<0||rect.top>window.innerHeight) return;
      state.pointerX=clamp((clientX/window.innerWidth-.5)*2,-1,1);
      state.pointerY=clamp((clientY/window.innerHeight-.5)*2,-1,1);
      hero.style.setProperty('--hero-x',`${state.pointerX*16}px`);
      hero.style.setProperty('--hero-y',`${state.pointerY*8}px`);
    };

    window.addEventListener('pointermove',(event)=>{
      updatePointer(event.clientX,event.clientY);
    },{passive:true});

    window.addEventListener('touchmove',(event)=>{
      const touch=event.touches[0];
      if(touch) updatePointer(touch.clientX,touch.clientY);
    },{passive:true});

    function updateScroll(){
      const rect=hero.getBoundingClientRect();
      const travel=Math.max(hero.offsetHeight*.82,1);
      state.scroll=clamp(-rect.top/travel,0,1);
      hero.style.setProperty('--hero-scroll',`${state.scroll*-34}px`);
    }
    updateScroll();
    window.addEventListener('scroll',updateScroll,{passive:true});

    if('IntersectionObserver' in window){
      new IntersectionObserver((entries)=>{
        state.visible=entries[0]?.isIntersecting??true;
      },{threshold:.01}).observe(stage);
    }

    const rxReadout=document.querySelector('[data-readout="rx"]');
    const ryReadout=document.querySelector('[data-readout="ry"]');
    const scrollReadout=document.querySelector('[data-readout="scroll"]');
    const clock3d=new THREE.Clock();
    let animationFrame=0;

    function animate(){
      animationFrame=requestAnimationFrame(animate);
      if(!state.visible) return;

      const elapsed=clock3d.getElapsedTime();

      state.currentX+=(state.pointerX-state.currentX)*.055;
      state.currentY+=(state.pointerY-state.currentY)*.055;
      state.currentScroll+=(state.scroll-state.currentScroll)*.06;

      const idleX=Math.sin(elapsed*.55)*.012;
      const idleY=Math.cos(elapsed*.42)*.014;

      group.rotation.y=state.currentX*.26+state.currentScroll*.11+idleX;
      group.rotation.x=-state.currentY*.10+idleY-state.currentScroll*.045;
      group.rotation.z=state.currentX*.024+state.currentScroll*.07;
      group.position.x=state.currentX*.22;
      group.position.y=-.06-state.currentY*.10-state.currentScroll*.42+Math.sin(elapsed*.7)*.022;
      group.position.z=state.currentScroll*.46;

      ringA.rotation.z=elapsed*.055+state.currentX*.08;
      ringB.rotation.z=-elapsed*.04-state.currentX*.05;
      ringA.rotation.x=.18+state.currentY*.04;
      ringB.rotation.y=-.18+state.currentX*.055;

      camera.position.x=state.currentX*.14;
      camera.position.y=.05-state.currentY*.06+state.currentScroll*.08;
      camera.lookAt(0,-.02,0);

      renderer.render(scene,camera);

      const rx=THREE.MathUtils.radToDeg(group.rotation.x);
      const ry=THREE.MathUtils.radToDeg(group.rotation.y);
      if(rxReadout) rxReadout.textContent=`${rx>=0?'+':''}${rx.toFixed(1)}°`;
      if(ryReadout) ryReadout.textContent=`${ry>=0?'+':''}${ry.toFixed(1)}°`;
      if(scrollReadout) scrollReadout.textContent=String(Math.round(state.currentScroll*100)).padStart(3,'0');
    }

    stage.classList.remove('is-fallback');
    stage.classList.add('is-webgl');
    stage.dataset.renderMode='webgl-depth-mesh';
    loading?.classList.add('is-done');
    animate();

    window.addEventListener('pagehide',()=>{
      cancelAnimationFrame(animationFrame);
      renderer.dispose();
      geometry.dispose();
      portraitMaterial.dispose();
      glowMaterial.dispose();
      ringA.geometry.dispose();
      ringA.material.dispose();
      ringB.geometry.dispose();
      ringB.material.dispose();
      portraitTexture.dispose();
    },{once:true});

  }catch(error){
    console.warn('Interactive portrait fallback:',error);
    stage.classList.add('is-fallback');
    stage.dataset.renderMode=`fallback:${error?.message||'unknown'}`;
    loading?.classList.add('is-done');

    window.addEventListener('pointermove',(event)=>{
      const x=clamp((event.clientX/window.innerWidth-.5)*2,-1,1);
      const y=clamp((event.clientY/window.innerHeight-.5)*2,-1,1);
      hero.style.setProperty('--hero-x',`${x*10}px`);
      hero.style.setProperty('--hero-y',`${y*6}px`);
      hero.style.setProperty('--portrait-ry',String(x*4));
    },{passive:true});
  }
})();
