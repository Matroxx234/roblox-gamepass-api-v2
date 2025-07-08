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
    const html = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    const $ = cheerio.load(html.data);
    const passes = [];

    const gamepassDivs = $(".game-pass-item");

    for (let i = 0; i < gamepassDivs.length; i++) {
      const div = gamepassDivs[i];
      const id = $(div).attr("data-pass-id");
      const name = $(div).find(".text-label").text().trim();

      if (!id || !name) continue;

      // Récupération du prix
      let price = 0;
      try {
        const productUrl = `https://economy.roblox.com/v1/assets/${id}/resellers`;
        const resellers = await axios.get(productUrl);
        if (resellers.data?.data?.[0]?.unitPrice) {
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
    console.error("Erreur principale:", err.message);
    res.status(500).json({ error: "Erreur interne Roblox" });
  }
});

app.get("/api/username/:username", async (req, res) => {
  const username = req.params.username;

  try {
    const result = await axios.post(
      `https://users.roblox.com/v1/usernames/users`,
      { usernames: [username] },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const userId = result.data?.data?.[0]?.id;
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
