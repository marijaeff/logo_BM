function drawVotes(voteCount) {
  const container = document.getElementById('grid');
  container.innerHTML = '';

  for (let i = 0; i < voteCount; i++) {
    const div = document.createElement('div');
    div.className = 'vote-block';

    // Увеличение размеров при меньшем числе голосов
    const scale = Math.max(1, 10 / voteCount); // при 1 голосе = x10
    const baseSize = 100;
    const size = baseSize * scale * (0.8 + Math.random() * 0.4); // немного рандома

    div.style.width = `${size}px`;
    div.style.height = `${size}px`;
    div.style.position = 'absolute';
    div.style.left = `${Math.random() * (730 - size)}px`;
    div.style.top = `${Math.random() * (687 - size)}px`;

    div.style.backgroundColor = getColor(i);
    div.style.borderRadius = '40%';
    div.style.opacity = 0.85;

    container.appendChild(div);
  }

  function getColor(index) {
    const palette = ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf',
                     '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff'];
    return palette[index % palette.length];
  }
}

// Пример вызова:
drawVotes(3); // можно менять на 1, 2, 5, 10 и т.д.
