<template>
  <div class="container">
    <div><img class="logo" src="static/logo.png"/></div>
    <div class="message">
      2017 Stand Scouting
    </div>
    <div class="mshadow button" @click="callback">
      Sign in with Google
    </div>
    <div class='errormessage'>
      {{errorMessage}}
    </div>
  </div>
</template>

<script>
export default {
  name: 'signinpage',
  props: ['callback', 'errorMessage'],
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
.logo {
  width: 250px;
  height: auto;
}
.message {
  color: #fff;
  margin-top: -0.5rem;
  font-size: 1.5rem;
  padding-left: 50px;
  padding-right: 50px;
  text-align: center;
  max-width: 700px;
}
.errormessage {
  color: white;
  margin-top: 22px;
  max-width: 500px;
  padding-left: 50px;
  padding-right: 50px;
  text-align: center;
}
.button {
  background-color: #4d83c4;
  height: 40px;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  width: 220px;
  border-radius: 20px;
  user-select: none;
  cursor: pointer;
  cursor: hand;
}
.button:active {
  background-color: #3e77bb;
}
</style>
