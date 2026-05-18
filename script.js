// THEME TOGGLE
const themeBtn = document.getElementById("theme-toggle");

themeBtn.onclick = () => {
  const body = document.body;

  if (body.classList.contains("theme-blue")) {
    body.classList.replace("theme-blue", "theme-dark");
    themeBtn.textContent = "Light";
  } else if (body.classList.contains("theme-dark")) {
    body.classList.replace("theme-dark", "theme-light");
    themeBtn.textContent = "Blue";
  } else {
    body.classList.replace("theme-light", "theme-blue");
    themeBtn.textContent = "Dark";
  }
};

// MARKETPLACE LOADER
async function loadMarketplace() {
  const grid = document.getElementById("game-grid");
  const featured = document.getElementById("featured-row");

  let games = [];
  try {
    const res = await fetch("index.json");
    games = await res.json();
  } catch {
    grid.innerHTML = "<div class='empty-message'>Failed to load marketplace.</div>";
    return;
  }

  if (!Array.isArray(games) || games.length === 0) {
    grid.innerHTML = "<div class='empty-message'>No games available yet.</div>";
    return;
  }

  // FEATURED (first 3)
  games.slice(0, 3).forEach(game => {
    const card = document.createElement("div");
    card.className = "featured-card";
    card.style.backgroundImage = `url(${game.thumbnail})`;

    card.innerHTML = `
      <div class="featured-overlay">
        <h3>${game.name}</h3>
      </div>
    `;

    featured.appendChild(card);
  });

  // ALL GAMES GRID
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
