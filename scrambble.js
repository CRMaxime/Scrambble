/**
 * Parses a text file
 * @param file the file path
 * @return an array containing every line
 */
async function parse(file) {
	const req = await fetch(file)
	const dictionary = await req.text()
	return dictionary.split("\n")
}

const origin = new Date("2022-02-08T00:00:00")
let startTime = new Date()
const today = startTime.getFullYear() + "-" + startTime.getMonth() + "-" + startTime.getDate()
const daysPassed = Math.floor((startTime.getTime() - origin.getTime()) / (1000 * 60 * 60 * 24))
let elapsed = 0

const save = JSON.parse(localStorage.getItem("saveData")) || {}

const colors = ["red", "orange", "blue", "green"]
let toGuess, guessed = []
let done = false

const texts = {
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

const lang = /fr/.test(navigator.language) && location.href.indexOf("en") == -1 || location.href.indexOf("fr") != -1 ? "fr" : "en"
const intro = document.createElement("h6")
intro.textContent = texts[lang].intro
document.body.appendChild(intro)

const styleEl = document.createElement('style');
document.head.appendChild(styleEl);
const style = styleEl.sheet;

async function start() {
	const dictionnary = lang + "_words.txt"
	const words = await parse(dictionnary)
	const wotd = words[daysPassed].split(",")
	
	toGuess = wotd.slice(0, 4)
	const columns = [wotd.slice(4, 8), wotd.slice(8, 12), wotd.slice(12, 16), wotd.slice(16, 20), wotd.slice(20, 24)]

	for (const column of columns) {
		// Create columns
		const div = document.createElement("div")
		// Up arrow
		const up = document.createElement("a")
		up.textContent = "↥"
		div.appendChild(up)
		const letters = document.createElement("div")
		// Letters
		for (const letter in column) {
			const span = document.createElement("span")
			span.textContent = column[letter]
			letters.appendChild(span)
			if (columns.indexOf(column) == 0) {
				span.style.color = colors[letter]
			}
			
		}
		div.appendChild(letters)
		// Down arrows
		const down = document.createElement("a")
		down.textContent = "↧"
		div.appendChild(down)
		document.body.appendChild(div)
	}
	
	if (save[today] && save[today][lang]) {
		elapsed = save[today][lang].time
		const layout = save[today][lang].data.split(",")
		const spans = document.querySelectorAll("span")
		for (let l = 0; l < 20; l++) {
			spans[l].textContent = layout[l * 3]
			spans[l].className = layout[l * 3 + 1]
			spans[l].style.color = layout[l * 3 + 2]
			if (spans[l].className == "used")
				spans[l].style.color = layout[l * 3 + 2]
		}
		guessed = save[today][lang].guessed
		if (guessed.length == colors.length) win()
	}
	
	document.querySelectorAll("div div").forEach(div => loopScroll(div))

	startTime = new Date()
}

start()

let dragged
let previousTouch

window.ontouchend = (e) => {
	dragged?.reset()
}

function loopScroll(div) {
	const topper = document.createElement("span")
	copyAttributes(topper, div.lastChild)
	div.insertBefore(topper, div.firstChild)
	const bottom = document.createElement("span")
	copyAttributes(bottom, div.childNodes[1])
	div.appendChild(bottom)
	
	let topY = -52
	let dragging = false
	
	const updateMargin = () => {
		topper.style.marginTop = topY + "px"
	}
	
	const updateLetters = () => {
		if (topY >= 4) {
			topY -= 56
			const letters = div.querySelectorAll("span")
			for (let l = 5; l >= 0; l--)
				copyAttributes(letters[l], letters[l - 1] || letters[4])
		} else if (topY <= -108) {
			topY += 56
			const letters = div.querySelectorAll("span")
			for (let l = 0; l <= 5; l++)
				copyAttributes(letters[l], letters[l + 1] || letters[1])
		}
		updateMargin()
	}
	
	div.ontouchstart = (e) => {
		dragging = true
		dragged = div
		previousTouch = e.touches[0].pageY
		e.preventDefault()
		topper.style.transition = "none"
		style.insertRule("span { transition: margin 0.5s }", style.cssRules.length)
	}
	
	div.reset = () => {
		dragging = false
		topY = [-108, -52, 4].reduce((a, b) => Math.abs(b - topY) < Math.abs(a - topY) ? b : a)
		topper.style.transition = "margin 0.5s"
		updateMargin()
		setTimeout(() => {
			updateLetters()
			topper.style.transition = "none"
			setTimeout(check, 10)
		}, 500)
	}
	
	div.ontouchmove = e => {
		if (dragging) {
			const touch = e.touches[0].pageY
			topY += touch - previousTouch
			previousTouch = touch
			updateLetters()
		}
	}
	
	div.previousElementSibling.ontouchstart = div.previousElementSibling.onclick = e =>  {
		e.preventDefault()
		style.insertRule("span { transition: margin 0.5s }", style.cssRules.length)
		topY -= 56
		updateLetters()
		setTimeout(check, 10)
	}
	
	div.nextElementSibling.ontouchstart = div.nextElementSibling.onclick = e => {
		e.preventDefault()
		style.insertRule("span { transition: margin 0.5s }", style.cssRules.length)
		topY += 56
		updateLetters()
		setTimeout(check, 10)
	}
	
	updateMargin()
}

function copyAttributes(l1, l2) {
	l1.textContent = l2.textContent
	l1.style.color = l2.style.color
	l1.className = l2.className
}

/**
 * Checks if a word has been found and colors it
 */
function check() {
	const lines = colors.length + 2
	const letters = document.querySelectorAll("span")
	for (let i = 1; i < lines - 1; i++) {
		const word = letters[i].textContent + letters[i + lines].textContent + letters[i + lines * 2].textContent + letters[i + lines * 3].textContent + letters[i + lines * 4].textContent
		if (toGuess.includes(word) && !guessed.includes(word)) {
			style.insertRule("span { transition: all 0.5s }", style.cssRules.length)
			letters[i].className = letters[i + lines].className = letters[i + lines * 2].className = letters[i + lines * 3].className = letters[i + lines * 4].className = "used"			
			letters[i + lines].style.color = letters[i + lines * 2].style.color = letters[i + lines * 3].style.color = letters[i + lines * 4].style.color = letters[i].style.color
			guessed.push(word)
		}
	}
	
	let saveData = ""
	document.querySelectorAll("div div").forEach(c => {
		copyAttributes(c.lastChild, c.childNodes[1])
		copyAttributes(c.firstChild, c.childNodes[4])
		for (let l = 1; l < lines - 1; l++)
			saveData += c.childNodes[l].textContent + "," + c.childNodes[l].className + "," + (c.childNodes[l].style.color || c.childNodes[l].style.backgroundColor) + ","
	})
	if (!save[today]) save[today] = {}
	save[today][lang] = {
		data: saveData,
		time: Date.now() - startTime.getTime() + elapsed,
		guessed
	}
	localStorage.setItem("saveData", JSON.stringify(save))
		
	if (guessed.length == colors.length) win()
}

function win() {
	document.querySelectorAll("div a").forEach(a => a.style.visibility = "hidden")
	document.querySelectorAll("div div").forEach(div => div.style.pointerEvents = "none")
	dragged = null
	document.querySelectorAll("span").forEach(l => {
		l.className = "done"
		l.style.backgroundColor = l.style.color
	})
	const p = document.createElement("p")
	const time = format(save[today][lang].time)
	p.textContent = texts[lang].win + time
	document.body.appendChild(p)
	const cta = document.createElement("button")
	cta.textContent = texts[lang].share
	cta.onclick = () => share(time)
	document.body.appendChild(cta)
}

/**
 * Formats a time
 * @param time a time in ms
 * @return X:XX
 */
function format(time) {
	const seconds = Math.round(time % 60000 / 1000)
	const minutes = Math.floor(time / 60000)
	return minutes + ":" + (seconds > 9 ? seconds : "0" + seconds)
}

/**
 * Shares an emoji recap of the game
 * @param time the time it took to complete
 */
function share(time) {
	let emojis = ""
	for (let c = 2; c < colors.length + 2; c++) {
		emojis += "\n"
		document.querySelectorAll("span:nth-child(" + c + ")").forEach(l => emojis += l.style.backgroundColor)
	}
	emojis = emojis.replaceAll("red", "🟥").replaceAll("orange", "🟧").replaceAll("green", "🟩").replaceAll("blue", "🟦").replace("purple", "🟪")
	const text = "Scrambble.app #" + daysPassed + " - " + time + emojis
	if (navigator.share) {
		navigator.share({ text: text })
	} else {
		navigator.clipboard.writeText(text).then(function() {
			const p = document.createElement("p")
			p.textContent = texts[lang].copied
			document.body.appendChild(p)
		}, function(err) {
			const textArea = document.createElement("textarea")
				textArea.value = text
				textArea.spellcheck = false
				document.body.appendChild(textArea)
				textArea.select()
		});
	}
	document.querySelector("button").style.pointerEvents = "none"
}
