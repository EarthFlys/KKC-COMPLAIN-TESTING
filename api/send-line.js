export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: 'Missing message' });

  const token = process.env.LINE_TOKEN;
  if (!token) return res.status(500).json({ error: 'LINE_TOKEN not set' });

  const response = await fetch('https://notify-api.line.me/api/notify', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ message }),
  });

  const data = await response.json();
  res.status(response.status).json(data);
}
