<template>
  <div class="home">
    <div>
      <router-link to="/parent">Principal</router-link>
      <router-link to="/worker">Operário</router-link>
    </div>
    Modo Manual
    <div>
      <router-link to="/manual/parent">Principal</router-link>
      <router-link to="/manual/worker">Operário</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: "Home",
};
</script>
