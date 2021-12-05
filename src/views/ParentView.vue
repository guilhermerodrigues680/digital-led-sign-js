<template>
  <div>
    <h1>ParentView</h1>

    <div>
      <h2>qrcode</h2>
      {{ qrcode }}
    </div>
  </div>
</template>

<script>
// JS
import { PeerParent } from "@/services/webrtc";

export default {
  name: "ParentView",

  data: () => ({
    /** @type {Array<PeerParent>} */
    peerParentListFreeze: [null],
    qrcode: "",
  }),

  computed: {
    peerParent() {
      return this.peerParentListFreeze[0];
    },
  },

  mounted() {
    this.peerParentListFreeze = Object.freeze([new PeerParent()]);
    console.debug(this.peerParent);
    this.peerParent.on("client-id", (clientId) => {
      this.qrcode = clientId;
    });
    this.createOffer();
  },

  beforeDestroy() {
    this.peerParent && this.peerParent.destroy();
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
