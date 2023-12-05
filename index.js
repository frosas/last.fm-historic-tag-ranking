import { export_tag_per_artist, import_scrobbles, import_tag_per_artist } from './import.js'

// configuration
const SCROBBLES_CSV = './recenttracks-r00z-1701781243.csv'
const NUMBER_TOP_TAGS = 30
const FETCH_TAGS = true
const IGNORED_TAGS = [
	null,
	undefined,
	'seen live',
	'musik um sich allein zu betrinken',
	'dank',
	'boy der am block chillt',
	'horses and ponies and unicorns too',
	'countries and continents',
	'favorites',
	'female vocalists',
	'Deutschrap',
	'angeschwollene Eier',
	'french',
	'Norway',
	'haiti',
	'belgian',
]

async function main() {
	console.warn('importing local data')
	const scrobbles = await import_scrobbles(SCROBBLES_CSV)
	const tag_per_artist = import_tag_per_artist()

	const already_fetched_artists = new Set()

	const tag_count_per_year = {}

	console.warn('searching tags')
	for (const scrobble of scrobbles) {
		let tag = tag_per_artist.get(scrobble.artist)
		if (
			FETCH_TAGS &&
			(!tag || IGNORED_TAGS.includes(tag)) &&
			tag != null &&
			!already_fetched_artists.has(scrobble.artist)
		) {
			console.warn('# Fetching tags for artist: ', scrobble.artist)
			const tags = await fetch(
				`https://ws.audioscrobbler.com/2.0/?method=artist.gettoptags&artist=${scrobble.artist}&api_key=a014e53e73aba0fde3d38f1c5ec3c12b&format=json`
			)
				.then(async (r) => {
					const json = await r.json()
					if (json.error) throw json
					return json.toptags.tag
				})
				.catch((reason) => {
					console.error('FAILED TO GET TAG FOR ARTIST: ' + scrobble.artist)
					console.error('reason: ', JSON.stringify(reason))
					return []
				})

			for (let tag_i = 0; tag_i < tags.length; tag_i++) {
				tag = tags[tag_i].name
				if (!IGNORED_TAGS.includes(tag)) break
			}

			already_fetched_artists.add(scrobble.artist)
			console.warn(tag)
			if (tag && (tag.toLowerCase() === 'hip hop' || tag.toLowerCase() === 'rap')) tag = 'Hip-Hop'
			if (tag && tag.toLowerCase() === '8-bit') tag = 'chiptune'
			tag_per_artist.set(scrobble.artist, tag)
			export_tag_per_artist(tag_per_artist)
		}

		if (tag && (tag.toLowerCase() === 'hip hop' || tag.toLowerCase() === 'rap')) tag = 'Hip-Hop'
		if (tag && tag.toLowerCase() === '8-bit') tag = 'chiptune'

		if (IGNORED_TAGS.includes(tag)) continue

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
