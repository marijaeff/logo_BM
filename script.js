//firebase:)

import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

const container = document.getElementById('voteContainer');
const stats = document.getElementById('stats');
const canvas = document.getElementById('maskCanvas');
const ctx = canvas.getContext('2d');
const tooltip = document.getElementById('tooltip');
const img = new Image();
const isTouchDevice = window.matchMedia('(hover: none)').matches;
const isMobile = window.matchMedia('(max-width: 768px)').matches;
img.src = 'logo-mask.svg';
const circles = [];
let activePointerId = null;

let draggedWrapper = null;
let offsetX = 0;
let offsetY = 0;

function biasedRandom(min, max) {
  // Dodam lielāku varbūtību vidum
  const r = Math.random();
  const biased = (r + Math.random()) / 2; // vidējojam
  return min + biased * (max - min);
}

// vai tika maskā?
function isInsideMask(x, y, size) {
  const dpr = window.devicePixelRatio || 1;

  const points = [
    [x + size / 2, y + size / 2],
    [x + 5, y + 5],
    [x + size - 5, y + 5],
    [x + 5, y + size - 5],
    [x + size - 5, y + size - 5]
  ];

  return points.every(([px, py]) => {
    const pixel = ctx.getImageData(
      Math.floor(px * dpr),
      Math.floor(py * dpr),
      1,
      1
    ).data;
    return pixel[3] > 10;
  });
}

function freezeTransformToPosition(el) {
  const tr = getComputedStyle(el).transform;
  if (tr && tr !== 'none') {
    let tx = 0, ty = 0;
    if (tr.startsWith('matrix3d')) {
      const m = tr.slice(9, -1).split(',').map(parseFloat);
      tx = m[12]; ty = m[13];
    } else if (tr.startsWith('matrix')) {
      const m = tr.slice(7, -1).split(',').map(parseFloat);
      tx = m[4]; ty = m[5];
    }
    const left = parseFloat(el.style.left) || 0;
    const top = parseFloat(el.style.top) || 0;
    el.style.left = `${left + tx}px`;
    el.style.top = `${top + ty}px`;
  }

  el.style.transform = 'none';
  el.style.animation = 'none';
}

// koordināti, lai būtu iekš logo
function placeInsideMask(size) {
  let attempts = 0;

  const maxX = container.clientWidth - size;
  const maxY = container.clientHeight - size;

  while (attempts < 1000) {
    const x = biasedRandom(0, maxX);
    const y = biasedRandom(0, maxY);

    if (isInsideMask(x, y, size)) {
      return { x, y };
    }
    attempts++;
  }

  // Drošs centrs CSS koordinātēs
  return {
    x: container.clientWidth / 2 - size / 2,
    y: container.clientHeight / 2 - size / 2
  };
}


// dinamiskais izmērs
function getRandomSize(totalVotes) {
  let min, max;

  if (totalVotes < 20) {
    min = 50; max = 100;
  } else if (totalVotes < 50) {
    min = 35; max = 80;
  } else {
    min = 20; max = 50;
  }

  // Samazinām izmēru uz mobilajām ierīcēm
  const mobileScale = isMobile ? 0.7 : 1;

  min *= mobileScale;
  max *= mobileScale;

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// statistika
function updateStats() {
  const statsMap = {};

  circles.forEach(c => {
    const emotion = c.emotion;
    const color = c.style.getPropertyValue('--circle-color') || '#ccc';

    if (!statsMap[emotion]) {
      statsMap[emotion] = { count: 0, color };
    }
    statsMap[emotion].count++;
  });

  const total = circles.length;
  stats.innerHTML = Object.entries(statsMap).map(([emotion, data]) => {
    const percent = total ? Math.round((data.count / total) * 100) : 0;
    return `
      <div>
        <span style="color:${data.color}; font-size: 1.5em;">⬤</span>
        ${emotion} – ${data.count} (${percent}%)
      </div>
    `;
  }).join('') + `<hr><div><strong>Bērnu skaits:</strong> ${total}</div>`;
}

// veidojam burbuli no datiem firebase
function createBubble(vote, totalVotes) {
  const size = getRandomSize(totalVotes);
  const { x, y } = placeInsideMask(size);

  const wrapper = document.createElement('div');
  wrapper.className = 'circle-wrapper';
  wrapper.style.top = `${y}px`;
  wrapper.style.left = `${x}px`;
  wrapper.style.setProperty('--wander-delay', `${Math.random() * 8}s`);
  wrapper.style.setProperty('--wander-duration', `${35 + Math.random() * 30}s`);

  const circle = document.createElement('div');
  circle.className = 'circle-inner';
  circle.style.setProperty('--circle-size', `${size}px`);
  circle.style.setProperty('--circle-color', vote.emotionColor || '#ccc');
  circle.style.setProperty('--breathe-delay', `${Math.random() * 6}s`);
  circle.style.setProperty('--breathe-duration', `${3 + Math.random() * 4}s`);
  circle.emotion = vote.emotion || "Nezināms";
  circle.animal = vote.animal || "Dzīvnieks";


  // dzīvnieks+krāsa+tekstura
  if (vote.animal) {
    const animalEl = document.createElement('div');
    animalEl.className = 'animal-mask';

    // maska
    animalEl.style.webkitMaskImage = `url(${vote.animal})`;
    animalEl.style.maskImage = `url(${vote.animal})`;

    const baseColor = vote.color || "#f2c94c";

    if (vote.texture && vote.texture !== "none") {

      animalEl.style.backgroundImage = `url(${vote.texture}), linear-gradient(${baseColor}, ${baseColor})`;
      animalEl.style.backgroundBlendMode = "multiply";
      animalEl.style.backgroundSize = "20px, cover";
    } else {

      animalEl.style.backgroundColor = baseColor;
    }

    circle.appendChild(animalEl);
    animalEl.style.pointerEvents = 'none';

  }

  wrapper.appendChild(circle);
  container.appendChild(wrapper);
  circles.push(circle);

  // parādīšanas animācija
  const appearDelay = Math.random() * 1500;
  setTimeout(() => circle.classList.add('show'), appearDelay);


  // uzbilkšana
  circle.addEventListener('mouseenter', () => {
    tooltip.textContent = circle.emotion; // 
    const rect = circle.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.top}px`;
    tooltip.style.opacity = '1';
    tooltip.style.transform = 'translate(-50%, -120%)';
    wrapper.classList.add('paused');
  });
  circle.addEventListener('mouseleave', () => {
    tooltip.style.opacity = '0';
    wrapper.classList.remove('paused');
  });
  circle.addEventListener('mouseleave', () => {
    tooltip.style.opacity = '0';
    wrapper.classList.remove('paused');
  });
  if (tooltip) tooltip.style.pointerEvents = 'none';
  // pārvietošanas
  circle.addEventListener('mousedown', e => {
    draggedWrapper = wrapper;

    freezeTransformToPosition(wrapper);
    wrapper.classList.add('paused');


    const containerRect = container.getBoundingClientRect();
    const left = parseFloat(wrapper.style.left) || 0;
    const top = parseFloat(wrapper.style.top) || 0;
    offsetX = e.clientX - containerRect.left - left;
    offsetY = e.clientY - containerRect.top - top;

    wrapper.style.zIndex = '10';
    e.preventDefault();
  });

  circle.addEventListener('pointerdown', (e) => {
    // Tikai uz touch ierīcēm
    if (!isTouchDevice) return;

    e.stopPropagation();

    // Atzīmējam, ka tas vēl nav drag
    isDragging = false;

    // Deaktivizējam CITUS burbuļus, ne šo
    deactivateAllCircles(circle);

    // Uzreiz aktivizējam šo burbuli
    circle.classList.remove('active');
    void circle.offsetWidth; // piespiež pārzīmēšanu
    circle.classList.add('active');

    wrapper.classList.add('paused');
  });

}

function deactivateAllCircles(exceptCircle = null) {
  document.querySelectorAll('.circle-inner.active').forEach(c => {
    if (c === exceptCircle) return;

    const wrapper = c.closest('.circle-wrapper');

    // Sākam nomierināšanu
    c.classList.add('calm-down');

    setTimeout(() => {
      c.classList.remove('active');
      c.classList.remove('calm-down');
      wrapper?.classList.remove('paused');
    }, 600);
  });
}

// globālaas???
document.addEventListener('mousemove', e => {
  if (draggedWrapper) {
    const containerRect = container.getBoundingClientRect();
    const x = e.clientX - containerRect.left - offsetX;
    const y = e.clientY - containerRect.top - offsetY;
    const maxX = container.clientWidth - draggedWrapper.offsetWidth;
    const maxY = container.clientHeight - draggedWrapper.offsetHeight;
    draggedWrapper.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
    draggedWrapper.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
  }
});

document.addEventListener('mouseup', () => {
  if (!draggedWrapper) return;

  const w = draggedWrapper;
  const c = w.querySelector('.circle-inner');
  draggedWrapper = null;

  w.style.zIndex = '1';
  w.style.animationPlayState = 'paused';
  c.style.animationPlayState = 'paused';
  w.classList.add('paused');

  if (w._resumeTimer) clearTimeout(w._resumeTimer);
  w._resumeTimer = setTimeout(() => {
    w.classList.remove('paused');

    w.style.animation = '';
    w.style.animationPlayState = 'running';
    c.style.animationPlayState = 'running';
    w._resumeTimer = null;
  }, 5000); //5sek pauze
});

function resizeCanvasToContainer() {
  const rect = container.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  // Fiziskais canvas izmērs
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  // CSS izmērs
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';

  // Mērogojam kontekstu uz CSS koordinātēm
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// pieslēdzam firebase
img.onload = () => {
  resizeCanvasToContainer();

  const rect = container.getBoundingClientRect();

  ctx.clearRect(0, 0, rect.width, rect.height);
  ctx.drawImage(img, 0, 0, rect.width, rect.height);

  const votesRef = ref(db, "votes");
  onValue(votesRef, (snapshot) => {
    const data = snapshot.val();
    container.innerHTML = "";
    circles.length = 0;

    if (data) {
      const votes = Object.values(data);
      const totalVotes = votes.length;
      votes.forEach(vote => createBubble(vote, totalVotes));
    }
    updateStats();
  });
};




