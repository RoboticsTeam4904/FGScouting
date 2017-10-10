<template>
  <div class="container">
    <div :class="selected===option ? 'option selected' : 'option'" @click="setSelected(option)" v-for="option in options">{{option}}</div>
  </div>
</template>

<script>
export default {
  name: 'modernradio',
  props: ['options'],
  data() {
    return {
      selected: this.$props.options[0]
    }
  },
  methods: {
    setSelected: function(item) {
      this.selected = item
    }
  }
}
</script>

<style scoped>
.option {
  color: white;
  display: inline-block;
  font-size: 12px;
  border-radius: 3px;
  background-color: rgba(0,0,0,0.1);
  justify-content: center;
  align-items: center;
  padding: 7px;
  margin: 7px;
  margin-left: 0;
  text-align: center;
  cursor: pointer;
  transition: 0.2s ease all;
}
.option.selected {
  background-color: rgba(0,0,0,0.3);
}
.option:hover:not(.selected) {
  background-color: rgba(0,0,0,0.2);
}
</style>
