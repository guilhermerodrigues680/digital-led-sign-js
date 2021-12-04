import { PC } from "./config";

// let localStream = null;
// let remoteStream = null;
let channelG;

PC.ondatachannel = (event) => {
  console.log("ondatachannel", "Data channel is created!");
  const { channel } = event;
  channelG = channel;
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

// async function setupMediaSources() {
//   // Pergunta ao navegador se há acesso a câmera
//   localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//   console.debug(localStream);
//   remoteStream = new MediaStream();

//   // Push tracks from local stream to peer PC
//   // As tracks são o video e o audio
//   localStream.getTracks().forEach((track) => {
//     PC.addTrack(track, localStream);
//   });

//   // Pull tracks from remote stream, add to video stream
//   PC.ontrack = (event) => {
//     console.debug("PC.ontrack", event);
//     event.streams[0].getTracks().forEach((track) => {
//       remoteStream.addTrack(track);
//     });
//   };

//   return {
//     localStream,
//     remoteStream,
//   };
// }

function createOffer() {
  return new Promise((resolve) => {
    let offerDescription;
    // TODO
    const callId = "xxxxx";
    console.debug("callId", callId);

    const channel = PC.createDataChannel("data");
    channelG = channel;
    console.debug("chanel createOffer", channel);

    channel.onopen = (event) => {
      console.log("onopen", event);
    };

    channel.onmessage = (event) => {
      console.log("onmessage", event);
    };

    // Get candidates for caller, save to db
    PC.onicecandidate = (event) => {
      console.log("Get candidates for caller, save to db", event.candidate);
      // event.candidate.toJSON()
      resolve({ offerDescription });
    };

    // Create offer
    PC.createOffer()
      .then((offerDesc) => {
        offerDescription = offerDesc;
        PC.setLocalDescription(offerDesc)
          .then((res) => console.debug(res))
          .catch((err) => console.error(err));
      })
      .catch((err) => console.error(err));

    // const answeredCallback = (answer) => {
    //   console.debug("answeredCallback");
    //   if (!PC.currentRemoteDescription) {
    //     const answerDescription = new RTCSessionDescription(answer);
    //     PC.setRemoteDescription(answerDescription);
    //   }
    // };

    // const answeredICECallback = (ice) => {
    //   console.debug("answeredICECallback");
    //   const candidate = new RTCIceCandidate(ice);
    //   PC.addIceCandidate(candidate);
    // };

    // return {
    //   callId,
    //   offerDescription,
    //   answeredCallback,
    //   answeredICECallback,
    // };
  });
}

function step_4_accept_answer(answer) {
  //const answer = JSON.parse(getInputAnswerText());
  const answerDescription = new RTCSessionDescription(answer);
  PC.setRemoteDescription(answerDescription)
    .then((res) => console.debug("step_4_accept_answer OK!", res))
    .catch((err) => console.error("step_4_accept_answer err", err));
}

function send_text(text) {
  // const text = getChatMsg();
  // addMsgInChatHistory(text);
  channelG.send(text);
}

export default {
  // setupMediaSources,
  createOffer,
  send_text,
  step_4_accept_answer,
};
