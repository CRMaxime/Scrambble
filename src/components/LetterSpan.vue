<script setup lang="ts">

import { Letter } from '../types';

defineProps<{
  letter: Letter,
  disabled?: boolean
}>()

</script>

<template>
  <span :style="{ color: letter.color, background: disabled ? letter.color : '', opacity: letter.guessed && !disabled ? 0.4 : 1 }">{{ letter.letter }}</span>
</template>

<style scoped>

span {
  display: block;
  border-radius: 2px;
  margin: 8px 4px;
  width: 48px;
  height: 48px;
  line-height: 48px;
}

</style>
