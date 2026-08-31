export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const payload = req.body;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return res.status(400).json({ success: false, error: "Érvénytelen kérés." });
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const treatment = typeof payload.treatment === "string" ? payload.treatment.trim() : "";
  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  const acceptedPrivacy = payload.acceptedPrivacy === true;

  const phoneDigits = phone.replace(/\D/g, "");
  const localPhone = phoneDigits.startsWith("0036")
    ? phoneDigits.slice(4)
    : phoneDigits.startsWith("36")
      ? phoneDigits.slice(2)
      : phoneDigits.startsWith("06")
        ? phoneDigits.slice(2)
        : phoneDigits.startsWith("0")
          ? phoneDigits.slice(1)
          : phoneDigits;

  const validPhone = /^(?:(?:20|30|70)\d{7}|[1-9]\d{7})$/.test(localPhone);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const allowedTreatments = new Set([
    "Állapotfelmérés",
    "Fogkő-eltávolítás",
    "Fogfehérítés",
    "Gyökérkezelés",
    "Implantátum konzultáció",
    "Sürgősségi fogászat"
  ]);

  if (!name || name.length > 120) {
    return res.status(400).json({ success: false, error: "Érvényes név megadása kötelező." });
  }
  if (!validPhone) {
    return res.status(400).json({ success: false, error: "Érvényes telefonszám megadása kötelező." });
  }
  if (!validEmail || email.length > 254) {
    return res.status(400).json({ success: false, error: "Érvényes email cím megadása kötelező." });
  }
  if (!allowedTreatments.has(treatment)) {
    return res.status(400).json({ success: false, error: "Kezelés kiválasztása kötelező." });
  }
  if (!acceptedPrivacy) {
    return res.status(400).json({ success: false, error: "Az adatkezelési feltételek elfogadása kötelező." });
  }
  if (message.length > 2000) {
    return res.status(400).json({ success: false, error: "Az üzenet túl hosszú." });
  }

  const webhookUrl = process.env.MAKE_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(500).json({
      success: false,
      error: "A MAKE_WEBHOOK_URL környezeti változó nincs beállítva."
    });
  }

  const lead = {
    name,
    phone,
    email,
    treatment,
    message,
    acceptedPrivacy,
    source: "NovaDent landing",
    date: new Date().toISOString()
  };

  try {
    const upstream = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead)
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
