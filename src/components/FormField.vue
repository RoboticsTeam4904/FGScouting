<template>
  <div class="field">
    <div v-if="data[3]==='yes'" class="name">
      {{data[0] + " *"}}
    </div>
    <div v-else class="name">
      {{data[0]}}
    </div>
    <input @input="(event) => { set(event.target.value) }" type="text" v-if="data[2]==='ShortText'"/>
    <!--<div class="checkboxcenterer" v-if="data[2]==='Boolean'">
      <input :id="data[1]" class="styled-checkbox" type="checkbox"/>
      <label :for="data[1]"></label>
    </div>-->
    <ModernRadio @input="(event) => { set(event) }" v-if="data[2]==='Boolean'" :multiple="false" :options="['No','Yes']"></ModernRadio>
    <ModernRadio @input="(event) => { set(event) }" v-if="data[2]==='BooleanReverse'" :multiple="false" :options="['Yes','No']"></ModernRadio>
    <ModernRadio @input="(event) => { set(event) }" v-if="data[2]==='Radio'" :multiple="false" :options="data.slice(4)"></ModernRadio>
    <ModernRadio @input="(event) => { set(event) }" v-if="data[2]==='RadioMultiple'" :multiple="true" :options="data.slice(4)"></ModernRadio>
    <input @input="(event) => { set(+event.target.value) }" type="number" v-if="data[2]==='Number'"/>
    <ModernSelect @input="(event) => { set(event) }" v-if="data[2]==='PrefilledSelectOne'" :multiple="data[2]==='SelectMultiple' || data[2]==='DuplicatingSelectMultiple'" :allowDuplicates="data[2]==='DuplicatingSelectMultiple'" :options="data.slice(4)" :prefilled="true"></ModernSelect>
    <ModernSelect @input="(event) => { set(event) }" v-if="data[2]==='SelectOne' || data[2]==='SelectMultiple' || data[2]==='DuplicatingSelectMultiple'" :multiple="data[2]==='SelectMultiple' || data[2]==='DuplicatingSelectMultiple'" :allowDuplicates="data[2]==='DuplicatingSelectMultiple'" :options="data.slice(4)" :prefilled="false"></ModernSelect>
    <div @input="(event) => { set(event.target.textContent) }" contenteditable="true" v-if="data[2]==='LongText'"></div>
    <ModernSlider @input="(event) => { set(event) }" :initialPosition="parseInt(data[7])" :stepped="data[4]!=0" :steps="parseInt(data[4])" :minValue="parseInt(data[5])" :maxValue="parseInt(data[6])" v-if="data[2]==='Slider'"></ModernSlider>
  </div>
</template>

<script>

import ModernSelect from './ModernSelect'
import ModernRadio from './ModernRadio'
import ModernSlider from './ModernSlider'

export default {
  name: 'formfield',
  components: {ModernSelect, ModernRadio, ModernSlider},
  props: ['data'],
  data() {
    return {
      value: null
    }
  },
  mounted() {
    this.dispatch()
  },
  methods: {
    dispatch: function() {
      this.$emit('input',this.value)
    },
    set: function(value) {
      this.value = value
      this.dispatch()
    }
  }
}
</script>

<style scoped>
.name {
  color: white;
  font-size: 13px;
}
.field {
  padding-bottom: 8px;
}
input[type='text'] {
  outline: none;
  border: none;
  border-bottom: 2px solid rgba(0,0,0,0.1);
  transition: border 0.2s ease;
  margin-top: 2px;
  font-family: Arvo;
  margin-bottom: 10px;
  width: 100%;
  padding-bottom: 8px;
  padding-top: 8px;
  background-color: transparent;
  color: white;
}
input[type='text'], input[type='number'], textarea {
  box-sizing: border-box;
}
input[type='text']:focus {
  border-bottom: 2px solid rgba(0,0,0,0.3);
}
[contenteditable='true'] {
  outline: none;
  border: none;
  border-bottom: 2px solid rgba(0,0,0,0.1);
  transition: border 0.2s ease;
  margin-top: 2px;
  font-family: Arvo;
  margin-bottom: 10px;
  width: 100%;
  padding-bottom: 8px;
  padding-top: 8px;
  background-color: transparent;
  color: white;
  resize: none;
  overflow: hidden;
}
[contenteditable='true']:focus {
  border-bottom: 2px solid rgba(0,0,0,0.3);
}
input[type='number'] {
  outline: none;
  border: none;
  border-bottom: 2px solid rgba(0,0,0,0.1);
  transition: border 0.2s ease;
  margin-top: 2px;
  font-family: Arvo;
  margin-bottom: 10px;
  width: 100%;
  padding-bottom: 8px;
  padding-top: 8px;
  background-color: transparent;
  color: white;
}
input[type='number']:focus {
  border-bottom: 2px solid rgba(0,0,0,0.3);
}
input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
}
.nowrap {
  display: inline-block;
}
input[type="checkbox"] {
  display: none;
}
input[type="checkbox"] + label:before {
  content: 'No';
  color: white;
  display: inline-block;
  width: 20px;
  font-size: 12px;
  border-radius: 3px;
  height: 20px;
  display: flex;
  background-color: rgba(0,0,0,0.1);
  justify-content: center;
  align-items: center;
  padding: 7px;
  margin: 7px;
  margin-left: 0;
  text-align: center;
  cursor: pointer;
  transition: 0.3s ease all;
}

input[type="checkbox"]:checked + label:before {
  content: 'Yes';
  background-color: rgba(0,0,0,0.3);
}
input[type="checkbox"]:hover:not(:checked) + label:before{
  background-color: rgba(0,0,0,0.2);
}
.checkboxcenterer {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
}
</style>
