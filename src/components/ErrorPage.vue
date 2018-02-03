<template>
  <div class="container">
    <div class="error">Error</div>
    <div class="message">
      {{text}}
    </div>
  </div>
</template>

<script>
export default {
  name: 'errorpage',
  props: ['text'],
  data() {
    return {
    }
  }
}
</script>

<style scoped>
.container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column nowrap;
}
.error {
  color: #fff;
  text-transform: uppercase;
  font-size: 3rem;
  margin-bottom: 1rem;
}
.message {
  color: #fff;
  font-size: 1.5rem;
  padding-left: 50px;
  padding-right: 50px;
  text-align: center;
  max-width: 700px;
}
</style>
