<template>
  <div class="container aligner">
    <div class="option" @click="increment(-1)" >{{options[0]}}</div>
    <div class="option center">Value: <strong>{{value}}</strong></div>
    <div class="option" @click="increment(1)" >{{options[1]}}</div>
  </div>
</template>

<script>
export default {
  name: 'modernradio',
  props: ['options','minValue','maxValue'],
  data() {
    return {
      value: null,
    }
  },
  methods: {
    increment: function(item) {
      this.value += item;
      if(!(this.$props.minValue==null) && this.value < this.$props.minValue){
        this.value = this.$props.minValue;
      }
      if(!(this.$props.maxValue==null) && this.value > this.$props.maxValue){
        this.value = this.$props.maxValue;
      }
      this.$emit('input',this.value)
    }
  },
  mounted(){
    if(this.$props.minValue==null){
      this.value = 0;
    }else{
      this.value = this.$props.minValue;
    }
    this.$emit('input',this.value)
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
  width: calc(23% - 14px);
  padding: 7px;
  margin: 7px;
  margin-left: 0;
  margin-right: 0;
  text-align: center;
  cursor: pointer;
  transition: 0.2s ease all;
  user-select: none;
}
.aligner {
  align-items: center;
}
.option.center {
  width: calc(50% - 14px);
}
.option:hover:not(.center) {
  background-color: rgba(0,0,0,0.3);
}
</style>
