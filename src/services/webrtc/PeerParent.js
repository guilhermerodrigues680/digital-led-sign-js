import { SERVERS } from "./config";
import mitt from "mitt";

class PeerParent {
  /** @type {RTCDataChannel} */
  _channelG;
  /** @type {RTCPeerConnection} */
  _PC;
  /** @type {Array<RTCIceCandidate>} */
  _iceCandidates = [];
  _iceCandidatesEnd = false;
  _emitter;

  constructor() {
    this._emitter = mitt();
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

    this._channelG = this._PC.createDataChannel("data");
    this._channelG.onopen = (event) => console.log("onopen", event);
    this._channelG.onmessage = (event) => console.log("onmessage", event);
    this._channelG.onclose = (event) => console.debug("onclose", { event });
    this._channelG.onerror = (event) => console.debug("onerror", { event });
    this._channelG.onbufferedamountlow = (event) => console.debug("onbufferedamountlow", { event });
  }

  // Ouvidores de Eventos
  _onconnectionstatechange(event) {
    console.log("onconnectionstatechange", { event }, this._PC.connectionState);
  }
  _oniceconnectionstatechange(event) {
    console.log("oniceconnectionstatechange", { event }, this._PC.iceConnectionState);
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

    return new Promise((resolve) => {
      // Se já tem todos os candidatos retorna
      if (this._iceCandidatesEnd) {
        resolve(this._PC.localDescription);
        return;
      }

      // Se não tem todos os candidatos espera ter todos e retorna
      const iceCandidatesEndHandler = () => {
        this._emitter.off("ice-candidates-end", iceCandidatesEndHandler);
        resolve(this._PC.localDescription);
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

  send_text(text) {
    this._channelG.send(text);
  }
}

export default PeerParent;
