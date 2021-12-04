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
import { peerParent } from "@/services/webrtc";

export default {
  name: "ParentView",

  data: () => ({
    offer: "",
    answer: "",
  }),

  mounted() {
    // peerParent.setupMediaSources();
  },

  methods: {
    async createOffer() {
      let offer;
      try {
        offer = await peerParent.createOffer();
      } catch (error) {
        console.error(error.message);
        return;
      }

      console.debug(offer);
      this.offer = JSON.stringify(offer.offerDescription);
    },

    readAnswer() {
      const answer = JSON.parse(this.answer);
      peerParent.step_4_accept_answer(answer);
    },

    sendText() {
      peerParent.send_text("texto");
    },
  },
};
</script>
