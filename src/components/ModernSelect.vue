<template>
<div :class="collapsed ? 'open box' : 'box'" @click="switchState">
  <div v-if="!multiple" class="selections">
    {{selected}}
  </div>
  <div v-else class="selections">
    <div v-on:click.stop="removeSelection(selection)" v-for="selection in selected" class="selection">{{selection}} <i class="icon ion-close-round"/></div>
  </div>
  <div :class="collapsed ? 'arrow flipped' : 'arrow'"><i :class="collapsed ? 'icon ion-ios-arrow-down flip' : 'icon ion-ios-arrow-down'"></i></div>
  <div :class="collapsed ? 'menu' : 'hidden menu'">
    <div v-for="option in options" v-if="multiple ? (selected.indexOf(option)===-1 || allowDuplicates) : option != selected" :class="multiple ? 'option multiple' : 'option'" @click="setSelected(option)">
      {{option}}
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: 'modernselect',
  props: ['value', 'options', 'multiple', 'allowDuplicates'],
  data() {
    document.addEventListener('mouseup', function(event){
      if (event.target.className!='open box' && event.target.className!='option' && event.target.className!='icon ion-ios-arrow-down flip')
      this.collapsed = false;
      this.helper = true;
    }.bind(this))
    return {
      selected: this.$props.multiple ? [] : this.$props.options[0],
      collapsed: false
    }
  },
  methods: {
    switchState: function(event) {
      this.collapsed = !this.collapsed
    },
    setSelected: function(item) {
      if (this.multiple) {
        this.selected.push(item)
      } else {
        this.selected = item
      }
    },
    removeSelection: function(item) {
      this.selected.splice(this.selected.indexOf(item),1)
    }
  }
}
</script>

<style scoped>
.selections {
  display: flex;
  flex-flow: row wrap;
  max-width: 92%;
}
.selection {
  padding: 5px;
  background-color: rgba(0,0,0,0.1);
  border-radius: 3px;
  margin: 2px;
  display: flex;
  justify-content: center;
  flex-flow: row nowrap;
  align-items: center;
  user-select: none;
  position: relative;
  padding-right: 21px;
}
.selection .icon {
  font-size: 10px;
  position: absolute;
  right: 8px;
  top: 6.4px;
}
.box {
  min-height: 20px;
  background-color: rgba(0,0,0,0.1);
  padding: 7px;
  margin: 7px;
  margin-left: 0;
  margin-right: 0;
  color: white;
  border-radius: 3px;
  font-size: 12px;
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: flex-start;
  cursor: pointer;
  position: relative;
}
.open.box {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
.arrow {
  align-self: flex-end;
  font-size: 20px;
  margin-right: 4px;
  position: absolute;
  right: 8px;
  width: 10px;
  height: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: rotateZ(0deg);
}
.arrow.flipped {
  transform: rotate3d(0,0,1,180deg);
}
.option {
  padding: 7px;
  border-top: 1px solid rgba(0,0,0,0.1);
  user-select: none;
}
.menu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #386ba7;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
  overflow: hidden;
  z-index: 1001;
}
.menu.hidden {
  max-height: 0px;
}
.option:hover {
  background-color: rgba(0,0,0,0.1);
}
</style>
