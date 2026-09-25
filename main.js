import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

const mobile = window.matchMedia('(max-width: 700px)').matches;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Navigation
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
menuToggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));

// Section reveals
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('is-visible');
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// Subtle cursor light
const spot = document.querySelector('.cursor-spot');
window.addEventListener('pointermove', (event) => {
  if (!spot || mobile) return;
  spot.style.left = `${event.clientX}px`;
  spot.style.top = `${event.clientY}px`;
}, { passive: true });

// 3D electronics identity object
const container = document.getElementById('three-scene');
const fallback = document.querySelector('.scene-fallback');

if (!container || !window.WebGLRenderingContext) {
  if (fallback) fallback.style.display = 'grid';
} else {
  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.3, mobile ? 9.5 : 8.6);

    const renderer = new THREE.WebGLRenderer({
      antialias: !mobile,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.2 : 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = !mobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const C = {
      ink: 0x171717,
      paper: 0xf1eee6,
      blue: 0x2855d9,
      red: 0xf05a37,
      acid: 0xc9e65b,
      copper: 0xb97644,
      grey: 0x77736a
    };

    const matte = (color, roughness = 0.72) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.05 });
    const metal = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.72 });

    const world = new THREE.Group();
    world.rotation.set(-0.05, -0.25, -0.03);
    scene.add(world);

    // Main circuit slab
    const boardGroup = new THREE.Group();
    boardGroup.rotation.set(-0.2, 0.25, -0.11);
    world.add(boardGroup);

    const board = new THREE.Mesh(new THREE.BoxGeometry(4.35, 2.85, 0.22), matte(C.blue, 0.58));
    board.castShadow = true;
    boardGroup.add(board);

    // Board edge stripe
    const edge = new THREE.Mesh(new THREE.BoxGeometry(4.48, 0.16, 0.29), matte(C.red));
    edge.position.set(0, -1.37, 0.03);
    boardGroup.add(edge);

    // Large processor
    const chip = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.12, 0.28), metal(C.ink));
    chip.position.set(0.22, 0.05, 0.2);
    chip.castShadow = true;
    boardGroup.add(chip);

    const chipTop = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.66, 0.04), matte(C.acid));
    chipTop.position.set(0.22, 0.05, 0.365);
    boardGroup.add(chipTop);

    // Processor pins
    const pinMat = metal(C.copper);
    const pinCount = mobile ? 9 : 14;
    for (let i = 0; i < pinCount; i++) {
      const y = -0.48 + i * (0.96 / Math.max(pinCount - 1, 1));
      [-0.76, 0.76].forEach((x) => {
        const pin = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.035, 0.035), pinMat);
        pin.position.set(0.22 + x, y + 0.05, 0.34);
        boardGroup.add(pin);
      });
    }

    // Small modules
    const modules = [
      [-1.45, 0.75, 0.52, 0.33, C.acid],
      [-1.35, -0.15, 0.72, 0.22, C.ink],
      [-1.55, -0.78, 0.42, 0.42, C.red],
      [1.45, 0.78, 0.62, 0.28, C.paper],
      [1.58, 0.12, 0.38, 0.62, C.ink],
      [1.34, -0.72, 0.75, 0.25, C.acid]
    ];
    modules.forEach(([x, y, w, h, color]) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.12), matte(color));
      m.position.set(x, y, 0.22);
      boardGroup.add(m);
    });

    // Circuit traces
    const traceMat = new THREE.LineBasicMaterial({ color: C.paper, transparent: true, opacity: 0.62 });
    const traceSets = [
      [[-1.9,1.05],[-.85,1.05],[-.85,.55],[-.25,.55]],
      [[1.95,-1.0],[1.0,-1.0],[1.0,-.5],[.72,-.5]],
      [[-1.95,-.38],[-.75,-.38],[-.75,-.7],[-.2,-.7]],
      [[1.88,.43],[1.12,.43],[1.12,.12],[.86,.12]]
    ];
    traceSets.forEach((points) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(points.map(([x,y]) => new THREE.Vector3(x,y,.36)));
      boardGroup.add(new THREE.Line(geometry, traceMat));
    });

    // Cable looping around the board
    const cableCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.8, 1.7, -0.7),
      new THREE.Vector3(-3.25, 0.4, 0.5),
      new THREE.Vector3(-2.65, -1.8, 0.8),
      new THREE.Vector3(-0.4, -2.5, -0.4),
      new THREE.Vector3(2.35, -2.0, -0.8),
      new THREE.Vector3(3.05, -0.4, 0.55),
      new THREE.Vector3(2.65, 1.3, 0.85)
    ]);
    const cable = new THREE.Mesh(
      new THREE.TubeGeometry(cableCurve, mobile ? 70 : 110, 0.085, 10, false),
      matte(C.ink, 0.6)
    );
    cable.castShadow = true;
    world.add(cable);

    // Connector head
    const connector = new THREE.Group();
    connector.position.set(2.72, 1.35, 0.84);
    connector.rotation.z = -0.6;
    world.add(connector);
    const plugBody = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.38, 0.28), matte(C.red));
    connector.add(plugBody);
    const plugTip = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.19), metal(C.ink));
    plugTip.position.x = 0.45;
    connector.add(plugTip);

    // Floating orb and rings â motion anchor
    const signal = new THREE.Group();
    signal.position.set(-2.2, 1.45, 1.0);
    world.add(signal);
    const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34, 1), metal(C.ink));
    signal.add(orb);
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.035, 8, 48), matte(C.acid));
    ring1.rotation.x = 1.15;
    signal.add(ring1);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.027, 8, 48), matte(C.red));
    ring2.rotation.y = 0.95;
    signal.add(ring2);

    // Floating labels / paper chips
    const floaters = [];
    const labelCount = mobile ? 3 : 5;
    for (let i = 0; i < labelCount; i++) {
      const g = new THREE.Group();
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.7 + (i % 2) * .22, 0.38, 0.045), matte(i % 2 ? C.paper : C.acid));
      g.add(plate);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), matte(C.red));
      dot.position.set(-0.24, 0, 0.05);
      g.add(dot);
      g.position.set(-2.8 + i * 1.35, 2.0 - (i % 2) * .45, -1.0 + (i % 3) * .35);
      g.rotation.set(.1 * i, -.12 * i, -.12 + .05 * i);
      world.add(g);
      floaters.push(g);
    }

    // Lighting
    scene.add(new THREE.HemisphereLight(0xfffaf0, 0x6d6d78, 2.4));
    const key = new THREE.DirectionalLight(0xffffff, 3.4);
    key.position.set(4, 7, 7);
    key.castShadow = !mobile;
    scene.add(key);
    const blueLight = new THREE.PointLight(C.blue, 7, 10, 2);
    blueLight.position.set(-4, 2.5, 4);
    scene.add(blueLight);
    const redLight = new THREE.PointLight(C.red, 5, 10, 2);
    redLight.position.set(4, -2, 3);
    scene.add(redLight);

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let scrollRatio = 0;
    let visible = true;

    const setPointer = (x, y) => {
      target.x = (x / innerWidth - .5) * 2;
      target.y = (y / innerHeight - .5) * 2;
    };
    window.addEventListener('pointermove', (e) => setPointer(e.clientX, e.clientY), { passive: true });
    window.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      if (t) setPointer(t.clientX, t.clientY);
    }, { passive: true });

    const updateScroll = () => {
      const hero = document.querySelector('.hero');
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      scrollRatio = THREE.MathUtils.clamp(-rect.top / Math.max(rect.height, 1), 0, 1.1);
    };
    updateScroll();
    addEventListener('scroll', updateScroll, { passive: true });

    new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? true;
    }, { threshold: 0.01 }).observe(container);

    function resize() {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    addEventListener('resize', resize, { passive: true });
    resize();

    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      if (!visible && !reducedMotion) return;

      const t = clock.getElapsedTime();
      current.x += (target.x - current.x) * (mobile ? .035 : .055);
      current.y += (target.y - current.y) * (mobile ? .035 : .055);

      if (!reducedMotion) {
        world.rotation.y = -.25 + current.x * .17 + scrollRatio * .2;
        world.rotation.x = -.05 - current.y * .08 + scrollRatio * .04;
        world.position.y = Math.sin(t * .65) * .055 - scrollRatio * .15;
        boardGroup.rotation.z = -.11 + Math.sin(t * .5) * .025;
        signal.rotation.y = t * .8;
        ring1.rotation.z = t * .55;
        ring2.rotation.x = t * .42;
        orb.rotation.x = t * .9;
        orb.rotation.y = t * 1.1;
        floaters.forEach((floater, i) => {
          floater.position.y += Math.sin(t * .75 + i) * .0009;
          floater.rotation.z += (i % 2 ? 1 : -1) * .00045;
        });
      }

      camera.position.x = current.x * (mobile ? .3 : .5);
      camera.position.y = .3 - current.y * .16 + scrollRatio * .18;
      camera.lookAt(0, -0.1, 0);
      renderer.render(scene, camera);
    }
    animate();
  } catch (error) {
    console.warn('3D fallback activated:', error);
    if (fallback) fallback.style.display = 'grid';
  }
}
