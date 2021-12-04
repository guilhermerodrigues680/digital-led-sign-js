<template>
  <div>
    <h1>WorkerView</h1>

    <div>
      <h2>Criar uma resposta</h2>
      <textarea placeholder="offer" v-model="offer"></textarea>
      <button @click="createAnswer()">criar reposta</button>
    </div>

    <textarea placeholder="workerOffer" v-model="workerOffer"></textarea>
  </div>
</template>

<script>
// JS
import { PeerWorker } from "@/services/webrtc";

export default {
  name: "WorkerView",

  data: () => ({
    workerOffer: "",
    offer: "",
    /** @type {PeerWorker} */
    peerWorker: null,
  }),

  mounted() {
    this.peerWorker = new PeerWorker();
  },

  methods: {
    async createAnswer() {
      const offerDescription = JSON.parse(this.offer);
      const answer = await this.peerWorker.answerOffer(offerDescription);
      this.workerOffer = JSON.stringify(answer.localDescription);
    },
  },
};
</script>
