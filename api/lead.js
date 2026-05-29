export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const webhookUrl = process.env.MAKE_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(500).json({
      success: false,
      error: "A MAKE_WEBHOOK_URL környezeti változó nincs beállítva."
    });
  }

  const payload = req.body || {};

  try {
    const upstream = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!upstream.ok) {
      return res.status(502).json({
        success: false,
        error: "A webhook kiszolgáló hibát adott vissza."
      });
    }

    return res.status(200).json({ success: true });
  } catch {
    return res.status(500).json({
      success: false,
      error: "Nem sikerült továbbítani az adatokat a webhook felé."
    });
  }
}
