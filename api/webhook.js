export default function handler(req, res) {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "PRINTOPS_VERIFY_SECRET";

  const host = req.headers ? req.headers.host : 'localhost';
  const url = new URL(req.url, `https://${host}`);
  const mode = url.searchParams.get('hub.mode') || (req.query && req.query['hub.mode']);
  const token = url.searchParams.get('hub.verify_token') || (req.query && req.query['hub.verify_token']);
  const challenge = url.searchParams.get('hub.challenge') || (req.query && req.query['hub.challenge']);

  if (req.method === 'GET') {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      return res.end(challenge || '');
    }
    res.statusCode = 403;
    return res.end('Forbidden');
  }

  if (req.method === 'POST') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    return res.end('EVENT_RECEIVED');
  }

  res.statusCode = 405;
  return res.end('Method Not Allowed');
}
