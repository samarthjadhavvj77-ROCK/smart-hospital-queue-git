const http = require('http');

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'localhost';
const OLLAMA_PORT = process.env.OLLAMA_PORT || 11434;
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

// Check if Ollama is running
const checkOllamaStatus = () => {
  return new Promise((resolve) => {
    const req = http.get(`http://${OLLAMA_HOST}:${OLLAMA_PORT}/api/tags`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const models = parsed.models || [];
          resolve({ running: true, models: models.map(m => m.name) });
        } catch {
          resolve({ running: false, models: [] });
        }
      });
    });
    req.on('error', () => resolve({ running: false, models: [] }));
    req.setTimeout(3000, () => { req.destroy(); resolve({ running: false, models: [] }); });
  });
};

// Stream chat response from Ollama
// onToken(token) called for each streamed token
// onDone() called when complete
const streamChat = (messages, onToken, onDone, onError) => {
  const body = JSON.stringify({
    model: OLLAMA_MODEL,
    messages,
    stream: true,
    options: {
      temperature: 0.7,
      num_predict: 512,
    },
  });

  const options = {
    hostname: OLLAMA_HOST,
    port: OLLAMA_PORT,
    path: '/api/chat',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  };

  const req = http.request(options, (res) => {
    res.on('data', (chunk) => {
      const lines = chunk.toString().split('\n').filter(l => l.trim());
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.error) {
            return onError(new Error(parsed.error));
          }
          if (parsed.message && parsed.message.content) {
            onToken(parsed.message.content);
          }
          if (parsed.done) {
            onDone();
          }
        } catch {
          // skip malformed chunks
        }
      }
    });
    res.on('end', () => onDone());
    res.on('error', onError);
  });

  req.on('error', onError);
  req.setTimeout(60000, () => { req.destroy(); onError(new Error('Ollama request timeout')); });
  req.write(body);
  req.end();
};

module.exports = { checkOllamaStatus, streamChat, OLLAMA_MODEL };
