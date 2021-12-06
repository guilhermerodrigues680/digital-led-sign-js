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
      {{ scannedParentId }}
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
    scannedParentId: null,
    /** @type {Html5Qrcode} */
    html5QrCode: null,
  }),

  created() {
    this.peerWorker = new PeerWorker();
    if (this.validateParentId(this.parentId)) {
      this.scannedParentId = this.parentId;
    } else {
      console.error("created parentId inválido");
    }
    console.debug("created", this.scannedParentId);
  },

  mounted() {
    this.html5QrCode = new Html5Qrcode("123456789-reader");
    const html5QrCodeConfig = { fps: 10, qrbox: { width: 250, height: 250 } };
    if (!this.scannedParentId) {
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
    // this.peerWorker && this.peerWorker.destroy();
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
  },
};
</script>
