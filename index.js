const express = require('express');
const app = express();
const axios = require('axios');
const PORT = process.env.PORT || 3000;

app.get('/v1/users/:userId/gamepasses', async (req, res) => {
  const userId = req.params.userId;
  try {
    const response = await axios.get(`https://games.roblox.com/v1/users/${userId}/games`);
    const gameIds = response.data.data.map(game => game.id);

    let gamepasses = [];
    for (const gameId of gameIds) {
      const resGP = await axios.get(`https://games.roblox.com/v1/games/${gameId}/game-passes`);
      if (resGP.data.data) {
        gamepasses = gamepasses.concat(resGP.data.data);
      }
    }

    res.json(gamepasses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
