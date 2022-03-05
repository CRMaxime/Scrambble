<script setup lang="ts">

import Column from './components/Column.vue'
import { format } from './utils'
import { texts, lang, dictionary } from './locales'
import { computed, Ref, ref } from 'vue';
import { Letter, SaveDataArray, SaveHolder } from './types';

const origin = new Date("2022-02-08T00:00:00")
let startTime = new Date()
const today = startTime.getFullYear() + "-" + startTime.getMonth() + "-" + startTime.getDate()
const daysPassed = Math.floor((startTime.getTime() - origin.getTime()) / (1000 * 60 * 60 * 24))
let elapsed = 0

const save: SaveDataArray = JSON.parse(localStorage.getItem("saveData") || "{}")
if (!save[today]) save[today] = {} as SaveHolder

let toGuess: string[]
const guessed: Ref<string[]> = ref([])

const wotd = dictionary.split("\n")[daysPassed].split(",")
toGuess = wotd.slice(0, 4)
console.log("😱 OMG you're such a h4ck3r!", toGuess)

const letters: Ref<Letter[][]> = ref([[], [], [], [], []])
if (!save[today][lang]) {
  const columns = [wotd.slice(4, 8), wotd.slice(8, 12), wotd.slice(12, 16), wotd.slice(16, 20), wotd.slice(20, 24)]
  for (const c in columns)
    for (const l of columns[c])
      letters.value[c].push(new Letter(l))
  letters.value[0][0].color = "red"
  letters.value[0][1].color = "orange"
  letters.value[0][2].color = "blue"
  letters.value[0][3].color = "green"
} else {
  // Load grid from localStorage
  elapsed = save[today][lang].time
  letters.value = save[today][lang].letters
  guessed.value = save[today][lang].guessed
}

const shiftUp = (column: Letter[]) => {
  const first = column[0]
  column.shift()
  column.push(first)
}

const shiftDown = (column: Letter[]) => {
  const last = column[column.length - 1]
  column.pop()
  column.unshift(last)
}

const animate = ref(false)
const check = () => {
  // Make sure letter shifting is complete
  setTimeout(() => {
    // Check for matches
    for (let l = 0; l < 4; l++) {
      const word = letters.value[0][l].letter + letters.value[1][l].letter + letters.value[2][l].letter + letters.value[3][l].letter + letters.value[4][l].letter
      if (toGuess.includes(word) && !guessed.value.includes(word)) {
          animate.value = true
          letters.value[0][l].guessed = letters.value[1][l].guessed = letters.value[2][l].guessed = letters.value[3][l].guessed = letters.value[4][l].guessed = true
          letters.value[1][l].color = letters.value[2][l].color = letters.value[3][l].color = letters.value[4][l].color = letters.value[0][l].color
          guessed.value.push(word)
          setTimeout(() => animate.value = false, 500)
      }
    }

    // Save current grid to localStorage
    save[today][lang] = {
      letters: letters.value,
      time: Date.now() - startTime.getTime() + elapsed,
      guessed: guessed.value
    }
    localStorage.setItem("saveData", JSON.stringify(save))
  }, 10)
}

const shareText = computed(() => {
  let emojis = "\n"
  for (const l in letters.value[0])
    for (const column of letters.value)
      emojis += column[l].color
    emojis += "\n"
  emojis = emojis.replaceAll("red", "🟥").replaceAll("orange", "🟧").replaceAll("green", "🟩").replaceAll("blue", "🟦").replace("purple", "🟪")
  return "Scrambble.app #" + daysPassed + " - " + format(time.value) + emojis
})

const time = computed(() => {
  return guessed.value.length == 4 ? save[today][lang].time : Date.now() - startTime.getTime() + elapsed
})

const won = computed(() => {
  return guessed.value.length == 4
})

const copied = ref<null | boolean>(null)
const share = async() => {
  if (navigator.share) {
    navigator.share({ text: shareText.value })
  } else {
    try {
      await navigator.clipboard.writeText(shareText.value)
      copied.value = true
    } catch (err) {
      copied.value = false
    }
  }
}

startTime = new Date()

</script>

<template>
  <h4>Scrambble</h4>
  <h6>{{ texts[lang].intro }}</h6>
  <Column v-for="column in letters" :letters="column" @shiftUp="shiftUp(column)" @shiftDown="shiftDown(column)" @dragStop="check" :disabled="won" :class="{ animate }" />
  <p v-if="won">{{ texts[lang].win + format(time) }}</p>
  <button v-if="won" @click="share">{{ texts[lang].share }}</button>
  <p v-if="copied">{{ texts[lang].copied }}</p>
  <textarea v-if="!copied && copied !== null">{{ shareText }}</textarea>
</template>

<style>

@font-face {
  font-family: Oswald;
  font-style: normal;
  font-weight: 400;
  src: url("oswald.woff") format("woff")
}

body {
	text-align: center;
	font-family: Oswald;
	font-size: 32px;
	text-transform: uppercase;
	user-select: none;
	padding: 0;
	margin: 0;
	overflow: hidden;
	background: #fefefe;
	touch-action: manipulation;
}

h4 {
	margin: 0 0 8px 0;
	letter-spacing: 4px;
	font-weight: normal;
	border-bottom: 0.5px solid lightgrey;
}

h6 {
	margin: 16px 0 16px 0;
	font-weight: normal;
	color: lightgrey;
	font-size: 18px;
	letter-spacing: 1px;
}

p {
	margin: 16px 0 8px 0;
	font-size: 18px;
	letter-spacing: 1px;
}

button {
	-webkit-appearance: none;
	background: black;
	color: white;
	text-transform: uppercase;
	border: none;
	margin: 0 0 8px 0;
	font-family: Oswald;
	padding: 4px 8px;
	font-size: 18px;
	letter-spacing: 1px;
	cursor: pointer;
}

textarea {
	font-family: Oswald;
	width: 160px;
	height: 100px;
	letter-spacing: 1px;
	line-height: 20px;
	border: none;
	padding: 8px;
	display: block;
	margin: auto;
}

a { color: lightgrey; }
span { background: #eeeeee; }

div[disabled=true] div span { opacity: 1; color: #fefefe !important; }
.animate div span { transition: all 0.5s !important; }

@media (prefers-color-scheme: dark) {
  body { background: #0e0e0f; color: #fefefe; }
  h4 { background: #1d1d20; }
  h6, a { color: #646464; }
  button { background: grey; color: #0e0e0f; }
  span { background: #222222; }
  div[disabled=true] div span { color: #0e0e0f !important; }
}

</style>
