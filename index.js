const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/v1/user/:userId/items', async (req, res) => {
  const userId = req.params.userId;
  let gamepasses = [], clothes = [];

  try {
    const gamesRes = await axios.get(`https://games.roblox.com/v1/users/${userId}/games`);
    const games = gamesRes.data.data || [];

    for (const game of games) {
      const passRes = await axios.get(`https://games.roblox.com/v1/games/${game.id}/game-passes`);
      gamepasses = gamepasses.concat(passRes.data.data || []);
    }

    const types = [
      { name: 'Shirts', subId: 11 },
      { name: 'Pants', subId: 12 },
      { name: 'TShirts', subId: 2 }
    ];
    for (const t of types) {
      const clothesRes = await axios.get(
        `https://catalog.roblox.com/v1/search/items?CreatorTargetId=${userId}` +
        `&Category=3&Subcategory=${t.subId}&Limit=30`
      );
      clothes = clothes.concat(clothesRes.data.data || []);
    }

    res.json({ gamepasses, clothes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`API running on port ${PORT}`));
