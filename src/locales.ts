export type Language = "fr" | "en"
type Phrases = { 
  intro: string,
  win: string,
  share: string,
  copied: string
}
type Texts = { [key in Language]: Phrases }

export const texts: Texts = {
	en: {
		intro: "Align the letters to find 4 words",
		win: "Well done! Your time today is: ",
		share: "Share",
		copied: "Your game report is ready to paste :)"
	},	
	fr: {
		intro: "Aligne les lettres pour trouver 4 mots",
		win: "Bien joué ! Ton temps du jour : ",
		share: "Partager",
		copied: "Votre rapport a été copié"
	}
}

export const lang: Language = /fr/.test(navigator.language) && location.href.indexOf("en") == -1 || location.href.indexOf("fr") != -1 ? "fr" : "en"

import en from "./assets/en_words.txt?raw"
import fr from "./assets/fr_words.txt?raw"

export const dictionary = lang == "fr" ? fr : en