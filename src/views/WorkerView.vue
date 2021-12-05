<template>
  <div>
    <h1>WorkerView</h1>

    <div>
      <h2>Conectar ao pai:</h2>
      <input v-model="parentId" type="text" placeholder="parentId" />
      <button @click="connectToParent()">connectToParent</button>
    </div>
  </div>
</template>

<script>
// JS
import { PeerWorker } from "@/services/webrtc";

export default {
  name: "WorkerView",

  data: () => ({
    /** @type {PeerWorker} */
    peerWorker: null,
    parentId: "",
  }),

  mounted() {
    this.peerWorker = new PeerWorker();
  },

  beforeDestroy() {
    // this.peerWorker && this.peerWorker.destroy();
  },

  methods: {
    connectToParent() {
      this.peerWorker.answerParentOffer(this.parentId);
    },
  },
};
</script>
