import { Router, type IRouter } from "express";
const router: IRouter = Router();

const telegramRateLimit = new Map<string, number>();

router.post("/alerts/telegram", async (req, res) => {
  const { equipmentName, paramName, currentValue, threshold, severity } = req.body as {
    equipmentName?: string;
    paramName?: string;
    currentValue?: string;
    threshold?: string;
    severity?: string;
  };

  if (!equipmentName || !paramName || !currentValue || !threshold || !severity) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  if (!["warning", "critical"].includes(severity)) {
    res.status(400).json({ error: "severity must be warning or critical" });
    return;
  }

  const botToken = process.env["TELEGRAM_BOT_TOKEN"];
  const chatId = process.env["TELEGRAM_CHAT_ID"];

  if (!botToken || !chatId) {
    res.status(503).json({ error: "Telegram not configured", hint: "Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID secrets" });
    return;
  }

  const rateKey = `${equipmentName}:${paramName}`;
  const now = Date.now();
  const lastSent = telegramRateLimit.get(rateKey) ?? 0;
  if (now - lastSent < 5 * 60 * 1000) {
    res.json({ ok: true, skipped: true, reason: "rate_limited" });
    return;
  }
  telegramRateLimit.set(rateKey, now);

  const icon = severity === "critical" ? "🔴" : "🟡";
  const text =
    `${icon} <b>DİQQƏT — Yüksək Sərfiyyat Xəbərdarlığı</b>\n\n` +
    `🏭 <b>Avadanlıq:</b> ${equipmentName}\n` +
    `📊 <b>Parametr:</b> ${paramName}\n` +
    `📈 <b>Cari dəyər:</b> ${currentValue}\n` +
    `🔔 <b>Hədd:</b> ${threshold}\n` +
    `⚠️ <b>Səviyyə:</b> ${severity === "critical" ? "KRİTİK" : "XƏBƏRDARLIQ"}\n` +
    `🕐 <b>Vaxt:</b> ${new Date().toLocaleString("az-AZ")}`;

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      req.log.warn({ errBody, status: response.status }, "Telegram API error");
      res.status(502).json({ error: "Telegram API error", details: errBody });
      return;
    }

    req.log.info({ equipmentName, paramName, severity }, "Telegram alert sent");
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to call Telegram API");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
