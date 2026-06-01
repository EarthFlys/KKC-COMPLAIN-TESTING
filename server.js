const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// ===== LINE Channel Access Token (เก็บไว้ฝั่ง server — ไม่ส่งให้ client รู้) =====
const LINE_TOKEN = 'n8IV3g+a9mkQPJ/Wg+MzaTfrqjKsn9hGF/JlE8v8KzplhNSN9xAfcl9p2F1NF8/9TolFzBUnIE3HDlbwINrTz6sJzorst4JZSO39NWa0t4qIokPAeuHxGarC+Qtbuwi/7m0g4JRz5D7KiFbna4bgswdB04t89/1O/w1cDnyilFU=';

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

const server = http.createServer((req, res) => {
  // 1. CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  // 2. LINE API Proxy
  if (req.url === '/send-line' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        
        const lineReq = https.request('https://api.line.me/v2/bot/message/broadcast', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + LINE_TOKEN
          }
        }, (lineRes) => {
          let lineBody = '';
          lineRes.on('data', d => lineBody += d);
          lineRes.on('end', () => {
            res.writeHead(lineRes.statusCode, { 'Content-Type': 'application/json' });
            res.end(lineBody);
          });
        });

        lineReq.on('error', (e) => {
          res.writeHead(500);
          res.end(JSON.stringify({ error: e.message }));
        });

        lineReq.write(JSON.stringify({
          messages: [{ type: 'text', text: data.message }]
        }));
        lineReq.end();

      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // 3. Serve Static Files
  let filePath = path.join(__dirname, req.url === '/' ? 'test.html' : req.url);
  let extname = path.extname(filePath);
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code == 'ENOENT') {
        res.writeHead(404);
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end('500 Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': MIME_TYPES[extname] || 'text/plain' });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n==========================================`);
  console.log(`🚀 เซิร์ฟเวอร์ทำงานแล้ว!`);
  console.log(`👉 เปิดบราวเซอร์แล้วเข้าเว็บนี้: http://localhost:${PORT}`);
  console.log(`==========================================\n`);
  console.log(`(หน้าต่างนี้ต้องเปิดทิ้งไว้ ห้ามปิด หากจะปิดเว็บค่อยปิด)\n`);
});
