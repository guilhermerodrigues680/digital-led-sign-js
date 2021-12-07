<template>
  <div v-if="peerConnState.connectionState != 'connected'" class="parent-view">
    <h1>ParentView</h1>
    <div>
      {{ peerConnState }}
    </div>

    <div>
      <h2>qrcode</h2>

      <div v-show="qrvalue">
        <canvas ref="qr"></canvas>
        <div>
          Passos:
          <ol>
            <li>Escanei o código acima com seu celular</li>
            <li>Caso seu celular não leia qrcode, acesse nossa página para leitura do qrcode</li>
            <li>
              Caso seu dispositivo não possua uma camera, acesse o link a partir do seu celular:
              <a :href="qrvalueUrl" target="_blank">{{ qrvalueUrl }}</a>
            </li>
          </ol>
        </div>
      </div>
      <div v-show="!qrvalue">Obtendo codigo...</div>
    </div>

    <div>
      workerMessage:
      {{ workerMessage }}
    </div>
  </div>
  <div v-else class="digital-led-sign__wrapper">
    <div ref="digitalLedSign" class="digital-led-sign">
      {{ workerMessage }}
      <!-- Minha mensagem longa 1233 ola mundo 1234 -->
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
    peerConnState: {},
    qrious: null,
    qrvalue: null,
    workerMessage: "",
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
    this.peerParent.on("connection-state-change", (connState) => (this.peerConnState = connState));
    this.peerParent.on("channel-message", this.channelMessageHandler);
    this.createOffer();

    // this.$refs.digitalLedSign.addEventListener(
    //   "animationiteration",
    //   this.digitalLedSignAnimationendHandler
    // );
    // this.$once("hook:beforeDestroy", () => {
    //   this.$refs.digitalLedSign.removeEventListener(
    //     "animationiteration",
    //     this.digitalLedSignAnimationendHandler
    //   );
    // });
  },

  beforeDestroy() {
    this.peerParent.destroy();
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

    channelMessageHandler(data) {
      console.debug(data, this);
      this.workerMessage = data.message;
      this.sendMessage("OK! Recebi a mensagem!");
    },

    sendMessage(message) {
      this.peerParent.sendMessage(message);
    },

    digitalLedSignAnimationendHandler(event) {
      console.debug(event.type);
    },
  },
};
</script>

<style lang="scss" scoped>
.parent-view {
  margin-left: 2rem;
}

.digital-led-sign__wrapper {
  min-height: 100vh;
  background: #000000;
  position: relative;
  overflow: hidden;

  .digital-led-sign {
    // https://stackoverflow.com/questions/40789222/css-animate-scrolling-text-using-text-indent
    position: absolute;
    display: block;
    white-space: nowrap;
    top: 30%;
    left: 100%;
    font-family: "Texas LED";
    color: #ffffff;
    animation: floatText 2s infinite linear;
    // font-size: calc((100vh / 1rem) * 0.5);
    font-size: 10rem;

    @keyframes floatText {
      to {
        transform: translateX(calc(-100vw - 100%));
      }
    }
  }
}
</style>
