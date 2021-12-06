import { SERVERS } from "./config";
import mitt from "mitt";
import ClientSignalingServer from "./ClientSignalingServer";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class PeerParent {
  /** @type {RTCDataChannel} */
  _channelG;
  /** @type {RTCPeerConnection} */
  _PC;
  /** @type {Array<RTCIceCandidate>} */
  _iceCandidates = [];
  _iceCandidatesEnd = false;
  _emitter;
  /** @type {ClientSignalingServer} */
  _clientSignalingServer;
  /** @type {string} */
  _clientSignalingServerId = null;

  constructor() {
    this._emitter = mitt();
    this._clientSignalingServer = new ClientSignalingServer();
    this._clientSignalingServer.on("client-id", (clientId) => {
      this._clientSignalingServerId = clientId;
      this._emitter.emit("client-id", this._clientSignalingServerId);
    });
    this._clientSignalingServer.on("rtc-session-description-answer", (answerDescription) => {
      this.step_4_accept_answer(answerDescription);
    });

    this._PC = new RTCPeerConnection(SERVERS);
    this._PC.onconnectionstatechange = (event) => this._onconnectionstatechange(event);
    this._PC.oniceconnectionstatechange = (event) => this._oniceconnectionstatechange(event);

    // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnectionIceEvent/candidate#value
    this._PC.onicecandidate = (event) => {
      console.log("Get candidates for caller, save to db", event.candidate);
      if (event.candidate) {
        // event.candidate.toJSON()
        this._iceCandidates.push(event.candidate);
      } else {
        console.debug("não há mais candidatos para esta sessão de negociação.");
        this._iceCandidatesEnd = true;
        this._emitter.emit("ice-candidates-end", this._iceCandidatesEnd);
      }
    };

    this._channelG = this._PC.createDataChannel("digitalledsignchannel");
    this._channelG.onopen = this._dataChannelOpen.bind(this);
    this._channelG.onmessage = this._dataChannelMessage.bind(this);
    this._channelG.onclose = this._dataChannelClose.bind(this);
    this._channelG.onerror = this._dataChannelError.bind(this);
    this._channelG.onbufferedamountlow = (event) => console.debug("onbufferedamountlow", { event });
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

  // Ouvidores de Eventos
  _onconnectionstatechange() {
    const { connectionState, iceConnectionState } = this._PC;
    console.log("Connection state change", connectionState, iceConnectionState);
    this._emitter.emit("connection-state-change", { connectionState, iceConnectionState });
  }

  _oniceconnectionstatechange() {
    const { connectionState, iceConnectionState } = this._PC;
    console.log("ICE connection state change", connectionState, iceConnectionState);
    this._emitter.emit("connection-state-change", { connectionState, iceConnectionState });
  }

  _dataChannelOpen() {
    console.debug("Data channel is open.");
  }

  _dataChannelClose() {
    console.debug("Data channel is close.");
  }

  _dataChannelMessage(event) {
    const { data: eventData } = event;
    console.debug("Data channel message.", { eventData, this: this });
    const message = eventData;
    this._emitter.emit("channel-message", { message });
  }

  _dataChannelError(event) {
    console.debug("Data channel error.", { event });
  }

  async _createOffer() {
    console.debug("_createOffer");
    if (this._PC.localDescription) {
      return this._PC.localDescription;
    }
    const offerDescription = await this._PC.createOffer();
    await this._PC.setLocalDescription(offerDescription);
  }

  async getOffer() {
    await this._createOffer();

    // TODO: Aqui não aguarda um id, guarda na verdade a conexao estável
    // Aguarda um id do servidor de sinalizacao
    while (!this._clientSignalingServerId) {
      await sleep(250);
    }

    return new Promise((resolve) => {
      // Se já tem todos os candidatos retorna
      if (this._iceCandidatesEnd) {
        resolve(this._PC.localDescription);
        this._clientSignalingServer.sendRTCSessionDescriptionOffer(this._PC.localDescription);
        return;
      }

      // Se não tem todos os candidatos espera ter todos e retorna
      const iceCandidatesEndHandler = () => {
        this._emitter.off("ice-candidates-end", iceCandidatesEndHandler);
        resolve(this._PC.localDescription);
        this._clientSignalingServer.sendRTCSessionDescriptionOffer(this._PC.localDescription);
      };
      this._emitter.on("ice-candidates-end", iceCandidatesEndHandler);
    });

    // const answeredCallback = (answer) => {
    //   console.debug("answeredCallback");
    //   if (!this._PC.currentRemoteDescription) {
    //     const answerDescription = new RTCSessionDescription(answer);
    //     this._PC.setRemoteDescription(answerDescription);
    //   }
    // };

    // const answeredICECallback = (ice) => {
    //   console.debug("answeredICECallback");
    //   const candidate = new RTCIceCandidate(ice);
    //   this._PC.addIceCandidate(candidate);
    // };
  }

  async step_4_accept_answer(answer) {
    //const answer = JSON.parse(getInputAnswerText());
    const answerDescription = new RTCSessionDescription(answer);
    await this._PC.setRemoteDescription(answerDescription);
    console.debug("step_4_accept_answer OK!");
  }

  sendMessage(message) {
    this._channelG.send(message);
  }

  destroy() {
    this._emitter.all.clear();
    this._clientSignalingServer.destroy();
  }
}

export default PeerParent;
