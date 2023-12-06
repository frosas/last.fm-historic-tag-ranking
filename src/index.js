import { writeFileSync } from 'fs'
import { ArtistTagService } from './ArtistTagService/ArtistTagService.js'
import { loadScrobbles } from './importScrobbles.js'
import { LastFm } from './LastFm.js'
import { ArtistsTagsCache } from './ArtistTagService/ArtistsTagsCache.js'
import { buildStats } from './buildStats.js'
import { buildCsv } from './csv.js'

const basePath = new URL('..', import.meta.url).pathname

// configuration
const scrobblesPath = `${basePath}/scrobbles.csv`
const NUMBER_TOP_TAGS = 30
const artistsTagsCachePath = `${basePath}/artists-tags-cache.json`
const lastFmApiKey = `a014e53e73aba0fde3d38f1c5ec3c12b`

async function main() {
	console.warn('importing local data')
	const scrobbles = await loadScrobbles(scrobblesPath)
	const artistsTagsCache = new ArtistsTagsCache({ path: artistsTagsCachePath })
	const lastFm = new LastFm({ apiKey: lastFmApiKey })
	const artistTagService = new ArtistTagService({ cache: artistsTagsCache, lastFm })

	const tag_count_per_year = {}

	console.warn('searching tags')
	for (const scrobble of scrobbles) {
		const tag = await artistTagService.getArtistTag(scrobble.artist).catch((reason) => {
			console.error(`❗️ Could not get the tag for ${scrobble.artist}: ${JSON.stringify(reason)}}`)
			return undefined
		})

		if (!tag) continue

		if (!tag_count_per_year[scrobble.year]) tag_count_per_year[scrobble.year] = []
		let tag_in_year = tag_count_per_year[scrobble.year].find((i) => i.tag === tag)
		if (!tag_in_year) {
			tag_in_year = { tag, count: 0 }
			tag_count_per_year[scrobble.year].push(tag_in_year)
		}
		tag_in_year.count++
	}

	console.warn('building stats')
	buildStats({ artistsTags: artistsTagsCache.allTags })

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
	const rows = []
	const headerRow = ['tag']
	for (const year of [...year_set]) headerRow.push(year)
	rows.push(headerRow)
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
		rows.push(row)
	}
	writeFileSync('out.csv', buildCsv(rows))
}

main()
