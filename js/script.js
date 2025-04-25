const cardContainer = document.getElementById('cardContainer');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const themeToggle = document.getElementById('themeToggle');

// Load initial cards
fetchCards();

// Fetch cards from PokéTCG API
async function fetchCards(query = '') {
  try {
    cardContainer.innerHTML = '<p>Loading cards...</p>';

    const url = query
      ? `https://api.pokemontcg.io/v2/cards?q=name:"${encodeURIComponent(query)}"`
      : `https://api.pokemontcg.io/v2/cards?pageSize=20&page=${Math.floor(Math.random() * 100) + 1}`;

    const response = await fetch(url);
    const data = await response.json();
    displayCards(data.data);
  } catch (error) {
    cardContainer.innerHTML = '<p>Error fetching cards.</p>';
    console.error('Fetch error:', error);
  }
}

// Display cards
function displayCards(cards) {
  cardContainer.innerHTML = '';
  cards.forEach((card, index) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    cardEl.innerHTML = `
      <img src="${card.images.small}" alt="${card.name}" style="width: 100%; border-radius: 8px;" />
      <h3>${card.name}</h3>
      <p>Rarity: ${card.rarity || 'Unknown'}</p>
      <button class="add-to-deck" data-index="${index}" style="margin-top: 10px; padding: 6px 12px; background: #8300e9; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Add to Deck
      </button>
    `;
    cardContainer.appendChild(cardEl);
  });

  // Add-to-deck functionality
  document.querySelectorAll('.add-to-deck').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      const selectedCard = cards[i];
      const currentDeck = JSON.parse(localStorage.getItem('pokemonDeck')) || [];

      const cardToAdd = {
        name: selectedCard.name,
        type: selectedCard.types ? selectedCard.types.join(', ') : 'N/A',
        hp: selectedCard.hp || 'N/A',
        attack: selectedCard.attacks?.[0]?.name || 'Unknown',
        damage: selectedCard.attacks?.[0]?.damage || '0',
        image: selectedCard.images.small
      };

      // Prevent duplicates
      const alreadyExists = currentDeck.some(c => c.name === cardToAdd.name);
      if (alreadyExists) {
        btn.textContent = 'Already in deck!';
        btn.style.backgroundColor = '#ccc';
        return;
      }

      currentDeck.push(cardToAdd);
      localStorage.setItem('pokemonDeck', JSON.stringify(currentDeck));

      btn.textContent = '✔ Added!';
      btn.disabled = true;
      btn.style.backgroundColor = '#4CAF50';
    });
  });
}

// Search input handler
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim();
  if (query.length > 2) {
    fetchCards(query);
  } else {
    fetchCards();
  }
});

// Search button click handler
searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (query.length >= 3) {
    fetchCards(query);
  } else {
    fetchCards();
  }
});

// Theme toggle
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});
