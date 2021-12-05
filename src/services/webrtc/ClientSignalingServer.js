const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class ClientSignalingServer {
  _url;
  /** @type {WebSocket} */
  _ws = null;
  _destroyed = false;

  constructor() {
    this._url = "ws://localhost:8989/ws/signaling-server";
    this._tryConection();
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
    const { data } = event;
    console.debug("[ClientSignalingServer] message:", { data });
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

  destroy() {
    console.debug("ClientSignalingServer destroy");
    this._destroyed = true;
    this._closeConection();
  }
}

export default ClientSignalingServer;
