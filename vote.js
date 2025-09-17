const moodColors = ["#ff7675", "#74b9ff", "#55efc4", "#ffeaa7", "#a29bfe"];
const animalList = [
  { name: "Kaķis", src: "cat.png" },
  { name: "Suns", src: "dog.png" },
  { name: "Putns", src: "bird.png" }
];
const animalColors = ["#2d3436", "#00cec9", "#fab1a0", "#6c5ce7", "#fdcb6e"];

let selectedMoodColor = null;
let selectedAnimal = null;
let selectedAnimalColor = null;

function createColorOptions(colors, containerId, onSelect) {
  const container = document.getElementById(containerId);
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

createColorOptions(moodColors, "moodColors", (color) => {
  selectedMoodColor = color;
  document.getElementById("step2").classList.remove("hidden");
});

createAnimalOptions(animalList, "animalIcons", (animal) => {
  selectedAnimal = animal;
  document.getElementById("step3").classList.remove("hidden");
});

createColorOptions(animalColors, "animalColors", (color) => {
  selectedAnimalColor = color;
  document.getElementById("submitBtn").classList.remove("hidden");
});

document.getElementById("submitBtn").addEventListener("click", () => {
  if (selectedMoodColor && selectedAnimal && selectedAnimalColor) {
    const data = {
      moodColor: selectedMoodColor,
      animal: selectedAnimal.name,
      animalColor: selectedAnimalColor,
      timestamp: Date.now()
    };
    console.log("To send to Firebase:", data);
    // TODO: replace with firebase logic
    document.getElementById("submitBtn").classList.add("hidden");
    document.getElementById("thanksMessage").classList.remove("hidden");
  }
});

document.querySelectorAll('.animal').forEach(animal => {
  animal.addEventListener('click', () => {
    document.querySelectorAll('.animal').forEach(a => a.classList.remove('selected'));
    animal.classList.add('selected');
  });
});
