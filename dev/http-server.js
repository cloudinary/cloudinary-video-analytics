const http = require('http');
const multiparty = require('multiparty');

const events = [];
const server = http.createServer(function(req, res) {

  if (req.url === '/events' && req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify(events, null, 3));
    return;
  }

  if (req.url === '/events' && req.method === 'POST') {
    const form = new multiparty.Form({
      autoFields: true,
    });

    form.parse(req, function(err, fields) {
      res.writeHead(200);
      res.end();

      const parsedFields = Object.entries(fields).reduce((acc, [key, value]) => {
        acc[key] = value[0];
        return acc;
      }, {});

      events.push(parsedFields);
      console.log(events);
    });

    res.writeHead(200);
    res.end();

    return;
  }

  res.writeHead(500);
});
server.listen(3001, 'localhost', () => {
  console.log('Server is running on http://localhost:3001. Link to events - http://localhost:3001/events');
});
