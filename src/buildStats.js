import { writeFileSync } from 'fs'

/**
 * @param {object} params
 * @param {Map<string, string | null>} params.artistsTags
 */
export function buildStats({ artistsTags }) {
	const artistsByTag = [...artistsTags].reduce((artistsByTag, [artist, tag]) => {
		const effectiveTag = tag ?? 'unknown'
		return { ...artistsByTag, [effectiveTag]: [...(artistsByTag[effectiveTag] || []), artist] }
	}, {})
	const stats = {
		tags: Object.keys(artistsByTag),
		artistsByTag,
	}
	writeFileSync('./stats.json', JSON.stringify(stats, null, 2))
}
