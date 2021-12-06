<template>
  <div>
    <h1>ParentView</h1>

    <div>
      <h2>qrcode</h2>
      {{ qrvalueUrl }}

      <canvas ref="qr"></canvas>

      <button @click="createOffer()">createOffer()</button>
    </div>
  </div>
</template>

<script>
// JS
import { PeerParent } from "@/services/webrtc";
// https://medium.com/geekculture/few-ways-to-generate-qr-code-using-javascript-54b6b5220c4f
import qrcodejs from "qrcodejs";
import QRious from "qrious";
console.debug(qrcodejs);
console.debug(QRious);

export default {
  name: "ParentView",

  data: () => ({
    /** @type {Array<PeerParent>} */
    peerParentListFreeze: [null],
    qrious: null,
    qrvalue: null,
  }),

  computed: {
    peerParent() {
      return this.peerParentListFreeze[0];
    },
    qrvalueUrl() {
      const url = new URL(window.location.origin);
      url.hash = `/code/${this.qrvalue}`;
      return url.href;
    },
  },

  mounted() {
    this.qrious = new QRious({ element: this.$refs.qr, value: "" });
    this.peerParentListFreeze = Object.freeze([new PeerParent()]);
    this.peerParent.on("client-id", (clientId) => (this.qrvalue = clientId));
    this.createOffer();
  },

  beforeDestroy() {
    this.peerParent && this.peerParent.destroy();
  },

  watch: {
    qrvalue() {
      this.qrious.value = this.qrvalueUrl;
    },
  },

  methods: {
    async createOffer() {
      let offerDescription;
      try {
        offerDescription = await this.peerParent.getOffer();
      } catch (error) {
        console.error(error.message);
        return;
      }

      console.debug(offerDescription);
    },
  },
};
</script>
