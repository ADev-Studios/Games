async function loadMarketplace() {
  const grid = document.getElementById("game-grid");

  let games = [];
  try {
    const res = await fetch("index.json");
    games = await res.json();
  } catch (err) {
    grid.innerHTML = "<div class='empty-message'>Failed to load marketplace.</div>";
    return;
  }

  if (!Array.isArray(games) || games.length === 0) {
    grid.innerHTML = "<div class='empty-message'>No games available yet.</div>";
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
