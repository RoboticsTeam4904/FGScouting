<template>
  <div class="container">
    <div class="navbar static mshadow"><div class="button" @click="signOut">Sign Out</div><div class="networkstatus">{{networkStatus ? null : 'Offline'}}</div></div>
    <div class="form mshadow static">
      <div class="forminner">
        <div class="heading">Team 4904 Field Scouting</div>
        <FormField v-for="question in questions" :data="question" :failed="failed.indexOf(question)!=-1" :key="question[1]" @input="(value) => { set(question[1], value) }"></FormField>
        <div class="center"><div class="submit" @click="submit">Submit</div></div>
      </div>
    </div>
  </div>
</template>

<script>
import FormField from './FormField'

export default {
  name: 'scoutingform',
  props: ['signOut', 'questions','networkStatus'],
  components: {FormField},
  data() {
    var state = {}
    for (var i=0; i<this.$props.questions.length; i++) {
      state[this.$props.questions[i][1]] = null
    }
    return {
      state,
      failed: []
    }
  },
  methods: {
    set: function(item,value) {
      if (value === "" || value === NaN || value === Infinity) {
        this.state[item] = null
        return
      }
      this.state[item] = value
    },
    submit: function() {
      var unfilled = this.$props.questions.filter((question) => {
        return this.state.hasOwnProperty(question[1]) && this.state[question[1]] === null && question[3] === "yes"
      })
      if (unfilled.length > 0) {
        this.$emit('prompt',['Missing required fields', `Please fill the following required fields: ${unfilled.map(item => item[1]).join(', ')}.`])
      }
      else {
        this.$emit('submit',this.state)
      }
    }
  }
}
</script>

<style scoped>
.navbar {
  background-color: #3e77bb;
  z-index: 1000;
  position: fixed;
  height: 50px;
  padding-left: 5px;
  padding-right: 5px;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;
  top: 0;
  left: 0;
  width: 100vw;
}
.center {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}
.submit {
  color: white;
  padding: 10px;
  margin-bottom: 0;
  border-radius: 3px;
  margin-top: 15px;
  background-color: rgba(0,0,0,0.1);
  transition: background-color 0.2s ease;
  font-size: 18px;
  cursor: pointer;
  cursor: hand;
  user-select: none;
}
.submit:hover:not(:active) {
  background-color: rgba(0,0,0,0.2);
}
.submit:active {
  background-color: rgba(0,0,0,0.3);
}
.container {
  padding-top: 100px;
  width: 100vw;
  display: flex;
  justify-content: flex-start;
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
.heading {
  color: white;
  font-size: 36px;
  margin-bottom: 70px;
  width: 100%;
  text-align: center;
}
.button {
  height: 40px;
  cursor: pointer;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  width: 80px;
  border-radius: 3px;
  transition: all 0.2s ease;
  cursor: pointer;
  cursor: hand;
  background-color: rgba(0,0,0,0.1);
}
.networkstatus {
  color: white;
  margin-right: 20px;
}
.button:active {
  background-color: rgba(0,0,0,0.3);
}
.button:hover:not(:active) {
  background-color: rgba(0,0,0,0.2);
}
.form {
  background-color: #3e77bb;
  max-width: 700px;
  width: 100%;
  border-radius: 3px;
  margin-bottom: 50px;
}
@media all and (max-width: 700px) {
  .form {
    margin-bottom: 0;
  }
  .container {
    padding-top: 50px;
  }
}
.forminner {
  margin: 50px;
  margin-bottom: 30px;
}
</style>
