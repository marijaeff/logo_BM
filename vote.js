let selectedMoodColor = null;
let selectedAnimal = null;
let selectedAnimalColor = null;


function createColorOptions(colors, containerId, onSelect) {
  const container = document.getElementById(containerId);
  if (!container) return; // aidzsarzība
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
  if (!container) return; // aizsardzība
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


// vote_2.html


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
    if (!selectedEmotion) return;
    sessionStorage.setItem('emotion', selectedEmotion);

    // saglabājam krāsu noskaņai
    const sel = document.querySelector('.circle.selected');
    const moodColor = sel ? getComputedStyle(sel).backgroundColor : '';
    if (moodColor) sessionStorage.setItem('emotionColor', moodColor);

    window.location.href = 'vote_3.html';
  });
}



// vote_3.html 

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

//  vote_4 
const colorContainer = document.getElementById("animalColors");
const previewCircle = document.getElementById("animalPreview");
const animalShape = document.getElementById("animalShape");
const submitBtn4 = document.getElementById("submitBtn");

if (colorContainer && previewCircle && animalShape && submitBtn4) {
  // aplis - izvēlētais garastāvoklis
  const emotionColor = sessionStorage.getItem('emotionColor') || '#cfe2cf';
  previewCircle.style.backgroundColor = emotionColor;

  // maska dzīvniekam
  const animalName = sessionStorage.getItem('animal');
  const map = {
    "Kaķis": "cat.png", "Suns": "dog.png", "Ērglis": "eagle.png",
    "Lācis": "bear.png", "Čūska": "snake.png", "Lauva": "lion.png"
  };
  const src = map[animalName] || "cat.png";
  animalShape.style.setProperty('--animal-url', `url("${src}")`);

  // palīdzošas funkcijas 
  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
    const num = parseInt(hex, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }
  function luminance({ r, g, b }) {
    const a = [r, g, b].map(v => {
      v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }
  function contrast(rgb1, rgb2) {
    const L1 = luminance(rgb1) + 0.05, L2 = luminance(rgb2) + 0.05;
    return L1 > L2 ? L1 / L2 : L2 / L1;
  }
  function adjustDarker(hex, amount) {
    let { r, g, b } = hexToRgb(hex);
    r = Math.max(0, r - amount);
    g = Math.max(0, g - amount);
    b = Math.max(0, b - amount);
    return rgbToHex(r, g, b);
  }
  function rgbToHex(r, g, b) {
    return "#" + [r, g, b]
      .map(x => x.toString(16).padStart(2, "0"))
      .join("");
  }
  function rgbStringToObj(rgb) {
    const [r, g, b] = rgb.match(/\d+/g).map(Number);
    return { r, g, b };
  }
  function ensureContrast(fgHex, bgCss) {
    let safe = fgHex;
    const bg = rgbStringToObj(bgCss);
    let fg = hexToRgb(safe);

    let tries = 0;
    while (contrast(fg, bg) < 3 && tries < 10) {  // gribām kontrastu >= 3
      safe = adjustDarker(safe, 30); // samazina gaišumu uz 30
      fg = hexToRgb(safe);
      tries++;
    }
    return safe;
  }

  // krāsu palitra
  const colors = ["#D9C2A7", "#A0A7BA", "#A3B18A", "#C49A6C", "#B5A6C9", "#8D827A", "#F2E9E4", "#4B4B4B"];
  colorContainer.innerHTML = '';
  colors.forEach(c => {
    const div = document.createElement("div");
    div.className = "color-option";
    div.style.backgroundColor = c;
    div.addEventListener("click", () => {
      document.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
      div.classList.add('selected');

      const bg = getComputedStyle(previewCircle).backgroundColor;
      const safeColor = ensureContrast(c, bg);

      animalShape.style.backgroundColor = safeColor;
      sessionStorage.setItem('animalColor', safeColor);
      submitBtn4.disabled = false;
    });
    colorContainer.appendChild(div);
  });

  // pats izvēlās krāsu 
  const customDiv = document.createElement("div");
  customDiv.className = "color-option custom-color";
  customDiv.innerHTML = `
    <input type="color" id="customColor">
    <span class="icon">✏️</span>
  `;
  const customInput = customDiv.querySelector("input");
  customInput.addEventListener("input", (e) => {
    const c = e.target.value;
    const bg = getComputedStyle(previewCircle).backgroundColor;
    const safeColor = ensureContrast(c, bg);

    animalShape.style.backgroundColor = safeColor;
    sessionStorage.setItem('animalColor', safeColor);

    document.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
    customDiv.classList.add('selected');

    submitBtn4.disabled = false;
  });
  colorContainer.appendChild(customDiv);

  const textures = [
    { name: "Stripes", file: "textures/stripes.svg" },
    { name: "Rails", file: "textures/rails.svg" },
    { name: "Cogs", file: "textures/floating-cogs.svg" },
    { name: "Bubbles", file: "textures/bubbles.svg" },
    { name: "Circles", file: "textures/overlapping-circles.svg" },
    { name: "Floor", file: "textures/bathroom-floor.svg" },
    { name: "Food", file: "textures/i-like-food.svg" },
    { name: "Hexagons", file: "textures/hexagons.svg" },
    { name: "Jigsaw", file: "textures/jigsaw.svg" },
    { name: "Signal", file: "textures/signal.svg" },
    { name: "Stars", file: "textures/slanted-stars.svg" },
    { name: "Squeres", file: "textures/squares-in-squares.svg" },
    { name: "Houndstooth", file: "textures/houndstooth.svg" },
    { name: "Groovy", file: "textures/groovy.svg" },
    { name: "DeStar", file: "textures/death-star.svg" },
    { name: "Bubbles", file: "textures/bubbles.svg" }
  ];

  const textureContainer = document.getElementById("animalTextures");
  if (textureContainer) {
    textures.forEach(t => {
      const div = document.createElement("div");
      div.className = "texture-option";
      div.style.backgroundImage = `url(${t.file})`;
      div.addEventListener("click", () => {
        document.querySelectorAll('.texture-option').forEach(el => el.classList.remove('selected'));
        div.classList.add('selected');

        animalShape.style.setProperty('--animal-texture', `url(${t.file})`);
        animalShape.style.backgroundSize = "10px";
        animalShape.style.backgroundRepeat = "repeat";
        animalShape.style.backgroundBlendMode = "multiply";

        sessionStorage.setItem('animalTexture', t.file);
        submitBtn4.disabled = false;
      });
      textureContainer.appendChild(div);
    });
  }

  // poga
  submitBtn4.addEventListener("click", () => {
    const thanks = document.getElementById("thanksMessage");
    if (thanks) {
      thanks.classList.remove("hidden");
      submitBtn4.classList.add("hidden");
    }
  });
}

document.querySelectorAll('.accordion-header').forEach(btn => {
  btn.addEventListener('click', () => {
    const content = btn.nextElementSibling;
    content.classList.toggle('open');
  });
});