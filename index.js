import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ArtistTagService } from './src/ArtistTagService/ArtistTagService.js'
import { import_scrobbles } from './import.js'

// configuration
const SCROBBLES_CSV = './recenttracks-r00z-1701781243.csv'
const NUMBER_TOP_TAGS = 30

const __dirname = dirname(fileURLToPath(import.meta.url))

async function main() {
	console.warn('importing local data')
	const scrobbles = await import_scrobbles(SCROBBLES_CSV)
	const cachePath = `${__dirname}/../tag_per_artist.json`
	const artistTagService = new ArtistTagService({ cachePath })

	const tag_count_per_year = {}

	console.warn('searching tags')
	for (const scrobble of scrobbles) {
		const tag = await artistTagService.getArtistTag(scrobble.artist)

		if (!tag) continue

		if (!tag_count_per_year[scrobble.year]) tag_count_per_year[scrobble.year] = []
		let tag_in_year = tag_count_per_year[scrobble.year].find((i) => i.tag === tag)
		if (!tag_in_year) {
			tag_in_year = { tag, count: 0 }
			tag_count_per_year[scrobble.year].push(tag_in_year)
		}
		tag_in_year.count++
	}

	console.warn('getting top tags')
	for (const array of Object.values(tag_count_per_year)) {
		array.sort((a, b) => b.count - a.count)
		array.splice(NUMBER_TOP_TAGS, array.length - 1)
	}

	console.warn('selecting unique tags')
	const tag_set = new Set()
	const year_set = new Set()
	for (const [year, tag_array] of Object.entries(tag_count_per_year)) {
		year_set.add(year)
		tag_array.forEach(({ tag }) => {
			tag_set.add(tag)
		})
	}

	console.warn('printing ranking')
	const first_row = ['tag']
	for (const year of [...year_set]) {
		first_row.push(year)
	}
	console.log(first_row.map((v) => `"${v}"`).join(','))
	for (const tag of [...tag_set]) {
		const row = [
			tag
				.split(' ')
				.map((s) => s[0].toUpperCase() + s.substring(1))
				.join(' '),
		]
		for (const year of [...year_set]) {
			const index = tag_count_per_year[year].findIndex((i) => i.tag === tag)
			if (index === -1) {
				row.push('')
			} else {
				row.push(index + 1)
			}
		}
		console.log(row.map((v) => `"${v}"`).join(','))
	}
}

main()
