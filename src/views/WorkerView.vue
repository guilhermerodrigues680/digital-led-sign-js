<template>
  <div>
    <h1>WorkerView</h1>

    <!-- <div>
      <h2>Conectar ao pai:</h2>
      <input v-model="parentId" type="text" placeholder="parentId" />
      <button @click="connectToParent()">connectToParent</button>
    </div> -->

    <div v-show="!parentId" id="123456789-reader" width="600px"></div>

    <div>
      {{ parentId }}
    </div>
  </div>
</template>

<script>
// JS
import { PeerWorker } from "@/services/webrtc";
import { Html5Qrcode } from "html5-qrcode";

export default {
  name: "WorkerView",

  // props: {
  //   parentId: String,
  // },

  data: () => ({
    /** @type {PeerWorker} */
    peerWorker: null,
    parentId: "",
    /** @type {Html5Qrcode} */
    html5QrCode: null,
  }),

  // VUE ROUTER
  beforeRouteUpdate(to, from, next) {
    console.debug(
      "beforeRouteUpdate",
      this.parentId,
      this.$route.params.parentId,
      to.params.parentId
    );
    next();
  },

  created() {
    console.debug("created", this.parentId, this.$route.params.parentId);
  },

  mounted() {
    this.peerWorker = new PeerWorker();

    const onScanSuccess = (decodedText, decodedResult) => {
      console.log(`Code matched = ${decodedText}`, decodedResult);
      this.html5QrCode.stop();
      // ex: https://192.168.2.104:8080/#/code/rxiq
      this.parentId = decodedText.split("/code/").pop();
      this.connectToParent();
    };
    const onScanFailure = (errorMessage, error) => {
      if (!errorMessage.includes("NotFoundException")) {
        console.error(errorMessage, error);
      }
    };
    this.html5QrCode = new Html5Qrcode("123456789-reader");
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    this.html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess, onScanFailure);
  },

  updated() {
    console.debug("updated", this.parentId);
  },

  beforeDestroy() {
    // this.peerWorker && this.peerWorker.destroy();
    this.html5QrCode.stop();
  },

  methods: {
    connectToParent() {
      this.peerWorker.answerParentOffer(this.parentId);
    },
  },
};
</script>
