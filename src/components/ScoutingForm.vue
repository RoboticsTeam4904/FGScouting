<template>
  <div class="container">
    <div class="error">Unimplemented</div>
    <div class="button mshadow" @click="signOut">Sign Out</div>
  </div>
</template>

<script>
export default {
  name: 'scoutingform',
  props: ['signOut'],
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
  font-size: 2rem;
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
.button {
  background-color: #4d83c4;
  height: 40px;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  user-select: none;
  width: 220px;
  border-radius: 20px;
  cursor: pointer;
  cursor: hand;
}
.button:active {
  background-color: #3e77bb;
}
</style>
