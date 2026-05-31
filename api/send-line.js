const https = require("https");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const lineToken = process.env.LINE_TOKEN;
  if (!lineToken) return res.status(500).json({ error: "LINE_TOKEN not set" });

  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: "Missing message" });

  const payload = JSON.stringify({
    messages: [{ type: "text", text: message }],
  });

  return new Promise((resolve) => {
    const lineReq = https.request(
      {
        hostname: "api.line.me",
        path: "/v2/bot/message/broadcast",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
          Authorization: "Bearer " + lineToken,
        },
      },
      (lineRes) => {
        let body = "";
        lineRes.on("data", (c) => (body += c));
        lineRes.on("end", () => {
          let parsed = {};
          try { parsed = JSON.parse(body); } catch {}
          res.status(lineRes.statusCode).json(parsed);
          resolve();
        });
      }
    );
    lineReq.on("error", (e) => {
      res.status(500).json({ error: e.message });
      resolve();
    });
    lineReq.write(payload);
    lineReq.end();
  });
};
