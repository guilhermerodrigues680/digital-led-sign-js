<template>
  <div>
    <h1>ParentView</h1>

    <div>
      <h2>qrcode</h2>

      <div>
        <div v-show="qrvalue">
          <canvas ref="qr"></canvas>
          <div>
            Passos:
            <ol>
              <li>Escanei o código acima com seu celular</li>
              <li>Caso seu celular não leia qrcode, acesse nossa página para leitura do qrcode</li>
              <li>
                Caso seu dispositivo não possua uma camera, acesse o link a partir do seu celular:
                {{ qrvalueUrl }}
              </li>
            </ol>
          </div>
        </div>
        <div v-show="!qrvalue">Obtendo codigo...</div>
      </div>

      <button @click="createOffer()">createOffer()</button>
    </div>
  </div>
</template>

<script>
// JS
import { PeerParent } from "@/services/webrtc";
// https://medium.com/geekculture/few-ways-to-generate-qr-code-using-javascript-54b6b5220c4f
import QRious from "qrious";
console.debug(QRious);

export default {
  name: "ParentView",

  data: () => ({
    /** @type {PeerParent} */
    peerParent: null,
    qrious: null,
    qrvalue: null,
  }),

  computed: {
    qrvalueUrl() {
      const url = new URL(window.location.origin);
      url.pathname = `/code/${this.qrvalue}`;
      return url.href;
    },
  },

  mounted() {
    this.qrious = new QRious({ element: this.$refs.qr, value: "" });
    this.peerParent = new PeerParent();
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
