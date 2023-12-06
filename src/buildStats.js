import { writeFileSync } from 'fs'

/**
 * @param {object} params
 * @param {Map<string, string | null>} params.artistsTags
 */
export function buildStats({ artistsTags }) {
	const artistsByTag = [...artistsTags].reduce((artistsByTag, [artist, tag]) => {
		const effectiveTag = tag ?? 'unknown'
		const artists = [...(artistsByTag[effectiveTag] ?? []), artist]
		return { ...artistsByTag, [effectiveTag]: artists }
	}, {})
	for (const tagArtists of Object.values(artistsByTag)) {
		tagArtists.sort((artist1, artist2) => artist1.localeCompare(artist2))
	}
	const stats = {
		tags: Object.keys(artistsByTag),
		artistsByTag,
		tagsByPopularity: Object.entries(artistsByTag)
			.sort(([, tag1Artists], [, tag2Artists]) => tag2Artists.length - tag1Artists.length)
			.map(([tag, artists]) => ({ tag, artists: artists.length })),
	}
	writeFileSync('./stats.json', JSON.stringify(stats, null, 2))
}
