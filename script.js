// script.js
import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

const container = document.getElementById('voteContainer');
const stats = document.getElementById('stats');
const canvas = document.getElementById('maskCanvas');
const ctx = canvas.getContext('2d');
const tooltip = document.getElementById('tooltip');
const img = new Image();
img.src = 'logo-mask.svg';
const circles = [];

let draggedWrapper = null;
let offsetX = 0;
let offsetY = 0;

// проверка попадания в маску
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

// подбираем координаты так, чтобы кружок точно попал внутрь маски
function placeInsideMask(size) {
  let attempts = 0;
  while (attempts < 1000) {
    const x = Math.random() * (canvas.width - size);
    const y = Math.random() * (canvas.height - size);
    if (isInsideMask(x, y, size)) return { x, y };
    attempts++;
  }
  // fallback: если не получилось, рисуем в центре
  return { x: canvas.width / 2 - size / 2, y: canvas.height / 2 - size / 2 };
}

// динамический размер (чем меньше голосов, тем больше пузыри)
function getRandomSize(totalVotes) {
  let min, max;
  if (totalVotes < 20) {
    min = 50; max = 100;
  } else if (totalVotes < 50) {
    min = 35; max = 80;
  } else {
    min = 20; max = 50;
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// обновляем статистику
function updateStats() {
  const emotions = {};
  circles.forEach(c => {
    emotions[c.emotion] = (emotions[c.emotion] || 0) + 1;
  });
  const total = circles.length;
  stats.innerHTML = Object.entries(emotions).map(([emotion, votes]) => {
    const percent = total ? Math.round((votes / total) * 100) : 0;
    return `<div>${emotion} – ${votes} (${percent}%)</div>`;
  }).join('') + `<hr><div><strong>Bērnu skaits:</strong> ${total}</div>`;
}

// создаём пузырь из голоса
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

  // слой-животное с цветом + текстурой
  if (vote.animal) {
    const animalEl = document.createElement('div');
    animalEl.className = 'animal-mask';

    // маска по картинке животного
    animalEl.style.webkitMaskImage = `url(${vote.animal})`;
    animalEl.style.maskImage = `url(${vote.animal})`;

    const baseColor = vote.color || "#f2c94c";

    if (vote.texture && vote.texture !== "none") {
      // текстура + цвет в одном background
      animalEl.style.backgroundImage = `url(${vote.texture}), linear-gradient(${baseColor}, ${baseColor})`;
      animalEl.style.backgroundBlendMode = "multiply";
      animalEl.style.backgroundSize = "20px, cover";
    } else {
      // только цвет
      animalEl.style.backgroundColor = baseColor;
    }

    circle.appendChild(animalEl);
  }

  wrapper.appendChild(circle);
  container.appendChild(wrapper);
  circles.push(circle);

  // анимация появления
  const appearDelay = Math.random() * 1500;
  setTimeout(() => circle.classList.add('show'), appearDelay);

  // тултип
  circle.addEventListener('mouseenter', () => {
    tooltip.textContent = `${circle.animal} (${circle.emotion})`;
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

  // drag&drop
  circle.addEventListener('mousedown', e => {
    draggedWrapper = wrapper;
    wrapper.style.zIndex = '10';
    const containerRect = container.getBoundingClientRect();
    offsetX = e.clientX - containerRect.left - parseFloat(wrapper.style.left);
    offsetY = e.clientY - containerRect.top - parseFloat(wrapper.style.top);
    e.preventDefault();
  });
}


// загружаем маску и подключаем Firebase
img.onload = () => {
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

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

// глобальный drag&drop
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
  draggedWrapper.style.zIndex = '1';
  draggedWrapper.classList.add('paused');
  draggedWrapper = null;
});
