<template>
  <div class="container">
    <div class="loader">
      <img class="logo" src="static/logo.png"/>
      <div class="inner"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'loader',
  data() {
    return {
    }
  }
}
</script>

<style scoped>
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column nowrap;
}
.loader {
  width: 250px;
  border-radius: 100%;
  height: 250px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 4px solid #1583bd;
}
.inner {
  width: 70px;
  height: 260px;
  z-index: 1;
  position: absolute;
  background-color: #0a2634;
  animation: rotate 1.5s ease infinite;
  will-change: transform;
}
.logo {
  width: auto;
  z-index: 2;
  height: 200px;
}
</style>
