import { WebSocketServer } from "ws";

const PORT = 8989;
const wss = new WebSocketServer({ port: PORT, path: "/ws/signaling-server" });

wss.on("connection", (ws, req) => {
  ws.on("close", (code, reason) => {
    console.log("close code: %s, code: %s", code, reason);
  });

  ws.on("error", (error) => {
    console.log("error: %s", error.message);
  });

  ws.on("message", (data) => {
    console.log("message", data);
  });
  // ws.on("ping", (data) => {
  //   console.log("ping", data);
  //   ws.pong();
  // });
  // ws.on("pong", (data) => {
  //   console.log("pong", data.toString(), new Date().toLocaleTimeString());
  //   setTimeout(() => ws.ping(), 1000);
  // });

  const remoteIp = req.socket.remoteAddress;
  const remoteIpFromProxy = req.headers["x-forwarded-for"];
  console.log(`Nova conexão! remoteIp: ${remoteIp}, remoteIpFromProxy: ${remoteIpFromProxy}`);
  console.log(`Total de conexões: ${wss.clients.size}`);

  ws.send("connection success");
  // ws.ping();
});

wss.on("listening", () => {
  console.log(`Signaling server em execução: ${PORT}`);
});
