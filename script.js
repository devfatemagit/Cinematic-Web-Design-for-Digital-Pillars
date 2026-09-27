/* THREE.JS CINEMATIC BACKGROUND SYSTEM */
let scene, camera, renderer, coreMonolith, particles;
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

function initThree() {
  const container = document.getElementById('canvas-container');
  
  // Scene
  scene = new THREE.Scene();
  
  // Camera
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 15;

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // 3D Central Core Monolith / Sphere Structure
  const geometry = new THREE.IcosahedronGeometry(4, 2);
  const material = new THREE.MeshStandardMaterial({
    color: 0x00f2fe,
    wireframe: true,
    transparent: true,
    opacity: 0.35,
    roughness: 0.2,
    metalness: 0.8
  });
  
  coreMonolith = new THREE.Mesh(geometry, material);
  scene.add(coreMonolith);

  // Inner Glowing Core
  const innerGeo = new THREE.IcosahedronGeometry(2, 1);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x4facfe,
    wireframe: true,
    transparent: true,
    opacity: 0.6
  });
  const innerCore = new THREE.Mesh(innerGeo, innerMat);
  coreMonolith.add(innerCore);

  // Orbiting Light Rings
  const ringGeo = new THREE.TorusGeometry(6, 0.02, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.4 });
  const ring1 = new THREE.Mesh(ringGeo, ringMat);
  ring1.rotation.x = Math.PI / 3;
  scene.add(ring1);

  // Atmospheric Particle Field
  const particleGeo = new THREE.BufferGeometry();
  const particleCount = 700;
  const posArray = new Float32Array(particleCount * 3);

  for(let i = 0; i < particleCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 40;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const particleMat = new THREE.PointsMaterial({
    size: 0.04,
    color: 0x00f2fe,
    transparent: true,
    opacity: 0.5
  });

  particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0x00f2fe, 2, 50);
  pointLight.position.set(10, 10, 10);
  scene.add(pointLight);

  // Mouse Listener (Only on compatible devices)
  if (window.matchMedia("(pointer: fine)").matches) {
    document.addEventListener('mousemove', onDocumentMouseMove);
  }

  window.addEventListener('resize', onWindowResize);
  animate();
}

function onDocumentMouseMove(event) {
  mouseX = (event.clientX - windowHalfX) * 0.001;
  mouseY = (event.clientY - windowHalfY) * 0.001;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  targetX += (mouseX - targetX) * 0.05;
  targetY += (mouseY - targetY) * 0.05;

  if (coreMonolith) {
    coreMonolith.rotation.y += 0.003;
    coreMonolith.rotation.x += 0.002;
    coreMonolith.rotation.z = targetX * 0.5;
    coreMonolith.position.x = targetX * 2;
    coreMonolith.position.y = -targetY * 2;
  }

  if (particles) {
    particles.rotation.y -= 0.0005;
  }

  renderer.render(scene, camera);
}

/* CUSTOM CURSOR FOLLOWER LOGIC */
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');

if (window.matchMedia("(pointer: fine)").matches) {
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    follower.style.left = e.clientX + 'px';
    follower.style.top = e.clientY + 'px';
  });
}

/* COUNTER ANIMATIONS */
function animateCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  counters.forEach(counter => {
    const target = parseFloat(counter.getAttribute('data-counter'));
    const duration = 2000;
    const stepTime = 20;
    const steps = duration / stepTime;
    const inc = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += inc;
      if (current >= target) {
        counter.textContent = Number.isInteger(target) ? target.toLocaleString() : target.toFixed(1);
        clearInterval(timer);
      } else {
        counter.textContent = Number.isInteger(target) ? Math.floor(current).toLocaleString() : current.toFixed(1);
      }
    }, stepTime);
  });
}

/* PERFORMANCE CANVAS GRAPH */
function drawPerformanceChart(dataPoints) {
  const canvas = document.getElementById('performanceChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  
  canvas.width = canvas.parentElement.clientWidth * dpr;
  canvas.height = canvas.parentElement.clientHeight * dpr;
  ctx.scale(dpr, dpr);

  const width = canvas.parentElement.clientWidth;
  const height = canvas.parentElement.clientHeight;

  ctx.clearRect(0, 0, width, height);

  // Gradient fill
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, 'rgba(0, 242, 254, 0.25)');
  gradient.addColorStop(1, 'rgba(0, 242, 254, 0)');

  ctx.beginPath();
  const step = width / (dataPoints.length - 1);
  
  ctx.moveTo(0, height - (dataPoints[0] / 100) * height);
  for (let i = 1; i < dataPoints.length; i++) {
    const x = i * step;
    const y = height - (dataPoints[i] / 100) * height;
    ctx.lineTo(x, y);
  }

  ctx.strokeStyle = '#00f2fe';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.fillStyle = gradient;
  ctx.fill();
}

const chartDataMap = {
  '7d': [30, 45, 60, 50, 75, 80, 95],
  '30d': [20, 35, 40, 55, 70, 65, 85, 90, 100],
  '90d': [15, 25, 40, 35, 60, 75, 70, 85, 95, 110]
};

const chartMetricMap = {
  '7d': { spend: '$10,200', rev: '$54,100', roas: '5.30x', cpl: '$14.10' },
  '30d': { spend: '$42,150', rev: '$227,610', roas: '5.40x', cpl: '$12.40' },
  '90d': { spend: '$128,000', rev: '$742,400', roas: '5.80x', cpl: '$11.20' }
};

document.querySelectorAll('.time-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    
    const range = e.target.getAttribute('data-range');
    drawPerformanceChart(chartDataMap[range]);
    
    document.getElementById('dashSpend').textContent = chartMetricMap[range].spend;
    document.getElementById('dashRev').textContent = chartMetricMap[range].rev;
    document.getElementById('dashRoas').textContent = chartMetricMap[range].roas;
    document.getElementById('dashCpl').textContent = chartMetricMap[range].cpl;
  });
});

/* DYNAMIC SERVICE MODALS */
const serviceData = {
  'paid-media': {
    title: 'Paid Media & Performance Scale',
    desc: 'Our paid media infrastructure is built on rapid algorithmic creative testing, quantitative audience segmentation, and multi-channel attribution modeling.',
    deliverables: [
      'Meta, Google & TikTok Paid Engine Deployment',
      'High-Velocity Ad Creative Production & Testing',
      'Custom Multi-Touch Attribution Setup',
      'Real-time Performance Reporting Dashboard'
    ]
  },
  'social-growth': {
    title: 'Social Media Growth Architecture',
    desc: 'We transform brand presence into a predictable monetization engine through high-converting short-form video, organic audience acquisition, and active community management.',
    deliverables: [
      'Omnichannel Content Strategy & Scripting',
      'Short-Form Video Production (Reels/TikTok/Shorts)',
      'Community Orchestration & Brand Advocacy',
      'Growth Analytics & Audience Insights'
    ]
  },
  'web-dev': {
    title: 'Cinematic Web Design & Engineering',
    desc: 'We design sub-second 3D interactive web experiences that communicate absolute market authority and eliminate friction from the buying process.',
    deliverables: [
      'Custom Three.js 3D Interactive Design',
      'Headless CMS & Scalable Tech Architecture',
      'Conversion Rate Optimization (CRO) Framework',
      '90+ Target Lighthouse Speed Engineering'
    ]
  },
  'strategy': {
    title: 'Digital Growth Strategy & Consulting',
    desc: 'Before scaling spend, we perform deep forensic audits on your acquisition funnels, tech stack, and unit economics to chart out an aggressive growth roadmap.',
    deliverables: [
      'Full-Funnel CRO & Friction Audit',
      'Unit Economic & LTV Modeling',
      'Marketing Tech Stack Optimization',
      'Executive Growth Playbook'
    ]
  }
};

function openServiceModal(serviceKey) {
  const data = serviceData[serviceKey];
  if (!data) return;

  const content = `
    <span class="section-subtitle">DETAILED CAPABILITY</span>
    <h2 class="section-title" style="text-align: left; margin-bottom: 16px;">${data.title}</h2>
    <p style="color: var(--text-secondary); margin-bottom: 24px;">${data.desc}</p>
    <h4 style="margin-bottom: 12px; color: var(--accent-cyan);">Core System Deliverables:</h4>
    <ul style="list-style: none; padding: 0; margin-bottom: 32px;">
      ${data.deliverables.map(d => `<li style="padding: 8px 0; border-bottom: 1px solid var(--border-glass); display: flex; align-items: center; gap: 10px; font-size: 0.9rem;"><i class="fa-solid fa-check" style="color: var(--accent-cyan);"></i> ${d}</li>`).join('')}
    </ul>
    <a href="#contact" onclick="closeServiceModal()" class="btn btn-primary btn-full">Initiate Strategic Audit</a>
  `;

  document.getElementById('modalContent').innerHTML = content;
  document.getElementById('serviceModal').classList.add('active');
}

function closeServiceModal(e) {
  document.getElementById('serviceModal').classList.remove('active');
}

/* TESTIMONIAL SLIDER */
let currentSlide = 0;
const track = document.getElementById('testimonialTrack');
const dotsContainer = document.getElementById('sliderDots');
const slidesCount = 3;

function initSlider() {
  for (let i = 0; i < slidesCount; i++) {
    const dot = document.createElement('div');
    dot.className = `dot ${i === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }
}

function goToSlide(index) {
  currentSlide = index;
  track.style.transform = `translateX(-${index * 100}%)`;
  document.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === index);
  });
}

document.getElementById('nextTestimonial').addEventListener('click', () => {
  currentSlide = (currentSlide + 1) % slidesCount;
  goToSlide(currentSlide);
});

document.getElementById('prevTestimonial').addEventListener('click', () => {
  currentSlide = (currentSlide - 1 + slidesCount) % slidesCount;
  goToSlide(currentSlide);
});

/* DISCREET AI FAQ ASSISTANT */
const faqAnswers = [
  "We provide four core capabilities: Performance Paid Media, Social Media Growth, Cinematic 3D Web Engineering, and Growth Strategy Consulting.",
  "Standard technical design and campaign audits take 2-3 weeks. Full 3D web applications are deployed within 4-6 weeks.",
  "We partner with growth-stage businesses generating at least $20k+/mo, or venture-backed startups looking for aggressive acquisition scale.",
  "We run quantitative creative testing, daily automated ROAS monitoring, and real-time bid adjustments across Meta, Google, and TikTok.",
  "Fill out the audit form on this site. Our strategy lead will review your funnel and deliver a 48-hour diagnostic roadmap."
];

function toggleFaqAssistant() {
  document.querySelector('.faq-assistant-widget').classList.toggle('active');
}

function askFaq(index) {
  const chatBody = document.getElementById('faqChatBody');
  const questions = [
    "What services do you offer?",
    "What's your typical turnaround?",
    "Do you work with early startups?",
    "How do you manage ad campaigns?",
    "How do we get started?"
  ];

  // Append user message
  const userMsg = document.createElement('div');
  userMsg.className = 'faq-msg user';
  userMsg.textContent = questions[index];
  chatBody.appendChild(userMsg);

  // Append bot response
  setTimeout(() => {
    const botMsg = document.createElement('div');
    botMsg.className = 'faq-msg bot';
    botMsg.textContent = faqAnswers[index];
    chatBody.appendChild(botMsg);
    chatBody.scrollTop = chatBody.scrollHeight;
  }, 300);
}

/* FORM SUBMISSION */
function handleFormSubmit(e) {
  e.preventDefault();
  document.getElementById('contactForm').style.display = 'none';
  document.getElementById('formSuccess').classList.remove('hidden');
}

/* NAVBAR SCROLL & MOBILE TOGGLE */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (window.scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

document.getElementById('mobileToggle').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});

/* INIT ON DOM LOAD */
document.addEventListener('DOMContentLoaded', () => {
  initThree();
  animateCounters();
  drawPerformanceChart(chartDataMap['30d']);
  initSlider();
});