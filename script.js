async function loadMarketplace() {
  const grid = document.getElementById("game-grid");

  let games = [];
  try {
    const res = await fetch("index.json");
    games = await res.json();
  } catch (err) {
    grid.innerHTML = "<p>Failed to load marketplace.</p>";
    return;
  }

  games.forEach(game => {
    const card = document.createElement("div");
    card.className = "game-card";

    card.innerHTML = `
      <img src="${game.thumbnail}" class="game-thumb">
      <h2>${game.name}</h2>
      <p>${game.description}</p>

      <button class="download-btn" onclick="window.location='${game.downloads.windows}'">
        Download for Windows
      </button>

      <button class="download-btn" onclick="window.location='${game.downloads.linux}'">
        Download for Linux
      </button>
    `;

    grid.appendChild(card);
  });
}

loadMarketplace();
