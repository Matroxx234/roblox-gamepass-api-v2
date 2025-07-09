import express from "express";
import axios from "axios";
import cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/api/passes/:userId", async (req, res) => {
  const { userId } = req.params;
  const url = `https://www.roblox.com/users/${userId}/game-passes`;

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);
    const passes = [];

    $(".game-pass-item").each((_, el) => {
      const name = $(el).find(".text-name").text().trim();
      const idMatch = $(el).find("a").attr("href")?.match(/game-pass\/(\d+)/);
      const id = idMatch ? Number(idMatch[1]) : null;
      const priceText = $(el).find(".text-robux").text().replace("R$", "").trim();
      const price = Number(priceText);

      if (id && price > 0) {
        passes.push({ id, name, price });
      }
    });

    res.json({ passes });
  } catch (err) {
    console.error("Erreur API:", err.message);
    res.status(500).json({ error: "Erreur interne Roblox" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API en ligne sur le port ${PORT}`);
});
