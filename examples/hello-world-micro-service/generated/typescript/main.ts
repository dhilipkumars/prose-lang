import * as http from 'http';
import * as url from 'url';

const PORT = 8080;

interface ResponseData {
  message: string;
}

export function handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  const parsedUrl = url.parse(req.url || '', true);

  if (parsedUrl.pathname === '/hello' && req.method === 'GET') {
    // 1. EXTRACT Input First and Last Name from the request URL query parameters.
    const firstName = parsedUrl.query['First name'] as string | undefined;
    const lastName = parsedUrl.query['Last name'] as string | undefined;

    // 2. VALIDATE Input First & Last Names:
    // a. IF either of the Name is empty or missing:
    //    i. SET Input Name to "World" (Default).
    let fullMessage: string;
    if (!firstName || !lastName) {
      fullMessage = "Vanakam World";
    } else {
      // 3. CONSTRUCT the response:
      // a. FORMAT the string: "Vanakam" + Last Name, First Name.
      fullMessage = `Vanakam ${lastName}, ${firstName}`;
    }

    // b. STORE it in Message Payload.
    const payload: ResponseData = {
      message: fullMessage.trim()
    };

    // 4. SEND Response:
    // a. SET HTTP Status Code to 200 (OK).
    // b. SET Content-Type header to "application/json".
    // c. WRITE Message Payload as JSON to the response body.
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload));
  } else {
    res.writeHead(404);
    res.end();
  }
}

// Start the server only if run directly.
if (require.main === module) {
  const server = http.createServer((req, res) => handleRequest(req, res));
  server.listen(PORT, () => {
    console.log(`Starting Hello Microservice (TS) on port ${PORT}...`);
  });
}
