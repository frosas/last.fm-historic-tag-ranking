import { writeFileSync } from 'fs'

/**
 * @param {object} params
 * @param {Map<string, string | null>} params.artistsTags
 */
export function buildStats({ artistsTags }) {
	const artistsByTag = [...artistsTags].reduce((artistsByTag, [artist, tag]) => {
		const effectiveTag = tag ?? 'unknown'
		const artists = [...(artistsByTag[effectiveTag] ?? []), artist]
		artistsByTag[effectiveTag] = artists // Mutating for performance
		return artistsByTag
	}, {})
	for (const tagArtists of Object.values(artistsByTag)) tagArtists.sort()
	const stats = {
		tags: Object.keys(artistsByTag).sort(),
		artistsByTag,
		tagsByPopularity: Object.entries(artistsByTag)
			.sort(([, tag1Artists], [, tag2Artists]) => tag2Artists.length - tag1Artists.length)
			.map(([tag, artists]) => ({ tag, artists: artists.length })),
	}
	writeFileSync('./stats.json', JSON.stringify(stats, null, 2))
}
