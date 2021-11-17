const http = require("http");
const { URL } = require("url");

let previousReq;

// Create an HTTP proxy
const proxy = http.createServer((clientReq, clientRes) => {
  previousReq && (previousReq = clientReq);

  let chunks = [];
  // previousReq ? setnew : forward request without delay (possible race condition Assume only serial requests look in handling concurency issues)
  // if consecutive requests wait 2 seconds. use setTimeout. Design decision, do I wait to make proxy request or make proxy request then wait to respond back to client.

  clientReq.on("data", (chunk) => chunks.push(chunk));
  clientReq.on("end", () => {
    const { url, headers, method } = clientReq;
    const { hostname: host, port, pathname: path } = new URL(url);
    const clientReqBody = Buffer.concat(chunks).toString("utf-8");

    // look for bad_message if present reject 401
    if (clientReqBody.includes("bad_message")) {
      clientRes.writeHead("401", headers);
      clientRes.end();
    }

    const proxyReq = http.request(
      { host, port: port || 80, path, headers, method },
      (proxyRes) => {
        const { statusMessage, statusCode, headers } = proxyRes;
        clientRes.writeHead(statusCode, statusMessage, headers);
        proxyRes.on("data", (chunk) => clientRes.write(chunk));
        proxyRes.on("end", () => clientRes.end());
      }
    );
    proxyReq.end(clientReqBody);
  });
});

proxy.listen(3000, "localhost");
