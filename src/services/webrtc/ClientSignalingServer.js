import mitt from "mitt";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class ClientSignalingServer {
  _url;
  _emitter;
  /** @type {WebSocket} */
  _ws = null;
  _destroyed = false;

  constructor() {
    this._url = "ws://localhost:8989/ws/signaling-server";
    this._emitter = mitt();
    this._tryConection();
  }

  //
  // Atributos get/set
  //

  get on() {
    return this._emitter.on;
  }

  get off() {
    return this._emitter.off;
  }

  //
  // Método Privados
  //

  async _tryConection() {
    let connected = false;
    while (!connected && !this._destroyed) {
      try {
        console.debug("[ClientSignalingServer] Tentando conectar");
        await this.connect();
        connected = true;
      } catch (error) {
        console.debug("[ClientSignalingServer] Erro:", error.message);
        await sleep(1000);
      }
    }
  }

  _closeConection() {
    if (this._ws instanceof WebSocket) {
      // Remove todos os listeners
      this._ws.onclose = null;
      this._ws.onopen = null;
      this._ws.onerror = null;
      this._ws.onmessage = null;
      this._ws.close();
    }
    this._ws = null;
  }

  _openHandler() {
    console.debug("[ClientSignalingServer] conectado!");
  }

  _closeHandler(event) {
    const { code, reason } = event;
    console.debug(`[ClientSignalingServer] close. Code ${code}, reason '${reason}'`);
    this._closeConection();
    this._tryConection();
  }

  _messageHandler(event) {
    const { data: eventData } = event;
    console.debug("[ClientSignalingServer] eventData:", { eventData });

    let message = { type: "", data: {} };
    try {
      message = JSON.parse(eventData);
    } catch (error) {
      console.warn("Erro mensagem não JSON: ", eventData);
      return;
    }

    console.debug("[ClientSignalingServer] message:", message);
    switch (message.type) {
      case "client-id":
        this._emitter.emit("client-id", message.data);
        break;
      case "res-get-rtc-session-description-offer":
        this._emitter.emit("res-get-rtc-session-description-offer", message.data);
        break;
      case "rtc-session-description-answer":
        this._emitter.emit("rtc-session-description-answer", message.data);
        break;
      default:
        console.warn("[ClientSignalingServer] messagem desconhecida:", message);
        break;
    }
  }

  _errorHandler(event) {
    console.debug("[ClientSignalingServer] ws error", { event });
  }

  //
  // Método Públicos
  //

  connect() {
    return new Promise((resolve, reject) => {
      if (this._ws instanceof WebSocket && this._ws.readyState === WebSocket.OPEN) {
        resolve();
        console.debug("_ws já está conectado");
        return;
      }
      this._closeConection();

      // Primeiro cria uma instancia de um WebSocket
      // Em seguida ouve os eventos open e close
      // O que chegar primeiro conclui a promise

      const ws = new WebSocket(this._url);
      ws.onopen = (wsOpenEvent) => {
        this._ws = ws;
        this._ws.onopen = (event) => this._openHandler(event);
        this._ws.onclose = (event) => this._closeHandler(event);
        this._ws.onmessage = (event) => this._messageHandler(event);
        this._ws.onerror = (event) => this._errorHandler(event);
        this._openHandler(wsOpenEvent);
        resolve();
      };

      ws.onerror = () => {
        reject(new Error(`WebSocket connection to ${ws.url} failed`));
      };
    });
  }

  sendRTCSessionDescriptionOffer(data) {
    const message = {
      type: "rtc-session-description-offer",
      data,
    };
    this._ws.send(JSON.stringify(message));
  }

  sendRTCSessionDescriptionAnswer(rtcSessionDescriptionAnswer, clientIdOffer) {
    const message = {
      type: "rtc-session-description-answer",
      data: { rtcSessionDescriptionAnswer, clientIdOffer },
    };
    this._ws.send(JSON.stringify(message));
  }

  sendGetClientRTCSessionDescriptionOffer(clientId) {
    const message = {
      type: "get-rtc-session-description-offer",
      data: { clientId },
    };
    this._ws.send(JSON.stringify(message));
  }

  destroy() {
    console.debug("ClientSignalingServer destroy");
    this._destroyed = true;
    this._closeConection();
  }
}

export default ClientSignalingServer;
