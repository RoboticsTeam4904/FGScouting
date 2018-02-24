<template>
  <div class="container">
    <div v-if="multiple" :class="selected.indexOf(option)!=-1 ? 'option selected' : 'option'" @click="setSelected(option)" v-for="option in options">{{option}}</div>
    <div v-if="!multiple" :class="selected===option ? 'option selected' : 'option'" @click="setSelected(option)" v-for="option in options">{{option}}</div>
  </div>
</template>

<script>
export default {
  name: 'modernradio',
  props: ['options', 'multiple'],
  data() {
    return {
      selected: this.$props.multiple ? [] : this.$props.options[0]
    }
  },
  methods: {
    setSelected: function(item) {
      if (this.$props.multiple) {
        if (this.selected.indexOf(item) != -1){
          this.selected.splice(this.selected.indexOf(item),1)
        }
        else {
          this.selected.push(item)
        }
      }
      else {
        this.selected = item
      }
      this.$emit('input',this.selected)
    }
  },
  mounted(){
    this.$emit('input',this.selected)
  }
}
</script>

<style scoped>
.option {
  color: white;
  display: inline-block;
  font-size: 15px;
  border-radius: 3px;
  background-color: rgba(0,0,0,0.1);
  justify-content: center;
  align-items: center;
  padding: 7px;
  margin: 7px;
  margin-left: 0;
  margin-top: 20px;
  text-align: center;
  cursor: pointer;
  transition: 0.2s ease all;
  user-select: none;
}
.option.selected {
  background-color: rgba(0,0,0,0.5);
}
.option:hover:not(.selected) {
  background-color: rgba(0,0,0,0.3);
}
</style>
