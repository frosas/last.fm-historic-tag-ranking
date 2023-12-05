import { ArtistsTagsCache } from './ArtistsTagsCache.js'

export const ignoredTags = [
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
	'spain',
	'catala',
	'catalan',
	'australian',
]

export class ArtistTagService {
	/**
	 * @param {object} params
	 * @param {string} params.cachePath
	 */
	constructor({ cachePath }) {
		this.cache = new ArtistsTagsCache({ path: cachePath })
	}

	/**
	 * @param {string} artist
	 * @returns {Promise<string | undefined>} The artist main tag or undefined if they has no tag
	 */
	async getArtistTag(artist) {
		const cachedTag = this.cache.get(artist)
		const isTagCached = cachedTag !== undefined
		/**
		 * We want to retry fetching/saving the tag if it's in the ignored list as it means it's a newly
		 * added tag to the list
		 */
		const isCachedTagIgnored = typeof cachedTag === 'string' && ignoredTags.includes(cachedTag)
		if (isTagCached && !isCachedTagIgnored) return cachedTag ?? undefined
		console.warn('Fetching tag for artist:', artist)
		const fetchedTag = await this.#fetchArtistTag(artist)
		console.warn('Tag:', fetchedTag)
		this.cache.set(artist, fetchedTag ?? null)
		return fetchedTag
	}

	/**
	 * @param {string} artist
	 * @returns {Promise<string|undefined>}
	 */
	async #fetchArtistTag(artist) {
		const tagsData = await fetch(
			`https://ws.audioscrobbler.com/2.0/?method=artist.gettoptags&artist=${artist}&api_key=a014e53e73aba0fde3d38f1c5ec3c12b&format=json`
		)
			.then(async (r) => {
				const json = await r.json()
				if (json.error) throw json
				return json.toptags.tag
			})
			.catch((reason) => {
				console.error('FAILED TO GET TAG FOR ARTIST: ' + artist)
				console.error('reason: ', JSON.stringify(reason))
				return []
			})
		for (const tagData of tagsData) {
			const tag = tagData.name
			if (ignoredTags.includes(tag)) continue
			return tag
		}
	}
}
