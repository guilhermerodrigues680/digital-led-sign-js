import { SERVERS } from "./config";
import mitt from "mitt";
import ClientSignalingServer from "./ClientSignalingServer";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class PeerWorker {
  /** @type {RTCDataChannel} */
  _dataChannel;
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
    });

    this._PC = new RTCPeerConnection(SERVERS);
    this._PC.onconnectionstatechange = (event) => this._onconnectionstatechange(event);
    this._PC.oniceconnectionstatechange = (event) => this._oniceconnectionstatechange(event);

    // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnectionIceEvent/candidate#value
    this._PC.onicecandidate = (event) => {
      console.log("answer Get candidates for caller, save to db", event.candidate);
      if (event.candidate) {
        // event.candidate.toJSON()
        this._iceCandidates.push(event.candidate);
      } else {
        console.debug("não há mais candidatos para esta sessão de negociação.");
        this._iceCandidatesEnd = true;
        this._emitter.emit("ice-candidates-end", this._iceCandidatesEnd);
      }
    };

    // https://developer.mozilla.org/pt-BR/docs/Web/API/WebRTC_API/Simple_RTCDataChannel_sample
    this._PC.ondatachannel = (event) => {
      this._dataChannel = event.channel;
      console.debug("chanel ondatachannel", this._dataChannel);

      this._dataChannel.onopen = this._dataChannelOpen.bind(this);
      this._dataChannel.onclose = this._dataChannelClose.bind(this);
      this._dataChannel.onmessage = this._dataChannelMessage.bind(this);
      this._dataChannel.onerror = this._dataChannelError.bind(this);
      // this._dataChannel.onbufferedamountlow = (event) => console.debug("onbufferedamountlow", { event });
    };
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
  // Ouvidores de Eventos
  //

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
    console.debug("Data channel message.", { eventData });
    const message = eventData;
    this._emitter.emit("channel-message", { message });
  }

  _dataChannelError(event) {
    console.debug("Data channel error.", { event });
  }

  async answerOffer(offerDescription) {
    await this._PC.setRemoteDescription(new RTCSessionDescription(offerDescription));
    const answerDescription = await this._PC.createAnswer();
    await this._PC.setLocalDescription(answerDescription);

    return new Promise((resolve) => {
      if (this._iceCandidatesEnd) {
        resolve({
          remoteDescription: this._PC.remoteDescription,
          localDescription: this._PC.localDescription,
        });
        return;
      }

      // Se não tem todos os candidatos espera ter todos e retorna
      const iceCandidatesEndHandler = () => {
        this._emitter.off("ice-candidates-end", iceCandidatesEndHandler);
        resolve({
          remoteDescription: this._PC.remoteDescription,
          localDescription: this._PC.localDescription,
        });
      };
      this._emitter.on("ice-candidates-end", iceCandidatesEndHandler);
    });
    // const offerICECallback = (ice) => {
    //   console.debug("offerICECallback called");
    //   PC.addIceCandidate(new RTCIceCandidate(ice));
    // };
  }

  async answerParentOffer(clientId) {
    console.debug("answerParentOffer", clientId);

    // TODO: Aqui não aguarda um id, aguarda na verdade a conexao estável
    // Aguarda um id do servidor de sinalizacao
    while (!this._clientSignalingServerId) {
      await sleep(250);
    }

    const resCallback = async (offerDescription) => {
      this._clientSignalingServer.off("res-get-rtc-session-description-offer", resCallback);
      console.debug(offerDescription);
      const answer = await this.answerOffer(offerDescription);
      this._clientSignalingServer.sendRTCSessionDescriptionAnswer(
        answer.localDescription,
        clientId
      );
    };
    this._clientSignalingServer.on("res-get-rtc-session-description-offer", resCallback);
    this._clientSignalingServer.sendGetClientRTCSessionDescriptionOffer(clientId);
  }

  sendMessage(message) {
    this._dataChannel.send(message);
  }

  destroy() {
    this._emitter.all.clear();
    this._clientSignalingServer.destroy();
  }
}

export default PeerWorker;
