<template>
  <div>
    <h1>ParentView</h1>

    <div>
      <h2>Criar uma oferta</h2>
      <button @click="createOffer()">criar oferta</button>
      <textarea readonly :disabled="!offer" v-model="offer"></textarea>
    </div>

    <div>
      <h2>Ler uma resposta</h2>
      <textarea v-model="answer"></textarea>
      <button @click="readAnswer()">ler resposta</button>
    </div>

    <button @click="sendText()">Send text</button>
  </div>
</template>

<script>
// JS
import { PeerParent } from "@/services/webrtc";

export default {
  name: "ParentView",

  data: () => ({
    offer: "",
    answer: "",
    /** @type {Array<PeerParent>} */
    peerParentListFreeze: [null],
  }),

  computed: {
    peerParent() {
      return this.peerParentListFreeze[0];
    },
  },

  mounted() {
    this.peerParentListFreeze = Object.freeze([new PeerParent()]);
    console.debug(this.peerParent);
  },

  beforeDestroy() {
    // this.peerParent && this.peerParent.destroy();
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
      this.offer = JSON.stringify(offerDescription);
    },

    readAnswer() {
      const answer = JSON.parse(this.answer);
      this.peerParent.step_4_accept_answer(answer);
    },

    sendText() {
      this.peerParent.send_text("texto");
    },
  },
};
</script>
