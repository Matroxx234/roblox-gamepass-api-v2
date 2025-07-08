const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());

app.get("/api/passes/:userId", async (req, res) => {
  const userId = req.params.userId;
  const url = `https://www.roblox.com/users/${userId}/game-passes`;

  try {
    const html = await axios.get(url);
    const $ = cheerio.load(html.data);

    const passes = [];

    const gamepassDivs = $(".game-pass-item");

    for (let i = 0; i < gamepassDivs.length; i++) {
      const div = gamepassDivs[i];
      const id = $(div).attr("data-pass-id");
      const name = $(div).find(".text-label").text().trim();

      if (!id || !name) continue;

      // Récupération du prix via API secondaire
      const productUrl = `https://economy.roblox.com/v1/assets/${id}/resellers`;

      let price = 0;
      try {
        const resellers = await axios.get(productUrl);
        if (resellers.data && resellers.data.data && resellers.data.data[0]) {
          price = resellers.data.data[0].unitPrice;
        }
      } catch (err) {
        price = 0;
      }

      if (price > 0) {
        passes.push({
          id,
          name,
          price,
          image: `https://www.roblox.com/asset-thumbnail/image?assetId=${id}&width=150&height=150&format=png`
        });
      }
    }

    res.json({ passes });
  } catch (err) {
    console.error("Erreur API principale:", err.message);
    res.status(500).json({ error: "Erreur API Roblox: " + err.message });
  }
});

app.get("/api/username/:username", async (req, res) => {
  const username = req.params.username;
  try {
    const response = await axios.get(
      `https://users.roblox.com/v1/usernames/users`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: { usernames: [username] }
      }
    );

    const userId = response.data.data[0]?.id;

    if (userId) {
      res.json({ userId });
    } else {
      res.status(404).json({ error: "Utilisateur introuvable" });
    }
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération du userId" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API en ligne sur le port ${PORT}`);
});
