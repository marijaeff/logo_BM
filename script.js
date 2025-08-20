
const voteCount = 40;
const palette = [
  { color: '#FF6F91', emotion: 'Skumji' },
  { color: '#FFB347', emotion: 'Noguris' },
  { color: '#FDFD96', emotion: 'Neitrāli' },
  { color: '#77DD77', emotion: 'Priecīgs' },
  { color: '#779ECB', emotion: 'Ļoti priecīgs' }
];

const container = document.getElementById('voteContainer');
const stats = document.getElementById('stats');
const canvas = document.getElementById('maskCanvas');
const ctx = canvas.getContext('2d');
const tooltip = document.getElementById('tooltip');
const img = new Image();
img.src = 'logo-mask.svg';
const circles = [];
// const heartSound = new Audio('heartbeat.mp3');
// heartSound.loop = true;

function freezeTransformToPosition(el) {
  const cs = window.getComputedStyle(el);
  const tr = cs.transform;
  if (!tr || tr === 'none') return;

  let tx = 0, ty = 0;
  if (tr.startsWith('matrix3d')) {
    const m = tr.slice(9, -1).split(',').map(parseFloat);
    tx = m[12]; ty = m[13];
  } else if (tr.startsWith('matrix')) {
    const m = tr.slice(7, -1).split(',').map(parseFloat);
    tx = m[4]; ty = m[5];
  }

  const left = parseFloat(el.style.left) || 0;
  const top  = parseFloat(el.style.top)  || 0;
  el.style.left = `${left + tx}px`;
  el.style.top  = `${top  + ty}px`;

  el.style.transform = 'none';
  el.style.animation = 'none';
}


function isInsideMask(x, y, size) {
  const points = [
    [x + size / 2, y + size / 2], 
    [x + 5, y + 5],              
    [x + size - 5, y + 5],        
    [x + 5, y + size - 5],        
    [x + size - 5, y + size - 5]  
  ];

  return points.every(([px, py]) => {
    const pixel = ctx.getImageData(px, py, 1, 1).data;
    return pixel[3] > 10;
  });
}

function updateStats() {
  const counts = palette.map(entry => {
    const votes = circles.filter(c => c.emotion === entry.emotion).length;
    return { ...entry, votes };
  });
  const total = counts.reduce((sum, e) => sum + e.votes, 0);
  stats.innerHTML = counts.map(e => {
    const percent = total ? Math.round((e.votes / total) * 100) : 0;
    return `<div><span style="color:${e.color}">⬤</span> ${e.emotion} – ${e.votes} (${percent}%)</div>`;
  }).join('') + `<hr><div><strong>Bērnu skaits:</strong> ${total}</div>`;
}

  let draggedWrapper = null;
  let offsetX = 0;
  let offsetY = 0;

img.onload = () => {
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  let added = 0;
  const maxAttempts = voteCount * 20;
  const sizeMultiplier = voteCount < 40 ? 1.5 : 1;
  let attempts = 0;

  while (added < voteCount && attempts < maxAttempts) {
    attempts++;
    const baseSize = Math.floor(Math.random() * 40) + 30;
    const size = baseSize * sizeMultiplier;
    const x = Math.random() * (canvas.width - size);
    const y = Math.random() * (canvas.height - size);
    

    
    if (isInsideMask(x, y, size)) {
      const wrapper = document.createElement('div');
      wrapper.className = 'circle-wrapper';
      wrapper.style.top = `${y}px`;
      wrapper.style.left = `${x}px`;
      wrapper.style.setProperty('--wander-delay', `${Math.random() * 8}s`);
      wrapper.style.setProperty('--wander-duration', `${35 + Math.random() * 30}s`);
      

      const circle = document.createElement('div');
      circle.className = 'circle-inner';
      const selected = palette[Math.floor(Math.random() * palette.length)];
      circle.style.setProperty('--circle-size', `${size}px`);
      circle.style.setProperty('--circle-color', selected.color);
      circle.style.setProperty('--breathe-delay', `${Math.random() * 6}s`);
      circle.style.setProperty('--breathe-duration', `${3 + Math.random() * 4}s`);
      circle.emotion = selected.emotion;

      wrapper.appendChild(circle);
      container.appendChild(wrapper);
      circle.addEventListener('mousedown', e => {
      draggedWrapper = wrapper;

      freezeTransformToPosition(wrapper);

      wrapper.style.zIndex = '10';

      const containerRect = container.getBoundingClientRect();
      offsetX = e.clientX - containerRect.left - parseFloat(wrapper.style.left);
      offsetY = e.clientY - containerRect.top  - parseFloat(wrapper.style.top);

      e.preventDefault();
    });

      circles.push(circle);

      const appearDelay = Math.random() * 1500;
      setTimeout(() => circle.classList.add('show'), appearDelay);
      const pulseStart = appearDelay + 1200;
      setTimeout(() => circle.classList.add('active'), pulseStart);
      setTimeout(() => {
        const computedStyle = window.getComputedStyle(circle);
        circle.style.opacity = computedStyle.opacity;
        circle.classList.remove('active');
      }, pulseStart + 5000);


circle.addEventListener('mouseenter', () => {
  
  tooltip.textContent = selected.emotion;
  const rect = circle.getBoundingClientRect();
  tooltip.style.left = `${rect.left + rect.width / 2}px`;
  tooltip.style.top = `${rect.top}px`;
  tooltip.style.opacity = '1';
  tooltip.style.transform = 'translate(-50%, -120%)';

 
  wrapper.classList.add('paused');

  // heartSound.currentTime = 0;
  // heartSound.play();
});

circle.addEventListener('mouseleave', () => {
  tooltip.style.opacity = '0';

  
  wrapper.classList.remove('paused');

  //  heartSound.pause();
  // heartSound.currentTime = 0;
});

      added++;
    }
  }

  updateStats();


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

  const thisWrapper = draggedWrapper;
  const circle = thisWrapper.querySelector('.circle-inner');

  thisWrapper.style.zIndex = '1';

  // Держим 15 сек на паузе (wrapper по hover-логике)
  thisWrapper.classList.add('paused');

  // Пусть кружок мягко пульсирует (если нужно)
  circle.classList.add('active');

  // НЕ добавляем .calm-down, чтобы он не уменьшался
  // НЕ трогаем больше никакой wander у circle

  draggedWrapper = null;

  setTimeout(() => {
    // Снять паузу
    thisWrapper.classList.remove('paused');

    // Главное: вернуть блуждание wrapper'у, убрав инлайн 'animation: none'
    thisWrapper.style.animation = ''; // или thisWrapper.style.removeProperty('animation');

    // На всякий случай сбросить прямой transform кружка, если задавался
    circle.style.transform = '';
  }, 15000);
});

};
