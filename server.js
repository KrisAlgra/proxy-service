const http = require("http");
const { URL } = require("url");
const { MD5 } = require("crypto-js");
const { v4: uuid } = require("uuid");

let previousReq;

// Create an HTTP proxy
const proxy = http.createServer((clientReq, clientRes) => {
  let chunks = [];
  let isConsecutive = false;

  clientReq.on("data", (chunk) => chunks.push(chunk));
  clientReq.on("end", () => {
    const { url, headers, method } = clientReq;
    const { hostname: host, port, pathname: path } = new URL(url);
    const clientReqBody = Buffer.concat(chunks).toString("utf-8");

    if (
      previousReq ===
      `${clientReq.socket.remoteAddress}-${clientReq.url}-${
        clientReq.method
      }-${MD5(clientReqBody)}`
    ) {
      //delay response
      isConsecutive = true;
    }
    previousReq = `${clientReq.socket.remoteAddress}-${clientReq.url}-${
      clientReq.method
    }-${MD5(clientReqBody)}`;

    // Check for bad_message if present reject 401
    if (clientReqBody.includes("bad_message")) {
      clientRes.writeHead("401", headers);
      clientRes.end();
      return;
    }

    const proxyReq = http.request(
      { host, port: port || 80, path, headers, method },
      (proxyRes) => {
        const { statusMessage, statusCode, headers } = proxyRes;
        setTimeout(
          () => {
            // clientRes.writeHead(statusCode, statusMessage, headers);
            clientRes.writeHead(statusCode, statusMessage, {
              "X-Proxy-Request-ID": uuid(),
              ...headers,
            });
            proxyRes.on("data", (chunk) => clientRes.write(chunk));
            proxyRes.on("end", () => clientRes.end());
          },
          isConsecutive ? 2000 : 0
        );
      }
    );
    proxyReq.end(clientReqBody);
  });
});

proxy.listen(3000, "localhost");
