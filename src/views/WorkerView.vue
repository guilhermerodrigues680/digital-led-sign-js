<template>
  <div>
    <h1>WorkerView</h1>

    <!-- <div>
      <h2>Conectar ao pai:</h2>
      <input v-model="scannedParentId" type="text" placeholder="scannedParentId" />
      <button @click="connectToParent()">connectToParent</button>
    </div> -->

    <div v-show="!scannedParentId" id="123456789-reader" width="600px"></div>

    <div>
      {{ peerConnState }}
    </div>

    <div>
      {{ scannedParentId }}
    </div>

    <form @submit.prevent="formSendMessageSubmit($event)">
      <input name="message" type="text" />
      <button>Enviar mensagem</button>
    </form>

    <div>
      parentMessage:
      {{ parentMessage }}
    </div>
  </div>
</template>

<script>
// JS
import { PeerWorker } from "@/services/webrtc";
import { Html5Qrcode } from "html5-qrcode";

export default {
  name: "WorkerView",

  props: {
    parentId: String,
  },

  data: () => ({
    /** @type {PeerWorker} */
    peerWorker: null,
    peerConnState: {},
    scannedParentId: null,
    /** @type {Html5Qrcode} */
    html5QrCode: null,
    parentMessage: "",
  }),

  created() {
    this.peerWorker = new PeerWorker();
    this.peerWorker.on("connection-state-change", (connState) => (this.peerConnState = connState));
    this.peerWorker.on("channel-message", this.channelMessageHandler);
    if (this.validateParentId(this.parentId)) {
      this.scannedParentId = this.parentId;
    } else {
      console.error("created parentId inválido");
    }
    console.debug("created", this.scannedParentId);
  },

  mounted() {
    this.html5QrCode = new Html5Qrcode("123456789-reader");
    if (!this.scannedParentId) {
      // TODO: Detectar se o disposivo possui essa camera
      const html5QrCodeConfig = { fps: 10, qrbox: { width: 250, height: 250 } };
      this.html5QrCode.start(
        { facingMode: "environment" },
        html5QrCodeConfig,
        this.onScanSuccess,
        this.onScanFailure
      );
    } else {
      this.connectToParent();
    }
  },

  beforeDestroy() {
    this.peerWorker.destroy();
    if (this.html5QrCode.isScanning) {
      console.debug("this.html5QrCode.stop()");
      this.html5QrCode.stop();
    } else {
      console.debug("not stop. html5QrCode não está em execução.");
    }
  },

  methods: {
    connectToParent() {
      this.peerWorker.answerParentOffer(this.scannedParentId);
    },

    /**
     * @param {string} url ex: https://site.com/#/code/rxiq
     * @returns ex: rxiq
     * @throws url invalida
     */
    extractParentIdFromUrl(url) {
      const regexParentId = /\/(?<parentid>[A-Za-z0-9]+)$/;
      const regexExecRes = regexParentId.exec(url);
      if (!regexExecRes) {
        throw new Error("url não contém um parentId");
      }

      const { parentid } = regexExecRes.groups;
      if (!this.validateParentId(parentid)) {
        throw new Error("url não contém um parentId válido");
      }

      return parentid;
    },

    /**
     * @param {string} parentId string
     * @returns ex: rxiq
     */
    validateParentId(parentId) {
      if (!parentId) {
        return false;
      }
      const regexParentId = /^[a-z]+$/;
      return regexParentId.test(parentId);
    },

    onScanSuccess(decodedText, decodedResult) {
      console.log(`Code matched = ${decodedText}`, decodedResult);

      this.html5QrCode.stop();
      try {
        this.scannedParentId = this.extractParentIdFromUrl(decodedText);
        this.connectToParent();
        alert(`Code matched = ${this.scannedParentId}`);
      } catch (error) {
        console.error(error);
        alert(`Code matched = ${decodedText} inválido`);
      }
    },

    onScanFailure(errorMessage, error) {
      if (!errorMessage.includes("NotFoundException")) {
        console.error(errorMessage, error);
      }
    },

    formSendMessageSubmit(event) {
      /** @type {HTMLFormElement} */
      const form = event.target;

      this.peerWorker.sendMessage(form.elements.message.value);
    },

    channelMessageHandler(data) {
      console.debug(data, this);
      this.parentMessage = data.message;
    },
  },
};
</script>
