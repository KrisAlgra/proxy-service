const http = require("http");
const { URL } = require("url");

// let previousReq;

// Create an HTTP proxy
const proxy = http.createServer((clientReq, clientRes) => {
  let chunks = [];
  // previousReq ? setnew : forward request without delay (possible race condition Assume only serial requests look in handling concurency issues)
  // if consecutive requests wait 2 seconds. use setTimeout. Design decision, do I wait to make proxy request or make proxy request then wait to respond back to client.

  clientReq.on("data", (chunk) => chunks.push(chunk));
  clientReq.on("end", () => {
    const { url, headers, method } = clientReq;
    const { hostname: host, port, pathname: path } = new URL(url);
    const clientReqBody = Buffer.concat(chunks).toString("utf-8");
    // look for bad_message if present reject 401
    const proxyRequest = http.request(
      { host, port: port || 80, path, headers, method },
      (proxyResponse) => {
        const { statusMessage, statusCode, headers } = proxyResponse;
        clientRes.writeHead(statusCode, statusMessage, headers);
        proxyResponse.on("data", (chunk) => clientRes.write(chunk));
        proxyResponse.on("end", () => clientRes.end());
      }
    );
    proxyRequest.end(clientReqBody);
  });
});

proxy.listen(3000, "localhost");
