<template>
  <div class="field">
    <div v-if="data[3]==='yes'" class="name">
      {{data[0]}} <span class="required">*</span>
    </div>
    <div v-else class="name">
      {{data[0]}} <!--<span class="optional">- Optional </span> -->
    </div>
    <input ref="fieldComponent" @input="(event) => { set(event.target.value) }" type="text" v-if="data[2]==='ShortText'"/>
    <ModernRadio ref="fieldComponent" @input="(event) => { set(event) }" v-if="data[2]==='Boolean'" :multiple="false" :options="['No','Yes']"></ModernRadio>
    <ModernRadio ref="fieldComponent" @input="(event) => { set(event) }" v-if="data[2]==='BooleanReverse'" :multiple="false" :options="['Yes','No']"></ModernRadio>
    <ModernRadio ref="fieldComponent" @input="(event) => { set(event) }" v-if="data[2]==='Radio'" :multiple="false" :options="data.slice(4)"></ModernRadio>
    <ModernRadio ref="fieldComponent" @input="(event) => { set(event) }" v-if="data[2]==='RadioMultiple'" :multiple="true" :options="data.slice(4)"></ModernRadio>
    <input ref="fieldComponent" @input="(event) => { set(+event.target.value) }" type="number" v-if="data[2]==='Number'"/>
    <ModernSelect ref="fieldComponent" @input="(event) => { set(event) }" v-if="data[2]==='PrefilledSelectOne'" :multiple="data[2]==='SelectMultiple' || data[2]==='DuplicatingSelectMultiple'" :allowDuplicates="data[2]==='DuplicatingSelectMultiple'" :options="data.slice(4)" :prefilled="true"></ModernSelect>
    <ModernSelect ref="fieldComponent" @input="(event) => { set(event) }" v-if="data[2]==='SelectOne' || data[2]==='SelectMultiple' || data[2]==='DuplicatingSelectMultiple'" :multiple="data[2]==='SelectMultiple' || data[2]==='DuplicatingSelectMultiple'" :allowDuplicates="data[2]==='DuplicatingSelectMultiple'" :options="data.slice(4)" :prefilled="false"></ModernSelect>
    <div ref="fieldComponent" @input="(event) => { set(event.target.textContent) }" contenteditable="true" v-if="data[2]==='LongText'"></div>
    <ModernCounter ref="fieldComponent" @input="(event) => { set(event) }" v-if="data[2]==='Counter'" :options="['-1','+1']" :minValue="parseInt(data[5])" :maxValue="parseInt(data[6])"></ModernCounter>
    <ModernSlider ref="fieldComponent" @input="(event) => { set(event) }" :initialPosition="parseInt(data[7])" :stepped="data[4]!=0" :steps="parseInt(data[4])" :minValue="parseInt(data[5])" :maxValue="parseInt(data[6])" v-if="data[2]==='Slider'"></ModernSlider>
  </div>
</template>

<script>

import ModernSelect from './ModernSelect'
import ModernRadio from './ModernRadio'
import ModernSlider from './ModernSlider'
import ModernCounter from './ModernCounter'

export default {
  name: 'formfield',
  components: {ModernSelect, ModernRadio, ModernSlider, ModernCounter},
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
    },
    reset: function() {
      // fetch(`https://www.thebluealliance.com/api/v3/event/2018casf/matches`,
      // {
      //   method: "GET",
      //   headers: new Headers({
      //     'X-TBA-Auth-Key': "ECP12YDXG9GJxMjqVlOlIjeEEaQ2Bjk5nLeA5ieu3aJFWirE93MBFTM8lBsL6EAx"
      //   })        
      // }).then(response => {
      //   return response.json();
      // }).then(result => {
      //   var newResult = result.filter(obj => {
      //     return obj.comp_level === "qm"
      //   })
      //   var test = newResult.find(function (obj) { return obj.match_number === 3; })
      //   console.log(test.alliances.blue.team_keys[0].substring(3))
      // })
      if (this.data[1] == "name") {}
      else if (this.data[1] == "matchNumber"){
        var newValue = parseInt(this.$refs.fieldComponent.value) + 1;
        this.$refs.fieldComponent.value = newValue;
        this.set(newValue);
      } else if ((this.$refs.fieldComponent.tagName == "INPUT") || (this.$refs.fieldComponent.tagName == "DIV")){
        this.$refs.fieldComponent.value = null
        this.set(null)
      }else{
        var component = this.$refs.fieldComponent
        var fieldType = component.$options._componentTag
        if (fieldType === "ModernCounter"){
          component.value = 0;
          this.set(component.value)
        }
        else if (fieldType === "ModernRadio"){
          component.selected = component.multiple ? [] : component.options[0]
          this.set(component.selected)
        }
        else if (fieldType === "ModernSelect"){
          component.selected = component.multiple ? [] : (component.prefilled ? component.options[0] : 'Select one')
          if(component.prefilled){
            this.set(component.selected)
          }else{
            this.set(null)
          }
        }
        else if (fieldType === "ModernSlider"){
          component.dragToValue(0)
        }
        else {
          debugger;
        }
      }
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
.failed {
  border: 1px solid #cc241d;
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
.required {
  user-select: none;
  color: #ff0000;
}
.optional {
  user-select: none;
  color: rgba(255,255,255, 0.4);
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
