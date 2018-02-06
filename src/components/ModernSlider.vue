<template>
  <div ref="slider" class="slider">
    <div class="minlabel">{{minValue}}</div>
    <div v-if="stepped" class="division" v-for="number in Array(steps).fill(1).map((x, y) => x + y)"></div>
    <div v-else class="division" v-for="number in Array(2).fill(1).map((x, y) => x + y)"></div>
    <div ref="handle" :class="dragging ? 'active handle' : 'handle'" @mousedown="startDrag" @touchstart="startDragMobile" @mouseup="stopDrag" @touchend="stopDrag" @touchmove="updateDrag">
      <div class="inner"></div>
      <div class="text">{{value}}</div>
    </div>
    <div class="maxlabel">{{maxValue}}</div>
  </div>
</template>

<script>
export default {
  name: 'modernslider',
  props: ['stepped','steps','initialPosition','minValue','maxValue'],
  data() {
    document.addEventListener('mouseup', function(){
      this.dragging = false;
    }.bind(this))
    document.addEventListener('touchend', function(){
      this.dragging = false;
    }.bind(this))
    document.addEventListener('mousemove', this.updateDrag)
    window.addEventListener('resize', function() {
      var width = this.$refs.slider.getBoundingClientRect().width - this.magics[2]*2 + this.magics[0]
      var stepLength = this.$props.stepped ? width/(this.$props.steps-1) : width/(this.$props.maxValue - this.$props.minValue)
      this.$refs.handle.style.left = `${(this.magics[1]+this.magics[0]/2) + (this.$props.stepped ? this.value-this.$props.minValue : this.value)* stepLength}px`
    }.bind(this))
    return {
      dragging: false,
      xOffset: 0,
      mousePosition: [0,0],
      value: null,
      magics: [4, 20, 30]
    }
  },
  methods: {
    startDrag: function(event) {
      this.dragging = true
      this.xOffset = this.mousePosition[0] - this.$refs.handle.getBoundingClientRect().left
    },
    startDragMobile: function(event) {
      this.dragging = true
      this.xOffset = event.targetTouches[0].clientX - this.$refs.handle.getBoundingClientRect().left
    },
    stopDrag: function() {
      this.dragging = false
    },
    updateDrag: function(){
      this.mousePosition = [event.targetTouches ? event.targetTouches[0].pageX : event.pageX, event.targetTouches ? event.targetTouches[0].pageY : event.pageY]
      if (this.dragging) {
        var width = this.$refs.slider.getBoundingClientRect().width - this.magics[2]*2 + this.magics[0]
        var stepLength = width/(this.$props.maxValue - this.$props.minValue)
        this.$refs.handle.style.left = `${(event.targetTouches ? event.targetTouches[0].pageX : event.pageX) - this.xOffset - this.$refs.slider.getBoundingClientRect().left}px`
        if (this.$refs.handle.getBoundingClientRect().left < this.$refs.slider.getBoundingClientRect().left+(this.magics[1]+this.magics[0]/2)) {
          this.$refs.handle.style.left = `${(this.magics[1]+this.magics[0]/2)}px`
        }
        if (this.$refs.handle.getBoundingClientRect().right > this.$refs.slider.getBoundingClientRect().right-(this.magics[1]+this.magics[0]/2)) {
          this.$refs.handle.style.left = `${this.$refs.slider.getBoundingClientRect().width-(this.magics[1]*2+this.magics[0]/2)}px`
        }
        var sliderLeft = this.$refs.handle.getBoundingClientRect().left - this.$refs.slider.getBoundingClientRect().left - (this.magics[1]+this.magics[0]/2)
        this.value = Math.round(sliderLeft/stepLength) + this.$props.minValue
        if (this.$props.stepped) {
          stepLength = width/(this.$props.steps-1)
          this.$refs.handle.style.left = `${(this.magics[1]+this.magics[0]/2) + (stepLength * Math.round(sliderLeft/stepLength))}px`
        }
        this.$emit('input', this.value)
      }
    }
  },
  mounted() {
    this.$refs.handle.style.left = `${(this.magics[1]+this.magics[0]/2)}px`
    var width = this.$refs.slider.getBoundingClientRect().width - this.magics[2]*2 + this.magics[0]
    var stepLength = width/(this.$props.maxValue - this.$props.minValue)
    this.value = this.initialPosition
    this.$refs.handle.style.left = `${(this.magics[1]+this.magics[0]/2) + (stepLength * (this.$props.initialPosition - this.$props.minValue))}px`
    this.$emit('input', this.value)
  }
}
</script>

<style scoped>
.slider {
  user-select: none;
  width: 100%;
  height: 10px;
  box-sizing: border-box;
  margin-top: 10px;
  margin-bottom: 10px;
  background-color: rgba(0,0,0,0.1);
  border-radius: 3px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  padding-left: 30px;
  padding-right: 30px;
  align-items: center;
  position: relative;
}
.text {
  position: absolute;
  color: white;
  font-size: 8px;
}
.minlabel, .maxlabel {
  position: absolute;
  color: white;
  font-size: 8px;
}
.minlabel {
  right: 102%;
}
.maxlabel {
  left: 102%;
}
.division {
  height: 4px;
  width: 4px;
  border-radius: 100%;
  background-color: rgba(255,255,255,0.3);
}
.handle {
  position: absolute;
  height: 20px;
  width: 20px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #2b5382;
  transition: 0.2s border-radius ease;
  cursor: pointer;
  cursor: hand;
}
.handle:hover {
  border-radius: 5px;
}
.handle:hover > .inner {
  width: 1px;
  height: 1px;
  opacity: 1;
  border-radius: 10px;
}
.inner {
  background-color: rgba(0,0,0,0.3);
  transition: border-radius 0.3s ease,
              opacity 0.3s ease,
              height 0.1s ease,
              width 0.1s ease;
  will-change: height, width;
  width: 0;
  opacity: 0;
  height: 0;
  border-radius: 10px;
}
.active.handle {
  border-radius: 3px;
}
.active.handle > .inner {
  width: 20px;
  height: 20px;
  opacity: 1;
  border-radius: 3px;
}
</style>
