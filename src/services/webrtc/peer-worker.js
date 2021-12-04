import { PC } from "./config";

// let channelG;

PC.ondatachannel = (event) => {
  console.log("ondatachannel", "Data channel is created!");
  const { channel } = event;
  // channelG = channel;
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

PC.onconnectionstatechange = (event) => {
  event;
  //document.getElementById("connectionState").innerText = PC.connectionState;
  console.log("onconnectionstatechange", PC.connectionState);
};

PC.oniceconnectionstatechange = (event) => {
  event;
  //document.getElementById("iceConnectionState").innerText = PC.iceConnectionState;
  console.log("oniceconnectionstatechange", PC.iceConnectionState);
};

/**
 *
 * @param {string} offerDescription
 */
async function answerOffer(offerDescription) {
  PC.onicecandidate = (event) => {
    console.debug("answerCall caller", event.candidate);
    // event.candidate.toJSON()
  };

  await PC.setRemoteDescription(new RTCSessionDescription(offerDescription));

  const answerDescription = await PC.createAnswer();
  await PC.setLocalDescription(answerDescription);

  // const offerICECallback = (ice) => {
  //   console.debug("offerICECallback called");
  //   PC.addIceCandidate(new RTCIceCandidate(ice));
  // };

  console.debug(answerDescription);
  return { answerDescription };
}

export default { answerOffer };
