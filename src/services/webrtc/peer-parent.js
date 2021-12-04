import { SERVERS } from "./config";
class PeerParent {
  /** @type {RTCDataChannel} */
  _channelG;
  /** @type {RTCPeerConnection} */
  _PC;
  /** @type {Array<RTCIceCandidate>} */
  _iceCandidates = [];

  constructor() {
    this._PC = new RTCPeerConnection(SERVERS);
    this._PC.onconnectionstatechange = (event) => this._onconnectionstatechange(event);
    this._PC.oniceconnectionstatechange = (event) => this._oniceconnectionstatechange(event);
    this._PC.onicecandidate = (event) => {
      console.log("Get candidates for caller, save to db", event.candidate);
      if (event.candidate) {
        // event.candidate.toJSON()
        this._iceCandidates.push(event.candidate);
      } else {
        console.warn("not ice candidate: ", { event });
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
    this._createOffer();
    if (this._iceCandidates.length == 0) {
      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      await sleep(1500);
    }

    return {
      offerDescription: this._PC.localDescription,
    };

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
