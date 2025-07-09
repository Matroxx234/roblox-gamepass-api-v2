const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/v1/user/:userId/items', async (req, res) => {
  const userId = req.params.userId;
  let gamepasses = [], clothes = [];

  try {
    // Étape 1 : Obtenir le jeu par défaut du joueur
    const gamesRes = await axios.get(`https://games.roblox.com/v2/users/${userId}/games?accessFilter=2&limit=1&sortOrder=Asc`);
    const defaultGame = gamesRes.data.data[0];

    if (!defaultGame) {
      return res.status(404).json({ error: "Aucun jeu trouvé pour cet utilisateur." });
    }

    const gameId = defaultGame.id;

    // Étape 2 : Récupérer les Gamepasses associés au jeu
    const passRes = await axios.get(`https://games.roblox.com/v1/games/${gameId}/game-passes`);
    gamepasses = passRes.data.data || [];

    // Étape 3 : Récupérer les vêtements créés par le joueur
    const types = [
      { name: 'Shirts', subId: 11 },
      { name: 'Pants', subId: 12 },
      { name: 'TShirts', subId: 2 }
    ];

    for (const t of types) {
      const response = await axios.get(
        `https://catalog.roblox.com/v1/search/items?CreatorTargetId=${userId}` +
        `&Category=3&Subcategory=${t.subId}&Limit=30`
      );
      clothes = clothes.concat(response.data.data || []);
    }

    res.json({ gamepasses, clothes });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`✅ API en ligne sur le port ${PORT}`));
