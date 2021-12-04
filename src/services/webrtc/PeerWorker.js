import { SERVERS } from "./config";
import mitt from "mitt";

class PeerWorker {
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
    this._PC.ondatachannel = (event) => {
      console.log("ondatachannel", "Data channel is created!");
      const { channel } = event;
      this._channelG = channel;
      console.debug("chanel ondatachannel", channel);

      channel.onopen = (event) => {
        console.log("Data channel is open and ready to be used.");
        console.log("onopen", event);
      };

      channel.onmessage = (event) => {
        console.log("onmessage", event);
        //alert(event.data);
      };
    };

    // this._channelG = this._PC.createDataChannel("data");
    // this._channelG.onopen = (event) => console.log("onopen", event);
    // this._channelG.onmessage = (event) => console.log("onmessage", event);
    // this._channelG.onclose = (event) => console.debug("onclose", { event });
    // this._channelG.onerror = (event) => console.debug("onerror", { event });
    // this._channelG.onbufferedamountlow = (event) => console.debug("onbufferedamountlow", { event });
  }

  // Ouvidores de Eventos
  _onconnectionstatechange(event) {
    console.log("onconnectionstatechange", { event }, this._PC.connectionState);
  }
  _oniceconnectionstatechange(event) {
    console.log("oniceconnectionstatechange", { event }, this._PC.iceConnectionState);
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
}

export default PeerWorker;
