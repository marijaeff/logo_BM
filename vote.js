let selectedMoodColor = null;
let selectedAnimal = null;
let selectedAnimalColor = null;

// -------------------- //
// Утилиты
// -------------------- //
function createColorOptions(colors, containerId, onSelect) {
  const container = document.getElementById(containerId);
  if (!container) return; // защита
  colors.forEach(color => {
    const div = document.createElement("div");
    div.className = "color-option";
    div.style.backgroundColor = color;
    div.dataset.color = color;
    div.addEventListener("click", () => onSelect(color));
    container.appendChild(div);
  });
}

function createAnimalOptions(animals, containerId, onSelect) {
  const container = document.getElementById(containerId);
  if (!container) return; // защита
  animals.forEach(animal => {
    const img = document.createElement("img");
    img.src = animal.src;
    img.className = "animal-icon";
    img.alt = animal.name;
    img.dataset.animal = animal.name;
    img.addEventListener("click", () => onSelect(animal));
    container.appendChild(img);
  });
}

// -------------------- //
// vote_2.html (эмоции)
// -------------------- //
if (document.querySelector('.circle')) {
  const circles = document.querySelectorAll('.circle');
  const submitBtn = document.getElementById('submitBtn');
  let selectedEmotion = null;

  circles.forEach(circle => {
    circle.addEventListener('click', () => {
      circles.forEach(c => c.classList.remove('selected'));
      circle.classList.add('selected');
      selectedEmotion = circle.getAttribute('data-emotion');
      submitBtn.disabled = false;
    });
  });

  submitBtn.addEventListener('click', () => {
    if (selectedEmotion) {
      sessionStorage.setItem('emotion', selectedEmotion);
      window.location.href = 'vote_3.html';
    }
  });
}

// -------------------- //
// vote_3.html (животные)
// -------------------- //
if (document.querySelector('.animal-grid')) {
  const animals = document.querySelectorAll('.animal, .animal-btn');
  const chooseBtn = document.querySelector('.buttons .btn:first-child');

  animals.forEach(animal => {
    animal.addEventListener('click', () => {
      animals.forEach(a => a.classList.remove('selected'));
      animal.classList.add('selected');

      const img = animal.querySelector('img');
      selectedAnimal = img ? img.alt : null;

      chooseBtn.disabled = !selectedAnimal;
    });
  });

  chooseBtn.addEventListener('click', () => {
    if (!selectedAnimal) return;
    sessionStorage.setItem('animal', selectedAnimal);
    window.location.href = 'vote_4.html';
  });
}
