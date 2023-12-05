import csv from 'csv-parser'
import fs from 'node:fs'

export async function import_scrobbles(file) {
	const scrobbles = await new Promise((resolve, reject) => {
		const scrobbles = []
		fs.createReadStream(file)
			.pipe(csv())
			.on('data', (data) => scrobbles.push(data))
			.on('end', () => resolve(scrobbles))
			.on('error', (e) => reject(e))
	})

	for (const scrobble of scrobbles) {
		// this removes weird "1970" data from the export, not sure what happened there
		if (+scrobble.uts < 31536000) continue
		scrobble.date = new Date(scrobble.uts * 1000)
		scrobble.year = scrobble.date.getFullYear()
	}

	return scrobbles
}
