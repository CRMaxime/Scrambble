<script setup lang="ts">
import { ref } from 'vue'
import { Letter } from '../types';
import LetterSpan from './LetterSpan.vue'

defineProps<{
  letters: Letter[],
  disabled: boolean
}>()

const emit = defineEmits<{
  (e: "shiftUp"): void,
  (e: "shiftDown"): void,
  (e: "dragStop"): void
}>()

const topY = ref(-220)
const transition = ref("none")
let dragging = false

let previousTouch: number

const updateLetters = () => {
  if (topY.value >= -164) {
    topY.value -= 56
    emit("shiftDown")
  } else if (topY.value <= -276) {
    topY.value += 56
    emit("shiftUp")
  }
}

const startDrag = (e: TouchEvent | MouseEvent) => {
  e.preventDefault()
  dragging = true
  window.onmouseup = reset
  window.ontouchend = reset
  window.onmousemove = move
  window.ontouchmove = move
  if (e instanceof TouchEvent) previousTouch = e.touches[0].pageY
  transition.value = "none"
}

const move = (e: TouchEvent | MouseEvent) => {
  if (dragging) {
    if (e instanceof TouchEvent) {
      const touch = e.touches[0].pageY
      topY.value += touch - previousTouch
      previousTouch = touch
    } else {
      topY.value += e.movementY / window.devicePixelRatio
    }
    updateLetters()
  }
}

const reset = () => {
  if (dragging) {
    dragging = false
    const snap = [-276, -220, -164].reduce((a, b) => Math.abs(b - topY.value) < Math.abs(a - topY.value) ? b : a)
    const delta = Math.abs(topY.value - snap)
    const time = delta * 0.5 / 28 
    transition.value = "margin " + time + "s"
    topY.value = snap
    setTimeout(() => {
      transition.value = "none"
      updateLetters()
      emit("dragStop")
    }, time * 1000)
  }
}

let clicks: number[] = []

const shift = (direction: -1 | 1) => {
  if (clicks.length < 4) {
    transition.value = "margin 0.5s"
    topY.value += 56 * direction
    clearTimeout(clicks[clicks.length - 1])
    clicks.push(setTimeout(() => {
      transition.value = "none"
      clicks.forEach(c => updateLetters())
      clicks = []
      emit("dragStop")
    }, 500))
  }
}

</script>

<template>
  <div :disabled="disabled">
    <a @touchstart="shift(-1)" @mousedown.prevent="shift(-1)">↥</a>
    <div @touchstart="startDrag" @mousedown="startDrag">
      <LetterSpan :style="{ marginTop: topY + 'px', transition }" :letter="letters[0]" />
      <LetterSpan v-for="l in 11" LetterSpan :letter="letters[l % 4]" :disabled="disabled" />
    </div>
    <a @touchstart="shift(1)" @mousedown.prevent="shift(1)">↧</a>
  </div>
</template>

<style scoped>

div {
	display: inline-block;
	width: 56px;
}

div div {
	height: 224px;
	cursor: ns-resize;
	overflow: hidden;
}

a {
	cursor: pointer;
	touch-action: manipulation;
	display: block;
	height: 48px;
	margin-top: -12px;
	line-height: 40px;
}

:root [disabled=true] { pointer-events: none; }
:root [disabled=true] a { visibility: hidden; }

</style>
