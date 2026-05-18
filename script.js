let allGames = [];
let fuse;

// THEME TOGGLE
const themeBtn = document.getElementById("theme-toggle");
themeBtn.onclick = () => {
  const body = document.body;

  if (body.classList.contains("theme-blue")) {
    body.classList.replace("theme-blue", "theme-dark");
    themeBtn.textContent = "Blue Theme";
  } else {
    body.classList.replace("theme-dark", "theme-blue");
    themeBtn.textContent = "Dark Theme";
  }
};

// RENDER GAMES
function renderGames(games) {
  const grid = document.getElementById("game-grid");
  grid.innerHTML = "";

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

// MARKETPLACE LOADER
async function loadMarketplace() {
  const featured = document.getElementById("featured-row");

  try {
    const res = await fetch("index.json");
    allGames = await res.json();
  } catch {
    document.getElementById("game-grid").innerHTML =
      "<div class='empty-message'>Failed to load marketplace.</div>";
    return;
  }

  // FIX: Ensure it's an array
  if (!Array.isArray(allGames)) {
    allGames = [allGames];
  }

  // FEATURED
  allGames.slice(0, 3).forEach(game => {
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

  // INIT FUSE
  fuse = new Fuse(allGames, {
    keys: ["name", "description"],
    threshold: 0.3
  });

  // INITIAL RENDER
  renderGames(allGames);
}

loadMarketplace();

// SEARCH BAR
document.getElementById("search").addEventListener("input", e => {
  const query = e.target.value.trim();

  if (query === "") {
    renderGames(allGames);
    return;
  }

  const results = fuse.search(query).map(r => r.item);
  renderGames(results);
});
