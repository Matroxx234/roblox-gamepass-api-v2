const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());

app.get('/api/passes/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const url = `https://catalog.roblox.com/v1/search/items?category=11&creatorTargetId=${userId}&salesTypeFilter=1&limit=30`;
    const response = await axios.get(url);
    const passes = response.data.data.map(pass => ({
      id: pass.id,
      name: pass.name,
      price: pass.price || 0
    }));
    res.json({ passes });
  } catch (err) {
    console.error('Erreur API:', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des Game Pass' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API en ligne sur le port ${PORT}`);
});
