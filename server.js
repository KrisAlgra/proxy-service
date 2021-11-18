const { Socket } = require("dgram");
const http = require("http");
const { url } = require("inspector");
const { URL } = require("url");

let previousReq; //`${clientReq.socket.remoteAddress}-${clientReq.url}-${clientReq.method}`

// Create an HTTP proxy
const proxy = http.createServer((clientReq, clientRes) => {
  let chunks = [];
  let isConsecutive = false;
  if (
    previousReq ===
    `${clientReq.socket.remoteAddress}-${clientReq.url}-${clientReq.method}`
  ) {
    //delay response
    isConsecutive = true;
  }
  previousReq = `${clientReq.socket.remoteAddress}-${clientReq.url}-${clientReq.method}`;

  //   const isConsecutive = () => {
  //     if (previousReq) {
  //       const {
  //         method: prevMethod,
  //         url: prevUrl,
  //         socket: prevSocket,
  //       } = previousReq;
  //       const { method: curMethod, url: curUrl, socket: curSocket } = clientReq;
  //       console.log(
  //         "requests match: ",
  //         curMethod === prevMethod &&
  //           curUrl === prevUrl &&
  //           curSocket.remoteAddress === prevSocket.remoteAddress
  //       );
  //       if (
  //         curMethod === prevMethod &&
  //         curUrl === prevUrl &&
  //         curSocket.remoteAddress === prevSocket.remoteAddress
  //       ) {
  //         // previousReq = clientReq;
  //         return true;
  //       }
  //     }
  //     // previousReq = clientReq;
  //     return false;
  //   };

  clientReq.on("data", (chunk) => chunks.push(chunk));
  clientReq.on("end", () => {
    const { url, headers, method } = clientReq;
    const { hostname: host, port, pathname: path } = new URL(url);
    const clientReqBody = Buffer.concat(chunks).toString("utf-8");

    // Check for bad_message if present reject 401
    if (clientReqBody.includes("bad_message")) {
      clientRes.writeHead("401", headers);
      clientRes.end();
    }

    const proxyReq = http.request(
      { host, port: port || 80, path, headers, method },
      (proxyRes) => {
        const { statusMessage, statusCode, headers } = proxyRes;
        if (isConsecutive) {
          setTimeout(() => {
            clientRes.writeHead(statusCode, statusMessage, headers);
            proxyRes.on("data", (chunk) => clientRes.write(chunk));
            proxyRes.on("end", () => clientRes.end());
          }, 5000);
        } else {
          clientRes.writeHead(statusCode, statusMessage, headers);
          proxyRes.on("data", (chunk) => clientRes.write(chunk));
          proxyRes.on("end", () => clientRes.end());
        }
      }
    );
    proxyReq.end(clientReqBody);
  });
});

proxy.listen(3000, "localhost");
