import { Language } from "./locales"

export class Letter {
  letter: string
  color?: "red" | "green" | "blue" | "orange" | "purple"
  guessed: boolean
  constructor(letter: string) {
  this.letter = letter
  this.guessed = false
  }
}

interface SaveData {
  letters: Letter[][],
  time: number,
  guessed: string[]
}

export type SaveHolder = {
  [key in Language]: SaveData
}

export type SaveDataArray = {
  [key: string]: SaveHolder
}