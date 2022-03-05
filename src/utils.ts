/**
 * Formats a time
 * @param time a time in ms
 * @return X:XX
 */
 export function format(time: number) {
	const seconds = Math.round(time % 60000 / 1000)
	const minutes = Math.floor(time / 60000)
	return minutes + ":" + (seconds > 9 ? seconds : "0" + seconds)
}
