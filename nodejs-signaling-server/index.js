import { customAlphabet } from "nanoid";
import { WebSocketServer } from "ws";

const alphabet = "abcdefghijklmnopqrstuvwxyz";
const nanoid = customAlphabet(alphabet, 4);
const db = {
  offers: {}, // mapa: clientID -> offer
  // answers: {},// mapa: clientID -> answer
};

const PORT = 8989;
const wss = new WebSocketServer({ port: PORT, path: "/ws/signaling-server" });

wss.on("connection", (ws, req) => {
  const clientData = {
    clientId: nanoid(),
  };

  ws.on("close", (code, reason) => {
    console.log("close code: %s, code: %s", code, reason);
  });

  ws.on("error", (error) => {
    console.log("error: %s", error.message);
  });

  ws.on("message", (eventData) => {
    console.debug("%s eventData:", clientData.clientId, eventData);

    let message = { type: "", data: {} };
    try {
      message = JSON.parse(eventData);
    } catch (error) {
      console.warn("Erro mensagem não JSON: ", eventData);
      return;
    }

    console.debug("%s message:", clientData.clientId, message);
    switch (message.type) {
      case "rtc-session-description-offer":
        db.offers[clientData.clientId] = message.data;
        break;
      default:
        console.warn("%s message desconhecida:", clientData.clientId, message);
        break;
    }
    console.dir(db);
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
  console.log(
    `${new Date().toLocaleTimeString()} Nova conexão! clientId: ${
      clientData.clientId
    } remoteIp: ${remoteIp}, remoteIpFromProxy: ${remoteIpFromProxy}`
  );
  console.log(`Total de conexões: ${wss.clients.size}`);

  ws.send(
    JSON.stringify({
      type: "client-id",
      data: clientData.clientId,
    })
  );
  // ws.ping();
});

wss.on("listening", () => {
  console.log(`Signaling server em execução: ${PORT}`);
});
